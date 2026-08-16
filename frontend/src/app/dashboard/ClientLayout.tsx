'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Home, PlusCircle, Settings, LogOut, ArrowLeft, ArrowRight, LayoutDashboard, Receipt, TrendingUp, Loader2, ChevronLeft, ChevronRight, Target, Upload, DollarSign, Euro, PoundSterling, IndianRupee, JapaneseYen } from 'lucide-react';
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
    <div className="min-h-screen bg-background text-foreground flex relative overflow-hidden">
      {/* Dynamic Background Gradients */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] -translate-y-1/2 -translate-x-1/2 pointer-events-none z-0"></div>
      <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-purple-500/5 rounded-full blur-[120px] translate-y-1/3 translate-x-1/3 pointer-events-none z-0"></div>

      {/* Sidebar */}
      <aside className={`border-r border-border bg-card/60 backdrop-blur-xl flex flex-col p-4 fixed h-full transition-all duration-300 z-20 ${isSidebarCollapsed ? 'w-20' : 'w-64'}`}>
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

        <div className="pt-4 border-t border-white/5 mt-auto">
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

      {/* Main Content */}
      <main className={`flex-1 p-8 transition-all duration-300 relative z-10 ${isSidebarCollapsed ? 'ml-20' : 'ml-64'}`}>
        <header className="flex items-center justify-between mb-8 pb-4 border-b border-border relative z-50">
          <div className="flex items-center gap-2">
            <button onClick={() => router.back()} className="p-2 rounded-lg bg-card border border-border hover:bg-accent transition-colors text-muted-foreground hover:text-foreground" title="Go Back">
              <ArrowLeft className="w-4 h-4" />
            </button>
            <button onClick={() => router.forward()} className="p-2 rounded-lg bg-card border border-border hover:bg-accent transition-colors text-muted-foreground hover:text-foreground" title="Go Forward">
              <ArrowRight className="w-4 h-4" />
            </button>
            <h1 className="text-2xl font-bold ml-4 capitalize">
                {getPageTitle(pathname)}
            </h1>
          </div>
          <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 bg-card border border-border rounded-xl w-48">
                <CustomDatePicker
                  selected={new Date(selectedYear, selectedMonth - 1, 1)}
                  onChange={(date) => {
                    if (date) {
                      setDateFilter(date.getFullYear(), date.getMonth() + 1);
                    }
                  }}
                  showMonthYearPicker
                  className="bg-transparent border-none py-1.5 pl-10 text-sm focus:ring-0 shadow-none"
                />
              </div>
              <LanguageSelector />
              <CurrencySelector />
              <ThemeToggle />
              {userProfile && <span className="text-sm font-medium text-muted-foreground">{userProfile.name}</span>}
              <button 
                onClick={() => setProfileModalOpen(true)}
                className="w-10 h-10 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center overflow-hidden hover:opacity-80 transition-opacity"
              >
                {userProfile?.profilePictureBase64 ? (
                    <img src={userProfile.profilePictureBase64} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                    <span className="text-sm font-bold text-indigo-400">{getInitials(userProfile?.name || '')}</span>
                )}
              </button>
          </div>
        </header>
        {children}
      </main>

      <ProfileSettingsModal 
        isOpen={isProfileModalOpen} 
        onClose={() => setProfileModalOpen(false)} 
      />
      <ConsentModal />

      {/* Floating Action Button (Speed Dial) */}
      <div className="fixed bottom-8 right-8 z-50 group flex flex-col items-center justify-end">
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
