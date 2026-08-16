import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../core/network/dio_client.dart';
import '../core/network/savings_api.dart';
import '../models/savings_goal.dart';

final savingsApiProvider = Provider((ref) {
  final dio = ref.watch(expenseApiProvider);
  return SavingsApi(dio);
});

final savingsProvider = AsyncNotifierProvider<SavingsNotifier, List<SavingsGoal>>(() {
  return SavingsNotifier();
});

class SavingsNotifier extends AsyncNotifier<List<SavingsGoal>> {
  @override
  Future<List<SavingsGoal>> build() async {
    final api = ref.watch(savingsApiProvider);
    return api.getSavingsGoals();
  }

  Future<void> addGoal(SavingsGoal goal) async {
    final api = ref.read(savingsApiProvider);
    state = const AsyncValue.loading();
    try {
      await api.addSavingsGoal(goal);
      ref.invalidateSelf();
    } catch (e, st) {
      state = AsyncValue.error(e, st);
    }
  }

  Future<void> deleteGoal(String id) async {
    final api = ref.read(savingsApiProvider);
    state = const AsyncValue.loading();
    try {
      await api.deleteSavingsGoal(id);
      ref.invalidateSelf();
    } catch (e, st) {
      state = AsyncValue.error(e, st);
    }
  }

  Future<void> updateGoal(SavingsGoal goal) async {
    final api = ref.read(savingsApiProvider);
    state = const AsyncValue.loading();
    try {
      await api.updateSavingsGoal(goal);
      ref.invalidateSelf();
    } catch (e, st) {
      state = AsyncValue.error(e, st);
    }
  }
}
