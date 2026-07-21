import { PNRStatus, LiveTrainStatus, Train, ClassSeatAvailability, FareBreakdown } from '../types';
import { railwayApiService } from './railwayApi';

/**
 * Clean Architecture Interface definition for Indian Railways query engine.
 * Contains placeholders for all required endpoints to connect to real-world central nodes.
 */
export interface RailwayService {
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
  getCoachPosition(trainNo: string): Promise<any>;
}

export class RailwayServiceImpl implements RailwayService {
  /**
   * 1. PNR Status enquiry placeholder
   */
  async getPnrStatus(pnrNumber: string): Promise<PNRStatus> {
    return railwayApiService.getPnrStatus(pnrNumber);
  }

  /**
   * 2. Live train GPS telemetry status placeholder
   */
  async getLiveTrainStatus(trainNo: string): Promise<LiveTrainStatus> {
    return railwayApiService.getLiveTrainStatus(trainNo);
  }

  /**
   * 3. Trains list search placeholder
   */
  async searchTrains(fromStation: string, toStation: string, date: string): Promise<Train[]> {
    return railwayApiService.searchTrains(fromStation, toStation, date);
  }

  /**
   * 4. Train station timetable/stops schedule list placeholder
   */
  async getTrainSchedule(trainNo: string): Promise<any> {
    return railwayApiService.getTrainSchedule(trainNo);
  }

  /**
   * 5. Seat availability checks placeholder
   */
  async checkSeatAvailability(
    trainNo: string,
    fromCode: string,
    toCode: string,
    date: string,
    classType: string,
    quota?: string
  ): Promise<ClassSeatAvailability> {
    return railwayApiService.checkSeatAvailability(trainNo, fromCode, toCode, date, classType, quota);
  }

  /**
   * 6. Ticket pricing fare enquiry calculation placeholder
   */
  async getFareEnquiry(
    trainNo: string,
    fromCode: string,
    toCode: string,
    classType: string,
    quota?: string
  ): Promise<FareBreakdown> {
    return railwayApiService.getFareEnquiry(trainNo, fromCode, toCode, classType, quota);
  }

  /**
   * 7. Coach layout and rake composition platform locator placeholder
   * Note: This connects to live coach allocation API gateways.
   */
  async getCoachPosition(trainNo: string): Promise<any> {
    // There is no pre-existing coach position endpoint in the backend.
    // In production, this would make a live call to /api/coach
    const response = await fetch(`/api/coach?trainNo=${encodeURIComponent(trainNo)}`);
    if (!response.ok) {
      throw new Error('Coach position information is currently unavailable.');
    }
    return response.json();
  }
}

export const railwayService: RailwayService = new RailwayServiceImpl();
