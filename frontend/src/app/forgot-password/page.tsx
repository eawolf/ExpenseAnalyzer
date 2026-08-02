'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Mail, MessageSquare, ShieldQuestion, CheckCircle2, Eye, EyeOff } from 'lucide-react';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [identifier, setIdentifier] = useState('');
  const [method, setMethod] = useState('');
  const [otp, setOtp] = useState('');
  const [answers, setAnswers] = useState({ q1: '', q2: '', q3: '' });
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRequestRecovery = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('http://localhost:8081/api/auth/forgot-password/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emailOrPhone: identifier, method })
      });
      if (res.ok) {
        setStep(3);
      } else {
        setError('Failed to request recovery. Please try again.');
      }
    } catch (err) {
      setError('An error occurred.');
    }
    setLoading(false);
  };

  const handleVerifyQuestions = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('http://localhost:8081/api/auth/forgot-password/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          emailOrPhone: identifier, 
          method: 'QUESTIONS',
          answer1: answers.q1,
          answer2: answers.q2,
          answer3: answers.q3
        })
      });
      if (res.ok) {
        setStep(4);
      } else {
        setError('Incorrect security answers.');
      }
    } catch (err) {
      setError('An error occurred.');
    }
    setLoading(false);
  };

  const validatePassword = (pwd: string) => {
    if (pwd.length < 8) return 'Password must be at least 8 characters long.';
    if (!/[A-Z]/.test(pwd)) return 'Password must contain at least one uppercase letter.';
    if (!/[a-z]/.test(pwd)) return 'Password must contain at least one lowercase letter.';
    if (!/[0-9]/.test(pwd)) return 'Password must contain at least one number.';
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(pwd)) return 'Password must contain at least one special character.';
    return null;
  };

  const handleResetPassword = async () => {
    setError('');
    const pwdError = validatePassword(newPassword);
    if (pwdError) {
      setError(pwdError);
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('http://localhost:8081/api/auth/forgot-password/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          emailOrPhone: identifier, 
          otpCode: otp,
          newPassword
        })
      });
      if (res.ok) {
        setStep(5);
      } else {
        setError('Failed to reset password. Invalid OTP or Token.');
      }
    } catch (err) {
      setError('An error occurred.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-neutral-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-xl">
        
        {step < 5 && (
          <Link href="/login" className="inline-flex items-center text-sm text-neutral-400 hover:text-white mb-8 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to login
          </Link>
        )}

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-500 text-sm p-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {step === 1 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
            <div>
              <h1 className="text-2xl font-semibold text-white mb-2">Forgot Password</h1>
              <p className="text-neutral-400 text-sm">Enter your email or phone number to find your account.</p>
            </div>
            <div className="space-y-2">
              <label className="text-sm text-neutral-400">Email or Phone Number</label>
              <input 
                type="text" 
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                placeholder="john@example.com"
              />
            </div>
            <button 
              onClick={() => { if(identifier) setStep(2); }}
              disabled={!identifier}
              className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-medium py-3 rounded-xl transition-colors disabled:opacity-50"
            >
              Continue
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
            <div>
              <h1 className="text-2xl font-semibold text-white mb-2">Choose Recovery Method</h1>
              <p className="text-neutral-400 text-sm">How would you like to reset your password?</p>
            </div>
            
            <div className="space-y-3">
              <button onClick={() => setMethod('EMAIL')} className={`w-full flex items-center p-4 rounded-xl border transition-all ${method === 'EMAIL' ? 'bg-indigo-500/20 border-indigo-500 text-white' : 'bg-white/5 border-white/10 text-neutral-300 hover:bg-white/10'}`}>
                <Mail className="w-5 h-5 mr-3 text-indigo-400" />
                <div className="text-left">
                  <div className="font-medium">Email OTP</div>
                  <div className="text-xs text-neutral-500">Send a code to your registered email</div>
                </div>
              </button>

              <button onClick={() => setMethod('SMS')} className={`w-full flex items-center p-4 rounded-xl border transition-all ${method === 'SMS' ? 'bg-indigo-500/20 border-indigo-500 text-white' : 'bg-white/5 border-white/10 text-neutral-300 hover:bg-white/10'}`}>
                <MessageSquare className="w-5 h-5 mr-3 text-indigo-400" />
                <div className="text-left">
                  <div className="font-medium">SMS OTP</div>
                  <div className="text-xs text-neutral-500">Send a code to your phone number</div>
                </div>
              </button>

              <button onClick={() => setMethod('QUESTIONS')} className={`w-full flex items-center p-4 rounded-xl border transition-all ${method === 'QUESTIONS' ? 'bg-indigo-500/20 border-indigo-500 text-white' : 'bg-white/5 border-white/10 text-neutral-300 hover:bg-white/10'}`}>
                <ShieldQuestion className="w-5 h-5 mr-3 text-indigo-400" />
                <div className="text-left">
                  <div className="font-medium">Security Questions</div>
                  <div className="text-xs text-neutral-500">Answer 2 out of 3 questions</div>
                </div>
              </button>
            </div>

            <button 
              onClick={() => {
                if (method === 'QUESTIONS') setStep(3);
                else handleRequestRecovery();
              }}
              disabled={!method || loading}
              className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-medium py-3 rounded-xl transition-colors disabled:opacity-50"
            >
              {loading ? 'Processing...' : 'Continue'}
            </button>
          </div>
        )}

        {step === 3 && method !== 'QUESTIONS' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
            <div>
              <h1 className="text-2xl font-semibold text-white mb-2">Enter OTP</h1>
              <p className="text-neutral-400 text-sm">We've sent a 6-digit code to your {method.toLowerCase()}.</p>
            </div>
            <div className="space-y-2">
              <input 
                type="text" 
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-center tracking-widest text-2xl font-mono"
                placeholder="000000"
              />
            </div>
            <button 
              onClick={() => setStep(4)}
              disabled={otp.length !== 6}
              className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-medium py-3 rounded-xl transition-colors disabled:opacity-50"
            >
              Verify Code
            </button>
          </div>
        )}

        {step === 3 && method === 'QUESTIONS' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
            <div>
              <h1 className="text-2xl font-semibold text-white mb-2">Security Questions</h1>
              <p className="text-neutral-400 text-sm">Answer at least 2 of your security questions.</p>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm text-neutral-400">What is your mother's maiden name?</label>
                <input type="text" onChange={(e) => setAnswers({...answers, q1: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white" />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-neutral-400">What was the name of your first pet?</label>
                <input type="text" onChange={(e) => setAnswers({...answers, q2: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white" />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-neutral-400">What city were you born in?</label>
                <input type="text" onChange={(e) => setAnswers({...answers, q3: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white" />
              </div>
            </div>
            <button 
              onClick={handleVerifyQuestions}
              disabled={loading}
              className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-medium py-3 rounded-xl transition-colors disabled:opacity-50"
            >
              {loading ? 'Verifying...' : 'Verify Answers'}
            </button>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
            <div>
              <h1 className="text-2xl font-semibold text-white mb-2">New Password</h1>
              <p className="text-neutral-400 text-sm">Enter your new secure password.</p>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-neutral-400 mb-1.5 block">New Password</label>
                <div className="relative">
                  <input 
                    type={showNewPassword ? "text" : "password"} 
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 pr-12 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                    placeholder="••••••••"
                  />
                  <button type="button" onClick={() => setShowNewPassword(!showNewPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white transition-colors">
                    {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="text-sm text-neutral-400 mb-1.5 block">Confirm New Password</label>
                <div className="relative">
                  <input 
                    type={showConfirmPassword ? "text" : "password"} 
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 pr-12 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                    placeholder="••••••••"
                  />
                  <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white transition-colors">
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            </div>
            <button 
              onClick={handleResetPassword}
              disabled={newPassword.length < 8 || loading}
              className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-medium py-3 rounded-xl transition-colors disabled:opacity-50"
            >
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
          </div>
        )}

        {step === 5 && (
          <div className="text-center space-y-6 animate-in zoom-in-95 duration-500">
            <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-10 h-10 text-green-500" />
            </div>
            <h1 className="text-2xl font-semibold text-white">Password Reset!</h1>
            <p className="text-neutral-400">Your password has been successfully changed.</p>
            <button 
              onClick={() => router.push('/login')}
              className="w-full bg-white text-black hover:bg-neutral-200 font-medium py-3 rounded-xl transition-colors"
            >
              Continue to Login
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
