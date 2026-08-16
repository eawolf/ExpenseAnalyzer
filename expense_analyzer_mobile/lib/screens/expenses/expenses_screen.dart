import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../providers/transaction_provider.dart';
import '../../models/transaction_model.dart';
import 'package:intl/intl.dart';

class ExpensesScreen extends ConsumerWidget {
  const ExpensesScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final transactionsAsync = ref.watch(transactionsProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Transactions', style: TextStyle(fontWeight: FontWeight.bold)),
        backgroundColor: Colors.transparent,
        elevation: 0,
      ),
      body: transactionsAsync.when(
        data: (transactions) => RefreshIndicator(
          onRefresh: () async {
            ref.invalidate(transactionsProvider);
          },
          child: transactions.isEmpty 
            ? const Center(child: Text('No transactions yet. Add one!'))
            : ListView.builder(
                padding: const EdgeInsets.all(16),
                itemCount: transactions.length,
                itemBuilder: (context, index) {
                  final tx = transactions[index];
                  return Card(
                    margin: const EdgeInsets.only(bottom: 12),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                    child: ListTile(
                      contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                      leading: CircleAvatar(
                        backgroundColor: tx.type == 'INCOME' ? Colors.green.withValues(alpha: 0.2) : Colors.red.withValues(alpha: 0.2),
                        child: Icon(
                          tx.type == 'INCOME' ? Icons.arrow_downward : Icons.arrow_upward,
                          color: tx.type == 'INCOME' ? Colors.green : Colors.red,
                        ),
                      ),
                      title: Text(tx.type == 'INCOME' ? (tx.source ?? 'Income') : (tx.categories.isNotEmpty ? tx.categories.first : 'Expense'), style: const TextStyle(fontWeight: FontWeight.bold)),
                      subtitle: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(DateFormat.yMMMd().format(tx.date)),
                          if (tx.notes != null && tx.notes!.isNotEmpty)
                            Text(tx.notes!, style: const TextStyle(fontSize: 12, color: Colors.grey)),
                        ],
                      ),
                      trailing: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Text(
                            '${tx.type == 'INCOME' ? '+' : '-'}\$${tx.amount.toStringAsFixed(2)}',
                            style: TextStyle(
                              fontWeight: FontWeight.bold,
                              fontSize: 16,
                              color: tx.type == 'INCOME' ? Colors.green : Colors.red,
                            ),
                          ),
                          IconButton(
                            icon: const Icon(Icons.delete, color: Colors.redAccent, size: 20),
                            onPressed: () {
                              ref.read(transactionsProvider.notifier).deleteTransaction(tx.id, tx.type);
                            },
                          ),
                        ],
                      ),
                    ),
                  );
                },
              ),
        ),
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (err, stack) => Center(child: Text('Error: $err')),
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () {
          _showAddTransactionDialog(context, ref);
        },
        child: const Icon(Icons.add),
      ),
    );
  }

  void _showAddTransactionDialog(BuildContext context, WidgetRef ref) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => const AddTransactionSheet(),
    );
  }
}

class AddTransactionSheet extends ConsumerStatefulWidget {
  const AddTransactionSheet({super.key});

  @override
  ConsumerState<AddTransactionSheet> createState() => _AddTransactionSheetState();
}

class _AddTransactionSheetState extends ConsumerState<AddTransactionSheet> {
  final _amountController = TextEditingController();
  final _categoryController = TextEditingController();
  final _notesController = TextEditingController();
  String _type = 'EXPENSE';

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: Theme.of(context).scaffoldBackgroundColor,
        borderRadius: const BorderRadius.vertical(top: Radius.circular(24)),
      ),
      padding: EdgeInsets.only(
        bottom: MediaQuery.of(context).viewInsets.bottom + 24,
        top: 24,
        left: 24,
        right: 24,
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Text('Add Transaction', style: Theme.of(context).textTheme.titleLarge),
          const SizedBox(height: 16),
          Row(
            children: [
              Expanded(
                child: RadioListTile<String>(
                  title: const Text('Expense'),
                  value: 'EXPENSE',
                  groupValue: _type,
                  onChanged: (val) => setState(() => _type = val!),
                ),
              ),
              Expanded(
                child: RadioListTile<String>(
                  title: const Text('Income'),
                  value: 'INCOME',
                  groupValue: _type,
                  onChanged: (val) => setState(() => _type = val!),
                ),
              ),
            ],
          ),
          TextField(
            controller: _amountController,
            decoration: const InputDecoration(labelText: 'Amount', prefixText: '\$'),
            keyboardType: const TextInputType.numberWithOptions(decimal: true),
          ),
          const SizedBox(height: 12),
          TextField(
            controller: _categoryController,
            decoration: InputDecoration(labelText: _type == 'EXPENSE' ? 'Category' : 'Source'),
          ),
          const SizedBox(height: 12),
          TextField(
            controller: _notesController,
            decoration: const InputDecoration(labelText: 'Notes'),
          ),
          const SizedBox(height: 24),
          ElevatedButton(
            style: ElevatedButton.styleFrom(
              padding: const EdgeInsets.symmetric(vertical: 16),
              backgroundColor: Colors.indigoAccent,
              foregroundColor: Colors.white,
            ),
            onPressed: () {
              final amount = double.tryParse(_amountController.text) ?? 0.0;
              final cat = _categoryController.text.trim();
              final notes = _notesController.text.trim();
              
              if (amount <= 0 || cat.isEmpty) return;

              final newTx = AppTransaction(
                id: '', // Generated by backend
                type: _type,
                amount: amount,
                date: DateTime.now(),
                categories: _type == 'EXPENSE' ? [cat] : [],
                source: _type == 'INCOME' ? cat : null,
                notes: notes,
              );

              ref.read(transactionsProvider.notifier).addTransaction(newTx);
              Navigator.pop(context);
            },
            child: const Text('SAVE TRANSACTION'),
          ),
        ],
      ),
    );
  }
}
