import { Train, PNRStatus, LiveTrainStatus, ClassSeatAvailability, DisruptedTrain, PlatformDetails, SavedItem } from '../types';

export const MOCK_TRAINS: Train[] = [
  {
    number: '22436',
    name: 'NDLS BSB VANDE BHARAT EXP',
    from: 'New Delhi',
    fromCode: 'NDLS',
    to: 'Varanasi Jn',
    toCode: 'BSB',
    departureTime: '06:00',
    arrivalTime: '14:00',
    duration: '08h 00m',
    runsOn: ['Mon', 'Tue', 'Wed', 'Fri', 'Sat', 'Sun'],
    classes: ['EC', 'CC'],
    type: 'Vande Bharat'
  },
  {
    number: '12424',
    name: 'NDLS DBRT RAJDHANI',
    from: 'New Delhi',
    fromCode: 'NDLS',
    to: 'Dibrugarh',
    toCode: 'DBRT',
    departureTime: '16:10',
    arrivalTime: '07:00',
    duration: '38h 50m',
    runsOn: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    classes: ['1A', '2A', '3A'],
    type: 'Rajdhani'
  },
  {
    number: '12002',
    name: 'NDLS BPL SHATABDI EXP',
    from: 'New Delhi',
    fromCode: 'NDLS',
    to: 'Bhopal Jn',
    toCode: 'BPL',
    departureTime: '06:00',
    arrivalTime: '14:40',
    duration: '08h 40m',
    runsOn: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    classes: ['EC', 'CC'],
    type: 'Shatabdi'
  },
  {
    number: '12626',
    name: 'NDLS TVC KERALA EXPRESS',
    from: 'New Delhi',
    fromCode: 'NDLS',
    to: 'Trivandrum Central',
    toCode: 'TVC',
    departureTime: '20:10',
    arrivalTime: '21:50',
    duration: '49h 40m',
    runsOn: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    classes: ['2A', '3A', 'SL', '2S'],
    type: 'Superfast'
  },
  {
    number: '12952',
    name: 'NDLS MMCT MUMBAI RAJDHANI',
    from: 'New Delhi',
    fromCode: 'NDLS',
    to: 'Mumbai Central',
    toCode: 'MMCT',
    departureTime: '16:55',
    arrivalTime: '08:35',
    duration: '15h 40m',
    runsOn: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    classes: ['1A', '2A', '3A'],
    type: 'Rajdhani'
  },
  {
    number: '12260',
    name: 'HWH NDLS DURONTO EXP',
    from: 'Howrah Jn',
    fromCode: 'HWH',
    to: 'New Delhi',
    toCode: 'NDLS',
    departureTime: '16:15',
    arrivalTime: '10:30',
    duration: '18h 15m',
    runsOn: ['Tue', 'Wed', 'Fri', 'Sat'],
    classes: ['1A', '2A', '3A', 'SL'],
    type: 'Superfast'
  }
];

export const MOCK_PNRS: PNRStatus[] = [
  {
    pnr: '4321098765',
    trainNumber: '22436',
    trainName: 'NDLS BSB VANDE BHARAT EXP',
    dateOfJourney: '2026-07-25',
    from: 'New Delhi',
    fromCode: 'NDLS',
    to: 'Varanasi Jn',
    toCode: 'BSB',
    boarding: 'New Delhi',
    boardingCode: 'NDLS',
    class: 'CC',
    chartStatus: 'CHART NOT PREPARED',
    passengers: [
      {
        number: 1,
        bookingStatus: 'CNF',
        currentStatus: 'CNF',
        coach: 'C4',
        berth: 42
      },
      {
        number: 2,
        bookingStatus: 'WL 12',
        currentStatus: 'CNF',
        coach: 'C4',
        berth: 43
      }
    ]
  },
  {
    pnr: '9876543210',
    trainNumber: '12424',
    trainName: 'NDLS DBRT RAJDHANI',
    dateOfJourney: '2026-07-28',
    from: 'New Delhi',
    fromCode: 'NDLS',
    to: 'Kanpur Central',
    toCode: 'CNB',
    boarding: 'New Delhi',
    boardingCode: 'NDLS',
    class: '3A',
    chartStatus: 'CHART PREPARED',
    passengers: [
      {
        number: 1,
        bookingStatus: 'GNWL 4 / WL 2',
        currentStatus: 'CNF',
        coach: 'B2',
        berth: 18
      },
      {
        number: 2,
        bookingStatus: 'GNWL 5 / WL 3',
        currentStatus: 'GNWL 1 / WL 1',
        coach: 'None',
        berth: 0
      }
    ]
  }
];

