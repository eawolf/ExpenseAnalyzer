'use client';

import { useEffect, useState } from 'react';
import api from '@/utils/api';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend, LineChart, Line, AreaChart, Area } from 'recharts';
import { ArrowDownRight, ArrowUpRight, Wallet, Loader2, BarChart2, PieChart as PieChartIcon, LineChart as LineChartIcon, ExternalLink, TrendingUp, TrendingDown, Coins, Receipt } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { format, parseISO } from 'date-fns';
import { useRouter } from 'next/navigation';
import { useUserProfile } from '@/context/UserProfileContext';
import { useDateFilter } from '@/context/DateFilterContext';
import CustomDatePicker from '@/components/CustomDatePicker';

interface Transaction {
  id: string;
  type: 'INCOME' | 'EXPENSE';
  amount: number;
  title: string;
  date: string;
  merchant?: string;
  source?: string;
}

interface CategorySummary {
  name: string;
  total: number;
}

interface SummaryData {
  totalIncome: number;
  totalExpense: number;
  balance: number;
  recentTransactions: Transaction[];
  topCategories?: CategorySummary[];
}

export default function Dashboard() {
  const { t } = useTranslation();
  const router = useRouter();
  const [data, setData] = useState<SummaryData | null>(null);
  const [chartSummaryData, setChartSummaryData] = useState<SummaryData | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingChart, setLoadingChart] = useState(false);
  const [chartType, setChartType] = useState<'bar' | 'pie' | 'pie-categories' | 'line'>('bar');
  const [chartStartDate, setChartStartDate] = useState<Date | null>(null);
  const [chartEndDate, setChartEndDate] = useState<Date | null>(null);
  const { userProfile, loading: profileLoading } = useUserProfile();
  const { selectedYear, selectedMonth } = useDateFilter();

  const currencySymbol = userProfile?.currency || '$';

  useEffect(() => {
    const fetchData = async () => {
      setLoadingStats(true);
      try {
        const start = new Date(selectedYear, selectedMonth - 1, 1);
        const end = new Date(selectedYear, selectedMonth, 0);
        const url = `/dashboard/summary?startDate=${format(start, 'yyyy-MM-dd')}&endDate=${format(end, 'yyyy-MM-dd')}`;
        const res = await api.get(url);
        setData(res.data);
      } catch (err) {
        console.error('Failed to fetch summary', err);
      } finally {
        setLoadingStats(false);
      }
    };
    fetchData();
  }, [selectedYear, selectedMonth]);

  useEffect(() => {
    const fetchChartData = async () => {
      if (!chartStartDate || !chartEndDate) {
        setChartSummaryData(null);
        return;
      }
      setLoadingChart(true);
      try {
        const url = `/dashboard/summary?startDate=${format(chartStartDate, 'yyyy-MM-dd')}&endDate=${format(chartEndDate, 'yyyy-MM-dd')}`;
        const res = await api.get(url);
        setChartSummaryData(res.data);
      } catch (err) {
        console.error('Failed to fetch chart summary', err);
      } finally {
        setLoadingChart(false);
      }
    };
    fetchChartData();
  }, [chartStartDate, chartEndDate]);

  if (loadingStats || !data || profileLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  const activeData = chartSummaryData || data;

  const chartData = activeData.recentTransactions.slice(0, 7).reverse().map((t, i) => ({
    name: `${format(parseISO(t.date), 'MMM dd')} - ${t.merchant || t.source || 'Transaction'} ${i}`,
    displayDate: format(parseISO(t.date), 'MMM dd'),
    amount: t.amount,
    type: t.type
  }));

  const incomeSparklineData = activeData.recentTransactions.filter(t => t.type === 'INCOME').slice(0, 10).reverse().map(t => ({ amount: t.amount }));
  const expenseSparklineData = activeData.recentTransactions.filter(t => t.type === 'EXPENSE').slice(0, 10).reverse().map(t => ({ amount: t.amount }));

  const recentIncomes = activeData.recentTransactions.filter(t => t.type === 'INCOME').slice(0, 3);
  const recentExpenses = activeData.recentTransactions.filter(t => t.type === 'EXPENSE').slice(0, 3);

  const pieData = [
    { name: 'Income', value: activeData.totalIncome, color: '#10b981' },
    { name: 'Expenses', value: activeData.totalExpense, color: '#f43f5e' }
  ].filter(d => d.value > 0);

  const topCategoriesPieColors = ['#f43f5e', '#f97316', '#eab308'];
  const topCategoriesPieData = (activeData.topCategories || []).slice(0, 3).map((c, i) => ({
    name: c.name,
    value: c.total,
    color: topCategoriesPieColors[i % topCategoriesPieColors.length]
  }));

  return (
    <div className="flex flex-col gap-8">
      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
        <div className="p-6 rounded-2xl glass-panel relative overflow-hidden group">
           <div className="absolute top-0 right-0 p-4 opacity-5 dark:opacity-10 text-foreground">
              <Wallet className="w-24 h-24" />
           </div>
           <p className="text-muted-foreground text-sm font-medium mb-1 relative z-10">{t('totalBalance')}</p>
           <h2 className="text-3xl font-bold text-foreground relative z-10">{currencySymbol}{data.balance.toFixed(2)}</h2>
        </div>
        
        <div className="p-6 rounded-2xl glass-panel relative overflow-hidden flex items-center justify-between">
           <div>
             <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center mb-4">
                <ArrowUpRight className="w-5 h-5 text-emerald-500 dark:text-emerald-400" />
             </div>
             <p className="text-muted-foreground text-sm font-medium mb-1">{t('totalIncome')}</p>
             <h2 className="text-2xl font-bold text-foreground">{currencySymbol}{data.totalIncome.toFixed(2)}</h2>
           </div>

           <div className="absolute -right-8 -bottom-8 opacity-5 dark:opacity-10 pointer-events-none z-0">
             <div className="animate-float-icon">
               <Coins className="w-40 h-40 text-emerald-500" strokeWidth={1.5} />
             </div>
           </div>
        </div>

        <div className="p-6 rounded-2xl glass-panel relative overflow-hidden flex items-center justify-between">
           <div>
             <div className="w-10 h-10 rounded-full bg-rose-500/10 flex items-center justify-center mb-4">
                <ArrowDownRight className="w-5 h-5 text-rose-500 dark:text-rose-400" />
             </div>
             <p className="text-muted-foreground text-sm font-medium mb-1">{t('totalExpenses')}</p>
             <h2 className="text-2xl font-bold text-foreground">{currencySymbol}{data.totalExpense.toFixed(2)}</h2>
           </div>

           <div className="absolute -right-8 -bottom-8 opacity-5 dark:opacity-10 pointer-events-none z-0">
             <div className="animate-float-icon-delayed">
               <Receipt className="w-40 h-40 text-rose-500" strokeWidth={1.5} />
             </div>
           </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 relative z-10 items-start">
        {/* Chart */}
        <div className="lg:col-span-2 p-6 rounded-2xl glass-panel sticky top-24">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
            <h3 className="text-lg font-semibold text-foreground">{t('activityOverview', 'Activity Overview')}</h3>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-44">
                  <CustomDatePicker
                    selected={chartStartDate}
                    onChange={(date) => setChartStartDate(date as Date | null)}
                    selectsStart
                    startDate={chartStartDate}
                    endDate={chartEndDate}
                    placeholderText="From"
                    className="bg-background border-border py-1.5 pl-9 text-sm shadow-sm w-full"
                  />
                </div>
                <span className="text-muted-foreground text-sm">-</span>
                <div className="w-44">
                  <CustomDatePicker
                    selected={chartEndDate}
                    onChange={(date) => setChartEndDate(date as Date | null)}
                    selectsEnd
                    startDate={chartStartDate}
                    endDate={chartEndDate}
                    minDate={chartStartDate}
                    placeholderText="To"
                    className="bg-background border-border py-1.5 pl-9 text-sm shadow-sm w-full"
                  />
                </div>
              </div>
              <div className="flex items-center gap-1 bg-background p-1 rounded-lg border border-border shadow-sm">
              <button 
                onClick={() => setChartType('bar')} 
                className={`p-1.5 rounded-md transition-colors ${chartType === 'bar' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground hover:bg-accent'}`}
                title="Bar Chart (Recent Trend)"
              >
                <BarChart2 className="w-4 h-4" />
              </button>
              <button 
                onClick={() => setChartType('line')} 
                className={`p-1.5 rounded-md transition-colors ${chartType === 'line' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground hover:bg-accent'}`}
                title="Line Chart (Activity Trajectory)"
              >
                <LineChartIcon className="w-4 h-4" />
              </button>
              <button 
                onClick={() => setChartType('pie')} 
                className={`p-1.5 rounded-md transition-colors ${chartType === 'pie' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground hover:bg-accent'}`}
                title="Pie Chart (Income vs Expense)"
              >
                <PieChartIcon className="w-4 h-4" />
              </button>
              <button 
                onClick={() => setChartType('pie-categories')} 
                className={`p-1.5 rounded-md transition-colors ${chartType === 'pie-categories' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground hover:bg-accent'}`}
                title="Pie Chart (Top Categories)"
              >
                <PieChartIcon className="w-4 h-4 text-rose-500" />
              </button>
              </div>
            </div>
          </div>
          <div className="h-72 w-full relative">
            {loadingChart && (
              <div className="absolute inset-0 bg-background/50 flex items-center justify-center z-10 rounded-xl backdrop-blur-sm">
                <Loader2 className="w-6 h-6 text-primary animate-spin" />
              </div>
            )}
            {chartType === 'bar' ? (
              chartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="glassIncome" x1="0" y1="0" x2="1" y2="1">
                          <stop offset="0%" stopColor="#10b981" stopOpacity={0.8} />
                          <stop offset="100%" stopColor="#10b981" stopOpacity={0.3} />
                        </linearGradient>
                        <linearGradient id="glassExpense" x1="0" y1="0" x2="1" y2="1">
                          <stop offset="0%" stopColor="#f43f5e" stopOpacity={0.8} />
                          <stop offset="100%" stopColor="#f43f5e" stopOpacity={0.3} />
                        </linearGradient>
                        <filter id="glassShadowBar" x="-20%" y="-20%" width="140%" height="140%">
                          <feDropShadow dx="0" dy="6" stdDeviation="8" floodColor="#000" floodOpacity="0.15" />
                        </filter>
                      </defs>
                      <XAxis dataKey="name" stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => val.split(' - ')[0]} />
                      <YAxis stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `${currencySymbol}${val}`} />
                      <Tooltip 
                        cursor={{fill: 'var(--accent)', opacity: 0.5}}
                        contentStyle={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--foreground)' }} 
                        itemStyle={{ color: 'var(--foreground)' }}
                        formatter={(value) => [`${currencySymbol}${value}`, 'Amount']}
                      />
                      <Bar dataKey="amount" radius={[6, 6, 0, 0]}>
                        {chartData.map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={entry.type === 'INCOME' ? 'url(#glassIncome)' : 'url(#glassExpense)'} 
                            stroke="rgba(255,255,255,0.4)" 
                            strokeWidth={1}
                            filter="url(#glassShadowBar)"
                          />
                        ))}
                      </Bar>
                  </BarChart>
                  </ResponsiveContainer>
              ) : (
                  <div className="flex h-full items-center justify-center text-muted-foreground">No activity yet.</div>
              )
            ) : chartType === 'line' ? (
              chartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <XAxis dataKey="name" stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => val.split(' - ')[0]} />
                      <YAxis stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `${currencySymbol}${val}`} />
                      <Tooltip 
                        cursor={{stroke: 'var(--border)', strokeWidth: 1, strokeDasharray: '4 4'}}
                        contentStyle={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--foreground)' }} 
                        itemStyle={{ color: 'var(--foreground)' }}
                        formatter={(value) => [`${currencySymbol}${value}`, 'Amount']}
                      />
                      <Line type="monotone" dataKey="amount" stroke="var(--primary)" strokeWidth={3} dot={{ r: 4, fill: 'var(--primary)', strokeWidth: 0 }} activeDot={{ r: 6, strokeWidth: 0 }} />
                  </LineChart>
                  </ResponsiveContainer>
              ) : (
                  <div className="flex h-full items-center justify-center text-muted-foreground">No activity yet.</div>
              )
            ) : chartType === 'pie-categories' ? (
              topCategoriesPieData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <defs>
                        {topCategoriesPieData.map((entry, index) => (
                          <linearGradient key={`grad-cat-${index}`} id={`glassPieCat-${index}`} x1="0" y1="0" x2="1" y2="1">
                            <stop offset="0%" stopColor={entry.color} stopOpacity={0.85} />
                            <stop offset="100%" stopColor={entry.color} stopOpacity={0.25} />
                          </linearGradient>
                        ))}
                        <filter id="glassShadowPieCat" x="-20%" y="-20%" width="140%" height="140%">
                          <feDropShadow dx="0" dy="8" stdDeviation="12" floodColor="#000" floodOpacity="0.2" />
                        </filter>
                      </defs>
                      <Pie
                        data={topCategoriesPieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={65}
                        outerRadius={95}
                        paddingAngle={6}
                        dataKey="value"
                        stroke="none"
                      >
                        {topCategoriesPieData.map((entry, index) => (
                          <Cell 
                            key={`cell-cat-${index}`} 
                            fill={`url(#glassPieCat-${index})`} 
                            stroke="rgba(255,255,255,0.4)" 
                            strokeWidth={1.5}
                            filter="url(#glassShadowPieCat)"
                          />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--foreground)' }}
                        itemStyle={{ color: 'var(--foreground)' }}
                        formatter={(value: any) => [`${currencySymbol}${Number(value).toFixed(2)}`, 'Amount']}
                      />
                      <Legend verticalAlign="bottom" height={36} iconType="circle" />
                    </PieChart>
                  </ResponsiveContainer>
              ) : (
                  <div className="flex h-full items-center justify-center text-muted-foreground">No categories yet.</div>
              )
            ) : (
              pieData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <defs>
                        {pieData.map((entry, index) => (
                          <linearGradient key={`grad-${index}`} id={`glassPie-${index}`} x1="0" y1="0" x2="1" y2="1">
                            <stop offset="0%" stopColor={entry.color} stopOpacity={0.85} />
                            <stop offset="100%" stopColor={entry.color} stopOpacity={0.25} />
                          </linearGradient>
                        ))}
                        <filter id="glassShadowPie" x="-20%" y="-20%" width="140%" height="140%">
                          <feDropShadow dx="0" dy="8" stdDeviation="12" floodColor="#000" floodOpacity="0.2" />
                        </filter>
                      </defs>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={65}
                        outerRadius={95}
                        paddingAngle={6}
                        dataKey="value"
                        stroke="none"
                      >
                        {pieData.map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={`url(#glassPie-${index})`} 
                            stroke="rgba(255,255,255,0.4)" 
                            strokeWidth={1.5}
                            filter="url(#glassShadowPie)"
                          />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--foreground)' }}
                        itemStyle={{ color: 'var(--foreground)' }}
                        formatter={(value: any) => [`${currencySymbol}${Number(value).toFixed(2)}`, 'Amount']}
                      />
                      <Legend verticalAlign="bottom" height={36} iconType="circle" />
                    </PieChart>
                  </ResponsiveContainer>
              ) : (
                  <div className="flex h-full items-center justify-center text-muted-foreground">No activity yet.</div>
              )
            )}
          </div>
        </div>

        {/* Transactions */}
        <div className="p-6 rounded-2xl glass-panel max-h-[calc(100vh-220px)] flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-foreground">{t('recentTransactions')}</h3>
            <button 
              onClick={() => router.push('/dashboard/expenses')}
              className="text-sm font-medium text-primary hover:text-primary/80 transition-colors flex items-center gap-1"
            >
              {t('view')} <ExternalLink className="w-3 h-3" />
            </button>
          </div>
                <div className="flex flex-col gap-4 overflow-y-auto pr-2 pb-2 scroll-3d-list">
                  {activeData.recentTransactions.length === 0 ? (
                      <p className="text-muted-foreground text-center py-4">{t('noRecentTransactions', 'No recent transactions.')}</p>
                  ) : (
                      activeData.recentTransactions.map(t => (
                        <div 
                          key={t.id} 
                          onClick={() => router.push(`/dashboard/${t.type === 'INCOME' ? 'incomes' : 'expenses'}`)}
                          className="flex items-center justify-between p-4 rounded-xl glass-card-etched hover:bg-accent/30 transition-colors cursor-pointer group scroll-3d-item"
                        >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${t.type === 'INCOME' ? 'bg-emerald-500/10' : 'bg-rose-500/10'}`}>
                         {t.type === 'INCOME' ? <ArrowUpRight className="w-5 h-5 text-emerald-500 dark:text-emerald-400 group-hover:scale-110 transition-transform" /> : <ArrowDownRight className="w-5 h-5 text-rose-500 dark:text-rose-400 group-hover:scale-110 transition-transform" />}
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{t.title}</p>
                        <p className="text-xs text-muted-foreground">{format(parseISO(t.date), 'MMM dd, yyyy h:mm a')}</p>
                      </div>
                    </div>
                    <span className={`font-semibold ${t.type === 'INCOME' ? 'text-emerald-500 dark:text-emerald-400' : 'text-rose-500 dark:text-rose-400'}`}>
                       {t.type === 'INCOME' ? '+' : '-'}{currencySymbol}{t.amount.toFixed(2)}
                    </span>
                  </div>
                ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
