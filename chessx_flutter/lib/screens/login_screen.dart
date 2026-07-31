import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../models/user_model.dart';
import '../widgets/google_sign_in_button.dart';
import 'main_navigation_screen.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({Key? key}) : super(key: key);

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> with SingleTickerProviderStateMixin {
  late TabController _tabController;
  
  final _loginEmailController = TextEditingController(text: 'player@chessx.com');
  final _loginPassController = TextEditingController(text: 'password123');
  final _regUserController = TextEditingController();
  final _regEmailController = TextEditingController();
  final _regPassController = TextEditingController();

  bool _obscureLoginPass = true;
  bool _obscureRegPass = true;
  bool _rememberMe = true;
  bool _isLoading = false;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
  }

  @override
  void dispose() {
    _tabController.dispose();
    _loginEmailController.dispose();
    _loginPassController.dispose();
    _regUserController.dispose();
    _regEmailController.dispose();
    _regPassController.dispose();
    super.dispose();
  }

  Future<void> _handleAuthSuccess(UserModel user) async {
    setState(() => _isLoading = true);
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('chessx_user', user.toJson());
    await prefs.setBool('is_logged_in', true);

    if (!mounted) return;
    setState(() => _isLoading = false);

    // Replace initial route with Main App Navigation Screen
    Navigator.of(context).pushReplacement(
      MaterialPageRoute(builder: (context) => MainNavigationScreen(currentUser: user)),
    );
  }

  void _signInWithGoogle() {
    final googleUser = UserModel(
      id: 'usr_google_${DateTime.now().millisecondsSinceEpoch}',
      username: 'Grandmaster Google Player',
      email: 'player@gmail.com',
      provider: 'google',
      loggedInAt: DateTime.now(),
    );
    
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('Successfully authenticated with Google!'), backgroundColor: Color(0xFF00B894)),
    );
    
    _handleAuthSuccess(googleUser);
  }

  void _loginWithEmail() {
    final email = _loginEmailController.text.trim();
    if (email.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please enter email or username')),
      );
      return;
    }

    final user = UserModel(
      id: 'usr_email_${DateTime.now().millisecondsSinceEpoch}',
      username: email.contains('@') ? email.split('@')[0] : email,
      email: email.contains('@') ? email : '$email@chessx.com',
      provider: 'email',
      loggedInAt: DateTime.now(),
    );

    _handleAuthSuccess(user);
  }

  void _registerAccount() {
    final username = _regUserController.text.trim();
    final email = _regEmailController.text.trim();

    if (username.isEmpty || email.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please fill in all fields')),
      );
      return;
    }

    final user = UserModel(
      id: 'usr_new_${DateTime.now().millisecondsSinceEpoch}',
      username: username,
      email: email,
      provider: 'email',
      loggedInAt: DateTime.now(),
    );

    _handleAuthSuccess(user);
  }

  void _showForgotPasswordDialog() {
    final resetController = TextEditingController();
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        backgroundColor: const Color(0xFF1A1A2E),
        title: const Text('Reset Password', style: TextStyle(color: Colors.white)),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Enter your registered email address to receive password recovery instructions.',
              style: TextStyle(color: Color(0xFFA0A5BA), fontSize: 13),
            ),
            const SizedBox(height: 16),
            TextField(
              controller: resetController,
              style: const TextStyle(color: Colors.white),
              decoration: InputDecoration(
                hintText: 'user@domain.com',
                hintStyle: const TextStyle(color: Color(0xFF6C728F)),
                filled: true,
                fillColor: const Color(0xFF161626),
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(8)),
              ),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel', style: TextStyle(color: Colors.white54)),
          ),
          ElevatedButton(
            onPressed: () {
              Navigator.pop(context);
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(content: Text('Reset link sent to ${resetController.text}')),
              );
            },
            style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF6C5CE7)),
            child: const Text('Send Reset Link'),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0F0F1A), // Deep void background
      body: SafeArea(
        child: Center(
          child: SingleChildScrollView(
            padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 32),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                // Brand Header Logo
                Container(
                  width: 68,
                  height: 68,
                  decoration: BoxDecoration(
                    gradient: const LinearGradient(
                      colors: [Color(0xFF6C5CE7), Color(0xFF00CEC9)],
                    ),
                    borderRadius: BorderRadius.circular(16),
                    boxShadow: [
                      BoxShadow(
                        color: const Color(0xFF6C5CE7).withOpacity(0.4),
                        blurRadius: 20,
                        spreadRadius: 2,
                      ),
                    ],
                  ),
                  child: const Center(
                    child: Text('♔', style: TextStyle(fontSize: 40, color: Colors.white)),
                  ),
                ),
                const SizedBox(height: 16),
                RichText(
                  text: const TextSpan(
                    style: TextStyle(fontSize: 32, fontWeight: FontWeight.extrabold, fontFamily: 'Outfit'),
                    children: [
                      TextSpan(text: 'CHESS', style: TextStyle(color: Colors.white)),
                      TextSpan(text: 'X', style: TextStyle(color: Color(0xFF00CEC9))),
                    ],
                  ),
                ),
                const SizedBox(height: 8),
                const Text(
                  'Master the Grandmaster Mind',
                  style: TextStyle(color: Color(0xFFA0A5BA), fontSize: 14),
                ),
                const SizedBox(height: 32),

                // Glassmorphic Auth Container
                Container(
                  maxWidth: 440,
                  padding: const EdgeInsets.all(24),
                  decoration: BoxDecoration(
                    color: const Color(0xFF1A1A2E).withOpacity(0.85),
                    borderRadius: BorderRadius.circular(20),
                    border: Border.all(color: Colors.white.withOpacity(0.1)),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withOpacity(0.4),
                        blurRadius: 30,
                        offset: const Offset(0, 15),
                      ),
                    ],
                  ),
                  child: Column(
                    children: [
                      // Auth Tab Selector
                      Container(
                        decoration: BoxDecoration(
                          color: Colors.black.withOpacity(0.3),
                          borderRadius: BorderRadius.circular(10),
                        ),
                        child: TabBar(
                          controller: _tabController,
                          indicator: BoxDecoration(
                            borderRadius: BorderRadius.circular(8),
                            color: const Color(0xFF22223B),
                          ),
                          labelColor: Colors.white,
                          unselectedLabelColor: const Color(0xFFA0A5BA),
                          tabs: const [
                            Tab(text: 'Log In'),
                            Tab(text: 'Sign Up'),
                          ],
                        ),
                      ),
                      const SizedBox(height: 24),

                      // Google OAuth Button
                      GoogleSignInButton(
                        onPressed: _signInWithGoogle,
                        text: 'Continue with Google',
                      ),
                      const SizedBox(height: 20),

                      // Divider OR
                      Row(
                        children: [
                          Expanded(child: Divider(color: Colors.white.withOpacity(0.1))),
                          const Padding(
                            padding: EdgeInsets.symmetric(horizontal: 12),
                            child: Text(
                              'OR WITH EMAIL',
                              style: TextStyle(color: Color(0xFF6C728F), fontSize: 11, fontWeight: FontWeight.bold),
                            ),
                          ),
                          Expanded(child: Divider(color: Colors.white.withOpacity(0.1))),
                        ],
                      ),
                      const SizedBox(height: 20),

                      // Tab Bar View (Log In / Sign Up Forms)
                      SizedBox(
                        height: 280,
                        child: TabBarView(
                          controller: _tabController,
                          children: [
                            // Log In Form
                            Column(
                              children: [
                                TextField(
                                  controller: _loginEmailController,
                                  style: const TextStyle(color: Colors.white),
                                  decoration: InputDecoration(
                                    labelText: 'Email or Username',
                                    labelStyle: const TextStyle(color: Color(0xFFA0A5BA)),
                                    prefixIcon: const Icon(Icons.email_outlined, color: Color(0xFFA0A5BA)),
                                    filled: true,
                                    fillColor: const Color(0xFF161626),
                                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
                                  ),
                                ),
                                const SizedBox(height: 12),
                                TextField(
                                  controller: _loginPassController,
                                  obscureText: _obscureLoginPass,
                                  style: const TextStyle(color: Colors.white),
                                  decoration: InputDecoration(
                                    labelText: 'Password',
                                    labelStyle: const TextStyle(color: Color(0xFFA0A5BA)),
                                    prefixIcon: const Icon(Icons.lock_outline, color: Color(0xFFA0A5BA)),
                                    suffixIcon: IconButton(
                                      icon: Icon(
                                        _obscureLoginPass ? Icons.visibility_off : Icons.visibility,
                                        color: const Color(0xFFA0A5BA),
                                      ),
                                      onPressed: () => setState(() => _obscureLoginPass = !_obscureLoginPass),
                                    ),
                                    filled: true,
                                    fillColor: const Color(0xFF161626),
                                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
                                  ),
                                ),
                                Row(
                                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                  children: [
                                    Row(
                                      children: [
                                        Checkbox(
                                          value: _rememberMe,
                                          activeColor: const Color(0xFF6C5CE7),
                                          onChanged: (val) => setState(() => _rememberMe = val ?? true),
                                        ),
                                        const Text('Remember me', style: TextStyle(color: Color(0xFFA0A5BA), fontSize: 13)),
                                      ],
                                    ),
                                    TextButton(
                                      onPressed: _showForgotPasswordDialog,
                                      child: const Text('Forgot password?', style: TextStyle(color: Color(0xFFA29BFE), fontSize: 13)),
                                    ),
                                  ],
                                ),
                                const SizedBox(height: 12),
                                SizedBox(
                                  width: double.infinity,
                                  height: 48,
                                  child: ElevatedButton(
                                    onPressed: _loginWithEmail,
                                    style: ElevatedButton.styleFrom(
                                      backgroundColor: const Color(0xFF6C5CE7),
                                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                                    ),
                                    child: _isLoading
                                        ? const CircularProgressIndicator(color: Colors.white)
                                        : const Text('LOG IN', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                                  ),
                                ),
                              ],
                            ),

                            // Sign Up Form
                            Column(
                              children: [
                                TextField(
                                  controller: _regUserController,
                                  style: const TextStyle(color: Colors.white),
                                  decoration: InputDecoration(
                                    labelText: 'Username',
                                    labelStyle: const TextStyle(color: Color(0xFFA0A5BA)),
                                    prefixIcon: const Icon(Icons.person_outline, color: Color(0xFFA0A5BA)),
                                    filled: true,
                                    fillColor: const Color(0xFF161626),
                                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
                                  ),
                                ),
                                const SizedBox(height: 12),
                                TextField(
                                  controller: _regEmailController,
                                  style: const TextStyle(color: Colors.white),
                                  decoration: InputDecoration(
                                    labelText: 'Email Address',
                                    labelStyle: const TextStyle(color: Color(0xFFA0A5BA)),
                                    prefixIcon: const Icon(Icons.email_outlined, color: Color(0xFFA0A5BA)),
                                    filled: true,
                                    fillColor: const Color(0xFF161626),
                                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
                                  ),
                                ),
                                const SizedBox(height: 12),
                                TextField(
                                  controller: _regPassController,
                                  obscureText: _obscureRegPass,
                                  style: const TextStyle(color: Colors.white),
                                  decoration: InputDecoration(
                                    labelText: 'Password',
                                    labelStyle: const TextStyle(color: Color(0xFFA0A5BA)),
                                    prefixIcon: const Icon(Icons.lock_outline, color: Color(0xFFA0A5BA)),
                                    suffixIcon: IconButton(
                                      icon: Icon(
                                        _obscureRegPass ? Icons.visibility_off : Icons.visibility,
                                        color: const Color(0xFFA0A5BA),
                                      ),
                                      onPressed: () => setState(() => _obscureRegPass = !_obscureRegPass),
                                    ),
                                    filled: true,
                                    fillColor: const Color(0xFF161626),
                                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
                                  ),
                                ),
                                const SizedBox(height: 16),
                                SizedBox(
                                  width: double.infinity,
                                  height: 48,
                                  child: ElevatedButton(
                                    onPressed: _registerAccount,
                                    style: ElevatedButton.styleFrom(
                                      backgroundColor: const Color(0xFF00B894),
                                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                                    ),
                                    child: const Text('CREATE ACCOUNT', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                                  ),
                                ),
                              ],
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
