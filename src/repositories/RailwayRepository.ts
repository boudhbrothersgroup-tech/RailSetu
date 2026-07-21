import { railwayService } from '../services/RailwayService';
import { PNRStatus, LiveTrainStatus, Train, ClassSeatAvailability, FareBreakdown } from '../types';

// ==========================================
// CUSTOM DOMAIN EXCEPTIONS (Clean Architecture)
// ==========================================
export class AppRepositoryException extends Error {
  constructor(
    message: string,
    public readonly code: string = 'REPOSITORY_ERROR',
    public readonly originalError?: any
  ) {
    super(message);
    this.name = 'AppRepositoryException';
  }
}

export class NetworkException extends AppRepositoryException {
  constructor(message: string, originalError?: any) {
    super(message, 'NETWORK_FAILURE', originalError);
    this.name = 'NetworkException';
  }
}

export class TimeoutException extends AppRepositoryException {
  constructor(message: string, originalError?: any) {
    super(message, 'TIMEOUT', originalError);
    this.name = 'TimeoutException';
  }
}

export class OfflineException extends AppRepositoryException {
  constructor(message: string) {
    super(message, 'OFFLINE');
    this.name = 'OfflineException';
  }
}

export class ApiServiceException extends AppRepositoryException {
  constructor(message: string, code: string, public readonly status?: number, originalError?: any) {
    super(message, code, originalError);
    this.name = 'ApiServiceException';
  }
}

// ==========================================
// CACHE CONTRACT & HELPER
// ==========================================
interface CacheItem<T> {
  data: T;
  timestamp: number; // UTC ms
  expiresAt: number; // UTC ms
}

class CacheManager {
  private static PREFIX = 'railsetu_cache_';

  static get<T>(key: string): T | null {
    try {
      const stored = localStorage.getItem(this.PREFIX + key);
      if (!stored) return null;

      const item: CacheItem<T> = JSON.parse(stored);
      if (Date.now() > item.expiresAt) {
        localStorage.removeItem(this.PREFIX + key);
        return null; // Expired
      }
      return item.data;
    } catch {
      return null;
    }
  }

  static set<T>(key: string, data: T, ttlMs: number): void {
    try {
      const item: CacheItem<T> = {
        data,
        timestamp: Date.now(),
        expiresAt: Date.now() + ttlMs,
      };
      localStorage.setItem(this.PREFIX + key, JSON.stringify(item));
    } catch (e) {
      console.warn('LocalStorage write failed:', e);
    }
  }

  static clear(): void {
    try {
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(this.PREFIX)) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(k => localStorage.removeItem(k));
    } catch {}
  }
}

// ==========================================
// REPOSITORY CONTRACT INTERFACE (Flutter Style)
// ==========================================
export interface RailwayRepository {
  getPnrStatus(pnrNumber: string, forceRefresh?: boolean): Promise<PNRStatus>;
  getLiveTrainStatus(trainNo: string, forceRefresh?: boolean): Promise<LiveTrainStatus>;
  searchTrains(fromStation: string, toStation: string, date: string, forceRefresh?: boolean): Promise<Train[]>;
  getTrainSchedule(trainNo: string, forceRefresh?: boolean): Promise<any>;
  checkSeatAvailability(
    trainNo: string,
    fromCode: string,
    toCode: string,
    date: string,
    classType: string,
    quota?: string,
    forceRefresh?: boolean
  ): Promise<ClassSeatAvailability>;
  getFareEnquiry(
    trainNo: string,
    fromCode: string,
    toCode: string,
    classType: string,
    quota?: string,
    forceRefresh?: boolean
  ): Promise<FareBreakdown>;
  getCoachPosition(trainNo: string, forceRefresh?: boolean): Promise<any>;
}

// ==========================================
// REPOSITORY IMPLEMENTATION (Flutter Clean Patterns)
// ==========================================
class RailwayRepositoryImpl implements RailwayRepository {
  private readonly defaultTimeoutMs = 12000; // 12 seconds timeout (Flutter Best Practice)
  private readonly maxRetries = 3;

