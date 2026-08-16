class SavingsGoal {
  final String id;
  final int year;
  final int month;
  final double targetAmount;
  final double currentSaved; // We'll compute this on the client or let backend provide it later

  SavingsGoal({
    required this.id,
    required this.year,
    required this.month,
    required this.targetAmount,
    this.currentSaved = 0.0,
  });

  factory SavingsGoal.fromJson(Map<String, dynamic> json) {
    return SavingsGoal(
      id: json['id']?.toString() ?? '',
      year: json['year'] as int? ?? DateTime.now().year,
      month: json['month'] as int? ?? DateTime.now().month,
      targetAmount: (json['targetAmount'] ?? 0).toDouble(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'year': year,
      'month': month,
      'targetAmount': targetAmount,
    };
  }
}
