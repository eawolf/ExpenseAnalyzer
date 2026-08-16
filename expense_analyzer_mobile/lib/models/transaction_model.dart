class AppTransaction {
  final String id;
  final String type; // 'EXPENSE' or 'INCOME'
  final double amount;
  final DateTime date;
  
  // Expense fields
  final List<String> categories;
  final String? merchant;
  
  // Income fields
  final String? source;
  
  // Common fields
  final String? notes;

  AppTransaction({
    required this.id,
    required this.type,
    required this.amount,
    required this.date,
    this.categories = const [],
    this.merchant,
    this.source,
    this.notes,
  });

  factory AppTransaction.fromJson(Map<String, dynamic> json, String type) {
    DateTime parsedDate = DateTime.now();
    if (json['transactionDate'] != null) {
      if (json['transactionDate'] is String) {
        parsedDate = DateTime.tryParse(json['transactionDate']) ?? DateTime.now();
      } else if (json['transactionDate'] is List) {
        final List d = json['transactionDate'];
        if (d.length >= 3) {
          parsedDate = DateTime(
            d[0], d[1], d[2], 
            d.length > 3 ? d[3] : 0, 
            d.length > 4 ? d[4] : 0
          );
        }
      }
    }

    return AppTransaction(
      id: json['id']?.toString() ?? '',
      type: type,
      amount: (json['amount'] ?? 0).toDouble(),
      date: parsedDate,
      categories: (json['categories'] as List?)?.map((e) => e.toString()).toList() ?? [],
      merchant: json['merchant']?.toString(),
      source: json['source']?.toString(),
      notes: json['notes']?.toString(),
    );
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = {
      'amount': amount,
      'notes': notes,
      'transactionDate': date.toIso8601String().split('T')[0],
    };
    
    if (type == 'EXPENSE') {
      data['categories'] = categories.isNotEmpty ? categories : ['Uncategorized'];
      data['merchant'] = merchant;
    } else {
      data['source'] = source ?? 'Unknown';
    }
    
    return data;
  }
}
