import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'models/user_model.dart';
import 'screens/login_screen.dart';
import 'screens/main_navigation_screen.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  runApp(const ChessXFlutterApp());
}

class ChessXFlutterApp extends StatelessWidget {
  const ChessXFlutterApp({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'ChessX',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        brightness: Brightness.dark,
        scaffoldBackgroundColor: const Color(0xFF0F0F1A),
        primaryColor: const Color(0xFF6C5CE7),
        fontFamily: 'Inter',
        colorScheme: const ColorScheme.dark(
          primary: Color(0xFF6C5CE7),
          secondary: Color(0xFF00CEC9),
          surface: Color(0xFF1A1A2E),
        ),
      ),
      home: const AuthWrapper(),
    );
  }
}

class AuthWrapper extends StatelessWidget {
  const AuthWrapper({Key? key}) : super(key: key);

  Future<Map<String, dynamic>> _checkInitialAuthState() async {
    final prefs = await SharedPreferences.getInstance();
    final isLoggedIn = prefs.getBool('is_logged_in') ?? false;
    final userJson = prefs.getString('chessx_user');

    if (isLoggedIn && userJson != null) {
      final user = UserModel.fromJson(userJson);
      return {'isLoggedIn': true, 'user': user};
    }
    return {'isLoggedIn': false, 'user': null};
  }

  @override
  Widget build(BuildContext context) {
    return FutureBuilder<Map<String, dynamic>>(
      future: _checkInitialAuthState(),
      builder: (context, snapshot) {
        if (snapshot.connectionState == ConnectionState.waiting) {
          return const Scaffold(
            backgroundColor: Color(0xFF0F0F1A),
            body: Center(
              child: CircularProgressIndicator(color: Color(0xFF6C5CE7)),
            ),
          );
        }

        final data = snapshot.data;
        if (data != null && data['isLoggedIn'] == true && data['user'] != null) {
          // If already logged in, enter Main App Navigation Shell
          return MainNavigationScreen(currentUser: data['user'] as UserModel);
        }

        // Default: Login Screen opens FIRST on app launch!
        return const LoginScreen();
      },
    );
  }
}
