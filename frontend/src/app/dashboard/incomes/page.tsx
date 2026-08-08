'use client';

import { useEffect, useState, useRef } from 'react';
import api from '@/utils/api';
import { Loader2, Trash2, TrendingUp, Search, Filter, Check, Edit2, X, ArrowUpRight } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import ConfirmModal from '@/components/ConfirmModal';
import { useUserProfile } from '@/context/UserProfileContext';
import { useDateFilter } from '@/context/DateFilterContext';
import CustomDatePicker from '@/components/CustomDatePicker';

interface Income {
  id: string;
  amount: number;
  source: string;
  transactionDate: string;
}

export default function IncomesPage() {
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [showFilter, setShowFilter] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [editingIncome, setEditingIncome] = useState<Income | null>(null);
  const [editFormData, setEditFormData] = useState<{ amount: string; source: string; transactionDate: Date | null }>({ amount: '', source: '', transactionDate: null });
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
    const fetchIncomes = async () => {
      try {
        const start = new Date(selectedYear, selectedMonth - 1, 1);
        const end = new Date(selectedYear, selectedMonth, 0);
        
        const url = `/incomes?startDate=${format(start, 'yyyy-MM-dd')}&endDate=${format(end, 'yyyy-MM-dd')}`;
        const res = await api.get(url);
        setIncomes(res.data);
      } catch (err) {
        console.error('Failed to fetch incomes', err);
      } finally {
        setLoading(false);
      }
    };
    fetchIncomes();
  }, [selectedYear, selectedMonth]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await api.delete(`/incomes/${deleteTarget}`);
      setIncomes(incomes.filter(i => i.id !== deleteTarget));
    } catch (err) {
      console.error('Failed to delete income', err);
    } finally {
      setDeleteTarget(null);
    }
  };

  const startEdit = (income: Income) => {
    setEditingIncome(income);
    setEditFormData({
      amount: income.amount.toString(),
      source: income.source || '',
      transactionDate: income.transactionDate ? parseISO(income.transactionDate) : null
    });
  };

  const handleEditSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingIncome) return;
    setIsSaving(true);
    try {
      const payload = {
        amount: Number(editFormData.amount),
        source: editFormData.source,
        transactionDate: editFormData.transactionDate ? format(editFormData.transactionDate, "yyyy-MM-dd'T'HH:mm:ss") : undefined
      };
      const res = await api.put(`/incomes/${editingIncome.id}`, payload);
      setIncomes(prev => prev.map(inc => inc.id === editingIncome.id ? res.data : inc));
      setEditingIncome(null);
    } catch (err) {
      console.error('Failed to update income', err);
      alert('Failed to update income.');
    } finally {
      setIsSaving(false);
    }
  };

  const allSources = Array.from(new Set(incomes.map(i => i.source))).sort();

  const filteredIncomes = incomes.filter(i => {
    const matchesSearch = i.source?.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = selectedFilters.length === 0 || selectedFilters.includes(i.source);
    return matchesSearch && matchesFilter;
  });

  const toggleFilter = (src: string) => {
    setSelectedFilters(prev => 
      prev.includes(src) ? prev.filter(s => s !== src) : [...prev, src]
    );
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <TrendingUp className="w-6 h-6 text-emerald-400" />
          All Income
        </h2>
      </div>

      <div className="flex flex-col md:flex-row gap-4 justify-between items-center glass-panel p-4 rounded-2xl mb-8">
        <div className="relative w-full md:w-96">
          <Search className="w-5 h-5 absolute left-3 top-3 text-muted-foreground" />
          <input 
            type="text"
            placeholder="Search by source..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-input border border-border rounded-xl pl-10 pr-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary transition-colors"
          />
        </div>
        <div className="relative w-full md:w-auto" ref={filterRef}>
          <button 
            onClick={() => setShowFilter(!showFilter)}
            className={`flex items-center justify-center gap-2 px-4 py-2.5 hover:bg-accent hover:text-accent-foreground text-sm font-medium rounded-xl transition-colors w-full md:w-auto ${showFilter || selectedFilters.length > 0 ? 'bg-emerald-500/20 text-emerald-500 border border-emerald-500/30' : 'bg-card border border-border text-foreground'}`}
          >
            <Filter className="w-4 h-4" />
            Filter {selectedFilters.length > 0 && `(${selectedFilters.length})`}
          </button>
          
          {showFilter && (
            <div className="absolute right-0 mt-2 w-64 glass-popup rounded-xl shadow-xl z-50 p-4 animate-in fade-in slide-in-from-top-2">
              <h4 className="text-sm font-semibold text-foreground mb-3">Filter by Source</h4>
              {allSources.length > 0 ? (
                <div className="flex flex-col gap-2 max-h-60 overflow-y-auto scroll-3d-list">
                  {allSources.map(src => (
                    <label key={src} className="flex items-center gap-3 p-2 -mx-2 rounded-lg cursor-pointer group hover:bg-accent/50 transition-colors scroll-3d-item" onClick={() => toggleFilter(src)}>
                      <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${selectedFilters.includes(src) ? 'bg-emerald-500 border-emerald-500' : 'border-foreground/30 group-hover:border-foreground/50'}`}>
                        {selectedFilters.includes(src) && <Check className="w-3 h-3 text-primary-foreground" strokeWidth={3} />}
                      </div>
                      <span className="text-sm text-foreground transition-colors">{src}</span>
                    </label>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground italic">No sources available.</p>
              )}
              {selectedFilters.length > 0 && (
                <button 
                  onClick={() => setSelectedFilters([])}
                  className="w-full mt-4 py-2 text-xs font-medium text-muted-foreground hover:text-foreground bg-accent hover:bg-accent/80 rounded-lg transition-colors"
                >
                  Clear Filters
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Scrollable Container */}
      <div className="flex flex-col gap-4 overflow-y-auto pr-2 pb-2 max-h-[calc(100vh-250px)] mt-4">
        {filteredIncomes.length > 0 ? (
          filteredIncomes.map((income) => (
            <div key={income.id} className="flex items-center justify-between p-4 rounded-xl glass-card-etched hover:bg-accent/30 transition-colors group border border-border/10">
              <div className="flex items-center gap-4 flex-1">
                <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                  <ArrowUpRight className="w-5 h-5 text-emerald-500" />
                </div>
                <div className="min-w-[200px]">
                  <p className="font-semibold text-foreground">{income.source || 'Unknown Source'}</p>
                  <p className="text-sm text-muted-foreground truncate max-w-[200px]">{format(parseISO(income.transactionDate), 'MMM dd, yyyy h:mm a')}</p>
                </div>
              </div>

              <div className="flex items-center gap-6">
                <span className="font-semibold text-emerald-500 min-w-[100px] text-right">+{currencySymbol}{income.amount.toFixed(2)}</span>
                
                <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity min-w-[80px]">
                  <button 
                    onClick={() => startEdit(income)}
                    className="p-2 bg-card hover:bg-accent text-muted-foreground rounded-lg transition-colors border border-border"
                    title="Edit Income"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => setDeleteTarget(income.id)}
                    className="p-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 rounded-lg transition-colors"
                    title="Delete Income"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="flex justify-center p-8 text-muted-foreground">
            No income found.
          </div>
        )}
      </div>

      <ConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Income"
        message="Are you sure you want to delete this income entry? This action cannot be undone and will affect your total balance."
      />

      {editingIncome && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-card border border-border rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h3 className="text-xl font-bold text-foreground">Edit Income</h3>
              <button onClick={() => setEditingIncome(null)} className="text-muted-foreground hover:text-foreground transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleEditSave} className="p-6 flex flex-col gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Amount</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/70">{currencySymbol}</span>
                  <input 
                    type="number" step="0.01" required
                    value={editFormData.amount} onChange={(e) => setEditFormData({...editFormData, amount: e.target.value})}
                    className="w-full bg-input border border-border rounded-xl pl-8 pr-4 py-2.5 text-foreground focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Date</label>
                <CustomDatePicker 
                  selected={editFormData.transactionDate} 
                  onChange={(date) => setEditFormData({...editFormData, transactionDate: date})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Source</label>
                <input 
                  type="text" required
                  value={editFormData.source} onChange={(e) => setEditFormData({...editFormData, source: e.target.value})}
                  className="w-full bg-input border border-border rounded-xl px-4 py-2.5 text-foreground focus:outline-none focus:border-emerald-500"
                />
              </div>
              
              <div className="flex items-center justify-end gap-3 mt-4">
                <button type="button" onClick={() => setEditingIncome(null)} className="px-4 py-2 rounded-xl text-sm font-medium text-foreground hover:bg-accent transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={isSaving} className="px-6 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-primary-foreground text-sm font-medium transition-colors flex items-center gap-2">
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