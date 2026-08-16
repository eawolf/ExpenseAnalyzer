import 'package:dio/dio.dart';
import '../../models/transaction_model.dart';

class TransactionApi {
  final Dio _dio;

  TransactionApi(this._dio);

  Future<List<AppTransaction>> getTransactions() async {
    try {
      final expenseRes = await _dio.get('/expenses');
      final incomeRes = await _dio.get('/incomes');
      
      final List<AppTransaction> transactions = [];
      
      if (expenseRes.data != null) {
        for (var e in expenseRes.data) {
          transactions.add(AppTransaction.fromJson(e, 'EXPENSE'));
        }
      }
      
      if (incomeRes.data != null) {
        for (var i in incomeRes.data) {
          transactions.add(AppTransaction.fromJson(i, 'INCOME'));
        }
      }
      
      // Sort by date descending
      transactions.sort((a, b) => b.date.compareTo(a.date));
      return transactions;
    } catch (e) {
      throw Exception('Failed to load transactions: $e');
    }
  }

  Future<AppTransaction> addTransaction(AppTransaction tx) async {
    try {
      final endpoint = tx.type == 'EXPENSE' ? '/expenses' : '/incomes';
      final response = await _dio.post(endpoint, data: tx.toJson());
      return AppTransaction.fromJson(response.data, tx.type);
    } catch (e) {
      throw Exception('Failed to add transaction: $e');
    }
  }

  Future<void> deleteTransaction(String id, String type) async {
    try {
      final endpoint = type == 'EXPENSE' ? '/expenses/$id' : '/incomes/$id';
      await _dio.delete(endpoint);
    } catch (e) {
      throw Exception('Failed to delete transaction: $e');
    }
  }

  Future<AppTransaction> updateTransaction(AppTransaction tx) async {
    try {
      final endpoint = tx.type == 'EXPENSE' ? '/expenses/${tx.id}' : '/incomes/${tx.id}';
      final response = await _dio.put(endpoint, data: tx.toJson());
      return AppTransaction.fromJson(response.data, tx.type);
    } catch (e) {
      throw Exception('Failed to update transaction: $e');
    }
  }
}
