class DashboardSummary {
  final double totalIncome;
  final double totalExpense;
  final double balance;
  final List<Transaction> recentTransactions;
  final List<CategorySummary> topCategories;

  DashboardSummary({
    required this.totalIncome,
    required this.totalExpense,
    required this.balance,
    required this.recentTransactions,
    required this.topCategories,
  });

  factory DashboardSummary.fromJson(Map<String, dynamic> json) {
    return DashboardSummary(
      totalIncome: (json['totalIncome'] ?? 0).toDouble(),
      totalExpense: (json['totalExpense'] ?? 0).toDouble(),
      balance: (json['balance'] ?? 0).toDouble(),
      recentTransactions: (json['recentTransactions'] as List?)
              ?.map((e) => Transaction.fromJson(e))
              .toList() ??
          [],
      topCategories: (json['topCategories'] as List?)
              ?.map((e) => CategorySummary.fromJson(e))
              .toList() ??
          [],
    );
  }
}

class Transaction {
  final String id;
  final String type;
  final double amount;
  final String title;
  final DateTime date;

  Transaction({
    required this.id,
    required this.type,
    required this.amount,
    required this.title,
    required this.date,
  });

  factory Transaction.fromJson(Map<String, dynamic> json) {
    DateTime parsedDate = DateTime.now();
    if (json['date'] != null) {
      if (json['date'] is String) {
        parsedDate = DateTime.tryParse(json['date']) ?? DateTime.now();
      } else if (json['date'] is List) {
        final List d = json['date'];
        if (d.length >= 3) {
          parsedDate = DateTime(
            d[0], d[1], d[2], 
            d.length > 3 ? d[3] : 0, 
            d.length > 4 ? d[4] : 0
          );
        }
      }
    }

    return Transaction(
      id: json['id']?.toString() ?? '',
      type: json['type']?.toString() ?? '',
      amount: (json['amount'] ?? 0).toDouble(),
      title: json['title']?.toString() ?? '',
      date: parsedDate,
    );
  }
}

class CategorySummary {
  final String name;
  final double total;

  CategorySummary({
    required this.name,
    required this.total,
  });

  factory CategorySummary.fromJson(Map<String, dynamic> json) {
    return CategorySummary(
      name: json['name'] ?? '',
      total: (json['total'] ?? 0).toDouble(),
    );
  }
}
