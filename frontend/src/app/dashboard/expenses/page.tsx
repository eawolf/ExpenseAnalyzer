'use client';

import { useEffect, useState } from 'react';
import api from '@/utils/api';
import { format, parseISO } from 'date-fns';
import { Search, Filter, Loader2, ArrowDownRight, Tag, Trash2, Check, Edit2, X } from 'lucide-react';
import { useUserProfile } from '@/context/UserProfileContext';
import { useDateFilter } from '@/context/DateFilterContext';

interface Expense {
  id: string;
  amount: number;
  merchant: string;
  categories: string[];
  notes: string;
  transactionDate: string;
}

export default function Expenses() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showFilter, setShowFilter] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [editFormData, setEditFormData] = useState({ amount: '', merchant: '', categories: '', notes: '', transactionDate: '' });
  const [isSaving, setIsSaving] = useState(false);
  const { userProfile } = useUserProfile();
  const { selectedYear, selectedMonth } = useDateFilter();
  
  const currencySymbol = userProfile?.currency || '$';

  useEffect(() => {
    const fetchExpenses = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/expenses?year=${selectedYear}&month=${selectedMonth}`);
        setExpenses(res.data);
      } catch (err) {
        console.error('Failed to load expenses', err);
      } finally {
        setLoading(false);
      }
    };
    fetchExpenses();
  }, [selectedYear, selectedMonth]);

  const allCategories = Array.from(new Set(expenses.flatMap(e => e.categories || []))).sort();

  const filteredExpenses = expenses.filter(e => {
    const matchesSearch = 
      e.merchant?.toLowerCase().includes(search.toLowerCase()) || 
      e.categories?.join(' ').toLowerCase().includes(search.toLowerCase()) ||
      e.notes?.toLowerCase().includes(search.toLowerCase());
    
    const matchesFilter = selectedFilters.length === 0 || 
      (e.categories && e.categories.some(cat => selectedFilters.includes(cat)));

    return matchesSearch && matchesFilter;
  });

  const toggleFilter = (cat: string) => {
    setSelectedFilters(prev => 
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this expense?')) return;
    try {
      await api.delete(`/expenses/${id}`);
      setExpenses(prev => prev.filter(e => e.id !== id));
    } catch (err) {
      console.error('Failed to delete expense', err);
      alert('Failed to delete expense. Please try again.');
    }
  };

  const startEdit = (expense: Expense) => {
    setEditingExpense(expense);
    setEditFormData({
      amount: expense.amount.toString(),
      merchant: expense.merchant || '',
      categories: expense.categories ? expense.categories.join(', ') : '',
      notes: expense.notes || '',
      transactionDate: expense.transactionDate ? format(parseISO(expense.transactionDate), "yyyy-MM-dd'T'HH:mm") : ''
    });
  };

  const handleEditSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingExpense) return;
    setIsSaving(true);
    try {
      const payload = {
        amount: Number(editFormData.amount),
        merchant: editFormData.merchant,
        categories: editFormData.categories.split(',').map(s => s.trim()).filter(s => s.length > 0),
        notes: editFormData.notes,
        transactionDate: editFormData.transactionDate ? new Date(editFormData.transactionDate).toISOString() : undefined
      };
      const res = await api.put(`/expenses/${editingExpense.id}`, payload);
      setExpenses(prev => prev.map(exp => exp.id === editingExpense.id ? res.data : exp));
      setEditingExpense(null);
    } catch (err) {
      console.error('Failed to update expense', err);
      alert('Failed to update expense.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto flex flex-col gap-8">
      
      {/* Header Actions */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-zinc-900 border border-white/5 p-4 rounded-2xl">
        <div className="relative w-full md:w-96">
          <Search className="w-5 h-5 absolute left-3 top-3 text-zinc-500" />
          <input 
            type="text"
            placeholder="Search by merchant, category, notes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-zinc-950 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors"
          />
        </div>
        <div className="relative">
          <button 
            onClick={() => setShowFilter(!showFilter)}
            className={`flex items-center gap-2 px-4 py-2.5 hover:bg-zinc-700 text-white text-sm font-medium rounded-xl transition-colors w-full md:w-auto ${showFilter || selectedFilters.length > 0 ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30' : 'bg-zinc-800'}`}
          >
            <Filter className="w-4 h-4" />
            Filter {selectedFilters.length > 0 && `(${selectedFilters.length})`}
          </button>
          
          {showFilter && (
            <div className="absolute right-0 mt-2 w-64 bg-zinc-900 border border-white/10 rounded-xl shadow-xl z-50 p-4 animate-in fade-in slide-in-from-top-2">
              <h4 className="text-sm font-semibold text-zinc-300 mb-3">Filter by Category</h4>
              {allCategories.length > 0 ? (
                <div className="flex flex-col gap-2 max-h-60 overflow-y-auto">
                  {allCategories.map(cat => (
                    <label key={cat} className="flex items-center gap-3 cursor-pointer group" onClick={() => toggleFilter(cat)}>
                      <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${selectedFilters.includes(cat) ? 'bg-indigo-500 border-indigo-500' : 'border-zinc-500 group-hover:border-zinc-400'}`}>
                        {selectedFilters.includes(cat) && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                      </div>
                      <span className="text-sm text-zinc-300 group-hover:text-white transition-colors">{cat}</span>
                    </label>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-zinc-500 italic">No categories available.</p>
              )}
              {selectedFilters.length > 0 && (
                <button 
                  onClick={() => setSelectedFilters([])}
                  className="w-full mt-4 py-2 text-xs font-medium text-zinc-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
                >
                  Clear Filters
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="bg-zinc-900 border border-white/5 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-zinc-950/50 border-b border-white/5 text-zinc-400 text-sm">
                <th className="p-4 font-medium">Merchant / Details</th>
                <th className="p-4 font-medium">Categories</th>
                <th className="p-4 font-medium">Date</th>
                <th className="p-4 font-medium text-right">Amount</th>
                <th className="p-4 w-12"></th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center">
                    <Loader2 className="w-8 h-8 text-indigo-500 animate-spin mx-auto" />
                  </td>
                </tr>
              ) : filteredExpenses.length > 0 ? (
                filteredExpenses.map(expense => (
                  <tr key={expense.id} className="border-b border-white/5 hover:bg-white/5 transition-colors group">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-rose-500/10 flex items-center justify-center flex-shrink-0">
                          <ArrowDownRight className="w-5 h-5 text-rose-400" />
                        </div>
                        <div>
                          <p className="font-semibold text-white">{expense.merchant || 'Unknown Merchant'}</p>
                          {expense.notes && <p className="text-sm text-zinc-500 truncate max-w-xs">{expense.notes}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-wrap gap-1.5 max-w-[200px]">
                        {expense.categories && expense.categories.length > 0 ? (
                           expense.categories.map((cat, idx) => (
                             <span key={idx} className="inline-flex items-center gap-1 bg-zinc-800 text-zinc-300 px-2 py-1 rounded-md text-xs font-medium whitespace-nowrap">
                               <Tag className="w-3 h-3 opacity-50" />
                               {cat}
                             </span>
                           ))
                        ) : (
                           <span className="text-zinc-500 text-sm italic">Uncategorized</span>
                        )}
                      </div>
                    </td>
                    <td className="p-4 text-sm text-zinc-400">
                      {format(parseISO(expense.transactionDate), 'MMM dd, yyyy h:mm a')}
                    </td>
                    <td className="p-4 text-right">
                      <span className="font-semibold text-rose-400">-{currencySymbol}{expense.amount.toFixed(2)}</span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
                        <button 
                          onClick={() => startEdit(expense)}
                          className="p-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg transition-colors"
                          title="Edit Expense"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(expense.id)}
                          className="p-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-lg transition-colors"
                          title="Delete Expense"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-zinc-500">
                    No expenses found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      {editingExpense && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-zinc-900 border border-white/10 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-white/5">
              <h3 className="text-xl font-bold text-white">Edit Expense</h3>
              <button onClick={() => setEditingExpense(null)} className="text-zinc-500 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleEditSave} className="p-6 flex flex-col gap-4">
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1">Amount</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500">{currencySymbol}</span>
                  <input 
                    type="number" step="0.01" required
                    value={editFormData.amount} onChange={(e) => setEditFormData({...editFormData, amount: e.target.value})}
                    className="w-full bg-zinc-950 border border-white/10 rounded-xl pl-8 pr-4 py-2.5 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1">Date & Time</label>
                <input 
                  type="datetime-local"
                  value={editFormData.transactionDate} onChange={(e) => setEditFormData({...editFormData, transactionDate: e.target.value})}
                  className="w-full bg-zinc-950 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500 [color-scheme:dark]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1">Merchant</label>
                <input 
                  type="text" required
                  value={editFormData.merchant} onChange={(e) => setEditFormData({...editFormData, merchant: e.target.value})}
                  className="w-full bg-zinc-950 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1">Categories (comma separated)</label>
                <input 
                  type="text"
                  value={editFormData.categories} onChange={(e) => setEditFormData({...editFormData, categories: e.target.value})}
                  className="w-full bg-zinc-950 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1">Notes</label>
                <textarea 
                  value={editFormData.notes} onChange={(e) => setEditFormData({...editFormData, notes: e.target.value})}
                  className="w-full bg-zinc-950 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500 min-h-[80px]"
                />
              </div>
              
              <div className="flex items-center justify-end gap-3 mt-4">
                <button type="button" onClick={() => setEditingExpense(null)} className="px-4 py-2 rounded-xl text-sm font-medium text-zinc-400 hover:text-white hover:bg-white/5 transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={isSaving} className="px-6 py-2 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-medium transition-colors flex items-center gap-2">
                  {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}