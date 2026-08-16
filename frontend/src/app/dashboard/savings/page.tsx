'use client';

import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import api from '@/utils/api';
import { Target, Loader2, Trophy, AlertTriangle, Edit2, CheckCircle2, Trash2, PiggyBank, Coins } from 'lucide-react';
import { useUserProfile } from '@/context/UserProfileContext';
import { useDateFilter } from '@/context/DateFilterContext';
import { format } from 'date-fns';

interface SavingsGoal {
  id?: string;
  year: number;
  month: number;
  targetAmount: number;
}

export default function SavingsPage() {
  const { t } = useTranslation();
  const [goal, setGoal] = useState<SavingsGoal | null>(null);
  const [balance, setBalance] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [targetInput, setTargetInput] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
  
  const { userProfile } = useUserProfile();
  const { selectedYear, selectedMonth } = useDateFilter();
  
  const currencySymbol = userProfile?.currency || '$';

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch goal
        const goalRes = await api.get(`/savings-goal?year=${selectedYear}&month=${selectedMonth}`);
        if (goalRes.status === 200 && goalRes.data) {
          setGoal(goalRes.data);
          setTargetInput(goalRes.data.targetAmount.toString());
        } else {
          setGoal(null);
          setTargetInput('');
        }

        // Fetch balance from summary using date range
        const start = new Date(selectedYear, selectedMonth - 1, 1);
        const end = new Date(selectedYear, selectedMonth, 0);
        const summaryUrl = `/dashboard/summary?startDate=${format(start, 'yyyy-MM-dd')}&endDate=${format(end, 'yyyy-MM-dd')}`;
        
        const summaryRes = await api.get(summaryUrl);
        setBalance(summaryRes.data.balance || 0);

      } catch (err) {
        console.error('Failed to fetch savings data', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
    setIsEditing(false);
  }, [selectedYear, selectedMonth]);

  const handleSaveGoal = async () => {
    if (!targetInput || isNaN(Number(targetInput))) return;
    setIsSaving(true);
    try {
      const res = await api.post('/savings-goal', {
        year: selectedYear,
        month: selectedMonth,
        targetAmount: Number(targetInput)
      });
      setGoal(res.data);
      setIsEditing(false);
      setShowSuccessAnimation(true);
      setTimeout(() => setShowSuccessAnimation(false), 2000);
    } catch (err) {
      console.error('Failed to save goal', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteGoal = async () => {
    if (!confirm('Are you sure you want to remove your savings target for this month?')) return;
    setIsSaving(true);
    try {
      await api.delete(`/savings-goal?year=${selectedYear}&month=${selectedMonth}`);
      setGoal(null);
      setTargetInput('');
      setIsEditing(false);
    } catch (err) {
      console.error('Failed to delete goal', err);
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  const targetAmount = goal?.targetAmount || 0;
  const hasGoal = targetAmount > 0;
  const progressPercentage = hasGoal ? Math.min((Math.max(balance, 0) / targetAmount) * 100, 100) : 0;
  const isOnTarget = balance >= targetAmount;
  const shortfall = targetAmount - balance;

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-8 relative">
      <style>{`
        @keyframes drop-coin {
          0% { transform: translateY(-80px) scale(0.5); opacity: 0; }
          20% { opacity: 1; }
          80% { transform: translateY(0px) scale(1); opacity: 1; }
          100% { transform: translateY(20px) scale(0.8); opacity: 0; }
        }
        @keyframes wiggle {
          0%, 100% { transform: rotate(-3deg); }
          50% { transform: rotate(3deg); }
        }
      `}</style>

      {showSuccessAnimation && (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background/90 backdrop-blur-sm">
          <div className="relative w-32 h-40 flex flex-col items-center justify-end">
            <div className="absolute top-0 animate-[drop-coin_1s_ease-in-out_infinite]">
              <Coins className="w-12 h-12 text-amber-400 drop-shadow-xl" strokeWidth={1.5} />
            </div>
            <div className="relative z-10 animate-[wiggle_0.3s_ease-in-out_infinite]">
              <PiggyBank className="w-28 h-28 text-pink-500 drop-shadow-2xl" strokeWidth={1.5} />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-pink-400 mt-6 animate-pulse">Target Locked!</h3>
        </div>
      )}

      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Target className="w-6 h-6 text-primary" />
          Monthly Savings Goal
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Goal Setting Card */}
        <div className="p-6 rounded-2xl glass-card-etched relative overflow-hidden group">
          <div className="absolute -top-4 -right-4 p-4 opacity-5">
             <Target className="w-32 h-32 text-foreground" />
          </div>
          <h3 className="text-muted-foreground text-sm font-medium mb-4 relative z-10">Target to Save</h3>
          
          {!hasGoal || isEditing ? (
            <div className="flex flex-col gap-4 relative z-10">
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">{currencySymbol}</span>
                <input
                  type="number"
                  value={targetInput}
                  onChange={(e) => setTargetInput(e.target.value)}
                  placeholder="0.00"
                  className="w-full bg-input border border-border rounded-xl pl-8 pr-4 py-3 text-2xl font-bold text-foreground focus:outline-none focus:border-primary transition-colors"
                />
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={handleSaveGoal}
                  disabled={isSaving || !targetInput}
                  className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-2.5 rounded-xl transition-colors flex justify-center items-center gap-2 disabled:opacity-50"
                >
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                  Save Target
                </button>
                {hasGoal && (
                  <button 
                    onClick={() => { setIsEditing(false); setTargetInput(targetAmount.toString()); }}
                    className="px-4 bg-card border border-border hover:bg-accent text-muted-foreground font-medium rounded-xl transition-colors"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-end justify-between relative z-10">
              <h2 className="text-4xl font-bold text-foreground">{currencySymbol}{targetAmount.toFixed(2)}</h2>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-2 px-3 py-1.5 bg-card border border-border hover:bg-accent text-muted-foreground rounded-lg transition-colors text-sm font-medium"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  Edit
                </button>
                <button 
                  onClick={handleDeleteGoal}
                  className="flex items-center gap-2 px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 rounded-lg transition-colors text-sm font-medium"
                  title="Remove Target"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Current Balance Card */}
        <div className="p-6 rounded-2xl glass-card-etched relative overflow-hidden">
          <h3 className="text-muted-foreground text-sm font-medium mb-4 relative z-10">{t('currentSavings', 'Current Savings')} (Balance)</h3>
          <h2 className={`text-4xl font-bold relative z-10 ${balance >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
            {balance >= 0 ? '+' : '-'}{currencySymbol}{Math.abs(balance).toFixed(2)}
          </h2>
        </div>
      </div>

      {/* Progress & Feedback Section */}
      {hasGoal && !isEditing && (
        <div className="p-8 rounded-2xl glass-card-etched flex flex-col gap-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-lg text-foreground">Your Progress</h3>
            <span className="font-bold text-primary">{progressPercentage.toFixed(0)}%</span>
          </div>
          
          <div className="h-4 w-full bg-input rounded-full overflow-hidden border border-border">
            <div 
              className={`h-full transition-all duration-1000 ease-out rounded-full ${isOnTarget ? 'bg-emerald-500' : 'bg-primary'}`}
              style={{ width: `${progressPercentage}%` }}
            />
          </div>

          <div className={`mt-4 p-6 rounded-xl border flex items-start gap-4 ${isOnTarget ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-amber-500/10 border-amber-500/20'}`}>
            {isOnTarget ? (
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0">
                <Trophy className="w-6 h-6 text-emerald-500" />
              </div>
            ) : (
              <div className="w-12 h-12 rounded-full bg-amber-500/20 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-6 h-6 text-amber-400" />
              </div>
            )}
            
            <div className="flex flex-col justify-center min-h-[3rem]">
              <h4 className={`text-lg font-bold ${isOnTarget ? 'text-emerald-500' : 'text-amber-500'}`}>
                {isOnTarget ? 'You are on target!' : 'Keep going!'}
              </h4>
              <p className="text-muted-foreground mt-1">
                {isOnTarget 
                  ? `Great job! You have successfully saved ${currencySymbol}${balance.toFixed(2)}, surpassing your goal of ${currencySymbol}${targetAmount.toFixed(2)}.`
                  : `You fell short of this much amount: ${currencySymbol}${shortfall.toFixed(2)}. Review your expenses to see where you can save more.`
                }
              </p>
            </div>
          </div>
        </div>
      )}

      {!hasGoal && !isEditing && (
         <div className="p-8 rounded-2xl bg-primary/10 border border-primary/20 text-center flex flex-col items-center gap-4">
           <Target className="w-12 h-12 text-primary opacity-50" />
           <div>
             <h3 className="text-lg font-bold text-primary mb-1">Set a Savings Target</h3>
             <p className="text-muted-foreground max-w-md mx-auto">Having a clear target helps you stay disciplined with your spending. Set your target for this month above!</p>
           </div>
         </div>
      )}
    </div>
  );
}
