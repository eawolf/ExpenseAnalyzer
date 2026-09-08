'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Eye, EyeOff } from 'lucide-react';
import ThemeToggle from '@/components/ThemeToggle';

export default function SignupPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [countryCode, setCountryCode] = useState('+1');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [securityQuestion1, setSecurityQuestion1] = useState('');
  const [securityAnswer1, setSecurityAnswer1] = useState('');
  const [securityQuestion2, setSecurityQuestion2] = useState('');
  const [securityAnswer2, setSecurityAnswer2] = useState('');
  const [securityQuestion3, setSecurityQuestion3] = useState('');
  const [securityAnswer3, setSecurityAnswer3] = useState('');

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const validatePassword = (pwd: string) => {
    if (pwd.length < 8) return 'Password must be at least 8 characters long.';
    if (!/[A-Z]/.test(pwd)) return 'Password must contain at least one uppercase letter.';
    if (!/[a-z]/.test(pwd)) return 'Password must contain at least one lowercase letter.';
    if (!/[0-9]/.test(pwd)) return 'Password must contain at least one number.';
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(pwd)) return 'Password must contain at least one special character.';
    return null;
  };

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const pwdError = validatePassword(password);
    if (pwdError) {
      setError(pwdError);
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setStep(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!securityQuestion1 || !securityAnswer1 || !securityQuestion2 || !securityAnswer2 || !securityQuestion3 || !securityAnswer3) {
      setError('Please answer all 3 security questions.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('http://localhost:8081/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          name, 
          email, 
          phoneNumber: `${countryCode} ${phoneNumber}`,
          password,
          securityQuestion1,
          securityAnswer1,
          securityQuestion2,
          securityAnswer2,
          securityQuestion3,
          securityAnswer3
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Registration failed. Please try again.');
        return;
      }

      router.push('/login?registered=true');
    } catch (err) {
      setError('Unable to connect to server. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const questions = [
    "What is your mother's maiden name?",
    "What was the name of your first pet?",
    "What city were you born in?",
    "What is the name of your favorite childhood teacher?",
    "What was the make and model of your first car?"
  ];

  const phonePlaceholders: Record<string, string> = {
    '+1': '555-000-0000',
    '+91': '98765 43210',
    '+44': '7911 123456',
    '+61': '412 345 678',
    '+81': '90-1234-5678',
    '+49': '151 12345678',
    '+33': '6 12 34 56 78',
  };

  return (
    <div className="min-h-screen w-full flex bg-background">
      
      {/* Left Column: Form */}
      <div className="flex-1 flex flex-col justify-center px-8 sm:px-12 lg:px-20 relative">
        <div className="absolute top-8 left-8 sm:top-12 sm:left-12 flex items-center justify-between w-[calc(100%-4rem)] sm:w-[calc(100%-6rem)]">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-white shadow-lg group-hover:shadow-indigo-500/25 transition-all">
              E
            </div>
            <span className="font-bold tracking-tight text-foreground group-hover:text-primary transition-colors text-lg">ExpenseAnalyzer</span>
          </Link>
          <ThemeToggle />
        </div>

        <div className="w-full max-w-2xl mx-auto mt-32 lg:mt-0 z-10">
          
          {step === 2 && (
            <button onClick={() => setStep(1)} className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Personal Info
            </button>
          )}

          <div className="mb-10">
            <h2 className="text-3xl font-bold tracking-tight text-foreground mb-2">Create an Account</h2>
            <p className="text-muted-foreground">
              {step === 1 ? 'Join us to start analyzing your expenses and taking control of your finances.' : 'Setup your security questions for account recovery.'}
            </p>
          </div>

          {error && (
            <div className="rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400 mb-6">
              {error}
            </div>
          )}

          {step === 1 ? (
            <form className="animate-in fade-in slide-in-from-bottom-4" onSubmit={handleNextStep}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5 mb-8">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-foreground mb-1.5">Full Name</label>
                  <input required value={name} onChange={(e) => setName(e.target.value)} type="text" className="block w-full rounded-xl border border-border bg-input px-4 py-3 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" placeholder="John Doe" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Email Address</label>
                  <input required value={email} onChange={(e) => setEmail(e.target.value)} type="email" className="block w-full rounded-xl border border-border bg-input px-4 py-3 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" placeholder="you@example.com" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Phone Number</label>
                  <div className="flex gap-2 min-w-0">
                    <select 
                      value={countryCode} 
                      onChange={(e) => setCountryCode(e.target.value)}
                      className="w-28 rounded-xl border border-border bg-input px-2 py-3 text-foreground text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary shrink-0"
                    >
                      <option value="+1">US (+1)</option>
                      <option value="+44">UK (+44)</option>
                      <option value="+91">IN (+91)</option>
                      <option value="+61">AU (+61)</option>
                      <option value="+81">JP (+81)</option>
                      <option value="+49">DE (+49)</option>
                      <option value="+33">FR (+33)</option>
                    </select>
                    <input 
                      required 
                      value={phoneNumber} 
                      onChange={(e) => setPhoneNumber(e.target.value)} 
                      type="tel" 
                      className="flex-1 min-w-0 rounded-xl border border-border bg-input px-4 py-3 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" 
                      placeholder={phonePlaceholders[countryCode] || '555-000-0000'} 
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Password</label>
                  <div className="relative">
                    <input required value={password} onChange={(e) => setPassword(e.target.value)} type={showPassword ? "text" : "password"} className="block w-full rounded-xl border border-border bg-input px-4 py-3 pr-12 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" placeholder="••••••••" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Confirm Password</label>
                  <div className="relative">
                    <input required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} type={showConfirmPassword ? "text" : "password"} className="block w-full rounded-xl border border-border bg-input px-4 py-3 pr-12 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" placeholder="••••••••" />
                    <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                      {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
              </div>

              <button type="submit" className="w-full max-w-sm mx-auto block rounded-xl bg-indigo-600 px-4 py-3.5 mt-2 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 hover:bg-indigo-500 transition-all">
                Continue to Security
              </button>
            </form>
          ) : (
            <form className="animate-in fade-in slide-in-from-right-4" onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {/* Q1 */}
                <div className="md:col-span-2 p-4 rounded-xl border border-border bg-card">
                  <select required value={securityQuestion1} onChange={(e) => setSecurityQuestion1(e.target.value)} className="w-full bg-transparent text-sm text-foreground mb-2 focus:outline-none">
                    <option value="" disabled className="text-muted-foreground">Select Question 1</option>
                    {questions.map(q => <option key={q} value={q} className="text-foreground">{q}</option>)}
                  </select>
                  <input required value={securityAnswer1} onChange={(e) => setSecurityAnswer1(e.target.value)} type="text" className="w-full bg-input border border-border rounded-lg px-3 py-2 text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:border-primary" placeholder="Your Answer" />
                </div>
                
                {/* Q2 */}
                <div className="p-4 rounded-xl border border-border bg-card">
                  <select required value={securityQuestion2} onChange={(e) => setSecurityQuestion2(e.target.value)} className="w-full bg-transparent text-sm text-foreground mb-2 focus:outline-none">
                    <option value="" disabled className="text-muted-foreground">Select Question 2</option>
                    {questions.map(q => <option key={q} value={q} className="text-foreground">{q}</option>)}
                  </select>
                  <input required value={securityAnswer2} onChange={(e) => setSecurityAnswer2(e.target.value)} type="text" className="w-full bg-input border border-border rounded-lg px-3 py-2 text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:border-primary" placeholder="Your Answer" />
                </div>

                {/* Q3 */}
                <div className="p-4 rounded-xl border border-border bg-card">
                  <select required value={securityQuestion3} onChange={(e) => setSecurityQuestion3(e.target.value)} className="w-full bg-transparent text-sm text-foreground mb-2 focus:outline-none">
                    <option value="" disabled className="text-muted-foreground">Select Question 3</option>
                    {questions.map(q => <option key={q} value={q} className="text-foreground">{q}</option>)}
                  </select>
                  <input required value={securityAnswer3} onChange={(e) => setSecurityAnswer3(e.target.value)} type="text" className="w-full bg-input border border-border rounded-lg px-3 py-2 text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:border-primary" placeholder="Your Answer" />
                </div>
              </div>

              <button type="submit" disabled={loading} className="w-full max-w-sm mx-auto block rounded-xl bg-indigo-600 px-4 py-3.5 mt-2 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 hover:bg-indigo-500 transition-all disabled:opacity-50">
                {loading ? 'Creating account…' : 'Complete Signup'}
              </button>
            </form>
          )}

          {step === 1 && (
            <p className="mt-8 text-center text-sm text-muted-foreground">
              Already have an account?{' '}
              <Link href="/login" className="font-semibold text-primary hover:text-primary/80 transition-colors">
                Sign in
              </Link>
            </p>
          )}
        </div>
      </div>

      {/* Right Column: Animated Perks */}
      <div className="hidden lg:flex lg:flex-1 relative overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_30%)]">
        <style>{`
          @keyframes marquee {
            0% { transform: translateY(0); }
            100% { transform: translateY(-50%); }
          }
          .animate-marquee {
            animation: marquee 20s linear infinite;
          }
          .animate-marquee:hover {
            animation-play-state: paused;
          }
        `}</style>
        
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-[120px] -translate-y-1/3 translate-x-1/4"></div>
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[100px] translate-y-1/3"></div>

        <div className="relative w-full h-full flex flex-col justify-center items-center p-12">
          
          <div className="mb-12 text-center relative z-10">
            <h3 className="text-3xl font-bold text-foreground mb-3">Why Join Us?</h3>
            <p className="text-muted-foreground text-lg mb-10">Discover what makes ExpenseAnalyzer special.</p>
          </div>

          <div className="h-[400px] w-full max-w-md overflow-hidden relative z-10 [mask-image:linear-gradient(to_bottom,transparent,black_10%,black_90%,transparent)]">
            <div className="animate-marquee flex flex-col gap-4">
              {[1, 2].map((loopIndex) => (
                <div key={loopIndex} className="flex flex-col gap-4">
                  <div className="p-5 rounded-2xl bg-card border border-border backdrop-blur-md flex items-start gap-4 hover:bg-accent transition-colors">
                    <div className="p-3 rounded-xl bg-indigo-500/20 text-indigo-400 shrink-0">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/><path d="M18 12a2 2 0 0 0 0 4h4v-4Z"/></svg>
                    </div>
                    <div>
                      <h4 className="text-foreground font-semibold mb-1">Track Every Cent</h4>
                      <p className="text-muted-foreground text-sm leading-relaxed">Log all your incomes and expenses with precision to know exactly where your money goes.</p>
                    </div>
                  </div>

                  <div className="p-5 rounded-2xl bg-card border border-border backdrop-blur-md flex items-start gap-4 hover:bg-accent transition-colors">
                    <div className="p-3 rounded-xl bg-purple-500/20 text-purple-400 shrink-0">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>
                    </div>
                    <div>
                      <h4 className="text-foreground font-semibold mb-1">Smart Savings Goals</h4>
                      <p className="text-muted-foreground text-sm leading-relaxed">Set monthly targets, track your progress automatically, and never miss your savings goal.</p>
                    </div>
                  </div>

                  <div className="p-5 rounded-2xl bg-card border border-border backdrop-blur-md flex items-start gap-4 hover:bg-accent transition-colors">
                    <div className="p-3 rounded-xl bg-emerald-500/20 text-emerald-400 shrink-0">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/></svg>
                    </div>
                    <div>
                      <h4 className="text-foreground font-semibold mb-1">Advanced Analytics</h4>
                      <p className="text-muted-foreground text-sm leading-relaxed">Visualize your financial health with beautiful, interactive charts and comprehensive summaries.</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
