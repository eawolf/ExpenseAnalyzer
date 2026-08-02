'use client';

import { useEffect, useState } from 'react';
import api from '@/utils/api';
import { Loader2, Trash2, TrendingUp, Search, Filter, Check, Edit2, X } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import ConfirmModal from '@/components/ConfirmModal';
import { useUserProfile } from '@/context/UserProfileContext';
import { useDateFilter } from '@/context/DateFilterContext';

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
  const [editFormData, setEditFormData] = useState({ amount: '', source: '', transactionDate: '' });
  const [isSaving, setIsSaving] = useState(false);
  const { userProfile } = useUserProfile();
  const { selectedYear, selectedMonth } = useDateFilter();

  const currencySymbol = userProfile?.currency || '$';

  const fetchIncomes = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/incomes?year=${selectedYear}&month=${selectedMonth}`);
      setIncomes(res.data);
    } catch (err) {
      console.error('Failed to fetch incomes', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
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
      transactionDate: income.transactionDate ? format(parseISO(income.transactionDate), "yyyy-MM-dd'T'HH:mm") : ''
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
        transactionDate: editFormData.transactionDate ? new Date(editFormData.transactionDate).toISOString() : undefined
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
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
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

      <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-zinc-900 border border-white/5 p-4 rounded-2xl mb-8">
        <div className="relative w-full md:w-96">
          <Search className="w-5 h-5 absolute left-3 top-3 text-zinc-500" />
          <input 
            type="text"
            placeholder="Search by source..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-zinc-950 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors"
          />
        </div>
        <div className="relative w-full md:w-auto">
          <button 
            onClick={() => setShowFilter(!showFilter)}
            className={`flex items-center justify-center gap-2 px-4 py-2.5 hover:bg-zinc-700 text-white text-sm font-medium rounded-xl transition-colors w-full md:w-auto ${showFilter || selectedFilters.length > 0 ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-zinc-800'}`}
          >
            <Filter className="w-4 h-4" />
            Filter {selectedFilters.length > 0 && `(${selectedFilters.length})`}
          </button>
          
          {showFilter && (
            <div className="absolute right-0 mt-2 w-64 bg-zinc-900 border border-white/10 rounded-xl shadow-xl z-50 p-4 animate-in fade-in slide-in-from-top-2">
              <h4 className="text-sm font-semibold text-zinc-300 mb-3">Filter by Source</h4>
              {allSources.length > 0 ? (
                <div className="flex flex-col gap-2 max-h-60 overflow-y-auto">
                  {allSources.map(src => (
                    <label key={src} className="flex items-center gap-3 cursor-pointer group" onClick={() => toggleFilter(src)}>
                      <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${selectedFilters.includes(src) ? 'bg-emerald-500 border-emerald-500' : 'border-zinc-500 group-hover:border-zinc-400'}`}>
                        {selectedFilters.includes(src) && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                      </div>
                      <span className="text-sm text-zinc-300 group-hover:text-white transition-colors">{src}</span>
                    </label>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-zinc-500 italic">No sources available.</p>
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

      <div className="bg-zinc-900 border border-white/5 rounded-2xl overflow-hidden">
        {filteredIncomes.length > 0 ? (
          <div className="divide-y divide-white/5">
            {filteredIncomes.map((income) => (
              <div key={income.id} className="p-4 sm:p-6 flex items-center justify-between hover:bg-white/[0.02] transition-colors group">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-emerald-400 font-bold text-lg">+</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-white text-lg">{income.source}</h4>
                    <p className="text-sm text-zinc-400">
                      {format(parseISO(income.transactionDate), 'MMM dd, yyyy')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-xl text-emerald-400 mr-4">+{currencySymbol}{income.amount.toFixed(2)}</span>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => startEdit(income)}
                      className="p-2 text-zinc-500 hover:text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition-all"
                      title="Edit Income"
                    >
                      <Edit2 className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => setDeleteTarget(income.id)}
                      className="p-2 text-zinc-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                      title="Delete Income"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center text-zinc-500">
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
          <div className="bg-zinc-900 border border-white/10 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-white/5">
              <h3 className="text-xl font-bold text-white">Edit Income</h3>
              <button onClick={() => setEditingIncome(null)} className="text-zinc-500 hover:text-white transition-colors">
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
                    className="w-full bg-zinc-950 border border-white/10 rounded-xl pl-8 pr-4 py-2.5 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1">Date & Time</label>
                <input 
                  type="datetime-local"
                  value={editFormData.transactionDate} onChange={(e) => setEditFormData({...editFormData, transactionDate: e.target.value})}
                  className="w-full bg-zinc-950 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-emerald-500 [color-scheme:dark]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1">Source</label>
                <input 
                  type="text" required
                  value={editFormData.source} onChange={(e) => setEditFormData({...editFormData, source: e.target.value})}
                  className="w-full bg-zinc-950 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
              
              <div className="flex items-center justify-end gap-3 mt-4">
                <button type="button" onClick={() => setEditingIncome(null)} className="px-4 py-2 rounded-xl text-sm font-medium text-zinc-400 hover:text-white hover:bg-white/5 transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={isSaving} className="px-6 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium transition-colors flex items-center gap-2">
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