import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../core/network/dio_client.dart';
import '../core/network/transaction_api.dart';
import '../models/transaction_model.dart';

final transactionApiProvider = Provider((ref) {
  final dio = ref.watch(expenseApiProvider);
  return TransactionApi(dio);
});

final transactionsProvider = AsyncNotifierProvider<TransactionsNotifier, List<AppTransaction>>(() {
  return TransactionsNotifier();
});

class TransactionsNotifier extends AsyncNotifier<List<AppTransaction>> {
  @override
  Future<List<AppTransaction>> build() async {
    final api = ref.watch(transactionApiProvider);
    return api.getTransactions();
  }

  Future<void> addTransaction(AppTransaction tx) async {
    final api = ref.read(transactionApiProvider);
    state = const AsyncValue.loading();
    try {
      await api.addTransaction(tx);
      ref.invalidateSelf(); // Refresh list from backend
    } catch (e, st) {
      state = AsyncValue.error(e, st);
    }
  }

  Future<void> deleteTransaction(String id, String type) async {
    final api = ref.read(transactionApiProvider);
    state = const AsyncValue.loading();
    try {
      await api.deleteTransaction(id, type);
      ref.invalidateSelf();
    } catch (e, st) {
      state = AsyncValue.error(e, st);
    }
  }

  Future<void> updateTransaction(AppTransaction tx) async {
    final api = ref.read(transactionApiProvider);
    state = const AsyncValue.loading();
    try {
      await api.updateTransaction(tx);
      ref.invalidateSelf();
    } catch (e, st) {
      state = AsyncValue.error(e, st);
    }
  }
}
