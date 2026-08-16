import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../../router.dart';
import '../constants.dart';

// Provides a configured Dio instance for the Expense Service
final expenseApiProvider = Provider<Dio>((ref) {
  final dio = Dio(BaseOptions(
    baseUrl: AppConstants.expenseBaseUrl,
    connectTimeout: const Duration(seconds: 10),
    receiveTimeout: const Duration(seconds: 10),
  ));

  dio.interceptors.add(
    InterceptorsWrapper(
      onRequest: (options, handler) async {
        print('DioClient: onRequest ${options.path}');
        final prefs = await SharedPreferences.getInstance();
        print('DioClient: SharedPreferences loaded');
        final token = prefs.getString('token');
        if (token != null) {
          options.headers['Authorization'] = 'Bearer $token';
        }
        print('DioClient: sending request...');
        return handler.next(options);
      },
      onError: (DioException e, handler) async {
        print('DioClient: onError ${e.message}');
        if (e.response?.statusCode == 401) {
          // Token expired or invalid! Clear storage and redirect to login
          final prefs = await SharedPreferences.getInstance();
          await prefs.clear();
          ref.read(routerProvider).go('/login');
        }
        return handler.next(e);
      },
    ),
  );

  return dio;
});

// Provides a configured Dio instance for the Auth Service
final authApiProvider = Provider<Dio>((ref) {
  return Dio(BaseOptions(
    baseUrl: AppConstants.authBaseUrl,
    connectTimeout: const Duration(seconds: 10),
    receiveTimeout: const Duration(seconds: 10),
  ));
});
