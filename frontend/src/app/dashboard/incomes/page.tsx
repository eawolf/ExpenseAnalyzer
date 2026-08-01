'use client';

import { useEffect, useState } from 'react';
import api from '@/utils/api';
import { Loader2, Trash2, TrendingUp } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import ConfirmModal from '@/components/ConfirmModal';
import { useUserProfile } from '@/context/UserProfileContext';

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
  const { userProfile } = useUserProfile();

  const currencySymbol = userProfile?.currency || '$';

  const fetchIncomes = async () => {
    try {
      const res = await api.get('/incomes');
      setIncomes(res.data);
    } catch (err) {
      console.error('Failed to fetch incomes', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIncomes();
  }, []);

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

      <div className="bg-zinc-900 border border-white/5 rounded-2xl overflow-hidden">
        {incomes.length > 0 ? (
          <div className="divide-y divide-white/5">
            {incomes.map((income) => (
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
                <div className="flex items-center gap-6">
                  <span className="font-bold text-xl text-emerald-400">+{currencySymbol}{income.amount.toFixed(2)}</span>
                  <button
                    onClick={() => setDeleteTarget(income.id)}
                    className="p-2 text-zinc-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                    title="Delete Income"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
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
    </div>
  );
}