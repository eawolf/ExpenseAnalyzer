'use client';

import Link from 'next/link';
import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { quotes, Quote } from '@/utils/quotes';
import { Quote as QuoteIcon, Eye, EyeOff } from 'lucide-react';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const registered = searchParams.get('registered');
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [quote, setQuote] = useState<Quote | null>(null);

  useEffect(() => {
    // Select a random quote on mount
    const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
    setQuote(randomQuote);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('http://localhost:8081/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Login failed. Please try again.');
        return;
      }

      // Store JWT and user info in localStorage
      localStorage.setItem('token', data.token);
      localStorage.setItem('userId', data.userId);
      localStorage.setItem('userName', data.name);
      localStorage.setItem('userEmail', data.email);
      // Also store token in cookie for Next.js Middleware AuthGuard
      document.cookie = `token=${data.token}; path=/; max-age=86400`;

      router.push('/dashboard');
    } catch (err) {
      setError('Unable to connect to server. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-neutral-950 flex-col-reverse lg:flex-row">
      
      {/* Left Column: Interactive Quotes */}
      <div className="hidden lg:flex lg:flex-1 relative overflow-hidden [mask-image:linear-gradient(to_left,transparent,black_30%)]">
        
        {/* Unified Background Gradients */}
        <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-[120px] -translate-y-1/3 -translate-x-1/4"></div>
        <div className="absolute bottom-0 left-1/4 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[100px] translate-y-1/3"></div>

        <div className="relative w-full h-full flex flex-col justify-center items-center p-12">
          {quote && (
            <div className="group relative w-full max-w-lg p-10 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl shadow-2xl transition-all duration-700 hover:bg-white/10 overflow-hidden cursor-default">
              
              <QuoteIcon className="w-12 h-12 text-indigo-500/30 absolute top-8 left-8" />
              
              <div className="relative z-10 pt-8">
                <p className="text-3xl font-medium text-white leading-relaxed tracking-tight transition-transform duration-500 group-hover:-translate-y-2">
                  "{quote.question}"
                </p>
                
                <div className="grid grid-rows-[0fr] group-hover:grid-rows-[1fr] transition-[grid-template-rows] duration-500 ease-in-out opacity-0 group-hover:opacity-100">
                  <div className="overflow-hidden">
                    <p className="text-xl text-indigo-300 mt-4 font-medium italic">
                      {quote.answer}
                    </p>
                    <div className="mt-6 flex items-center gap-3">
                      <div className="h-px w-8 bg-indigo-500/50"></div>
                      <p className="text-sm font-semibold text-neutral-400 uppercase tracking-wider">{quote.author}</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="absolute bottom-6 right-8 opacity-100 group-hover:opacity-0 transition-opacity duration-300">
                <span className="text-xs text-neutral-500 animate-pulse tracking-wider uppercase font-medium">Hover to reveal</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right Column: Form */}
      <div className="flex-1 flex flex-col justify-center px-8 sm:px-12 lg:px-20 relative">
        {/* Logo at Top Right */}
        <div className="absolute top-8 right-8 sm:top-12 sm:right-12">
          <Link href="/" className="flex items-center gap-2 group flex-row-reverse">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-white shadow-lg group-hover:shadow-indigo-500/25 transition-all">
              E
            </div>
            <span className="font-bold tracking-tight text-white group-hover:text-indigo-400 transition-colors text-lg">ExpenseAnalyzer</span>
          </Link>
        </div>

        <div className="w-full max-w-md mx-auto mt-16 lg:mt-0 z-10">
          <div className="mb-10 text-left">
            <h2 className="text-3xl font-bold tracking-tight text-white mb-2">Welcome Back</h2>
            <p className="text-neutral-400">Sign in to your account and continue your financial journey.</p>
          </div>

          {registered && (
            <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 px-4 py-3 text-sm text-emerald-400 mb-6">
              Registration successful! Please log in.
            </div>
          )}

          {error && (
            <div className="rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400 mb-6">
              {error}
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-1.5 text-left">Email Address</label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full rounded-xl border border-white/10 bg-neutral-900 px-4 py-3.5 text-white placeholder-neutral-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-colors text-left"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-sm font-medium text-neutral-300 text-left">Password</label>
                <Link href="/forgot-password" className="text-sm font-medium text-indigo-400 hover:text-indigo-300 transition-colors">
                  Forgot Password?
                </Link>
              </div>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full rounded-xl border border-white/10 bg-neutral-900 px-4 py-3.5 pr-12 text-white placeholder-neutral-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-colors text-left"
                  placeholder="••••••••"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white transition-colors">
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              id="login-btn"
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-indigo-600 px-4 py-3.5 mt-2 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2 focus:ring-offset-neutral-950 transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          <p className="mt-8 text-sm text-neutral-400 text-center">
            Don't have an account?{' '}
            <Link href="/signup" className="font-semibold text-indigo-400 hover:text-indigo-300 transition-colors">
              Sign up
            </Link>
          </p>
        </div>
      </div>

    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen w-full flex items-center justify-center bg-neutral-950">
        <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
