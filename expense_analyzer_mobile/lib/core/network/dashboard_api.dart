import 'package:dio/dio.dart';
import '../../models/dashboard_summary.dart';

class DashboardApi {
  final Dio _dio;

  DashboardApi(this._dio);

  Future<DashboardSummary> getSummary() async {
    try {
      print('DashboardApi: Fetching summary from ${_dio.options.baseUrl}/dashboard/summary');
      final response = await _dio.get('/dashboard/summary');
      print('DashboardApi: Fetched summary successfully');
      return DashboardSummary.fromJson(response.data);
    } catch (e) {
      print('DashboardApi: Error fetching summary: $e');
      throw Exception('Failed to load dashboard summary: $e');
    }
  }
}
