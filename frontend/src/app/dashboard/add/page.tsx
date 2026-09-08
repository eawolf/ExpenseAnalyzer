'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/utils/api';
import { format } from 'date-fns';
import { Loader2, GripVertical, X, Banknote, Wallet, Plus, Check } from 'lucide-react';
import { useUserProfile } from '@/context/UserProfileContext';
import CustomDatePicker from '@/components/CustomDatePicker';

const PREDEFINED_CATEGORIES = [
  '🍔 Food & Dining', '🚗 Transportation', '🏠 Rent/Mortgage', '💡 Utilities', 
  '🛒 Groceries', '🎬 Entertainment', '🛍️ Shopping', '💪 Health & Fitness', 
  '✈️ Travel', '📚 Education', '🧴 Personal Care', '🎁 Gifts & Donations', '📦 Other'
];

export default function AddTransaction() {
  const router = useRouter();
  const [type, setType] = useState<'EXPENSE' | 'INCOME'>('EXPENSE');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [animationType, setAnimationType] = useState<'EXPENSE' | 'INCOME' | null>(null);

  const [amount, setAmount] = useState('');
  const [merchant, setMerchant] = useState('');
  const [notes, setNotes] = useState('');
  const [transactionDate, setTransactionDate] = useState<Date | null>(new Date());

  const [incomeSource, setIncomeSource] = useState('');
  
  const [availableCategories, setAvailableCategories] = useState<string[]>(PREDEFINED_CATEGORIES);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [customCategory, setCustomCategory] = useState('');

  const { userProfile } = useUserProfile();
  const currencySymbol = userProfile?.currency || '$';

  const handleDragStart = (e: React.DragEvent, category: string, source: 'available' | 'selected') => {
    e.dataTransfer.setData('category', category);
    e.dataTransfer.setData('source', source);
  };

  const handleDrop = (e: React.DragEvent, target: 'available' | 'selected') => {
    e.preventDefault();
    const category = e.dataTransfer.getData('category');
    const source = e.dataTransfer.getData('source');

    if (source === target) return; 

    if (target === 'selected') {
      setAvailableCategories(prev => prev.filter(c => c !== category));
      setSelectedCategories(prev => [...prev, category]);
    } else {
      setSelectedCategories(prev => prev.filter(c => c !== category));
      if (!availableCategories.includes(category)) {
        setAvailableCategories(prev => [...prev, category]);
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault(); 
  };

  const toggleCategory = (category: string) => {
    if (selectedCategories.includes(category)) {
      setSelectedCategories(prev => prev.filter(c => c !== category));
      if (!availableCategories.includes(category)) {
        setAvailableCategories(prev => [...prev, category]);
      }
    } else {
      setAvailableCategories(prev => prev.filter(c => c !== category));
      setSelectedCategories(prev => [...prev, category]);
    }
  };

  const addCustomCategory = () => {
    if (!customCategory.trim()) return;
    const cat = customCategory.trim();
    if (!selectedCategories.includes(cat)) {
      setSelectedCategories(prev => [...prev, cat]);
    }
    setCustomCategory('');
  };

  const removeSelectedCategory = (cat: string) => {
    setSelectedCategories(prev => prev.filter(c => c !== cat));
    if (PREDEFINED_CATEGORIES.includes(cat) || !availableCategories.includes(cat)) {
      setAvailableCategories(prev => [...prev, cat]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (type === 'EXPENSE') {
        if (selectedCategories.length === 0) {
          setError('Please select at least one category.');
          setLoading(false);
          return;
        }
        await api.post('/expenses', {
          amount: parseFloat(amount),
          categories: selectedCategories,
          merchant,
          notes,
          transactionDate: transactionDate ? format(transactionDate, "yyyy-MM-dd'T'HH:mm:ss") : undefined
        });
        setAnimationType('EXPENSE');
        setTimeout(() => {
          router.push('/dashboard');
        }, 1500);
        return;
      } else {
        if (!incomeSource.trim()) {
           setError('Please enter an income source.');
           setLoading(false);
           return;
        }
        await api.post('/incomes', {
          amount: parseFloat(amount),
          source: incomeSource,
          transactionDate: transactionDate ? format(transactionDate, "yyyy-MM-dd'T'HH:mm:ss") : undefined
        });
        setAnimationType('INCOME');
        setTimeout(() => {
          router.push('/dashboard');
        }, 1500);
        return;
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to add transaction.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-card border border-border rounded-2xl p-4 sm:p-8 relative overflow-hidden shadow-xl">
      <style>{`
        @keyframes drop-in {
          0% { transform: translateY(-50px) scale(1.2); opacity: 0; }
          20% { opacity: 1; }
          80% { transform: translateY(40px) scale(0.6); opacity: 1; z-index: 0; }
          100% { transform: translateY(40px) scale(0.6); opacity: 0; z-index: 0; }
        }
        @keyframes fly-out {
          0% { transform: translateY(40px) scale(0.6); opacity: 0; z-index: 0; }
          20% { transform: translateY(40px) scale(0.6); opacity: 1; z-index: 0; }
          80% { opacity: 1; }
          100% { transform: translateY(-60px) scale(1.4); opacity: 0; }
        }
      `}</style>

      {animationType && (
        <div className="absolute inset-0 bg-background/90 backdrop-blur-md z-50 flex flex-col items-center justify-center pointer-events-none">
          <div className="relative flex flex-col items-center">
            {animationType === 'EXPENSE' ? (
              <div style={{ animation: 'drop-in 1.4s cubic-bezier(0.16, 1, 0.3, 1) forwards' }}>
                <Banknote className="w-20 h-20 text-rose-500" />
              </div>
            ) : (
              <div style={{ animation: 'fly-out 1.4s cubic-bezier(0.16, 1, 0.3, 1) forwards' }}>
                <Banknote className="w-20 h-20 text-emerald-500" />
              </div>
            )}
            <Wallet className="w-24 h-24 text-primary mt-2" />
            <p className="mt-4 text-lg font-bold text-foreground">
              {animationType === 'EXPENSE' ? 'Expense Recorded!' : 'Income Recorded!'}
            </p>
          </div>
        </div>
      )}

      {/* Segmented Type Selector */}
      <div className="flex bg-accent/50 p-1 rounded-xl mb-6 sm:mb-8 border border-border/50">
        <button 
          type="button"
          onClick={() => setType('EXPENSE')}
          className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${
            type === 'EXPENSE' 
              ? 'bg-card text-rose-500 shadow-md border border-rose-500/20' 
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Expense
        </button>
        <button 
          type="button"
          onClick={() => setType('INCOME')}
          className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${
            type === 'INCOME' 
              ? 'bg-card text-emerald-500 shadow-md border border-emerald-500/20' 
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Income
        </button>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-500 px-4 py-3 rounded-xl text-sm font-medium mb-6 text-center">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-5 sm:gap-6">
        {/* Amount Input */}
        <div>
          <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Amount</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-foreground text-xl">{currencySymbol}</span>
            <input 
              type="number" step="0.01" required placeholder="0.00"
              value={amount} onChange={(e) => setAmount(e.target.value)}
              className="w-full bg-input border border-border rounded-xl pl-10 pr-4 py-3 text-2xl font-bold text-foreground focus:outline-none focus:border-primary shadow-inner"
            />
          </div>
        </div>

        {/* Date Selector */}
        <div>
          <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Transaction Date</label>
          <CustomDatePicker 
            selected={transactionDate} 
            onChange={(date) => setTransactionDate(date as Date | null)}
          />
        </div>

        {type === 'EXPENSE' ? (
          <>
            <div>
              <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Merchant (Optional)</label>
              <input 
                type="text" placeholder="e.g. Starbucks, Amazon"
                value={merchant} onChange={(e) => setMerchant(e.target.value)}
                className="w-full bg-input border border-border rounded-xl px-4 py-2.5 text-foreground focus:outline-none focus:border-primary text-sm"
              />
            </div>

            {/* Categories Section (Tap or Drag-and-Drop) */}
            <div>
              <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                Categories (Tap or Drag items to select)
              </label>

              {/* Selected Categories Dropzone */}
              <div 
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, 'selected')}
                className="min-h-[64px] bg-primary/5 border-2 border-dashed border-primary/30 rounded-xl p-3 flex flex-wrap gap-2 items-center mb-3 transition-colors"
              >
                {selectedCategories.length === 0 ? (
                  <span className="text-xs text-muted-foreground italic">Tap or drag categories below to assign...</span>
                ) : (
                  selectedCategories.map(cat => (
                    <span 
                      key={cat}
                      draggable
                      onDragStart={(e) => handleDragStart(e, cat, 'selected')}
                      onClick={() => removeSelectedCategory(cat)}
                      className="inline-flex items-center gap-1.5 bg-primary text-primary-foreground px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer shadow-sm active:scale-95 transition-transform"
                    >
                      <GripVertical className="w-3.5 h-3.5 opacity-60" />
                      {cat}
                      <X className="w-3.5 h-3.5 hover:text-red-200" />
                    </span>
                  ))
                )}
              </div>

              {/* Available Categories Chips */}
              <div 
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, 'available')}
                className="flex flex-wrap gap-2 p-3 bg-accent/30 rounded-xl border border-border/50 max-h-48 overflow-y-auto"
              >
                {availableCategories.map(cat => (
                  <span 
                    key={cat}
                    draggable
                    onDragStart={(e) => handleDragStart(e, cat, 'available')}
                    onClick={() => toggleCategory(cat)}
                    className="inline-flex items-center gap-1.5 bg-card hover:bg-primary/20 hover:text-primary text-foreground border border-border px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-all active:scale-95"
                  >
                    <Plus className="w-3 h-3 opacity-60" />
                    {cat}
                  </span>
                ))}
              </div>

              {/* Custom Category Input */}
              <div className="flex gap-2 mt-3">
                <input 
                  type="text" placeholder="Add custom category..."
                  value={customCategory} onChange={(e) => setCustomCategory(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addCustomCategory(); } }}
                  className="flex-1 bg-input border border-border rounded-xl px-3 py-2 text-xs text-foreground focus:outline-none focus:border-primary"
                />
                <button 
                  type="button" onClick={addCustomCategory}
                  className="px-4 py-2 bg-accent text-accent-foreground text-xs font-semibold rounded-xl hover:bg-accent/80 transition-colors"
                >
                  Add
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Notes (Optional)</label>
              <textarea 
                placeholder="Additional details..."
                value={notes} onChange={(e) => setNotes(e.target.value)}
                className="w-full bg-input border border-border rounded-xl px-4 py-2.5 text-foreground focus:outline-none focus:border-primary text-sm min-h-[80px]"
              />
            </div>
          </>
        ) : (
          <div>
            <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Income Source</label>
            <input 
              type="text" required placeholder="e.g. Salary, Freelance, Dividend"
              value={incomeSource} onChange={(e) => setIncomeSource(e.target.value)}
              className="w-full bg-input border border-border rounded-xl px-4 py-2.5 text-foreground focus:outline-none focus:border-primary text-sm"
            />
          </div>
        )}

        <div className="flex items-center justify-end gap-3 mt-4">
          <button 
            type="button" onClick={() => router.back()}
            className="px-5 py-3 rounded-xl text-sm font-medium text-foreground hover:bg-accent transition-colors"
          >
            Cancel
          </button>
          <button 
            type="submit" disabled={loading}
            className={`px-8 py-3 rounded-xl text-sm font-bold text-white shadow-xl transition-all flex items-center gap-2 active:scale-95 ${
              type === 'EXPENSE' ? 'bg-rose-500 hover:bg-rose-600' : 'bg-emerald-500 hover:bg-emerald-600'
            }`}
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {type === 'EXPENSE' ? 'Save Expense' : 'Save Income'}
          </button>
        </div>
      </form>
    </div>
  );
}
