'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/utils/api';
import { Loader2, GripVertical, X } from 'lucide-react';
import { useUserProfile } from '@/context/UserProfileContext';

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

  const [amount, setAmount] = useState('');
  const [merchant, setMerchant] = useState('');
  const [notes, setNotes] = useState('');
  
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
        });
      } else {
        if (!incomeSource.trim()) {
           setError('Please enter an income source.');
           setLoading(false);
           return;
        }
        await api.post('/incomes', {
          amount: parseFloat(amount),
          source: incomeSource,
        });
      }
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to add transaction.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-zinc-900 border border-white/5 rounded-2xl p-8">
      <h2 className="text-2xl font-bold mb-6">Add New Transaction</h2>
      
      <div className="flex bg-zinc-950 p-1 rounded-xl mb-8 border border-white/5">
        <button
          className={"flex-1 py-2 text-sm font-medium rounded-lg transition-colors " + (type === 'EXPENSE' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-white')}
          onClick={() => setType('EXPENSE')}
        >
          Expense
        </button>
        <button
          className={"flex-1 py-2 text-sm font-medium rounded-lg transition-colors " + (type === 'INCOME' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-white')}
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
            <label className="block text-sm font-medium text-zinc-400 mb-2">Amount ({currencySymbol})</label>
            <input
              type="number"
              step="0.01"
              required
              min="0.01"
              className="w-full bg-zinc-950 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-indigo-500 transition-colors"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
            />
          </div>

          {type === 'INCOME' ? (
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-2">Income Source</label>
              <input
                type="text"
                required
                className="w-full bg-zinc-950 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-indigo-500 transition-colors"
                value={incomeSource}
                onChange={(e) => setIncomeSource(e.target.value)}
                placeholder="e.g., 💼 Salary, 👨‍💻 Freelance"
              />
            </div>
          ) : (
            <>
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">Merchant (Optional)</label>
                <input
                  type="text"
                  className="w-full bg-zinc-950 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-indigo-500 transition-colors"
                  value={merchant}
                  onChange={(e) => setMerchant(e.target.value)}
                  placeholder="e.g., Amazon, Starbucks"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">Notes (Optional)</label>
                <textarea
                  className="w-full bg-zinc-950 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-indigo-500 transition-colors"
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
            className="w-full bg-indigo-600 text-white font-medium py-3 rounded-xl hover:bg-indigo-700 transition-colors flex justify-center items-center mt-2"
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
              <h3 className="text-sm font-medium text-indigo-400 mb-3">Selected Categories (Drop here)</h3>
              <div className="flex flex-wrap gap-2">
                {selectedCategories.length === 0 && (
                   <p className="text-xs text-zinc-500 italic">Drag categories here...</p>
                )}
                {selectedCategories.map(cat => (
                  <div 
                    key={cat}
                    draggable
                    onDragStart={(e) => handleDragStart(e, cat, 'selected')}
                    className="flex items-center gap-1 bg-indigo-600 text-white px-3 py-1.5 rounded-full text-sm font-medium shadow-sm cursor-grab active:cursor-grabbing hover:bg-indigo-500 transition-colors"
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
                className="flex-1 bg-zinc-950 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors"
                value={customCategory}
                onChange={(e) => setCustomCategory(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomCategory())}
                placeholder="Type custom category (e.g. 🐶 Pets)..."
              />
              <button 
                type="button" 
                onClick={addCustomCategory}
                className="bg-zinc-800 text-white px-4 py-2 rounded-xl text-sm hover:bg-zinc-700 transition-colors"
              >
                Add
              </button>
            </div>

            {/* Available Zone */}
            <div 
              className="bg-zinc-950 border border-white/5 rounded-2xl p-4 flex flex-col flex-1"
              onDrop={(e) => handleDrop(e, 'available')}
              onDragOver={handleDragOver}
            >
              <h3 className="text-sm font-medium text-zinc-400 mb-3">Available Categories</h3>
              <div className="flex flex-wrap gap-2">
                {availableCategories.map(cat => (
                  <div 
                    key={cat}
                    draggable
                    onDragStart={(e) => handleDragStart(e, cat, 'available')}
                    className="flex items-center gap-1 bg-zinc-800 text-zinc-300 px-3 py-1.5 rounded-full text-sm cursor-grab active:cursor-grabbing hover:bg-zinc-700 hover:text-white transition-colors border border-white/5"
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