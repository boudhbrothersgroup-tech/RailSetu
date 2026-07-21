import { API_CONFIG } from '../config/apiConfig';
import { PNRStatus, LiveTrainStatus, Train, ClassSeatAvailability, FareBreakdown } from '../types';

// Standardized API error structure
export class RailwayApiError extends Error {
  constructor(
    message: string, 
    public code: string = 'UNKNOWN_ERROR', 
    public status?: number
  ) {
    super(message);
    this.name = 'RailwayApiError';
  }
}

// Client-side API Service Layer Interface
interface RailwayApiService {
  fetchJson<T>(url: string, options?: RequestInit): Promise<T>;
  getPnrStatus(pnrNumber: string): Promise<PNRStatus>;
  getLiveTrainStatus(trainNo: string): Promise<LiveTrainStatus>;
  searchTrains(fromStation: string, toStation: string, date: string): Promise<Train[]>;
  getTrainSchedule(trainNo: string): Promise<any>;
  checkSeatAvailability(
    trainNo: string,
    fromCode: string,
    toCode: string,
    date: string,
    classType: string,
    quota?: string
  ): Promise<ClassSeatAvailability>;
  getFareEnquiry(
    trainNo: string,
    fromCode: string,
    toCode: string,
    classType: string,
    quota?: string
  ): Promise<FareBreakdown>;
}

export const railwayApiService: RailwayApiService = {
  /**
   * Helper to perform standard fetch and handle common network/server faults
   */
  async fetchJson<T>(url: string, options: RequestInit = {}): Promise<T> {
    // 1. Internet Connection Guard
    if (typeof window !== 'undefined' && !navigator.onLine) {
      throw new RailwayApiError(
        'Offline: Please check your internet connection.',
        'NO_INTERNET'
      );
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      // Handle HTTP error statuses
      if (!response.ok) {
        let errMessage = `Server error (${response.status})`;
        let errCode = 'SERVER_ERROR';

        try {
          const errData = await response.json();
          errMessage = errData.message || errData.error || errMessage;
          errCode = errData.code || errCode;
        } catch {
          // Non-JSON or empty response error
        }

        throw new RailwayApiError(errMessage, errCode, response.status);
      }

      const data = await response.json();
      return data as T;
    } catch (err: any) {
      if (err instanceof RailwayApiError) throw err;
      throw new RailwayApiError(
        err.message || 'Connection failure to server',
        'NETWORK_ERROR'
      );
    }
  },

  /**
   * 1. Get PNR Status
   */
  async getPnrStatus(pnrNumber: string): Promise<PNRStatus> {
    const cleanPnr = pnrNumber.trim().replace(/\D/g, '');
    
    // Input Validation
    if (cleanPnr.length !== 10) {
      throw new RailwayApiError(
        'Invalid PNR Number: PNR must be exactly 10 digits.',
        'INVALID_INPUT'
      );
    }

    const url = `${API_CONFIG.endpoints.pnrStatus}?pnrNumber=${cleanPnr}`;
    return railwayApiService.fetchJson<PNRStatus>(url);
  },

  /**
   * 2. Get Live Train Status
   */
  async getLiveTrainStatus(trainNo: string): Promise<LiveTrainStatus> {
    const cleanTrain = trainNo.trim().replace(/\D/g, '');

    // Input Validation
    if (cleanTrain.length !== 5) {
      throw new RailwayApiError(
        'Invalid Train Number: Train number must be exactly 5 digits.',
        'INVALID_INPUT'
      );
    }

    const url = `${API_CONFIG.endpoints.liveTrainStatus}?trainNo=${cleanTrain}`;
    return railwayApiService.fetchJson<LiveTrainStatus>(url);
  },

  /**
   * 3. Search Trains between Stations
   */
  async searchTrains(fromStation: string, toStation: string, date: string): Promise<Train[]> {
    const from = fromStation.trim().toUpperCase();
    const to = toStation.trim().toUpperCase();

    if (!from || !to) {
      throw new RailwayApiError(
        'Please enter both origin and destination station codes.',
        'INVALID_INPUT'
      );
    }

    if (from === to) {
      throw new RailwayApiError(
        'Origin and destination station codes cannot be identical.',
        'INVALID_INPUT'
      );
    }

    const url = `${API_CONFIG.endpoints.trainSearch}?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}&date=${encodeURIComponent(date)}`;
    return railwayApiService.fetchJson<Train[]>(url);
  },

  /**
   * 4. Get Train Schedule
   */
  async getTrainSchedule(trainNo: string): Promise<any> {
    const cleanTrain = trainNo.trim().replace(/\D/g, '');

    if (cleanTrain.length !== 5) {
      throw new RailwayApiError(
        'Invalid Train Number: Train number must be exactly 5 digits.',
        'INVALID_INPUT'
      );
    }

    const url = `${API_CONFIG.endpoints.trainSchedule}?trainNo=${cleanTrain}`;
    return railwayApiService.fetchJson<any>(url);
  },

  /**
   * 5. Check Seat Availability
   */
  async checkSeatAvailability(
    trainNo: string,
    fromCode: string,
    toCode: string,
    date: string,
    classType: string,
    quota: string = 'GN'
  ): Promise<ClassSeatAvailability> {
    const cleanTrain = trainNo.trim().replace(/\D/g, '');

    if (cleanTrain.length !== 5) {
      throw new RailwayApiError('Invalid Train Number: Must be exactly 5 digits.', 'INVALID_INPUT');
    }
    if (!fromCode || !toCode) {
      throw new RailwayApiError('Origin and destination station codes are required.', 'INVALID_INPUT');
    }
    if (!classType) {
      throw new RailwayApiError('Please select a travel class.', 'INVALID_INPUT');
    }

    const url = `${API_CONFIG.endpoints.seatAvailability}?trainNo=${cleanTrain}&from=${encodeURIComponent(fromCode.toUpperCase())}&to=${encodeURIComponent(toCode.toUpperCase())}&date=${encodeURIComponent(date)}&classType=${encodeURIComponent(classType)}&quota=${encodeURIComponent(quota)}`;
    return railwayApiService.fetchJson<ClassSeatAvailability>(url);
  },

  /**
   * 6. Fare Enquiry
   */
  async getFareEnquiry(
    trainNo: string,
    fromCode: string,
    toCode: string,
    classType: string,
    quota: string = 'GN'
  ): Promise<FareBreakdown> {
    const cleanTrain = trainNo.trim().replace(/\D/g, '');

    if (cleanTrain.length !== 5) {
      throw new RailwayApiError('Invalid Train Number: Must be exactly 5 digits.', 'INVALID_INPUT');
    }
    if (!fromCode || !toCode) {
      throw new RailwayApiError('Origin and destination station codes are required.', 'INVALID_INPUT');
    }

    const url = `${API_CONFIG.endpoints.fareEnquiry}?trainNo=${cleanTrain}&from=${encodeURIComponent(fromCode.toUpperCase())}&to=${encodeURIComponent(toCode.toUpperCase())}&classType=${encodeURIComponent(classType)}&quota=${encodeURIComponent(quota)}`;
    return railwayApiService.fetchJson<FareBreakdown>(url);
  },
};
