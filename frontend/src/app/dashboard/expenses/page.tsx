'use client';

import { useEffect, useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import api from '@/utils/api';
import { format, parseISO } from 'date-fns';
import { Search, Filter, Loader2, ArrowDownRight, Tag, Trash2, Check, Edit2, X } from 'lucide-react';
import { useUserProfile } from '@/context/UserProfileContext';
import { useDateFilter } from '@/context/DateFilterContext';
import CustomDatePicker from '@/components/CustomDatePicker';

interface Expense {
  id: string;
  amount: number;
  merchant: string;
  categories: string[];
  notes: string;
  transactionDate: string;
}

export default function Expenses() {
  const { t } = useTranslation();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showFilter, setShowFilter] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [editFormData, setEditFormData] = useState<{ amount: string; merchant: string; categories: string; notes: string; transactionDate: Date | null }>({ amount: '', merchant: '', categories: '', notes: '', transactionDate: null });
  const [isSaving, setIsSaving] = useState(false);
  const { userProfile } = useUserProfile();
  const { selectedYear, selectedMonth } = useDateFilter();
  const filterRef = useRef<HTMLDivElement>(null);
  
  const currencySymbol = userProfile?.currency || '$';

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setShowFilter(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchExpenses = async () => {
      try {
        const start = new Date(selectedYear, selectedMonth - 1, 1);
        const end = new Date(selectedYear, selectedMonth, 0);
        
        const url = `/expenses?startDate=${format(start, 'yyyy-MM-dd')}&endDate=${format(end, 'yyyy-MM-dd')}`;
        const res = await api.get(url);
        setExpenses(res.data);
      } catch (err) {
        console.error('Failed to fetch expenses', err);
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
      transactionDate: expense.transactionDate ? parseISO(expense.transactionDate) : null
    });
  };

  const handleEditSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingExpense) return;
    setIsSaving(true);
    try {
      const res = await api.put(`/expenses/${editingExpense.id}`, {
        amount: parseFloat(editFormData.amount),
        merchant: editFormData.merchant,
        notes: editFormData.notes,
        transactionDate: editFormData.transactionDate ? format(editFormData.transactionDate, "yyyy-MM-dd'T'HH:mm:ss") : undefined,
        categories: editFormData.categories.split(',').map(c => c.trim()).filter(c => c)
      });
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
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center glass-panel p-4 rounded-2xl">
        <div className="relative w-full md:w-96">
          <Search className="w-5 h-5 absolute left-3 top-3 text-muted-foreground" />
          <input 
            type="text"
            placeholder="Search by merchant, category, notes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-input border border-border rounded-xl pl-10 pr-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary transition-colors"
          />
        </div>
        <div className="relative" ref={filterRef}>
          <button 
            onClick={() => setShowFilter(!showFilter)}
            className={`flex items-center gap-2 px-4 py-2.5 hover:bg-accent hover:text-accent-foreground text-sm font-medium rounded-xl transition-colors w-full md:w-auto ${showFilter || selectedFilters.length > 0 ? 'bg-primary/20 text-primary border border-primary/30' : 'bg-card border border-border text-foreground'}`}
          >
            <Filter className="w-4 h-4" />
            Filter {selectedFilters.length > 0 && `(${selectedFilters.length})`}
          </button>
          
          {showFilter && (
            <div className="absolute right-0 mt-2 w-64 glass-popup rounded-xl z-50 p-4 animate-in fade-in slide-in-from-top-2">
              <h4 className="text-sm font-semibold text-foreground mb-3">{t('filter', 'Filter')} by Category</h4>
              {allCategories.length > 0 ? (
                <div className="flex flex-col gap-2 max-h-60 overflow-y-auto scroll-3d-list">
                  {allCategories.map(cat => (
                    <label key={cat} className="flex items-center gap-3 p-2 -mx-2 rounded-lg cursor-pointer group hover:bg-accent/50 transition-colors scroll-3d-item" onClick={() => toggleFilter(cat)}>
                      <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${selectedFilters.includes(cat) ? 'bg-primary border-primary' : 'border-foreground/30 group-hover:border-foreground/50'}`}>
                        {selectedFilters.includes(cat) && <Check className="w-3 h-3 text-primary-foreground" strokeWidth={3} />}
                      </div>
                      <span className="text-sm text-foreground transition-colors">{cat}</span>
                    </label>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground italic">No categories available.</p>
              )}
              {selectedFilters.length > 0 && (
                <button 
                  onClick={() => setSelectedFilters([])}
                  className="w-full mt-4 py-2 text-xs font-medium text-muted-foreground hover:text-foreground bg-accent hover:bg-accent/80 rounded-lg transition-colors"
                >
                  {t('clearFilters', 'Clear Filters')}
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Scrollable Container */}
      <div className="flex flex-col gap-4 overflow-y-auto pr-2 pb-2 max-h-[calc(100vh-250px)] mt-4">
        {loading ? (
          <div className="flex justify-center p-8">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>
        ) : filteredExpenses.length > 0 ? (
          filteredExpenses.map(expense => (
            <div key={expense.id} className="flex items-center justify-between p-4 rounded-xl glass-card-etched hover:bg-accent/30 transition-colors group border border-border/10">
              <div className="flex items-center gap-4 flex-1">
                <div className="w-10 h-10 rounded-full bg-rose-500/10 flex items-center justify-center flex-shrink-0">
                  <ArrowDownRight className="w-5 h-5 text-rose-500" />
                </div>
                <div className="min-w-[200px]">
                  <p className="font-semibold text-foreground">{expense.merchant || 'Unknown Merchant'}</p>
                  {expense.notes && <p className="text-sm text-muted-foreground truncate max-w-xs">{expense.notes}</p>}
                </div>
                
                <div className="flex flex-wrap gap-1.5 min-w-[200px] flex-1">
                  {expense.categories && expense.categories.length > 0 ? (
                      expense.categories.map((cat, idx) => (
                        <span key={idx} className="inline-flex items-center gap-1 bg-accent text-accent-foreground px-2 py-1 rounded-md text-xs font-medium whitespace-nowrap">
                          <Tag className="w-3 h-3 opacity-50" />
                          {cat}
                        </span>
                      ))
                  ) : (
                      <span className="text-muted-foreground text-sm italic">Uncategorized</span>
                  )}
                </div>

                <div className="text-sm text-muted-foreground min-w-[150px]">
                  {format(parseISO(expense.transactionDate), 'MMM dd, yyyy h:mm a')}
                </div>
              </div>

              <div className="flex items-center gap-6">
                <span className="font-semibold text-rose-500 min-w-[100px] text-right">-{currencySymbol}{expense.amount.toFixed(2)}</span>
                
                <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity min-w-[80px]">
                  <button 
                    onClick={() => startEdit(expense)}
                    className="p-2 bg-card hover:bg-accent text-muted-foreground rounded-lg transition-colors border border-border"
                    title="{t('editExpense', 'Edit Expense')}"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => handleDelete(expense.id)}
                    className="p-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 rounded-lg transition-colors"
                    title="Delete Expense"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="flex justify-center p-8 text-muted-foreground">
            {t('noExpensesFound', 'No expenses found.')}
          </div>
        )}
      </div>
      {editingExpense && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-card border border-border rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h3 className="text-xl font-bold text-foreground">{t('editExpense', 'Edit Expense')}</h3>
              <button onClick={() => setEditingExpense(null)} className="text-muted-foreground hover:text-foreground transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleEditSave} className="p-6 flex flex-col gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">{t('amount', 'Amount')}</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/70">{currencySymbol}</span>
                  <input 
                    type="number" step="0.01" required
                    value={editFormData.amount} onChange={(e) => setEditFormData({...editFormData, amount: e.target.value})}
                    className="w-full bg-input border border-border rounded-xl pl-8 pr-4 py-2.5 text-foreground focus:outline-none focus:border-primary"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">{t('date', 'Date')}</label>
                <CustomDatePicker 
                  selected={editFormData.transactionDate} 
                  onChange={(date) => setEditFormData({...editFormData, transactionDate: date})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">{t('merchantOptional', 'Merchant (Optional)')}</label>
                <input 
                  type="text"
                  value={editFormData.merchant} onChange={(e) => setEditFormData({...editFormData, merchant: e.target.value})}
                  className="w-full bg-input border border-border rounded-xl px-4 py-2.5 text-foreground focus:outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">{t('categoriesComma', 'Categories (comma separated)')}</label>
                <input 
                  type="text"
                  value={editFormData.categories} onChange={(e) => setEditFormData({...editFormData, categories: e.target.value})}
                  className="w-full bg-input border border-border rounded-xl px-4 py-2.5 text-foreground focus:outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">{t('notesOptional', 'Notes (Optional)')}</label>
                <textarea 
                  value={editFormData.notes} onChange={(e) => setEditFormData({...editFormData, notes: e.target.value})}
                  className="w-full bg-input border border-border rounded-xl px-4 py-2.5 text-foreground focus:outline-none focus:border-primary min-h-[80px]"
                />
              </div>
              
              <div className="flex items-center justify-end gap-3 mt-4">
                <button type="button" onClick={() => setEditingExpense(null)} className="px-4 py-2 rounded-xl text-sm font-medium text-foreground hover:bg-accent transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={isSaving} className="px-6 py-2 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-medium transition-colors flex items-center gap-2">
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
