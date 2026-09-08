'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  Home, PlusCircle, Settings, LogOut, ArrowLeft, ArrowRight, 
  LayoutDashboard, Receipt, TrendingUp, Loader2, ChevronLeft, 
  ChevronRight, Target, Upload, DollarSign, Euro, PoundSterling, 
  IndianRupee, JapaneseYen, Menu, X, Sparkles, User 
} from 'lucide-react';
import ProfileSettingsModal from '@/components/ProfileSettingsModal';
import CurrencySelector from '@/components/CurrencySelector';
import { LanguageSelector } from '@/components/LanguageSelector';
import ConsentModal from '@/components/ConsentModal';
import ThemeToggle from '@/components/ThemeToggle';
import { UserProfileProvider, useUserProfile } from '@/context/UserProfileContext';
import { DateFilterProvider, useDateFilter } from '@/context/DateFilterContext';
import CustomDatePicker from '@/components/CustomDatePicker';

function DashboardInner({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { t } = useTranslation();
  const { userProfile, setUserProfile, loading } = useUserProfile();
  const { selectedYear, selectedMonth, setDateFilter } = useDateFilter();
  const [isProfileModalOpen, setProfileModalOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isQuickActionOpen, setIsQuickActionOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('userName');
    localStorage.removeItem('userEmail');
    document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    window.location.href = '/login';
  };

  const getCurrencyIcon = (symbol: string | undefined) => {
    switch (symbol) {
      case '€': return Euro;
      case '£': return PoundSterling;
      case '₹': return IndianRupee;
      case '¥': return JapaneseYen;
      case '$':
      default: return DollarSign;
    }
  };

  const navItems = [
    { name: t('dashboard'), href: '/dashboard', icon: LayoutDashboard },
    { name: t('expenses'), href: '/dashboard/expenses', icon: getCurrencyIcon(userProfile?.currency) },
    { name: t('incomes'), href: '/dashboard/incomes', icon: TrendingUp },
    { name: t('savings'), href: '/dashboard/savings', icon: Target },
    { name: t('settings'), href: '/dashboard/settings', icon: Settings },
  ];

  const getInitials = (name: string) => {
    if (!name) return 'U';
    return name.charAt(0).toUpperCase();
  };

  const getPageTitle = (path: string) => {
    const route = path.split('/').pop()?.replace('-', ' ') || '';
    return t(route.toLowerCase()) || route;
  };

  if (loading) {
    return (
       <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
       </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col md:flex-row relative overflow-x-hidden">
      {/* Dynamic Background Gradients */}
      <div className="fixed top-0 left-0 w-[350px] md:w-[500px] h-[350px] md:h-[500px] bg-primary/5 rounded-full blur-[100px] -translate-y-1/2 -translate-x-1/2 pointer-events-none z-0"></div>
      <div className="fixed bottom-0 right-0 w-[400px] md:w-[600px] h-[400px] md:h-[600px] bg-purple-500/5 rounded-full blur-[120px] translate-y-1/3 translate-x-1/3 pointer-events-none z-0"></div>

      {/* Desktop Sidebar (>= 768px) */}
      <aside className={`hidden md:flex border-r border-border bg-card/95 backdrop-blur-xl flex-col p-4 fixed h-full transition-all duration-300 z-50 ${isSidebarCollapsed ? 'w-20' : 'w-64'}`}>
        <div className={`flex items-center ${isSidebarCollapsed ? 'justify-center' : 'justify-between'} mb-8 px-2`}>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-white shadow-lg shrink-0">
              E
            </div>
            {!isSidebarCollapsed && (
              <span className="font-semibold text-lg tracking-tight">ExpenseAnalyzer</span>
            )}
          </div>
        </div>

        <button 
          onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          className="absolute -right-3 top-9 bg-card border border-border rounded-full p-1 text-muted-foreground hover:text-foreground transition-colors z-10"
          title={isSidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          {isSidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>

        <nav className="flex-1 flex flex-col gap-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                title={isSidebarCollapsed ? item.name : undefined}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
                  isActive ? "bg-primary/10 text-primary font-medium border border-primary/20" : "text-muted-foreground hover:text-foreground hover:bg-accent"
                } ${isSidebarCollapsed ? 'justify-center' : ''}`}
              >
                <Icon className="w-5 h-5 shrink-0" />
                {!isSidebarCollapsed && <span>{item.name}</span>}
              </Link>
            );
          })}
        </nav>

        <div className="pt-4 border-t border-border/40 mt-auto">
            <button
              onClick={handleLogout}
              title={isSidebarCollapsed ? "Logout" : undefined}
              className={`flex w-full items-center gap-3 px-3 py-2.5 rounded-xl text-zinc-400 hover:text-red-400 hover:bg-red-500/10 transition-colors ${isSidebarCollapsed ? 'justify-center' : ''}`}
            >
              <LogOut className="w-5 h-5 shrink-0" />
              {!isSidebarCollapsed && <span>{t('logout')}</span>}
            </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className={`flex-1 w-full p-3 sm:p-4 md:p-8 transition-all duration-300 relative z-10 pb-24 md:pb-8 ${isSidebarCollapsed ? 'md:ml-20' : 'md:ml-64'}`}>
        
        {/* Top Header Bar */}
        <header className="flex flex-col gap-3 mb-4 md:mb-8 pb-3 border-b border-border relative z-40">
          
          {/* Top Header Row: Brand Logo, Title & Profile Settings Avatar */}
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2 min-w-0">
              <div className="md:hidden w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-white shadow-md shrink-0">
                E
              </div>
              <button onClick={() => router.back()} className="hidden md:block p-2 rounded-lg bg-card border border-border hover:bg-accent transition-colors text-muted-foreground hover:text-foreground" title="Go Back">
                <ArrowLeft className="w-4 h-4" />
              </button>
              <button onClick={() => router.forward()} className="hidden md:block p-2 rounded-lg bg-card border border-border hover:bg-accent transition-colors text-muted-foreground hover:text-foreground" title="Go Forward">
                <ArrowRight className="w-4 h-4" />
              </button>
              <h1 className="text-lg sm:text-xl md:text-2xl font-bold capitalize truncate">
                  {getPageTitle(pathname)}
              </h1>
            </div>

            {/* Profile Settings Avatar Button (Desktop & Mobile) */}
            <button 
              onClick={() => setProfileModalOpen(true)}
              className="flex items-center gap-2 p-1 sm:p-1.5 rounded-full bg-card border border-border hover:bg-accent transition-all shrink-0 active:scale-95"
              title="Profile & Settings"
            >
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center overflow-hidden">
                {userProfile?.profilePictureBase64 ? (
                    <img src={userProfile.profilePictureBase64} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                    <span className="text-xs sm:text-sm font-bold text-indigo-400">{getInitials(userProfile?.name || '')}</span>
                )}
              </div>
              {userProfile && <span className="hidden sm:inline text-xs font-semibold px-1">{userProfile.name}</span>}
            </button>
          </div>

          {/* Second Header Row: Controls (Date Filter, Language, Currency, Theme) */}
          <div className="flex flex-wrap items-center justify-between sm:justify-end gap-2 w-full">
              <div className="flex items-center gap-1 bg-card border border-border rounded-xl px-2 py-1 flex-1 sm:flex-none">
                <CustomDatePicker
                  selected={new Date(selectedYear, selectedMonth - 1, 1)}
                  onChange={(date) => {
                    if (date && !Array.isArray(date)) {
                      setDateFilter(date.getFullYear(), date.getMonth() + 1);
                    }
                  }}
                  showMonthYearPicker
                  className="bg-transparent border-none py-1 text-xs sm:text-sm focus:ring-0 shadow-none w-full"
                />
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <LanguageSelector />
                <CurrencySelector />
                <ThemeToggle />
              </div>
          </div>
        </header>

        {children}
      </main>

      <ProfileSettingsModal 
        isOpen={isProfileModalOpen} 
        onClose={() => setProfileModalOpen(false)} 
      />
      <ConsentModal />

      {/* Mobile Quick Action Sheet / Modal */}
      {isQuickActionOpen && (
        <div 
          className="fixed inset-0 bg-background/80 backdrop-blur-md z-50 md:hidden flex flex-col justify-end p-4 animate-in fade-in duration-200"
          onClick={() => setIsQuickActionOpen(false)}
        >
          <div 
            className="bg-card border border-border rounded-3xl p-5 flex flex-col gap-3 shadow-2xl animate-in slide-in-from-bottom duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2 border-b border-border">
              <h3 className="font-bold text-base">Quick Actions</h3>
              <button 
                onClick={() => setIsQuickActionOpen(false)}
                className="w-7 h-7 rounded-full bg-accent flex items-center justify-center text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <Link 
              href="/dashboard/upload-transactions" 
              onClick={() => setIsQuickActionOpen(false)}
              className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 active:scale-98 transition-transform"
            >
              <div className="w-11 h-11 rounded-xl bg-indigo-500 text-white flex items-center justify-center shadow-md shrink-0">
                <Upload className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="font-semibold text-sm text-foreground">Scan Receipt (AI OCR)</span>
                <span className="text-[11px] text-muted-foreground">Upload receipt image to parse expenses</span>
              </div>
            </Link>

            <Link 
              href="/dashboard/add" 
              onClick={() => setIsQuickActionOpen(false)}
              className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 active:scale-98 transition-transform"
            >
              <div className="w-11 h-11 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-md shrink-0">
                <PlusCircle className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="font-semibold text-sm text-foreground">Manual Entry</span>
                <span className="text-[11px] text-muted-foreground">Add new expense or income record</span>
              </div>
            </Link>

            <Link 
              href="/dashboard/savings" 
              onClick={() => setIsQuickActionOpen(false)}
              className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 active:scale-98 transition-transform"
            >
              <div className="w-11 h-11 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-md shrink-0">
                <Target className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="font-semibold text-sm text-foreground">Savings Goal</span>
                <span className="text-[11px] text-muted-foreground">Set and track monthly savings targets</span>
              </div>
            </Link>
          </div>
        </div>
      )}

      {/* Mobile Glassmorphism Bottom Tab Bar (< 768px) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-card/95 backdrop-blur-2xl border-t border-border px-2 py-1.5 flex items-center justify-around shadow-2xl">
        <Link 
          href="/dashboard"
          className={`flex flex-col items-center gap-0.5 text-[10px] font-medium py-1 px-2.5 rounded-xl transition-all ${
            pathname === '/dashboard' ? 'text-primary scale-105 font-bold' : 'text-muted-foreground'
          }`}
        >
          <LayoutDashboard className="w-5 h-5" />
          <span>{t('dashboard')}</span>
        </Link>

        <Link 
          href="/dashboard/expenses"
          className={`flex flex-col items-center gap-0.5 text-[10px] font-medium py-1 px-2.5 rounded-xl transition-all ${
            pathname === '/dashboard/expenses' ? 'text-primary scale-105 font-bold' : 'text-muted-foreground'
          }`}
        >
          <Receipt className="w-5 h-5" />
          <span>{t('expenses')}</span>
        </Link>

        {/* Center Floating Action Button */}
        <button 
          onClick={() => setIsQuickActionOpen(true)}
          className="relative -top-3 w-12 h-12 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center shadow-[0_6px_20px_rgba(99,102,241,0.5)] active:scale-90 transition-all border-2 border-background"
          aria-label="Add transaction"
        >
          <PlusCircle className="w-6 h-6" />
        </button>

        <Link 
          href="/dashboard/incomes"
          className={`flex flex-col items-center gap-0.5 text-[10px] font-medium py-1 px-2.5 rounded-xl transition-all ${
            pathname === '/dashboard/incomes' ? 'text-primary scale-105 font-bold' : 'text-muted-foreground'
          }`}
        >
          <TrendingUp className="w-5 h-5" />
          <span>{t('incomes')}</span>
        </Link>

        <Link 
          href="/dashboard/settings"
          className={`flex flex-col items-center gap-0.5 text-[10px] font-medium py-1 px-2.5 rounded-xl transition-all ${
            pathname === '/dashboard/settings' ? 'text-primary scale-105 font-bold' : 'text-muted-foreground'
          }`}
        >
          <Settings className="w-5 h-5" />
          <span>{t('settings')}</span>
        </Link>
      </nav>

      {/* Desktop Floating Action Button (>= 768px) */}
      <div className="hidden md:flex fixed bottom-8 right-8 z-50 group flex-col items-center justify-end">
        <div className="absolute bottom-14 flex flex-col items-center gap-3 pb-4 opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 pointer-events-none group-hover:pointer-events-auto">
          <Link href="/dashboard/upload-transactions" className="flex items-center gap-3 group/item relative" title="Scan Receipt">
            <span className="absolute right-14 whitespace-nowrap bg-card border border-border text-card-foreground px-2 py-1 rounded text-xs font-medium shadow-md opacity-0 group-hover/item:opacity-100 transition-opacity translate-x-2 group-hover/item:translate-x-0">
              Scan Receipt
            </span>
            <div className="w-12 h-12 bg-card border border-border text-foreground rounded-full shadow-lg flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors hover:scale-110">
              <Upload className="w-5 h-5" />
            </div>
          </Link>
          <Link href="/dashboard/add" className="flex items-center gap-3 group/item relative" title="Manual Entry">
            <span className="absolute right-14 whitespace-nowrap bg-card border border-border text-card-foreground px-2 py-1 rounded text-xs font-medium shadow-md opacity-0 group-hover/item:opacity-100 transition-opacity translate-x-2 group-hover/item:translate-x-0">
              Manual Entry
            </span>
            <div className="w-12 h-12 bg-card border border-border text-foreground rounded-full shadow-lg flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors hover:scale-110">
              <PlusCircle className="w-5 h-5" />
            </div>
          </Link>
        </div>
        <button className="w-14 h-14 bg-primary text-primary-foreground rounded-full shadow-[0_0_15px_rgba(var(--primary),0.5)] flex items-center justify-center hover:scale-105 transition-all duration-300">
          <PlusCircle className="w-6 h-6 group-hover:rotate-45 transition-transform duration-300" />
        </button>
      </div>
    </div>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <UserProfileProvider>
      <DateFilterProvider>
        <DashboardInner>{children}</DashboardInner>
      </DateFilterProvider>
    </UserProfileProvider>
  );
}
