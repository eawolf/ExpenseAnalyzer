'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Home, PlusCircle, Settings, LogOut, ArrowLeft, ArrowRight, LayoutDashboard, Receipt, TrendingUp, Loader2, ChevronLeft, ChevronRight, Target } from 'lucide-react';
import ProfileSettingsModal from '@/components/ProfileSettingsModal';
import CurrencySelector from '@/components/CurrencySelector';
import ConsentModal from '@/components/ConsentModal';
import { UserProfileProvider, useUserProfile } from '@/context/UserProfileContext';
import { DateFilterProvider, useDateFilter } from '@/context/DateFilterContext';

function DashboardInner({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
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

  const navItems = [
    { name: 'Financial Pulse', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Add Transaction', href: '/dashboard/add', icon: PlusCircle },
    { name: 'Expenses', href: '/dashboard/expenses', icon: Receipt },
    { name: 'Income', href: '/dashboard/incomes', icon: TrendingUp },
    { name: 'Savings', href: '/dashboard/savings', icon: Target },
    { name: 'Settings', href: '/dashboard/settings', icon: Settings },
  ];

  const getInitials = (name: string) => {
    if (!name) return 'U';
    return name.charAt(0).toUpperCase();
  };

  if (loading) {
    return (
       <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
       </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50 flex">
      {/* Sidebar */}
      <aside className={`border-r border-white/5 bg-zinc-900/50 backdrop-blur flex flex-col p-4 fixed h-full transition-all duration-300 ${isSidebarCollapsed ? 'w-20' : 'w-64'}`}>
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
          className="absolute -right-3 top-9 bg-zinc-800 border border-white/10 rounded-full p-1 text-zinc-400 hover:text-white transition-colors z-10"
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
                  isActive ? "bg-indigo-500/10 text-indigo-400 font-medium border border-indigo-500/20" : "text-zinc-400 hover:text-zinc-50 hover:bg-white/5"
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
              {!isSidebarCollapsed && <span>Logout</span>}
            </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`flex-1 p-8 transition-all duration-300 ${isSidebarCollapsed ? 'ml-20' : 'ml-64'}`}>
        <header className="flex items-center justify-between mb-8 pb-4 border-b border-white/5">
          <div className="flex items-center gap-2">
            <button onClick={() => router.back()} className="p-2 rounded-lg bg-zinc-900 border border-white/10 hover:bg-white/10 transition-colors text-zinc-400 hover:text-white" title="Go Back">
              <ArrowLeft className="w-4 h-4" />
            </button>
            <button onClick={() => router.forward()} className="p-2 rounded-lg bg-zinc-900 border border-white/10 hover:bg-white/10 transition-colors text-zinc-400 hover:text-white" title="Go Forward">
              <ArrowRight className="w-4 h-4" />
            </button>
            <h1 className="text-2xl font-bold ml-4 capitalize">
                {pathname === '/dashboard' ? 'Overview' : pathname.split('/').pop()}
            </h1>
          </div>
          <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 bg-zinc-900 border border-white/10 rounded-xl px-3 py-1.5">
                <input 
                  type="month" 
                  value={`${selectedYear}-${selectedMonth.toString().padStart(2, '0')}`}
                  onChange={(e) => {
                    if (e.target.value) {
                      const [y, m] = e.target.value.split('-');
                      setDateFilter(parseInt(y, 10), parseInt(m, 10));
                    }
                  }}
                  className="bg-transparent border-none text-zinc-300 text-sm focus:outline-none focus:ring-0 [&::-webkit-calendar-picker-indicator]:filter [&::-webkit-calendar-picker-indicator]:invert [&::-webkit-calendar-picker-indicator]:opacity-70 hover:[&::-webkit-calendar-picker-indicator]:opacity-100 cursor-pointer"
                />
              </div>
              <CurrencySelector />
              {userProfile && <span className="text-sm font-medium text-zinc-300">{userProfile.name}</span>}
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