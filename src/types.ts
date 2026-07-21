export interface Train {
  number: string;
  name: string;
  from: string;
  fromCode: string;
  to: string;
  toCode: string;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  runsOn: string[]; // ['M', 'T', 'W', 'T', 'F', 'S', 'S']
  classes: string[]; // ['1A', '2A', '3A', 'SL', 'CC', '2S']
  type: 'Vande Bharat' | 'Shatabdi' | 'Rajdhani' | 'Superfast' | 'Express';
}

export interface PNRPassenger {
  number: number;
  bookingStatus: string;
  currentStatus: string;
  coach?: string;
  berth?: number;
}

export interface PNRStatus {
  pnr: string;
  trainNumber: string;
  trainName: string;
  dateOfJourney: string;
  from: string;
  fromCode: string;
  to: string;
  toCode: string;
  boarding: string;
  boardingCode: string;
  class: string;
  chartStatus: 'CHART PREPARED' | 'CHART NOT PREPARED';
  passengers: PNRPassenger[];
}

export interface StationPassing {
  stationName: string;
  stationCode: string;
  scheduledArrival: string;
  scheduledDeparture: string;
  actualArrival: string;
  actualDeparture: string;
  delayMinutes: number;
  status: 'Passed' | 'Arrived' | 'Upcoming' | 'Current';
  platform: string;
  distanceKm: number;
}

export interface LiveTrainStatus {
  trainNumber: string;
  trainName: string;
  currentStation: string;
  lastUpdated: string;
  delayMinutes: number;
  headingText: string;
  route: StationPassing[];
}

export interface SeatStatus {
  date: string;
  status: string; // 'AVAILABLE-0045', 'GNWL12/WL5', 'RAC2/RAC2', 'AVAILABLE-0120'
  probability?: string; // 'High', 'Medium', 'Low'
  fare: number;
}

export interface ClassSeatAvailability {
  className: string;
  availability: SeatStatus[];
}

export interface FareBreakdown {
  baseFare: number;
  superfastCharge: number;
  reservationFee: number;
  cateringCharge: number;
  gst: number;
  total: number;
}

export interface DisruptedTrain {
  trainNumber: string;
  trainName: string;
  from: string;
  to: string;
  type: 'Cancelled' | 'Rescheduled' | 'Diverted';
  details: string; // e.g., "Rescheduled by 2 hrs due to fog", "Diverted via ALD-BSB"
  date: string;
}

export interface PlatformDetails {
  stationCode: string;
  stationName: string;
  trainNumber: string;
  trainName: string;
  scheduledPlatform: string;
  expectedPlatform: string;
  arrivalTime: string;
  departureTime: string;
}

export interface SavedItem {
  id: string;
  type: 'pnr' | 'train' | 'search';
  title: string;
  subtitle: string;
  timestamp: string;
  payload: any;
}
