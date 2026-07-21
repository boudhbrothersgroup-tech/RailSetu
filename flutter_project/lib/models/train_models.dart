class Train {
  final String number;
  final String name;
  final String from;
  final String fromCode;
  final String to;
  final String toCode;
  final String departureTime;
  final String arrivalTime;
  final String duration;
  final List<String> runsOn;
  final List<String> classes;
  final String type;

  Train({
    required this.number,
    required this.name,
    required this.from,
    required this.fromCode,
    required this.to,
    required this.toCode,
    required this.departureTime,
    required this.arrivalTime,
    required this.duration,
    required this.runsOn,
    required this.classes,
    required this.type,
  });
}

class PNRPassenger {
  final int number;
  final String bookingStatus;
  final String currentStatus;
  final String? coach;
  final int? berth;

  PNRPassenger({
    required this.number,
    required this.bookingStatus,
    required this.currentStatus,
    this.coach,
    this.berth,
  });
}

class PNRStatus {
  final String pnr;
  final String trainNumber;
  final String trainName;
  final String dateOfJourney;
  final String from;
  final String to;
  final String boarding;
  final String travelClass;
  final String chartStatus;
  final List<PNRPassenger> passengers;

  PNRStatus({
    required this.pnr,
    required this.trainNumber,
    required this.trainName,
    required this.dateOfJourney,
    required this.from,
    required this.to,
    required this.boarding,
    required this.travelClass,
    required this.chartStatus,
    required this.passengers,
  });
}

class StationPassing {
  final String stationName;
  final String stationCode;
  final String scheduledArrival;
  final String scheduledDeparture;
  final String actualArrival;
  final String actualDeparture;
  final int delayMinutes;
  final String status;
  final String platform;

  StationPassing({
    required this.stationName,
    required this.stationCode,
    required this.scheduledArrival,
    required this.scheduledDeparture,
    required this.actualArrival,
    required this.actualDeparture,
    required this.delayMinutes,
    required this.status,
    required this.platform,
  });
}

class LiveTrainStatus {
  final String trainNumber;
  final String trainName;
  final String currentStation;
  final String lastUpdated;
  final int delayMinutes;
  final String headingText;
  final List<StationPassing> route;

  LiveTrainStatus({
    required this.trainNumber,
    required this.trainName,
    required this.currentStation,
    required this.lastUpdated,
    required this.delayMinutes,
    required this.headingText,
    required this.route,
  });
}
