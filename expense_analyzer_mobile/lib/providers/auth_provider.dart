import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:dio/dio.dart';
import '../core/network/dio_client.dart';

// 1. The State Object
class AuthState {
  final bool isLoading;
  final String? error;
  
  AuthState({this.isLoading = false, this.error});
}

// 2. The Notifier (Business Logic)
class AuthNotifier extends Notifier<AuthState> {
  
  @override
  AuthState build() {
    return AuthState(); // Initial state
  }

  Future<bool> login(String email, String password) async {
    state = AuthState(isLoading: true); // Show loading spinner
    
    try {
      final authApi = ref.read(authApiProvider);
      final response = await authApi.post('/auth/login', data: {
        'email': email,
        'password': password,
      });

      // Assuming your Spring Boot returns a token string directly or in a JSON body
      final token = response.data['token']; 
      
      // Save it locally!
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString('token', token);
      
      state = AuthState(isLoading: false);
      return true; // Login success!
      
    } on DioException catch (e) {
      // Something went wrong
      state = AuthState(
        isLoading: false, 
        error: e.response?.data['message'] ?? 'Failed to login',
      );
      return false;
    } catch (e) {
      state = AuthState(isLoading: false, error: 'Unknown error occurred');
      return false;
    }
  }

  Future<void> logout() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('token');
    state = AuthState();
  }
}

// 3. The Riverpod Provider
final authProvider = NotifierProvider<AuthNotifier, AuthState>(() {
  return AuthNotifier();
});
