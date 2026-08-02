'use client';

import { useEffect, useState } from 'react';
import api from '@/utils/api';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend, LineChart, Line } from 'recharts';
import { ArrowDownRight, ArrowUpRight, Wallet, Loader2, BarChart2, PieChart as PieChartIcon, LineChart as LineChartIcon } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { useUserProfile } from '@/context/UserProfileContext';
import { useDateFilter } from '@/context/DateFilterContext';

interface Transaction {
  id: string;
  type: 'INCOME' | 'EXPENSE';
  amount: number;
  title: string;
  date: string;
}

interface SummaryData {
  totalIncome: number;
  totalExpense: number;
  balance: number;
  recentTransactions: Transaction[];
}

export default function Dashboard() {
  const [data, setData] = useState<SummaryData | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const [chartType, setChartType] = useState<'bar' | 'pie' | 'line'>('bar');
  const { userProfile, loading: profileLoading } = useUserProfile();
  const { selectedYear, selectedMonth } = useDateFilter();

  const currencySymbol = userProfile?.currency || '$';

  useEffect(() => {
    const fetchData = async () => {
      setLoadingStats(true);
      try {
        const res = await api.get(`/dashboard/summary?year=${selectedYear}&month=${selectedMonth}`);
        setData(res.data);
      } catch (err) {
        console.error('Failed to fetch summary', err);
      } finally {
        setLoadingStats(false);
      }
    };
    fetchData();
  }, [selectedYear, selectedMonth]);

  if (loadingStats || !data || profileLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
      </div>
    );
  }

  const chartData = data.recentTransactions.slice(0, 7).reverse().map(t => ({
    name: format(parseISO(t.date), 'MMM dd'),
    amount: t.amount,
    type: t.type
  }));

  const pieData = [
    { name: 'Income', value: data.totalIncome, color: '#10b981' },
    { name: 'Expenses', value: data.totalExpense, color: '#f43f5e' }
  ].filter(d => d.value > 0);

  return (
    <div className="flex flex-col gap-8">
      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-2xl bg-zinc-900 border border-white/5 shadow-sm relative overflow-hidden group">
           <div className="absolute top-0 right-0 p-4 opacity-10">
              <Wallet className="w-24 h-24" />
           </div>
           <p className="text-zinc-400 text-sm font-medium mb-1 relative z-10">Total Balance</p>
           <h2 className="text-3xl font-bold text-white relative z-10">{currencySymbol}{data.balance.toFixed(2)}</h2>
        </div>
        
        <div className="p-6 rounded-2xl bg-zinc-900 border border-white/5 shadow-sm relative overflow-hidden">
           <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center mb-4">
              <ArrowUpRight className="w-5 h-5 text-emerald-400" />
           </div>
           <p className="text-zinc-400 text-sm font-medium mb-1">Total Income</p>
           <h2 className="text-2xl font-bold text-white">{currencySymbol}{data.totalIncome.toFixed(2)}</h2>
        </div>

        <div className="p-6 rounded-2xl bg-zinc-900 border border-white/5 shadow-sm relative overflow-hidden">
           <div className="w-10 h-10 rounded-full bg-rose-500/10 flex items-center justify-center mb-4">
              <ArrowDownRight className="w-5 h-5 text-rose-400" />
           </div>
           <p className="text-zinc-400 text-sm font-medium mb-1">Total Expenses</p>
           <h2 className="text-2xl font-bold text-white">{currencySymbol}{data.totalExpense.toFixed(2)}</h2>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Chart */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-zinc-900 border border-white/5">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold">Activity Overview</h3>
            <div className="flex items-center gap-1 bg-zinc-950 p-1 rounded-lg border border-white/10">
              <button 
                onClick={() => setChartType('bar')} 
                className={`p-1.5 rounded-md transition-colors ${chartType === 'bar' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
                title="Bar Chart (Recent Trend)"
              >
                <BarChart2 className="w-4 h-4" />
              </button>
              <button 
                onClick={() => setChartType('line')} 
                className={`p-1.5 rounded-md transition-colors ${chartType === 'line' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
                title="Line Chart (Activity Trajectory)"
              >
                <LineChartIcon className="w-4 h-4" />
              </button>
              <button 
                onClick={() => setChartType('pie')} 
                className={`p-1.5 rounded-md transition-colors ${chartType === 'pie' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
                title="Pie Chart (Income vs Expense)"
              >
                <PieChartIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div className="h-72 w-full">
            {chartType === 'bar' ? (
              chartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <XAxis dataKey="name" stroke="#52525b" fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis stroke="#52525b" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `${currencySymbol}${val}`} />
                      <Tooltip 
                        cursor={{fill: '#27272a'}}
                        contentStyle={{ backgroundColor: '#18181b', border: '1px solid #3f3f46', borderRadius: '8px' }} 
                        formatter={(value) => [`${currencySymbol}${value}`, 'Amount']}
                      />
                      <Bar dataKey="amount" radius={[4, 4, 0, 0]}>
                        {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.type === 'INCOME' ? '#10b981' : '#f43f5e'} />
                        ))}
                      </Bar>
                  </BarChart>
                  </ResponsiveContainer>
              ) : (
                  <div className="flex h-full items-center justify-center text-zinc-500">No activity yet.</div>
              )
            ) : chartType === 'line' ? (
              chartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <XAxis dataKey="name" stroke="#52525b" fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis stroke="#52525b" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `${currencySymbol}${val}`} />
                      <Tooltip 
                        cursor={{stroke: '#3f3f46', strokeWidth: 1, strokeDasharray: '4 4'}}
                        contentStyle={{ backgroundColor: '#18181b', border: '1px solid #3f3f46', borderRadius: '8px' }} 
                        formatter={(value) => [`${currencySymbol}${value}`, 'Amount']}
                      />
                      <Line type="monotone" dataKey="amount" stroke="#6366f1" strokeWidth={3} dot={{ r: 4, fill: '#6366f1', strokeWidth: 0 }} activeDot={{ r: 6, strokeWidth: 0 }} />
                  </LineChart>
                  </ResponsiveContainer>
              ) : (
                  <div className="flex h-full items-center justify-center text-zinc-500">No activity yet.</div>
              )
            ) : (
              pieData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={90}
                        paddingAngle={5}
                        dataKey="value"
                        stroke="none"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#18181b', border: '1px solid #3f3f46', borderRadius: '8px', color: '#fff' }}
                        itemStyle={{ color: '#fff' }}
                        formatter={(value: number) => [`${currencySymbol}${value.toFixed(2)}`, 'Total']}
                      />
                      <Legend verticalAlign="bottom" height={36} iconType="circle" />
                    </PieChart>
                  </ResponsiveContainer>
              ) : (
                  <div className="flex h-full items-center justify-center text-zinc-500">No activity yet.</div>
              )
            )}
          </div>
        </div>

        {/* Transactions */}
        <div className="p-6 rounded-2xl bg-zinc-900 border border-white/5">
          <h3 className="text-lg font-semibold mb-6">Recent Transactions</h3>
          <div className="flex flex-col gap-4">
            {data.recentTransactions.length > 0 ? (
                data.recentTransactions.map(t => (
                  <div key={t.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-colors cursor-pointer">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${t.type === 'INCOME' ? 'bg-emerald-500/10' : 'bg-rose-500/10'}`}>
                         {t.type === 'INCOME' ? <ArrowUpRight className="w-5 h-5 text-emerald-400" /> : <ArrowDownRight className="w-5 h-5 text-rose-400" />}
                      </div>
                      <div>
                        <p className="font-medium text-white">{t.title}</p>
                        <p className="text-xs text-zinc-500">{format(parseISO(t.date), 'MMM dd, yyyy h:mm a')}</p>
                      </div>
                    </div>
                    <span className={`font-semibold ${t.type === 'INCOME' ? 'text-emerald-400' : 'text-rose-400'}`}>
                       {t.type === 'INCOME' ? '+' : '-'}{currencySymbol}{t.amount.toFixed(2)}
                    </span>
                  </div>
                ))
            ) : (
                <p className="text-zinc-500 text-center py-4">No recent transactions.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}