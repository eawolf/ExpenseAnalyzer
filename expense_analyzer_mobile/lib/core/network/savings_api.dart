import 'package:dio/dio.dart';
import '../../models/savings_goal.dart';

class SavingsApi {
  final Dio _dio;

  SavingsApi(this._dio);

  Future<List<SavingsGoal>> getSavingsGoals() async {
    try {
      final response = await _dio.get('/savings-goals');
      final List<SavingsGoal> goals = [];
      if (response.data != null) {
        for (var g in response.data) {
          goals.add(SavingsGoal.fromJson(g));
        }
      }
      return goals;
    } catch (e) {
      throw Exception('Failed to load savings goals: $e');
    }
  }

  Future<SavingsGoal> addSavingsGoal(SavingsGoal goal) async {
    try {
      final response = await _dio.post('/savings-goals', data: goal.toJson());
      return SavingsGoal.fromJson(response.data);
    } catch (e) {
      throw Exception('Failed to add savings goal: $e');
    }
  }

  Future<void> deleteSavingsGoal(String id) async {
    try {
      await _dio.delete('/savings-goals/$id');
    } catch (e) {
      throw Exception('Failed to delete savings goal: $e');
    }
  }

  Future<SavingsGoal> updateSavingsGoal(SavingsGoal goal) async {
    try {
      final response = await _dio.put('/savings-goals/${goal.id}', data: goal.toJson());
      return SavingsGoal.fromJson(response.data);
    } catch (e) {
      throw Exception('Failed to update savings goal: $e');
    }
  }
}
