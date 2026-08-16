import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../core/network/dashboard_api.dart';
import '../core/network/dio_client.dart';
import '../models/dashboard_summary.dart';

final dashboardApiProvider = Provider((ref) {
  final dio = ref.watch(expenseApiProvider);
  return DashboardApi(dio);
});

final dashboardSummaryProvider = FutureProvider<DashboardSummary>((ref) async {
  final api = ref.watch(dashboardApiProvider);
  return api.getSummary();
});
