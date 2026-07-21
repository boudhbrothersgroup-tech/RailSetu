import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:firebase_storage/firebase_storage.dart';
import 'dart:io';

class FirebaseService {
  static final FirebaseService _instance = FirebaseService._internal();
  factory FirebaseService() => _instance;
  FirebaseService._internal();

  final FirebaseAuth _auth = FirebaseAuth.instance;
  final FirebaseFirestore _firestore = FirebaseFirestore.instance;
  final FirebaseMessaging _messaging = FirebaseMessaging.instance;
  final FirebaseStorage _storage = FirebaseStorage.instance;

  // Firebase Auth functions
  User? get currentUser => _auth.currentUser;
  Stream<User?> get authStateChanges => _auth.authStateChanges();

  Future<UserCredential> signInWithEmailAndPassword(String email, String password) async {
    return await _auth.signInWithEmailAndPassword(email: email, password: password);
  }

  Future<UserCredential> signUpWithEmailAndPassword({
    required String email,
    required String password,
    required String name,
  }) async {
    UserCredential credential = await _auth.createUserWithEmailAndPassword(
      email: email,
      password: password,
    );
    
    // Update display name
    await credential.user?.updateDisplayName(name);
    
    // Create initial user profile in Firestore
    await _firestore.collection('users').doc(credential.user?.uid).set({
      'name': name,
      'email': email,
      'createdAt': FieldValue.serverTimestamp(),
    });

    return credential;
  }

  Future<void> signOut() async {
    await _auth.signOut();
  }

  Future<void> sendPasswordResetEmail(String email) async {
    await _auth.sendPasswordResetEmail(email: email);
  }

  // Firestore Profile Functions
  Future<void> saveUserProfile({
    required String name,
    required String age,
    required String gender,
    required String mobile,
    required String idProofType,
    required String idProofNum,
    required String preferredClass,
  }) async {
    final uid = _auth.currentUser?.uid;
    if (uid == null) throw Exception("No user logged in to sync profile data");

    await _firestore.collection('users').doc(uid).set({
      'name': name,
      'age': age,
      'gender': gender,
      'mobile': mobile,
      'idProofType': idProofType,
      'idProofNum': idProofNum,
      'preferredClass': preferredClass,
      'updatedAt': FieldValue.serverTimestamp(),
    }, SetOptions(merge: true));
  }

  Future<DocumentSnapshot> getUserProfile() async {
    final uid = _auth.currentUser?.uid;
    if (uid == null) throw Exception("No user logged in to fetch profile data");
    return await _firestore.collection('users').doc(uid).get();
  }

  // Firestore Favorites syncing
  Future<void> pinTrain({required String trainNumber, required String name, required String travelClass}) async {
    final uid = _auth.currentUser?.uid;
    if (uid == null) throw Exception("No user logged in to pin train");

    await _firestore.collection('users').doc(uid).collection('pinned_trains').doc(trainNumber).set({
      'number': trainNumber,
      'name': name,
      'class': travelClass,
      'pinnedAt': FieldValue.serverTimestamp(),
    });
  }

  Future<void> unpinTrain(String trainNumber) async {
    final uid = _auth.currentUser?.uid;
    if (uid == null) return;
    await _firestore.collection('users').doc(uid).collection('pinned_trains').doc(trainNumber).delete();
  }

  Stream<QuerySnapshot> getPinnedTrains() {
    final uid = _auth.currentUser?.uid;
    if (uid == null) return const Stream.empty();
    return _firestore.collection('users').doc(uid).collection('pinned_trains').orderBy('pinnedAt', descending: true).snapshots();
  }

  Future<void> pinRoute({required String from, required String to, required String fromName, required String toName}) async {
    final uid = _auth.currentUser?.uid;
    if (uid == null) throw Exception("No user logged in to pin route");

    final routeId = "${from}_to_${to}".toUpperCase();
    await _firestore.collection('users').doc(uid).collection('pinned_routes').doc(routeId).set({
      'from': from,
      'to': to,
      'fromName': fromName,
      'toName': toName,
      'pinnedAt': FieldValue.serverTimestamp(),
    });
  }

  Future<void> unpinRoute(String from, String to) async {
    final uid = _auth.currentUser?.uid;
    if (uid == null) return;
    final routeId = "${from}_to_${to}".toUpperCase();
    await _firestore.collection('users').doc(uid).collection('pinned_routes').doc(routeId).delete();
  }

  Stream<QuerySnapshot> getPinnedRoutes() {
    final uid = _auth.currentUser?.uid;
    if (uid == null) return const Stream.empty();
    return _firestore.collection('users').doc(uid).collection('pinned_routes').orderBy('pinnedAt', descending: true).snapshots();
  }

  // Firebase Storage - Upload Profile Picture
  Future<String> uploadProfilePicture(File imageFile) async {
    final uid = _auth.currentUser?.uid;
    if (uid == null) throw Exception("No authenticated user");

    final ref = _storage.ref().child('user_profiles').child('$uid.jpg');
    final uploadTask = await ref.putFile(imageFile);
    final downloadUrl = await uploadTask.ref.getDownloadURL();

    // Update profile in Firestore and Auth display photo
    await _auth.currentUser?.updatePhotoURL(downloadUrl);
    await _firestore.collection('users').doc(uid).update({
      'photoUrl': downloadUrl,
    });

    return downloadUrl;
  }

  // Firebase Cloud Messaging (FCM)
  Future<void> initializeNotificationPipeline() async {
    // Request notification permission (critical for iOS/Android 13+)
    NotificationSettings settings = await _messaging.requestPermission(
      alert: true,
      badge: true,
      sound: true,
    );

    if (settings.authorizationStatus == AuthorizationStatus.authorized) {
      // Get FCM device registration token
      String? token = await _messaging.getToken();
      print("RailSetu FCM Registration Token: $token");

      if (token != null) {
        await _saveDeviceTokenToDatabase(token);
      }

      // Handle token refreshes
      _messaging.onTokenRefresh.listen((newToken) async {
        await _saveDeviceTokenToDatabase(newToken);
      });

      // Handle Foreground Messages
      FirebaseMessaging.onMessage.listen((RemoteMessage message) {
        print("RailSetu Foreground Notification Received: ${message.notification?.title}");
        // Here you can trigger local notification builders or dynamic in-app UI banners
      });

      // Handle background message clicks
      FirebaseMessaging.onMessageOpenedApp.listen((RemoteMessage message) {
        print("RailSetu Background Notification Tapped!");
      });
    }
  }

  Future<void> _saveDeviceTokenToDatabase(String token) async {
    final uid = _auth.currentUser?.uid;
    if (uid == null) return;
    
    await _firestore.collection('users').doc(uid).collection('tokens').doc(token).set({
      'token': token,
      'createdAt': FieldValue.serverTimestamp(),
      'platform': Platform.isAndroid ? 'android' : Platform.isIOS ? 'ios' : 'web',
    });
  }
}