export const MOCK_LIVE_STATUS: Record<string, LiveTrainStatus> = {
  '22436': {
    trainNumber: '22436',
    trainName: 'NDLS BSB VANDE BHARAT EXP',
    currentStation: 'Kanpur Central (CNB)',
    lastUpdated: '10 mins ago',
    delayMinutes: 5,
    headingText: 'Departed Kanpur Central (CNB) 5 mins late. Next stop Prayagraj Jn (PRYJ).',
    route: [
      {
        stationName: 'New Delhi',
        stationCode: 'NDLS',
        scheduledArrival: 'Source',
        scheduledDeparture: '06:00',
        actualArrival: 'Source',
        actualDeparture: '06:00',
        delayMinutes: 0,
        status: 'Passed',
        platform: '16',
        distanceKm: 0
      },
      {
        stationName: 'Kanpur Central',
        stationCode: 'CNB',
        scheduledArrival: '10:08',
        scheduledDeparture: '10:10',
        actualArrival: '10:11',
        actualDeparture: '10:15',
        delayMinutes: 5,
        status: 'Passed',
        platform: '5',
        distanceKm: 440
      },
      {
        stationName: 'Prayagraj Jn',
        stationCode: 'PRYJ',
        scheduledArrival: '12:08',
        scheduledDeparture: '12:10',
        actualArrival: '12:10',
        actualDeparture: '12:12',
        delayMinutes: 2,
        status: 'Upcoming',
        platform: '6',
        distanceKm: 633
      },
      {
        stationName: 'Varanasi Jn',
        stationCode: 'BSB',
        scheduledArrival: '14:00',
        scheduledDeparture: 'Destination',
        actualArrival: '14:00',
        actualDeparture: 'Destination',
        delayMinutes: 0,
        status: 'Upcoming',
        platform: '1',
        distanceKm: 755
      }
    ]
  },
  '12424': {
    trainNumber: '12424',
    trainName: 'NDLS DBRT RAJDHANI',
    currentStation: 'New Delhi (NDLS)',
    lastUpdated: 'Just now',
    delayMinutes: 0,
    headingText: 'Train is at source station New Delhi (NDLS). Departure scheduled at 16:10.',
    route: [
      {
        stationName: 'New Delhi',
        stationCode: 'NDLS',
        scheduledArrival: 'Source',
        scheduledDeparture: '16:10',
        actualArrival: '16:10',
        actualDeparture: '16:10',
        delayMinutes: 0,
        status: 'Current',
        platform: '12',
        distanceKm: 0
      },
      {
        stationName: 'Kanpur Central',
        stationCode: 'CNB',
        scheduledArrival: '21:40',
        scheduledDeparture: '21:45',
        actualArrival: '21:40',
        actualDeparture: '21:45',
        delayMinutes: 0,
        status: 'Upcoming',
        platform: '4',
        distanceKm: 440
      },
      {
        stationName: 'Prayagraj Jn',
        stationCode: 'PRYJ',
        scheduledArrival: '23:50',
        scheduledDeparture: '23:53',
        actualArrival: '23:50',
        actualDeparture: '23:53',
        delayMinutes: 0,
        status: 'Upcoming',
        platform: '5',
        distanceKm: 633
      },
      {
        stationName: 'Patna Jn',
        stationCode: 'PNBE',
        scheduledArrival: '04:15',
        scheduledDeparture: '04:25',
        actualArrival: '04:15',
        actualDeparture: '04:25',
        delayMinutes: 0,
        status: 'Upcoming',
        platform: '1',
        distanceKm: 998
      }
    ]
  }
};

