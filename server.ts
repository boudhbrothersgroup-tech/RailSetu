import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// ==========================================
// 1. SECURE SERVER-SIDE IN-MEMORY CACHE
// ==========================================
interface CacheEntry {
  data: any;
  expiresAt: number;
}
const serverCache = new Map<string, CacheEntry>();

const getCachedData = (key: string): any | null => {
  const entry = serverCache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    serverCache.delete(key);
    return null;
  }
  return entry.data;
};

const setCachedData = (key: string, data: any, ttlMs: number) => {
  serverCache.set(key, {
    data,
    expiresAt: Date.now() + ttlMs,
  });
};

// Clear cache helper (can be invoked if needed or for garbage collection)
const clearExpiredCache = () => {
  const now = Date.now();
  for (const [key, entry] of serverCache.entries()) {
    if (now > entry.expiresAt) {
      serverCache.delete(key);
    }
  }
};
setInterval(clearExpiredCache, 10 * 60 * 1000); // Clear every 10 minutes

// ==========================================
// 2. MIDDLEWARE & API CONFIGS
// ==========================================
const checkRailwayApiKey = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const apiKey = process.env.RAILWAY_API_KEY;

  if (!apiKey || apiKey === 'your_rapidapi_key_here' || apiKey.trim() === '') {
    return res.status(401).json({
      success: false,
      code: 'API_KEY_MISSING',
      error: 'API Key Not Configured',
      message: 'RailSetu live transit query engine is ready! Please configure "RAILWAY_API_KEY" in your .env configuration file or environment to connect to official Indian Railways servers.'
    });
  }
  next();
};

const getRailwayHeaders = () => {
  return {
    'X-RapidAPI-Key': process.env.RAILWAY_API_KEY || '',
    'X-RapidAPI-Host': process.env.RAILWAY_API_HOST || 'irctc1.p.rapidapi.com',
  };
};

