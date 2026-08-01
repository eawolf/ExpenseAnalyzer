'use client';

import { useEffect, useState } from 'react';
import api from '@/utils/api';
import { format, parseISO } from 'date-fns';
import { Search, Filter, Loader2, ArrowDownRight, Tag } from 'lucide-react';
import { useUserProfile } from '@/context/UserProfileContext';

interface Expense {
  id: string;
  amount: number;
  merchant: string;
  categories: string[];
  notes: string;
  transactionDate: string;
}

export default function Expenses() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const { userProfile } = useUserProfile();
  
  const currencySymbol = userProfile?.currency || '$';

  useEffect(() => {
    const fetchExpenses = async () => {
      try {
        const res = await api.get('/expenses');
        setExpenses(res.data);
      } catch (err) {
        console.error('Failed to load expenses', err);
      } finally {
        setLoading(false);
      }
    };
    fetchExpenses();
  }, []);

  const filteredExpenses = expenses.filter(e => 
    e.merchant?.toLowerCase().includes(search.toLowerCase()) || 
    e.categories?.join(' ').toLowerCase().includes(search.toLowerCase()) ||
    e.notes?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto flex flex-col gap-8">
      
      {/* Header Actions */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-zinc-900 border border-white/5 p-4 rounded-2xl">
        <div className="relative w-full md:w-96">
          <Search className="w-5 h-5 absolute left-3 top-3 text-zinc-500" />
          <input 
            type="text"
            placeholder="Search by merchant, category, notes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-zinc-950 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors"
          />
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white text-sm font-medium rounded-xl transition-colors w-full md:w-auto">
          <Filter className="w-4 h-4" />
          Filter
        </button>
      </div>

      {/* Table */}
      <div className="bg-zinc-900 border border-white/5 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-zinc-950/50 border-b border-white/5 text-zinc-400 text-sm">
                <th className="p-4 font-medium">Merchant / Details</th>
                <th className="p-4 font-medium">Categories</th>
                <th className="p-4 font-medium">Date</th>
                <th className="p-4 font-medium text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center">
                    <Loader2 className="w-8 h-8 text-indigo-500 animate-spin mx-auto" />
                  </td>
                </tr>
              ) : filteredExpenses.length > 0 ? (
                filteredExpenses.map(expense => (
                  <tr key={expense.id} className="border-b border-white/5 hover:bg-white/5 transition-colors group">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-rose-500/10 flex items-center justify-center flex-shrink-0">
                          <ArrowDownRight className="w-5 h-5 text-rose-400" />
                        </div>
                        <div>
                          <p className="font-semibold text-white">{expense.merchant || 'Unknown Merchant'}</p>
                          {expense.notes && <p className="text-sm text-zinc-500 truncate max-w-xs">{expense.notes}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-wrap gap-1.5 max-w-[200px]">
                        {expense.categories && expense.categories.length > 0 ? (
                           expense.categories.map((cat, idx) => (
                             <span key={idx} className="inline-flex items-center gap-1 bg-zinc-800 text-zinc-300 px-2 py-1 rounded-md text-xs font-medium whitespace-nowrap">
                               <Tag className="w-3 h-3 opacity-50" />
                               {cat}
                             </span>
                           ))
                        ) : (
                           <span className="text-zinc-500 text-sm italic">Uncategorized</span>
                        )}
                      </div>
                    </td>
                    <td className="p-4 text-sm text-zinc-400">
                      {format(parseISO(expense.transactionDate), 'MMM dd, yyyy h:mm a')}
                    </td>
                    <td className="p-4 text-right">
                      <span className="font-semibold text-rose-400">-{currencySymbol}{expense.amount.toFixed(2)}</span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-zinc-500">
                    No expenses found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}