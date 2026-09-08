'use client';

import { useEffect, useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();
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

  const allSources = Array.from(new Set(incomes.map(i => i.source).filter(Boolean))).sort();

  const filteredIncomes = incomes.filter(i => {
    const matchesSearch = i.source?.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = selectedFilters.length === 0 || (i.source && selectedFilters.includes(i.source));
    return matchesSearch && matchesFilter;
  });

  const toggleFilter = (source: string) => {
    setSelectedFilters(prev => 
      prev.includes(source) ? prev.filter(s => s !== source) : [...prev, source]
    );
  };

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

  return (
    <div className="max-w-6xl mx-auto flex flex-col gap-6">
      
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row gap-3 justify-between items-center glass-panel p-3.5 sm:p-4 rounded-2xl">
        <div className="relative w-full sm:w-80 md:w-96">
          <Search className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
          <input 
            type="text"
            placeholder="Search income source..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-input border border-border rounded-xl pl-9 pr-4 py-2 text-sm text-foreground focus:outline-none focus:border-primary transition-colors"
          />
        </div>
        
        <div className="relative w-full sm:w-auto" ref={filterRef}>
          <button 
            onClick={() => setShowFilter(!showFilter)}
            className={`flex items-center justify-center gap-2 px-4 py-2 hover:bg-accent hover:text-accent-foreground text-sm font-medium rounded-xl transition-colors w-full sm:w-auto ${showFilter || selectedFilters.length > 0 ? 'bg-primary/20 text-primary border border-primary/30' : 'bg-card border border-border text-foreground'}`}
          >
            <Filter className="w-4 h-4" />
            Filter {selectedFilters.length > 0 && `(${selectedFilters.length})`}
          </button>
          
          {showFilter && (
            <div className="absolute right-0 mt-2 w-full sm:w-64 glass-popup rounded-xl z-50 p-4 animate-in fade-in slide-in-from-top-2 shadow-2xl">
              <h4 className="text-sm font-semibold text-foreground mb-3">{t('filter', 'Filter')} by Source</h4>
              {allSources.length > 0 ? (
                <div className="flex flex-col gap-2 max-h-60 overflow-y-auto">
                  {allSources.map(src => (
                    <label key={src} className="flex items-center gap-3 p-2 -mx-2 rounded-lg cursor-pointer group hover:bg-accent/50 transition-colors" onClick={() => toggleFilter(src)}>
                      <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${selectedFilters.includes(src) ? 'bg-primary border-primary' : 'border-foreground/30 group-hover:border-foreground/50'}`}>
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
                  {t('clearFilters', 'Clear Filters')}
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Income List Cards */}
      <div className="flex flex-col gap-3 overflow-y-auto pb-6">
        {loading ? (
          <div className="flex justify-center p-8">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>
        ) : filteredIncomes.length > 0 ? (
          filteredIncomes.map(income => (
            <div key={income.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl glass-card-etched hover:bg-accent/20 transition-all gap-3 border border-border/10">
              <div className="flex items-center gap-3.5 flex-1">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center shrink-0">
                  <ArrowUpRight className="w-5 h-5 text-emerald-500" />
                </div>
                <div className="flex flex-col flex-1 min-w-0">
                  <div className="flex items-center justify-between sm:justify-start gap-2">
                    <p className="font-semibold text-foreground truncate">{income.source || 'Unknown Source'}</p>
                    <span className="sm:hidden font-bold text-emerald-500 shrink-0">+{currencySymbol}{income.amount.toFixed(2)}</span>
                  </div>
                  <span className="text-xs text-muted-foreground mt-0.5">
                    {format(parseISO(income.transactionDate), 'MMM dd, yyyy h:mm a')}
                  </span>
                </div>
              </div>

              {/* Desktop Amount & Actions */}
              <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-t-0 border-border/30 pt-2 sm:pt-0 mt-1 sm:mt-0">
                <span className="hidden sm:inline font-bold text-emerald-500 text-right min-w-[90px]">+{currencySymbol}{income.amount.toFixed(2)}</span>
                
                <div className="flex items-center gap-1.5 ml-auto">
                  <button 
                    onClick={() => startEdit(income)}
                    className="p-2 bg-card hover:bg-accent text-muted-foreground hover:text-foreground rounded-xl transition-colors border border-border"
                    title="Edit Income"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => setDeleteTarget(income.id)}
                    className="p-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 rounded-xl transition-colors"
                    title="Delete Income"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="flex justify-center p-8 text-muted-foreground text-sm">
            {t('noIncomeFound', 'No income records found.')}
          </div>
        )}
      </div>

      <ConfirmModal 
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title={t('deleteIncome', 'Delete Income')}
        message={t('confirmDeleteIncome', 'Are you sure you want to delete this income record?')}
      />

      {/* Edit Modal / Bottom Sheet */}
      {editingIncome && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-background/80 backdrop-blur-md animate-in fade-in">
          <div className="bg-card border border-border rounded-t-3xl sm:rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in slide-in-from-bottom duration-300">
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-border">
              <h3 className="text-lg sm:text-xl font-bold text-foreground">{t('editIncome', 'Edit Income')}</h3>
              <button onClick={() => setEditingIncome(null)} className="p-1 rounded-full text-muted-foreground hover:text-foreground transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleEditSave} className="p-4 sm:p-6 flex flex-col gap-4 max-h-[80vh] overflow-y-auto">
              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">{t('amount', 'Amount')}</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-foreground">{currencySymbol}</span>
                  <input 
                    type="number" step="0.01" required
                    value={editFormData.amount} onChange={(e) => setEditFormData({...editFormData, amount: e.target.value})}
                    className="w-full bg-input border border-border rounded-xl pl-9 pr-4 py-2.5 text-foreground focus:outline-none focus:border-primary font-semibold text-lg"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">{t('source', 'Source')}</label>
                <input 
                  type="text" required
                  value={editFormData.source} onChange={(e) => setEditFormData({...editFormData, source: e.target.value})}
                  className="w-full bg-input border border-border rounded-xl px-4 py-2.5 text-foreground focus:outline-none focus:border-primary text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">{t('date', 'Date')}</label>
                <CustomDatePicker 
                  selected={editFormData.transactionDate} 
                  onChange={(date) => setEditFormData({...editFormData, transactionDate: date as Date | null})}
                />
              </div>
              
              <div className="flex items-center justify-end gap-3 mt-4">
                <button type="button" onClick={() => setEditingIncome(null)} className="px-4 py-2.5 rounded-xl text-sm font-medium text-foreground hover:bg-accent transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={isSaving} className="px-6 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-semibold transition-colors flex items-center gap-2 shadow-lg">
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
