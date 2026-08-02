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

const MOCK_EXCHANGE_RATES: Record<string, number> = {
  '$': 1,
  '€': 0.92,
  '£': 0.79,
  '₹': 83.12,
  '¥': 148.50,
};

const getCurrencyLabel = (symbol: string) => CURRENCIES.find(c => c.symbol === symbol)?.label || symbol;

export default function CurrencySelector() {
  const { userProfile, setUserProfile } = useUserProfile();
  const [loadingCurrency, setLoadingCurrency] = useState(false);
  const [previousCurrency, setPreviousCurrency] = useState<string | null>(null);

  if (!userProfile) return null;

  const changeCurrency = async (newCurrency: string) => {
    if (userProfile.currency === newCurrency) return;
    setPreviousCurrency(userProfile.currency);
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

  const showConversion = previousCurrency && userProfile && previousCurrency !== userProfile.currency;
  const conversionRate = showConversion ? (MOCK_EXCHANGE_RATES[userProfile.currency] / MOCK_EXCHANGE_RATES[previousCurrency]).toFixed(4) : null;
  const reverseRate = showConversion ? (MOCK_EXCHANGE_RATES[previousCurrency] / MOCK_EXCHANGE_RATES[userProfile.currency]).toFixed(4) : null;

  return (
    <div className="flex items-center gap-3">
      {showConversion && (
        <div className="hidden md:flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 px-3 py-1.5 rounded-lg text-xs font-medium text-indigo-300 animate-in fade-in slide-in-from-right-2">
          <span>1 {getCurrencyLabel(previousCurrency)} = {conversionRate} {getCurrencyLabel(userProfile.currency)}</span>
          <span className="text-indigo-500/30">|</span>
          <span>1 {getCurrencyLabel(userProfile.currency)} = {reverseRate} {getCurrencyLabel(previousCurrency)}</span>
        </div>
      )}
      <div className="flex items-center gap-2 bg-zinc-900 border border-white/10 rounded-xl px-2 py-1.5">
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
    </div>
  );
}