// ==========================================
// 3. HIGH-RELIABILITY FETCH WITH RETRY & TIMEOUT
// ==========================================
const fetchWithPolicies = async (
  targetUrl: string,
  options: RequestInit = {},
  maxRetries = 3,
  timeoutMs = 12000
): Promise<any> => {
  let attempt = 0;
  let delay = 1000;

  while (attempt < maxRetries) {
    attempt++;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(targetUrl, {
        ...options,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
          ...getRailwayHeaders(),
        }
      });
      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Upstream server returned HTTP status ${response.status}`);
      }

      const json = await response.json();
      return json;
    } catch (error: any) {
      clearTimeout(timeoutId);
      
      const isTimeout = error.name === 'AbortError';
      const errorMessage = isTimeout ? 'Request to official railway servers timed out.' : (error.message || 'Connection failure');
      console.warn(`[SERVER-RETRY] Attempt ${attempt}/${maxRetries} failed for ${targetUrl}: ${errorMessage}`);

      if (attempt >= maxRetries) {
        throw new Error(isTimeout ? `Gateway Timeout: ${errorMessage}` : `Gateway Error: ${errorMessage}`);
      }

      // Exponential Backoff Delay
      await new Promise(resolve => setTimeout(resolve, delay));
      delay *= 2;
    }
  }
};

// TTL presets for various Indian Railways query modes
const TTL = {
  pnr: 3 * 60 * 1000,           // 3 minutes
  liveStatus: 60 * 1000,        // 1 minute (GPS coordinates update quickly)
  trainSearch: 15 * 60 * 1000,   // 15 minutes
  schedule: 24 * 60 * 60 * 1000, // 24 hours (stops and station matrices are static)
  seats: 5 * 60 * 1000,         // 5 minutes
  fare: 24 * 60 * 60 * 1000,     // 24 hours (fares are static)
};

// ============================================================================
// 1. PNR STATUS ENDPOINT
// ============================================================================
app.get('/api/pnr', checkRailwayApiKey, async (req, res) => {
  const { pnrNumber } = req.query;

  if (!pnrNumber || typeof pnrNumber !== 'string') {
    return res.status(400).json({
      success: false,
      code: 'INVALID_INPUT',
      message: 'PNR number parameter is required.'
    });
  }

  const cleanPnr = pnrNumber.trim().replace(/\D/g, '');
  if (cleanPnr.length !== 10) {
    return res.status(400).json({
      success: false,
      code: 'INVALID_INPUT',
      message: 'Invalid PNR Number: PNR must be exactly 10 digits.'
    });
  }

  const cacheKey = `pnr_${cleanPnr}`;
  const cached = getCachedData(cacheKey);
  if (cached) {
    console.log(`[SERVER-CACHE] Hit for PNR: ${cleanPnr}`);
    return res.json(cached);
  }

  const baseUrl = process.env.RAILWAY_API_BASE_URL || 'https://irctc1.p.rapidapi.com';
  const targetUrl = `${baseUrl}/api/v3/getPNRStatus?pnrNumber=${encodeURIComponent(cleanPnr)}`;

  try {
    const rawData = await fetchWithPolicies(targetUrl, { method: 'GET' });
    
    if (rawData && rawData.status && rawData.data) {
      const apiData = rawData.data;
      const adaptedPnr = {
        pnr: apiData.pnr || cleanPnr,
        trainNumber: apiData.trainNo || apiData.trainNumber || '',
        trainName: apiData.trainName || '',
        dateOfJourney: apiData.dateOfJourney || '',
        from: apiData.fromStationName || apiData.from || '',
        fromCode: apiData.fromStation || apiData.fromCode || '',
        to: apiData.toStationName || apiData.to || '',
        toCode: apiData.toStation || apiData.toCode || '',
        boarding: apiData.boardingStationName || apiData.fromStationName || '',
        boardingCode: apiData.boardingStation || apiData.fromStation || '',
        class: apiData.journeyClass || apiData.class || '',
        chartStatus: apiData.chartStatus === 'PREPARED' ? 'CHART PREPARED' : 'CHART NOT PREPARED',
        passengers: (apiData.passengerList || []).map((p: any, idx: number) => ({
          number: p.passengerId || idx + 1,
          bookingStatus: p.bookingStatus || 'Unknown',
          currentStatus: p.currentStatus || 'Unknown',
          coach: p.coach || '',
          berth: p.berthNumber ? parseInt(p.berthNumber, 10) : undefined
        }))
      };

      setCachedData(cacheKey, adaptedPnr, TTL.pnr);
      return res.json(adaptedPnr);
    }

    if (rawData && rawData.message) {
      return res.status(444).json({
        success: false,
        code: 'API_ERROR',
        message: rawData.message
      });
    }

    throw new Error('Malformed response from central IRCTC gateway');
  } catch (error: any) {
    console.error('[SERVER] PNR Fetch Error:', error.message);
    res.status(502).json({
      success: false,
      code: 'BAD_GATEWAY',
      error: 'Railway Server Gateway Error',
      message: 'Failed to retrieve PNR updates from official railway nodes. Please verify your PNR input or try again.',
      details: error.message
    });
  }
});

// ============================================================================
// 2. LIVE TRAIN STATUS ENDPOINT
// ============================================================================
app.get('/api/live', checkRailwayApiKey, async (req, res) => {
  const { trainNo } = req.query;

  if (!trainNo || typeof trainNo !== 'string') {
    return res.status(400).json({
      success: false,
      code: 'INVALID_INPUT',
      message: 'Train number parameter is required.'
    });
  }

  const cleanTrain = trainNo.trim().replace(/\D/g, '');
  if (cleanTrain.length !== 5) {
    return res.status(400).json({
      success: false,
      code: 'INVALID_INPUT',
      message: 'Invalid Train Number: Train number must be exactly 5 digits.'
    });
  }

  const cacheKey = `live_${cleanTrain}`;
  const cached = getCachedData(cacheKey);
  if (cached) {
    console.log(`[SERVER-CACHE] Hit for Live tracking: ${cleanTrain}`);
    return res.json(cached);
  }

  const baseUrl = process.env.RAILWAY_API_BASE_URL || 'https://irctc1.p.rapidapi.com';
  const targetUrl = `${baseUrl}/api/v1/liveTrainStatus?trainNo=${encodeURIComponent(cleanTrain)}&startDay=0`;

  try {
    const rawData = await fetchWithPolicies(targetUrl, { method: 'GET' });

    if (rawData && rawData.status && rawData.data) {
      const apiData = rawData.data;
      
      const routePassing = (apiData.previousStationList || []).map((st: any) => ({
        stationName: st.stationName || '',
        stationCode: st.stationCode || '',
        scheduledArrival: st.scheduledArrival || '--:--',
        scheduledDeparture: st.scheduledDeparture || '--:--',
        actualArrival: st.actualArrival || '--:--',
        actualDeparture: st.actualDeparture || '--:--',
        delayMinutes: st.delayInArrival || st.delayInDeparture || 0,
        status: st.hasArrived ? 'Passed' : 'Upcoming',
        platform: st.platformNumber || '1',
        distanceKm: st.distance || 0,
      }));

      const curStation = apiData.currentStationName || 'In Transit';

      const adaptedStatus = {
        trainNumber: apiData.trainNumber || cleanTrain,
        trainName: apiData.trainName || 'TRAIN STATUS',
        currentStation: curStation,
        lastUpdated: new Date().toLocaleTimeString(),
        delayMinutes: apiData.delayMinutes || 0,
        headingText: apiData.statusText || 'Running on Time',
        route: routePassing
      };

      setCachedData(cacheKey, adaptedStatus, TTL.liveStatus);
      return res.json(adaptedStatus);
    }

    if (rawData && rawData.message) {
      return res.status(444).json({
        success: false,
        code: 'API_ERROR',
        message: rawData.message
      });
    }

    throw new Error('Malformed response from live railway API');
  } catch (error: any) {
    console.error('[SERVER] Live Status Fetch Error:', error.message);
    res.status(502).json({
      success: false,
      code: 'BAD_GATEWAY',
      error: 'Railway Server Gateway Error',
      message: `Failed to retrieve live tracking telemetry for Train ${cleanTrain}. The train may not be running today.`,
      details: error.message
    });
  }
});

// ============================================================================
// 3. TRAIN SEARCH ENDPOINT
// ============================================================================
app.get('/api/search', checkRailwayApiKey, async (req, res) => {
  const { from, to, date } = req.query;

  if (!from || !to || typeof from !== 'string' || typeof to !== 'string') {
    return res.status(400).json({
      success: false,
      code: 'INVALID_INPUT',
      message: 'Both origin (from) and destination (to) codes are required.'
    });
  }

  const cleanFrom = from.trim().toUpperCase();
  const cleanTo = to.trim().toUpperCase();
  const cacheKey = `search_${cleanFrom}_${cleanTo}_${date}`;
  const cached = getCachedData(cacheKey);
  if (cached) {
    console.log(`[SERVER-CACHE] Hit for Search: ${cleanFrom} -> ${cleanTo}`);
    return res.json(cached);
  }

  const baseUrl = process.env.RAILWAY_API_BASE_URL || 'https://irctc1.p.rapidapi.com';
  const targetUrl = `${baseUrl}/api/v3/trainBetweenStations?fromStationCode=${encodeURIComponent(cleanFrom)}&toStationCode=${encodeURIComponent(cleanTo)}`;

  try {
    const rawData = await fetchWithPolicies(targetUrl, { method: 'GET' });

    if (rawData && rawData.status && rawData.data) {
      const adaptedTrains = rawData.data.map((tr: any) => ({
        number: tr.train_number || '',
        name: tr.train_name || '',
        from: tr.from_station_name || '',
        fromCode: tr.from_station_code || cleanFrom,
        to: tr.to_station_name || '',
        toCode: tr.to_station_code || cleanTo,
        departureTime: tr.run_days || tr.departureTime || '10:00',
        arrivalTime: tr.arrivalTime || '18:00',
        duration: tr.duration || '08h 00m',
        runsOn: tr.run_days ? Object.keys(tr.run_days).filter(day => tr.run_days[day]) : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        classes: tr.class_type || ['1A', '2A', '3A', 'SL'],
        type: 'Superfast'
      }));

      setCachedData(cacheKey, adaptedTrains, TTL.trainSearch);
      return res.json(adaptedTrains);
    }

    if (rawData && rawData.message) {
      return res.status(444).json({
        success: false,
        code: 'API_ERROR',
        message: rawData.message
      });
    }

    throw new Error('Malformed response from search service');
  } catch (error: any) {
    console.error('[SERVER] Search Trains Fetch Error:', error.message);
    res.status(502).json({
      success: false,
      code: 'BAD_GATEWAY',
      error: 'Railway Server Gateway Error',
      message: `Failed to search trains between ${cleanFrom} and ${cleanTo}. Station codes might be invalid.`,
      details: error.message
    });
  }
});

// ============================================================================
// 4. TRAIN SCHEDULE ENDPOINT
// ============================================================================
app.get('/api/schedule', checkRailwayApiKey, async (req, res) => {
  const { trainNo } = req.query;

  if (!trainNo || typeof trainNo !== 'string') {
    return res.status(400).json({
      success: false,
      code: 'INVALID_INPUT',
      message: 'Train number parameter is required.'
    });
  }

  const cleanTrain = trainNo.trim().replace(/\D/g, '');
  if (cleanTrain.length !== 5) {
    return res.status(400).json({
      success: false,
      code: 'INVALID_INPUT',
      message: 'Invalid Train Number: Train number must be exactly 5 digits.'
    });
  }

  const cacheKey = `schedule_${cleanTrain}`;
  const cached = getCachedData(cacheKey);
  if (cached) {
    console.log(`[SERVER-CACHE] Hit for Schedule: ${cleanTrain}`);
    return res.json(cached);
  }

  const baseUrl = process.env.RAILWAY_API_BASE_URL || 'https://irctc1.p.rapidapi.com';
  const targetUrl = `${baseUrl}/api/v1/getTrainSchedule?trainNo=${encodeURIComponent(cleanTrain)}`;

  try {
    const rawData = await fetchWithPolicies(targetUrl, { method: 'GET' });

    if (rawData && rawData.status && rawData.data) {
      const apiData = rawData.data;
      
      const route = (apiData.route || []).map((rt: any) => ({
        stationName: rt.stationName || '',
        stationCode: rt.stationCode || '',
        arrivalTime: rt.arrivalTime || 'Source',
        departureTime: rt.departureTime || 'Terminus',
        haltMinutes: rt.haltTime ? parseInt(rt.haltTime, 10) : 0,
        platform: rt.platformNumber || '',
        distance: rt.distance ? parseInt(rt.distance, 10) : 0,
        day: rt.day || 1
      }));

      const adaptedSchedule = {
        trainNumber: apiData.trainNo || cleanTrain,
        trainName: apiData.trainName || 'TRAIN SCHEDULE',
        route: route
      };

      setCachedData(cacheKey, adaptedSchedule, TTL.schedule);
      return res.json(adaptedSchedule);
    }

    if (rawData && rawData.message) {
      return res.status(444).json({
        success: false,
        code: 'API_ERROR',
        message: rawData.message
      });
    }

    throw new Error('Malformed response from schedule service');
  } catch (error: any) {
    console.error('[SERVER] Schedule Fetch Error:', error.message);
    res.status(502).json({
      success: false,
      code: 'BAD_GATEWAY',
      error: 'Railway Server Gateway Error',
      message: `Failed to retrieve official schedule index for Train ${cleanTrain}.`,
      details: error.message
    });
  }
});

// ============================================================================
// 5. SEAT AVAILABILITY ENDPOINT
// ============================================================================
app.get('/api/seats', checkRailwayApiKey, async (req, res) => {
  const { trainNo, from, to, date, classType, quota } = req.query;

  if (!trainNo || !from || !to || !date || !classType) {
    return res.status(400).json({
      success: false,
      code: 'INVALID_INPUT',
      message: 'Missing required parameters for seat availability.'
    });
  }

  const cleanTrain = String(trainNo).trim().replace(/\D/g, '');
  const cleanFrom = String(from).trim().toUpperCase();
  const cleanTo = String(to).trim().toUpperCase();
  const cleanClass = String(classType).trim().toUpperCase();
  const cleanQuota = String(quota || 'GN').trim().toUpperCase();

  const cacheKey = `seats_${cleanTrain}_${cleanFrom}_${cleanTo}_${date}_${cleanClass}_${cleanQuota}`;
  const cached = getCachedData(cacheKey);
  if (cached) {
    console.log(`[SERVER-CACHE] Hit for Seat availability: ${cacheKey}`);
    return res.json(cached);
  }

  const baseUrl = process.env.RAILWAY_API_BASE_URL || 'https://irctc1.p.rapidapi.com';
  const targetUrl = `${baseUrl}/api/v1/checkSeatAvailability?classType=${encodeURIComponent(cleanClass)}&fromStationCode=${encodeURIComponent(cleanFrom)}&toStationCode=${encodeURIComponent(cleanTo)}&dateOfJourney=${encodeURIComponent(date as string)}&trainNo=${encodeURIComponent(cleanTrain)}&quota=${encodeURIComponent(cleanQuota)}`;

  try {
    const rawData = await fetchWithPolicies(targetUrl, { method: 'GET' });

    if (rawData && rawData.status && rawData.data) {
      const apiData = rawData.data;

      const availabilityList = (apiData.availability || []).map((av: any) => ({
        date: av.date || '',
        status: av.status || 'AVAILABLE',
        probability: av.probability || 'High',
        fare: av.fare || 0
      }));

      const adaptedSeats = {
        className: cleanClass,
        availability: availabilityList
      };

      setCachedData(cacheKey, adaptedSeats, TTL.seats);
      return res.json(adaptedSeats);
    }

    if (rawData && rawData.message) {
      return res.status(444).json({
        success: false,
        code: 'API_ERROR',
        message: rawData.message
      });
    }

    throw new Error('Malformed response from seat availability services');
  } catch (error: any) {
    console.error('[SERVER] Seat Availability Fetch Error:', error.message);
    res.status(502).json({
      success: false,
      code: 'BAD_GATEWAY',
      error: 'Railway Server Gateway Error',
      message: `Failed to check seat availability index for Train ${cleanTrain} from ${cleanFrom} to ${cleanTo}.`,
      details: error.message
    });
  }
});

// ============================================================================
// 6. FARE ENQUIRY ENDPOINT
// ============================================================================
app.get('/api/fare', checkRailwayApiKey, async (req, res) => {
  const { trainNo, from, to, classType, quota } = req.query;

  if (!trainNo || !from || !to || !classType) {
    return res.status(400).json({
      success: false,
      code: 'INVALID_INPUT',
      message: 'Missing required parameters for fare query.'
    });
  }

  const cleanTrain = String(trainNo).trim().replace(/\D/g, '');
  const cleanFrom = String(from).trim().toUpperCase();
  const cleanTo = String(to).trim().toUpperCase();
  const cleanClass = String(classType).trim().toUpperCase();
  const cleanQuota = String(quota || 'GN').trim().toUpperCase();

  const cacheKey = `fare_${cleanTrain}_${cleanFrom}_${cleanTo}_${cleanClass}_${cleanQuota}`;
  const cached = getCachedData(cacheKey);
  if (cached) {
    console.log(`[SERVER-CACHE] Hit for Fare Enquiry: ${cacheKey}`);
    return res.json(cached);
  }

  const baseUrl = process.env.RAILWAY_API_BASE_URL || 'https://irctc1.p.rapidapi.com';
  const targetUrl = `${baseUrl}/api/v2/getFare?trainNo=${encodeURIComponent(cleanTrain)}&fromStationCode=${encodeURIComponent(cleanFrom)}&toStationCode=${encodeURIComponent(cleanTo)}&classType=${encodeURIComponent(cleanClass)}&quota=${encodeURIComponent(cleanQuota)}`;

  try {
    const rawData = await fetchWithPolicies(targetUrl, { method: 'GET' });

    if (rawData && rawData.status && rawData.data) {
      const apiData = rawData.data;

      const adaptedFare = {
        baseFare: apiData.baseFare || 500,
        superfastCharge: apiData.superfastCharge || 45,
        reservationFee: apiData.reservationFee || 20,
        cateringCharge: apiData.cateringCharge || 0,
        gst: apiData.gst || 25,
        total: apiData.totalFare || 590
      };

      setCachedData(cacheKey, adaptedFare, TTL.fare);
      return res.json(adaptedFare);
    }

    if (rawData && rawData.message) {
      return res.status(444).json({
        success: false,
        code: 'API_ERROR',
        message: rawData.message
      });
    }

    throw new Error('Malformed response from fare enquiry services');
  } catch (error: any) {
    console.error('[SERVER] Fare Enquiry Fetch Error:', error.message);
    res.status(502).json({
      success: false,
      code: 'BAD_GATEWAY',
      error: 'Railway Server Gateway Error',
      message: `Failed to calculate fares for Train ${cleanTrain} from ${cleanFrom} to ${cleanTo}.`,
      details: error.message
    });
  }
});

// ============================================================================
// VITE DEV / PRODUCTION STATIC MIDDLEWARE & SERVER STARTUP
// ============================================================================
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[SERVER] RailSetu backend is online and running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