export const MOCK_SEAT_AVAILABILITY: Record<string, ClassSeatAvailability[]> = {
  '22436': [
    {
      className: 'CC',
      availability: [
        { date: '25 Jul', status: 'AVAILABLE-0145', probability: 'High', fare: 1450 },
        { date: '26 Jul', status: 'AVAILABLE-0082', probability: 'High', fare: 1450 },
        { date: '27 Jul', status: 'RAC 4 / RAC 2', probability: 'Medium', fare: 1450 },
        { date: '28 Jul', status: 'GNWL 25 / WL 12', probability: 'Medium', fare: 1450 },
        { date: '29 Jul', status: 'GNWL 45 / WL 28', probability: 'Low', fare: 1450 },
        { date: '30 Jul', status: 'AVAILABLE-0210', probability: 'High', fare: 1450 }
      ]
    },
    {
      className: 'EC',
      availability: [
        { date: '25 Jul', status: 'AVAILABLE-0012', probability: 'High', fare: 2950 },
        { date: '26 Jul', status: 'AVAILABLE-0004', probability: 'High', fare: 2950 },
        { date: '27 Jul', status: 'GNWL 2 / WL 1', probability: 'High', fare: 2950 },
        { date: '28 Jul', status: 'GNWL 8 / WL 4', probability: 'Medium', fare: 2950 },
        { date: '29 Jul', status: 'GNWL 15 / WL 9', probability: 'Low', fare: 2950 },
        { date: '30 Jul', status: 'AVAILABLE-0024', probability: 'High', fare: 2950 }
      ]
    }
  ],
  '12424': [
    {
      className: '3A',
      availability: [
        { date: '28 Jul', status: 'AVAILABLE-0230', probability: 'High', fare: 1850 },
        { date: '29 Jul', status: 'AVAILABLE-0110', probability: 'High', fare: 1850 },
        { date: '30 Jul', status: 'AVAILABLE-0050', probability: 'High', fare: 1850 },
        { date: '31 Jul', status: 'RAC 12 / RAC 8', probability: 'High', fare: 1850 },
        { date: '01 Aug', status: 'GNWL 54 / WL 23', probability: 'Medium', fare: 1850 },
        { date: '02 Aug', status: 'GNWL 98 / WL 42', probability: 'Low', fare: 1850 }
      ]
    },
    {
      className: '2A',
      availability: [
        { date: '28 Jul', status: 'AVAILABLE-0042', probability: 'High', fare: 2650 },
        { date: '29 Jul', status: 'AVAILABLE-0018', probability: 'High', fare: 2650 },
        { date: '30 Jul', status: 'RAC 2 / CNF', probability: 'High', fare: 2650 },
        { date: '31 Jul', status: 'GNWL 8 / WL 3', probability: 'Medium', fare: 2650 },
        { date: '01 Aug', status: 'GNWL 18 / WL 7', probability: 'Medium', fare: 2650 },
        { date: '02 Aug', status: 'AVAILABLE-0022', probability: 'High', fare: 2650 }
      ]
    },
    {
      className: '1A',
      availability: [
        { date: '28 Jul', status: 'AVAILABLE-0008', probability: 'High', fare: 4200 },
        { date: '29 Jul', status: 'AVAILABLE-0004', probability: 'High', fare: 4200 },
        { date: '30 Jul', status: 'WL 1 / REGRET', probability: 'Low', fare: 4200 },
        { date: '31 Jul', status: 'GNWL 3 / WL 1', probability: 'High', fare: 4200 },
        { date: '01 Aug', status: 'AVAILABLE-0002', probability: 'High', fare: 4200 },
        { date: '02 Aug', status: 'AVAILABLE-0005', probability: 'High', fare: 4200 }
      ]
    }
  ]
};

