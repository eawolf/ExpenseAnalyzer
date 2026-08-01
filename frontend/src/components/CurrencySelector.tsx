'use client';

import { useState } from 'react';
import { Loader2, DollarSign, Euro, PoundSterling, IndianRupee, JapaneseYen } from 'lucide-react';
import api from '@/utils/api';
import { useUserProfile } from '@/context/UserProfileContext';

const CURRENCIES = [
  { symbol: '$', label: 'USD', icon: DollarSign },
  { symbol: '€', label: 'EUR', icon: Euro },
  { symbol: '£', label: 'GBP', icon: PoundSterling },
  { symbol: '₹', label: 'INR', icon: IndianRupee },
  { symbol: '¥', label: 'JPY', icon: JapaneseYen },
];

export default function CurrencySelector() {
  const { userProfile, setUserProfile } = useUserProfile();
  const [loadingCurrency, setLoadingCurrency] = useState(false);

  if (!userProfile) return null;

  const changeCurrency = async (newCurrency: string) => {
    setLoadingCurrency(true);
    try {
      const token = localStorage.getItem('token');
      const res = await api.put('http://localhost:8081/api/auth/me/currency', { currency: newCurrency }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUserProfile(res.data);
    } catch (err) {
      console.error('Failed to update currency', err);
      alert('Failed to update currency. Please try again.');
    } finally {
      setLoadingCurrency(false);
    }
  };

  return (
    <div className="flex items-center gap-2 mr-4 bg-zinc-900 border border-white/10 rounded-xl px-2 py-1">
      {loadingCurrency ? (
        <Loader2 className="w-4 h-4 text-zinc-400 animate-spin" />
      ) : (
        <span className="text-zinc-400 font-medium text-sm">{userProfile.currency}</span>
      )}
      <select 
        value={userProfile.currency}
        onChange={(e) => changeCurrency(e.target.value)}
        disabled={loadingCurrency}
        className="appearance-none bg-transparent text-sm text-zinc-300 font-medium focus:outline-none cursor-pointer disabled:opacity-50"
      >
        {CURRENCIES.map(c => (
          <option key={c.symbol} value={c.symbol} className="bg-zinc-900 text-zinc-300">{c.label} ({c.symbol})</option>
        ))}
      </select>
    </div>
  );
}
