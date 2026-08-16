import 'dart:io';

class AppConstants {
  static String get authBaseUrl => Platform.isAndroid 
      ? 'http://10.0.2.2:8081/api' 
      : 'http://localhost:8081/api';
      
  static String get expenseBaseUrl => Platform.isAndroid 
      ? 'http://10.0.2.2:8080/api' 
      : 'http://localhost:8080/api';
}
