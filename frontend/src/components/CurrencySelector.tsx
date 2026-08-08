'use client';

import { useState, useRef, useEffect } from 'react';
import { Loader2, DollarSign, Euro, PoundSterling, IndianRupee, JapaneseYen, ChevronDown } from 'lucide-react';
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
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!userProfile) return null;

  const changeCurrency = async (newCurrency: string) => {
    setIsOpen(false);
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
        <div className="hidden md:flex items-center gap-2 bg-primary/10 border border-primary/20 px-3 py-1.5 rounded-lg text-xs font-medium text-primary animate-in fade-in slide-in-from-right-2">
          <span>1 {getCurrencyLabel(previousCurrency)} = {conversionRate} {getCurrencyLabel(userProfile.currency)}</span>
          <span className="text-primary/30">|</span>
          <span>1 {getCurrencyLabel(userProfile.currency)} = {reverseRate} {getCurrencyLabel(previousCurrency)}</span>
        </div>
      )}
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          disabled={loadingCurrency}
          className="flex items-center gap-2 glass-panel rounded-xl px-3 py-2 hover:bg-accent transition-colors disabled:opacity-50"
        >
          {loadingCurrency ? (
            <Loader2 className="w-4 h-4 text-muted-foreground animate-spin" />
          ) : (
            <span className="text-muted-foreground font-medium text-sm">{userProfile.currency}</span>
          )}
          <span className="text-sm text-foreground font-medium flex items-center gap-1">
            {getCurrencyLabel(userProfile.currency)}
            <ChevronDown className="w-3 h-3 opacity-50" />
          </span>
        </button>

        {isOpen && (
          <div className="absolute right-0 top-full mt-2 w-40 glass-popup rounded-xl py-2 z-[100] animate-in fade-in slide-in-from-top-2">
            {CURRENCIES.map(c => (
              <button
                key={c.symbol}
                onClick={() => changeCurrency(c.symbol)}
                className={`w-full flex items-center justify-between px-4 py-2 text-sm transition-colors hover:bg-accent
                  ${userProfile.currency === c.symbol ? 'bg-primary/10 text-primary font-medium' : 'text-foreground'}`}
              >
                <span>{c.label}</span>
                <span className="text-muted-foreground">{c.symbol}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
