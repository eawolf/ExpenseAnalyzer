'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/utils/api';
import { format } from 'date-fns';
import { Loader2, GripVertical, X, Banknote, Wallet } from 'lucide-react';
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

  useEffect(() => {
    // Already defaults to now
  }, []);
  
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
        return; // prevent immediate routing
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to add transaction.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-card border border-border rounded-2xl p-8 relative overflow-hidden">
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
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-background/90 backdrop-blur-sm rounded-2xl">
          <div className="relative w-32 h-40 flex flex-col items-center justify-end">
            <div className={`absolute top-0 ${animationType === 'INCOME' ? 'animate-[drop-in_1s_ease-in-out_forwards]' : 'animate-[fly-out_1s_ease-in-out_forwards]'}`}>
              <Banknote className={`w-16 h-16 ${animationType === 'INCOME' ? 'text-emerald-500' : 'text-rose-500'} drop-shadow-xl`} strokeWidth={1.5} />
            </div>
            <div className="relative z-10 animate-bounce">
              <Wallet className="w-24 h-24 text-amber-600 drop-shadow-2xl" strokeWidth={1.5} />
            </div>
          </div>
          <h3 className={`text-2xl font-bold mt-6 animate-pulse ${animationType === 'INCOME' ? 'text-emerald-400' : 'text-rose-400'}`}>
            {animationType === 'INCOME' ? 'Income Secured!' : 'Expense Logged!'}
          </h3>
        </div>
      )}

      <h2 className="text-2xl font-bold mb-6">Add New Transaction</h2>
      
      <div className="flex bg-background p-1 rounded-xl mb-8 border border-border">
        <button
          className={"flex-1 py-2 text-sm font-medium rounded-lg transition-colors " + (type === 'EXPENSE' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground')}
          onClick={() => setType('EXPENSE')}
        >
          Expense
        </button>
        <button
          className={"flex-1 py-2 text-sm font-medium rounded-lg transition-colors " + (type === 'INCOME' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground')}
          onClick={() => setType('INCOME')}
        >
          Income
        </button>
      </div>

      {error && <div className="bg-red-500/10 text-red-500 p-4 rounded-xl mb-6 text-sm">{error}</div>}

      <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-8">
        
        {/* Left Side: Basic Form */}
        <div className="flex-1 flex flex-col gap-6">
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-2">Amount ({currencySymbol})</label>
            <input
              type="number"
              step="0.01"
              required
              min="0.01"
              className="w-full bg-input border border-border rounded-xl p-3 text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-2">Date (Defaults to Today)</label>
            <CustomDatePicker
              selected={transactionDate}
              onChange={(date) => setTransactionDate(date)}
              required
            />
          </div>

          {type === 'INCOME' ? (
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">Income Source</label>
              <input
                type="text"
                required
                className="w-full bg-input border border-border rounded-xl p-3 text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                value={incomeSource}
                onChange={(e) => setIncomeSource(e.target.value)}
                placeholder="e.g., 💼 Salary, 👨‍💻 Freelance"
              />
            </div>
          ) : (
            <>
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">Merchant (Optional)</label>
                <input
                  type="text"
                  className="w-full bg-input border border-border rounded-xl p-3 text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                  value={merchant}
                  onChange={(e) => setMerchant(e.target.value)}
                  placeholder="e.g., Amazon, Starbucks"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">Notes (Optional)</label>
                <textarea
                  className="w-full bg-input border border-border rounded-xl p-3 text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  placeholder="Any extra details..."
                />
              </div>
            </>
          )}
          
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-primary-foreground font-medium py-3 rounded-xl hover:opacity-90 transition-colors flex justify-center items-center mt-2"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Add " + (type === 'EXPENSE' ? 'Expense' : 'Income')}
          </button>
        </div>

        {/* Right Side: Category Drag & Drop */}
        {type === 'EXPENSE' && (
          <div className="flex-1 flex flex-col gap-6">
            
            {/* Selected Zone */}
            <div 
              className="bg-indigo-500/5 border-2 border-dashed border-indigo-500/30 rounded-2xl p-4 flex flex-col min-h-[120px]"
              onDrop={(e) => handleDrop(e, 'selected')}
              onDragOver={handleDragOver}
            >
              <h3 className="text-sm font-medium text-primary mb-3">Selected Categories (Drop here)</h3>
              <div className="flex flex-wrap gap-2">
                {selectedCategories.length === 0 && (
                   <p className="text-xs text-muted-foreground italic">Drag categories here...</p>
                )}
                {selectedCategories.map(cat => (
                  <div 
                    key={cat}
                    draggable
                    onDragStart={(e) => handleDragStart(e, cat, 'selected')}
                    className="flex items-center gap-1 bg-primary text-primary-foreground px-3 py-1.5 rounded-full text-sm font-medium shadow-sm cursor-grab active:cursor-grabbing hover:opacity-90 transition-colors"
                  >
                    <GripVertical className="w-3 h-3 opacity-50" />
                    {cat}
                    <button type="button" onClick={() => removeSelectedCategory(cat)} className="ml-1 opacity-70 hover:opacity-100">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Custom Category Input */}
            <div className="flex gap-2">
              <input
                type="text"
                className="flex-1 bg-input border border-border rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                value={customCategory}
                onChange={(e) => setCustomCategory(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomCategory())}
                placeholder="Type custom category (e.g. 🐶 Pets)..."
              />
              <button 
                type="button" 
                onClick={addCustomCategory}
                className="bg-accent text-accent-foreground border border-border px-4 py-2 rounded-xl text-sm hover:opacity-80 transition-colors"
              >
                Add
              </button>
            </div>

            {/* Available Zone */}
            <div 
              className="bg-background border border-border rounded-2xl p-4 flex flex-col flex-1"
              onDrop={(e) => handleDrop(e, 'available')}
              onDragOver={handleDragOver}
            >
              <h3 className="text-sm font-medium text-muted-foreground mb-3">Available Categories</h3>
              <div className="flex flex-wrap gap-2">
                {availableCategories.map(cat => (
                  <div 
                    key={cat}
                    draggable
                    onDragStart={(e) => handleDragStart(e, cat, 'available')}
                    className="flex items-center gap-1 bg-accent text-accent-foreground px-3 py-1.5 rounded-full text-sm cursor-grab active:cursor-grabbing hover:opacity-80 transition-colors border border-border"
                  >
                    <GripVertical className="w-3 h-3 opacity-50" />
                    {cat}
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

      </form>
    </div>
  );
}