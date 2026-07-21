import 'package:flutter/material.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'services/firebase_service.dart';
import 'screens/splash_screen.dart';

// Top-level background message handler for Firebase Cloud Messaging (FCM)
@pragma('vm:entry-point')
Future<void> _firebaseMessagingBackgroundHandler(RemoteMessage message) async {
  // Initialize Firebase inside background isolates/workers
  await Firebase.initializeApp();
  print("RailSetu Background Message Handler Received ID: ${message.messageId}");
}

void main() async {
  // Ensure that Flutter bindings are initialized before calling Firebase.initializeApp
  WidgetsFlutterBinding.ensureInitialized();

  // Initialize Firebase Core services
  await Firebase.initializeApp();

  // Set the background messaging handler early on, as a top-level function
  FirebaseMessaging.onBackgroundMessage(_firebaseMessagingBackgroundHandler);

  // Initialize FCM token registration, permissions, and pipeline triggers
  await FirebaseService().initializeNotificationPipeline();

  runApp(const RailSetuApp());
}

class RailSetuApp extends StatelessWidget {
  const RailSetuApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'RailSetu',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        useMaterial3: true,
        colorScheme: ColorScheme.fromSeed(
          seedColor: const Color(0x0D47A1), // Indian Railways Deep Blue
          primary: const Color(0x0D47A1),
          secondary: const Color(0xFFFF9800), // Indian Railways Vibrant Orange
          surface: Colors.white,
          onPrimary: Colors.white,
          onSecondary: Colors.black,
        ),
        appBarTheme: const AppBarTheme(
          backgroundColor: Color(0x0D47A1),
          foregroundColor: Colors.white,
          elevation: 0,
        ),
        bottomNavigationBarTheme: const BottomNavigationBarThemeData(
          selectedItemColor: Color(0x0D47A1),
          unselectedItemColor: Colors.grey,
        ),
      ),
      home: const SplashScreen(),
    );
  }
}
