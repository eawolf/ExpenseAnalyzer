'use client';

import React, { useState } from 'react';
import { useUserProfile } from '@/context/UserProfileContext';
import { Loader2 } from 'lucide-react';
import api from '@/utils/api';

export default function ConsentModal() {
  const { userProfile, setUserProfile, loading } = useUserProfile();
  const [saving, setSaving] = useState(false);
  
  const [form, setForm] = useState({
    age: '',
    gender: '',
    occupation: '',
    primarySourceOfIncome: '',
    aiConsent: true
  });

  if (loading || !userProfile || userProfile.consentCompleted) {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.age || !form.gender || !form.occupation || !form.primarySourceOfIncome) {
      alert('Please fill in all fields.');
      return;
    }

    setSaving(true);
    const token = localStorage.getItem('token');
    try {
      const res = await api.put('http://localhost:8081/api/auth/me/consent', {
        age: parseInt(form.age, 10),
        gender: form.gender,
        occupation: form.occupation,
        primarySourceOfIncome: form.primarySourceOfIncome,
        aiConsent: form.aiConsent
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUserProfile(res.data);
    } catch (err: any) {
      console.error('Failed to submit consent', err);
      alert('Failed to submit details. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-zinc-900 border border-white/10 rounded-2xl p-6 sm:p-8 w-full max-w-md shadow-2xl">
        <h2 className="text-2xl font-bold text-white mb-2">Welcome! Let's personalize your experience</h2>
        <p className="text-zinc-400 mb-6 text-sm">
          To provide you with the best AI-driven financial insights, we need a few details.
        </p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1">Age</label>
            <input 
              type="number" 
              required
              min="13"
              max="120"
              value={form.age}
              onChange={e => setForm({...form, age: e.target.value})}
              className="w-full bg-zinc-950 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors"
              placeholder="e.g. 28"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1">Gender</label>
            <select 
              required
              value={form.gender}
              onChange={e => setForm({...form, gender: e.target.value})}
              className="w-full bg-zinc-950 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors"
            >
              <option value="" disabled>Select gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Non-binary">Non-binary</option>
              <option value="Prefer not to say">Prefer not to say</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1">Occupation</label>
            <input 
              type="text" 
              required
              value={form.occupation}
              onChange={e => setForm({...form, occupation: e.target.value})}
              className="w-full bg-zinc-950 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors"
              placeholder="e.g. Software Engineer"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1">Primary Source of Income</label>
            <select 
              required
              value={form.primarySourceOfIncome}
              onChange={e => setForm({...form, primarySourceOfIncome: e.target.value})}
              className="w-full bg-zinc-950 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors"
            >
              <option value="" disabled>Select source</option>
              <option value="Salary">Salary</option>
              <option value="Business/Self-Employed">Business / Self-Employed</option>
              <option value="Investments">Investments</option>
              <option value="Freelance/Contract">Freelance / Contract</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="flex items-start gap-3 p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20 mt-6">
            <input 
              type="checkbox" 
              id="aiConsent"
              checked={form.aiConsent}
              onChange={(e) => setForm({...form, aiConsent: e.target.checked})}
              className="mt-1 w-4 h-4 rounded border-zinc-700 text-indigo-600 focus:ring-indigo-600 focus:ring-offset-zinc-900 bg-zinc-800 cursor-pointer"
            />
            <label htmlFor="aiConsent" className="text-sm text-zinc-300 cursor-pointer">
              <span className="font-medium text-indigo-400 block mb-1">AI Data Analysis Consent</span>
              I agree to allow my financial data and demographics to be analyzed by AI models to provide personalized financial insights.
            </label>
          </div>

          <button 
            type="submit" 
            disabled={saving}
            className="w-full mt-6 bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-3 rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {saving && <Loader2 className="w-5 h-5 animate-spin" />}
            Save and Continue
          </button>
        </form>
      </div>
    </div>
  );
}