export const MOCK_DISRUPTIONS: DisruptedTrain[] = [
  {
    trainNumber: '12056',
    trainName: 'DDN NDLS JANSHATABDI',
    from: 'Dehradun',
    to: 'New Delhi',
    type: 'Cancelled',
    details: 'Fully cancelled due to operational reasons and track maintenance near Meerut.',
    date: '2026-07-20'
  },
  {
    trainNumber: '12259',
    trainName: 'NDLS HWH DURONTO EXP',
    from: 'New Delhi',
    to: 'Howrah Jn',
    type: 'Rescheduled',
    details: 'Rescheduled by 02 hours 30 mins due to late arrival of linking rake. New departure: 18:45.',
    date: '2026-07-20'
  },
  {
    trainNumber: '12397',
    trainName: 'GAYA NDLS MAHABODHI EXP',
    from: 'Gaya Jn',
    to: 'New Delhi',
    type: 'Diverted',
    details: 'Diverted via Patna Jn - Ara - Buxar due to signal upgradation work at Kanpur bypass.',
    date: '2026-07-20'
  }
];

export const MOCK_PLATFORMS: PlatformDetails[] = [
  {
    stationCode: 'NDLS',
    stationName: 'New Delhi',
    trainNumber: '22436',
    trainName: 'NDLS BSB VANDE BHARAT EXP',
    scheduledPlatform: '16',
    expectedPlatform: '16',
    arrivalTime: 'Source',
    departureTime: '06:00'
  },
  {
    stationCode: 'NDLS',
    stationName: 'New Delhi',
    trainNumber: '12424',
    trainName: 'NDLS DBRT RAJDHANI',
    scheduledPlatform: '12',
    expectedPlatform: '12',
    arrivalTime: 'Source',
    departureTime: '16:10'
  },
  {
    stationCode: 'CNB',
    stationName: 'Kanpur Central',
    trainNumber: '22436',
    trainName: 'NDLS BSB VANDE BHARAT EXP',
    scheduledPlatform: '5',
    expectedPlatform: '5',
    arrivalTime: '10:08',
    departureTime: '10:10'
  }
];

export const MOCK_COACH_LAYOUTS: Record<string, string[]> = {
  '22436': ['ENG', 'C1', 'C2', 'C3', 'C4', 'C5', 'C6', 'C7', 'C8', 'C9', 'C10', 'E1', 'E2', 'ENG'],
  '12424': ['ENG', 'H1', 'A1', 'A2', 'B1', 'B2', 'B3', 'B4', 'B5', 'B6', 'PC', 'S1', 'S2', 'ENG'],
  'DEFAULT': ['ENG', 'H1', 'A1', 'B1', 'B2', 'PC', 'S1', 'S2', 'S3', 'S4', 'S5', 'GEN', 'GEN', 'ENG']
};

export const FARE_BREAKUP_CC = {
  baseFare: 1120,
  superfastCharge: 45,
  reservationFee: 40,
  cateringCharge: 195,
  gst: 50,
  total: 1450
};

export const FARE_BREAKUP_EC = {
  baseFare: 2450,
  superfastCharge: 75,
  reservationFee: 60,
  cateringCharge: 265,
  gst: 100,
  total: 2950
};

export const INITIAL_SAVED_ITEMS: SavedItem[] = [
  {
    id: 'save-1',
    type: 'train',
    title: '22436 - NDLS BSB VANDE BHARAT EXP',
    subtitle: 'New Delhi ➔ Varanasi Jn',
    timestamp: '2026-07-20T03:00:00Z',
    payload: { number: '22436' }
  },
  {
    id: 'save-2',
    type: 'pnr',
    title: '4321098765',
    subtitle: 'Vande Bharat - CNF',
    timestamp: '2026-07-20T04:15:00Z',
    payload: { pnr: '4321098765' }
  }
];

export const INITIAL_HISTORY: SavedItem[] = [
  {
    id: 'hist-1',
    type: 'search',
    title: 'NDLS to BSB',
    subtitle: 'New Delhi to Varanasi Jn',
    timestamp: '2026-07-20T05:00:00Z',
    payload: { from: 'NDLS', to: 'BSB' }
  },
  {
    id: 'hist-2',
    type: 'pnr',
    title: '9876543210',
    subtitle: 'NDLS DBRT RAJDHANI',
    timestamp: '2026-07-19T14:30:00Z',
    payload: { pnr: '9876543210' }
  }
];