  // TTL Settings for distinct types of transit queries
  private readonly ttlSettings = {
    pnr: 3 * 60 * 1000,           // 3 minutes (highly dynamic updates)
    liveStatus: 60 * 1000,        // 1 minute (real-time telemetry)
    trainSearch: 15 * 60 * 1000,   // 15 minutes (medium state)
    schedule: 24 * 60 * 60 * 1000, // 24 hours (mostly static stops grid)
    seats: 5 * 60 * 1000,         // 5 minutes (rapid changes on booking windows)
    fare: 12 * 60 * 60 * 1000,     // 12 hours (fares are mostly static)
    coach: 24 * 60 * 60 * 1000,    // 24 hours (mostly static train rake layout)
  };

  /**
   * Safe execution wrapper handling timeout, connectivity check, retries, and errors
   */
  private async executeWithPolicies<T>(
    operationName: string,
    cacheKey: string,
    ttlMs: number,
    apiCall: () => Promise<T>,
    forceRefresh = false
  ): Promise<T> {
    // 1. Return cached copy if present and not forcing refresh
    if (!forceRefresh) {
      const cached = CacheManager.get<T>(cacheKey);
      if (cached !== null) {
        console.log(`[Repository] Cache HIT for ${operationName} (key: ${cacheKey})`);
        return cached;
      }
    }

    // 2. Connectivity Pre-check (Flutter-like ConnectionGuard)
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      // Try to read stale/expired cache before throwing to guarantee high-resilience offline reading
      const staleCached = this.getStaleCache<T>(cacheKey);
      if (staleCached) {
        console.log(`[Repository] Offline Fallback to cached data for ${operationName}`);
        return staleCached;
      }
      throw new OfflineException('Network unavailable. Please verify your internet settings or mobile cellular link.');
    }

    let attempt = 0;
    let delay = 1000; // Starting backoff delay of 1s

    while (attempt < this.maxRetries) {
      attempt++;
      try {
        console.log(`[Repository] Running ${operationName} (Attempt ${attempt}/${this.maxRetries})`);
        
        // Wrap apiCall with a timeout promise
        const timeoutPromise = new Promise<never>((_, reject) => {
          setTimeout(() => {
            reject(new TimeoutException(`Operation ${operationName} timed out after ${this.defaultTimeoutMs}ms`));
          }, this.defaultTimeoutMs);
        });

        // Race the network fetch against the timeout trigger
        const result = await Promise.race([apiCall(), timeoutPromise]);

        // Successfully fetched, update local cache storage
        CacheManager.set(cacheKey, result, ttlMs);
        return result;

      } catch (error: any) {
        console.warn(`[Repository] Attempt ${attempt} failed:`, error.message || error);

        // Map timeout specifically
        if (error instanceof TimeoutException) {
          if (attempt >= this.maxRetries) throw error;
        }

        // If it's a specific API client error indicating 401/Invalid input, do not retry
        if (error.code === 'INVALID_INPUT' || error.code === 'API_KEY_MISSING' || error.status === 401 || error.status === 400) {
          throw new ApiServiceException(error.message || 'API error', error.code || 'API_FAULT', error.status, error);
        }

        // If we are out of retries, map and throw the terminal error
        if (attempt >= this.maxRetries) {
          // Stale cache fallback if available before blowing up
          const staleCached = this.getStaleCache<T>(cacheKey);
          if (staleCached) {
            console.warn(`[Repository] API error terminal. Falling back to stale cache.`);
            return staleCached;
          }

          if (error instanceof AppRepositoryException) {
            throw error;
          }
          throw new NetworkException(
            error.message || 'Severe connection disruption to central servers.',
            error
          );
        }

        // Wait before retrying with exponential backoff (e.g., 1s, 2s, 4s)
        await new Promise(resolve => setTimeout(resolve, delay));
        delay *= 2;
      }
    }

