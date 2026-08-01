'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Home, PlusCircle, Settings, LogOut, ArrowLeft, ArrowRight, LayoutDashboard, Receipt, TrendingUp, Loader2 } from 'lucide-react';
import ProfileSettingsModal from '@/components/ProfileSettingsModal';
import CurrencySelector from '@/components/CurrencySelector';
import { UserProfileProvider, useUserProfile } from '@/context/UserProfileContext';

function DashboardInner({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { userProfile, setUserProfile, loading } = useUserProfile();
  const [isProfileModalOpen, setProfileModalOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('userName');
    localStorage.removeItem('userEmail');
    document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    router.push('/login');
  };

  const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Add Transaction', href: '/dashboard/add', icon: PlusCircle },
    { name: 'Expenses', href: '/dashboard/expenses', icon: Receipt },
    { name: 'Income', href: '/dashboard/incomes', icon: TrendingUp },
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
      <aside className="w-64 border-r border-white/5 bg-zinc-900/50 backdrop-blur flex flex-col p-4 fixed h-full">
        <div className="flex items-center gap-2 mb-8 px-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-white shadow-lg">
            E
          </div>
          <span className="font-semibold text-lg tracking-tight">ExpenseAnalyzer</span>
        </div>

        <nav className="flex-1 flex flex-col gap-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={"flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all " + (isActive ? "bg-indigo-500/10 text-indigo-400 font-medium border border-indigo-500/20" : "text-zinc-400 hover:text-zinc-50 hover:bg-white/5")}
              >
                <Icon className="w-5 h-5" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="pt-4 border-t border-white/5 mt-auto">
            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-3 px-3 py-2.5 rounded-xl text-zinc-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              Logout
            </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 p-8">
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
    </div>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <UserProfileProvider>
       <DashboardInner>{children}</DashboardInner>
    </UserProfileProvider>
  );
}