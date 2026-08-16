class Expense {
  final double amount;
  final List<String> categories;
  final String? merchant;
  final String? notes;
  final DateTime? transactionDate;

  Expense({
    required this.amount,
    required this.categories,
    this.merchant,
    this.notes,
    this.transactionDate,
  });

  factory Expense.fromJson(Map<String, dynamic> json) {
    return Expense(
      amount: (json['amount'] ?? 0).toDouble(),
      categories: List<String>.from(json['categories'] ?? []),
      merchant: json['merchant'],
      notes: json['notes'],
      transactionDate: json['transactionDate'] != null
          ? DateTime.tryParse(json['transactionDate'])
          : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'amount': amount,
      'categories': categories,
      'merchant': merchant,
      'notes': notes,
      'transactionDate': transactionDate?.toIso8601String(),
    };
  }
}
