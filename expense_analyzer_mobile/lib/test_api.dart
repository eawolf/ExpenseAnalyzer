import 'package:dio/dio.dart';

void main() async {
  final authDio = Dio(BaseOptions(baseUrl: 'http://localhost:8081/api'));
  final expDio = Dio(BaseOptions(baseUrl: 'http://localhost:8080/api'));

  try {
    print('Logging in...');
    final loginRes = await authDio.post('/auth/login', data: {
      'email': 'john@example.com',
      'password': 'password123',
    });
    
    final token = loginRes.data['token'];
    print('Token received!');
    
    print('Fetching dashboard...');
    final expRes = await expDio.get(
      '/dashboard/summary',
      options: Options(headers: {'Authorization': 'Bearer $token'}),
    );
    
    print('Dashboard Response:');
    print(expRes.data);
  } catch (e) {
    if (e is DioException) {
      print('DioError: ${e.response?.statusCode} - ${e.response?.data}');
    } else {
      print('Error: $e');
    }
  }
}