    throw new NetworkException('Max transmission retries exceeded without connection lock.');
  }

  /**
   * Safe getter to bypass TTL check for absolute fallback data when offline
   */
  private getStaleCache<T>(key: string): T | null {
    try {
      const stored = localStorage.getItem('railsetu_cache_' + key);
      if (!stored) return null;
      const item: CacheItem<T> = JSON.parse(stored);
      return item.data;
    } catch {
      return null;
    }
  }

  // ==========================================
  // REPOSITORY METHODS
  // ==========================================

  async getPnrStatus(pnrNumber: string, forceRefresh = false): Promise<PNRStatus> {
    const cleanPnr = pnrNumber.trim().replace(/\D/g, '');
    const cacheKey = `pnr_${cleanPnr}`;
    return this.executeWithPolicies<PNRStatus>(
      `getPnrStatus(${cleanPnr})`,
      cacheKey,
      this.ttlSettings.pnr,
      () => railwayService.getPnrStatus(cleanPnr),
      forceRefresh
    );
  }

  async getLiveTrainStatus(trainNo: string, forceRefresh = false): Promise<LiveTrainStatus> {
    const cleanTrain = trainNo.trim().replace(/\D/g, '');
    const cacheKey = `livestatus_${cleanTrain}`;
    return this.executeWithPolicies<LiveTrainStatus>(
      `getLiveTrainStatus(${cleanTrain})`,
      cacheKey,
      this.ttlSettings.liveStatus,
      () => railwayService.getLiveTrainStatus(cleanTrain),
      forceRefresh
    );
  }

  async searchTrains(fromStation: string, toStation: string, date: string, forceRefresh = false): Promise<Train[]> {
    const from = fromStation.trim().toUpperCase();
    const to = toStation.trim().toUpperCase();
    const cacheKey = `search_${from}_${to}_${date}`;
    return this.executeWithPolicies<Train[]>(
      `searchTrains(${from}->${to}, ${date})`,
      cacheKey,
      this.ttlSettings.trainSearch,
      () => railwayService.searchTrains(from, to, date),
      forceRefresh
    );
  }

  async getTrainSchedule(trainNo: string, forceRefresh = false): Promise<any> {
    const cleanTrain = trainNo.trim().replace(/\D/g, '');
    const cacheKey = `schedule_${cleanTrain}`;
    return this.executeWithPolicies<any>(
      `getTrainSchedule(${cleanTrain})`,
      cacheKey,
      this.ttlSettings.schedule,
      () => railwayService.getTrainSchedule(cleanTrain),
      forceRefresh
    );
  }

  async checkSeatAvailability(
    trainNo: string,
    fromCode: string,
    toCode: string,
    date: string,
    classType: string,
    quota: string = 'GN',
    forceRefresh = false
  ): Promise<ClassSeatAvailability> {
    const cleanTrain = trainNo.trim().replace(/\D/g, '');
    const from = fromCode.toUpperCase();
    const to = toCode.toUpperCase();
    const cacheKey = `seats_${cleanTrain}_${from}_${to}_${date}_${classType}_${quota}`;
    return this.executeWithPolicies<ClassSeatAvailability>(
      `checkSeatAvailability(${cleanTrain}, ${from}->${to}, ${classType})`,
      cacheKey,
      this.ttlSettings.seats,
      () => railwayService.checkSeatAvailability(cleanTrain, from, to, date, classType, quota),
      forceRefresh
    );
  }

  async getFareEnquiry(
    trainNo: string,
    fromCode: string,
    toCode: string,
    classType: string,
    quota: string = 'GN',
    forceRefresh = false
  ): Promise<FareBreakdown> {
    const cleanTrain = trainNo.trim().replace(/\D/g, '');
    const from = fromCode.toUpperCase();
    const to = toCode.toUpperCase();
    const cacheKey = `fare_${cleanTrain}_${from}_${to}_${classType}_${quota}`;
    return this.executeWithPolicies<FareBreakdown>(
      `getFareEnquiry(${cleanTrain}, ${from}->${to}, ${classType})`,
      cacheKey,
      this.ttlSettings.fare,
      () => railwayService.getFareEnquiry(cleanTrain, from, to, classType, quota),
      forceRefresh
    );
  }

  async getCoachPosition(trainNo: string, forceRefresh = false): Promise<any> {
    const cleanTrain = trainNo.trim().replace(/\D/g, '');
    const cacheKey = `coach_${cleanTrain}`;
    return this.executeWithPolicies<any>(
      `getCoachPosition(${cleanTrain})`,
      cacheKey,
      this.ttlSettings.coach,
      () => railwayService.getCoachPosition(cleanTrain),
      forceRefresh
    );
  }
}

// Single active instance of our central Repository (Clean Singleton Pattern)
export const railwayRepository: RailwayRepository = new RailwayRepositoryImpl();
