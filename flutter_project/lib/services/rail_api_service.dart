import 'dart:async';
import '../models/train_models.dart';

class RailApiService {
  // Information-only RailSetu mock API service
  // No real credentials required. Simulates quick response and network states.

  static Future<List<Train>> searchTrains(String from, String to) async {
    await Future.delayed(const Duration(milliseconds: 800)); // Simulate latency
    
    // Check for empty or invalid station search
    if (from.isEmpty || to.isEmpty) {
      return [];
    }

    // Static mock train search data matching Indian Railways schedules
    return [
      Train(
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
        type: 'Vande Bharat',
      ),
      Train(
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
        type: 'Rajdhani',
      ),
    ];
  }

  static Future<PNRStatus?> getPNRStatus(String pnr) async {
    await Future.delayed(const Duration(milliseconds: 1000));
    
    if (pnr.length != 10) {
      throw Exception('Invalid PNR. PNR must be 10 digits long.');
    }

    return PNRStatus(
      pnr: pnr,
      trainNumber: '22436',
      trainName: 'NDLS BSB VANDE BHARAT EXP',
      dateOfJourney: '2026-07-25',
      from: 'NDLS (New Delhi)',
      to: 'BSB (Varanasi Jn)',
      boarding: 'New Delhi',
      travelClass: 'CC',
      chartStatus: 'CHART NOT PREPARED',
      passengers: [
        PNRPassenger(
          number: 1,
          bookingStatus: 'CNF',
          currentStatus: 'CNF',
          coach: 'C4',
          berth: 42,
        ),
        PNRPassenger(
          number: 2,
          bookingStatus: 'WL 12',
          currentStatus: 'CNF',
          coach: 'C4',
          berth: 43,
        ),
      ],
    );
  }

  static Future<LiveTrainStatus?> getLiveTrainStatus(String trainNumber) async {
    await Future.delayed(const Duration(milliseconds: 700));

    if (trainNumber != '22436' && trainNumber != '12424') {
      return null;
    }

    return LiveTrainStatus(
      trainNumber: trainNumber,
      trainName: trainNumber == '22436' ? 'NDLS BSB VANDE BHARAT EXP' : 'NDLS DBRT RAJDHANI',
      currentStation: 'Kanpur Central (CNB)',
      lastUpdated: 'Updated 5 minutes ago',
      delayMinutes: 5,
      headingText: 'Departed Kanpur Central (CNB) 5 mins late.',
      route: [
        StationPassing(
          stationName: 'New Delhi',
          stationCode: 'NDLS',
          scheduledArrival: 'Source',
          scheduledDeparture: '06:00',
          actualArrival: 'Source',
          actualDeparture: '06:00',
          delayMinutes: 0,
          status: 'Passed',
          platform: '16',
        ),
        StationPassing(
          stationName: 'Kanpur Central',
          stationCode: 'CNB',
          scheduledArrival: '10:08',
          scheduledDeparture: '10:10',
          actualArrival: '10:11',
          actualDeparture: '10:15',
          delayMinutes: 5,
          status: 'Passed',
          platform: '5',
        ),
        StationPassing(
          stationName: 'Varanasi Jn',
          stationCode: 'BSB',
          scheduledArrival: '14:00',
          scheduledDeparture: 'Destination',
          actualArrival: '14:00',
          actualDeparture: 'Destination',
          delayMinutes: 0,
          status: 'Upcoming',
          platform: '1',
        ),
      ],
    );
  }
}
