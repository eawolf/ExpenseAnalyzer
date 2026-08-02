'use client';

import { useEffect, useState, useRef } from 'react';
import api from '@/utils/api';
import { Loader2, User as UserIcon, Camera } from 'lucide-react';
import axios from 'axios';
import { useUserProfile } from '@/context/UserProfileContext';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  profilePictureBase64?: string;
}

export default function SettingsPage() {
  const { userProfile: profile, setUserProfile, loading } = useUserProfile();
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ 
    name: '', 
    email: '',
    age: '',
    gender: '',
    occupation: '',
    occupation: '',
    primarySourceOfIncome: '',
    aiConsent: false
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (profile) {
      setEditForm({ 
        name: profile.name, 
        email: profile.email,
        age: profile.age?.toString() || '',
        gender: profile.gender || '',
        occupation: profile.occupation || '',
        occupation: profile.occupation || '',
        primarySourceOfIncome: profile.primarySourceOfIncome || '',
        aiConsent: profile.aiConsent || false
      });
    }
  }, [profile]);

  const getInitials = (name: string) => {
    if (!name) return 'U';
    return name.charAt(0).toUpperCase();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert("File size must be under 2MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64String = event.target?.result as string;
      await uploadPicture(base64String);
    };
    reader.readAsDataURL(file);
  };

  const uploadPicture = async (base64Str: string) => {
    const token = localStorage.getItem('token');
    if (!token) return;
    setUploading(true);
    try {
      const res = await axios.put('http://localhost:8081/api/auth/me/picture', 
        { base64Image: base64Str }, 
        { headers: { Authorization: `Bearer ${token}` }}
      );
      setProfile(res.data);
      alert('Profile picture updated successfully! Please refresh the page to see changes everywhere.');
    } catch (err) {
      console.error('Failed to upload picture', err);
      alert('Failed to upload picture. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const removePicture = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    setUploading(true);
    try {
      const res = await axios.delete('http://localhost:8081/api/auth/me/picture', 
        { headers: { Authorization: `Bearer ${token}` }}
      );
      setUserProfile(res.data);
      alert('Profile picture removed successfully!');
    } catch (err) {
      console.error('Failed to remove picture', err);
      alert('Failed to remove picture. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleSaveProfile = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    setSaving(true);
    try {
      const payload = {
        ...editForm,
        age: editForm.age ? parseInt(editForm.age, 10) : null
      };
      const res = await api.put('http://localhost:8081/api/auth/me/profile', payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUserProfile(res.data);
      setIsEditing(false);
    } catch (err: any) {
      console.error('Failed to update profile', err);
      alert(err.response?.data?.message || 'Failed to update profile. Email might be in use.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
      </div>
    );
  }

  if (!profile) {
    return <div className="text-zinc-500 text-center">Failed to load profile.</div>;
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <UserIcon className="w-6 h-6 text-indigo-400" />
          Profile Settings
        </h2>
        {!isEditing ? (
          <button 
            onClick={() => setIsEditing(true)}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl transition-colors font-medium text-sm"
          >
            Edit Profile
          </button>
        ) : (
          <div className="flex items-center gap-3">
            <button 
              onClick={() => {
                setIsEditing(false);
                if (profile) setEditForm({ 
                  name: profile.name, 
                  email: profile.email,
                  age: profile.age?.toString() || '',
                  gender: profile.gender || '',
                  occupation: profile.occupation || '',
                  primarySourceOfIncome: profile.primarySourceOfIncome || '',
                  aiConsent: profile.aiConsent || false
                });
              }}
              disabled={saving}
              className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl transition-colors font-medium text-sm disabled:opacity-50"
            >
              Cancel
            </button>
            <button 
              onClick={handleSaveProfile}
              disabled={saving}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl transition-colors font-medium text-sm flex items-center gap-2 disabled:opacity-50"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              Save Changes
            </button>
          </div>
        )}
      </div>

      <div className="bg-zinc-900 border border-white/5 rounded-2xl p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row items-center gap-8 mb-8 pb-8 border-b border-white/5">
          <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
            {profile.profilePictureBase64 ? (
              <img src={profile.profilePictureBase64} alt="Profile" className="w-32 h-32 rounded-full object-cover border-4 border-zinc-800" />
            ) : (
              <div className="w-32 h-32 rounded-full bg-indigo-500/20 border-4 border-zinc-800 flex items-center justify-center text-5xl font-bold text-indigo-400">
                {getInitials(profile.name)}
              </div>
            )}
            <div className="absolute inset-0 bg-black/50 rounded-full flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              {uploading ? (
                <Loader2 className="w-8 h-8 text-white animate-spin" />
              ) : (
                <>
                  <Camera className="w-8 h-8 text-white mb-1" />
                  <span className="text-xs text-white font-medium">Change</span>
                </>
              )}
            </div>
          </div>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            accept="image/png, image/jpeg, image/webp" 
            className="hidden" 
          />
          <div className="text-center sm:text-left">
            <h3 className="text-2xl font-bold text-white">{profile.name}</h3>
            <p className="text-zinc-400">{profile.email}</p>
            <p className="text-xs text-zinc-500 mt-2">Max file size: 2MB</p>
            {profile.profilePictureBase64 && (
               <button 
                  onClick={removePicture}
                  disabled={uploading}
                  className="mt-3 text-sm font-medium text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 px-4 py-2 rounded-lg transition-colors"
               >
                  Remove Photo
               </button>
            )}
          </div>
        </div>

        <div className="space-y-6">
           <div>
              <label className="block text-sm font-medium text-zinc-400 mb-2">Full Name</label>
              <input 
                type="text" 
                value={isEditing ? editForm.name : profile.name} 
                onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                disabled={!isEditing || saving} 
                className={"w-full border rounded-xl px-4 py-3 transition-colors " + (!isEditing ? "bg-zinc-950 border-white/10 text-zinc-500 cursor-not-allowed" : "bg-zinc-900 border-indigo-500/50 text-white focus:outline-none focus:border-indigo-500")}
              />
           </div>
           <div>
              <label className="block text-sm font-medium text-zinc-400 mb-2">Email Address</label>
              <input 
                type="email" 
                value={isEditing ? editForm.email : profile.email} 
                onChange={(e) => setEditForm(prev => ({ ...prev, email: e.target.value }))}
                disabled={!isEditing || saving} 
                className={"w-full border rounded-xl px-4 py-3 transition-colors " + (!isEditing ? "bg-zinc-950 border-white/10 text-zinc-500 cursor-not-allowed" : "bg-zinc-900 border-indigo-500/50 text-white focus:outline-none focus:border-indigo-500")}
              />
           </div>
           <div>
              <label className="block text-sm font-medium text-zinc-400 mb-2">Account ID</label>
              <input type="text" value={profile.id} disabled className="w-full bg-zinc-950 border border-white/10 rounded-xl px-4 py-3 text-zinc-500 cursor-not-allowed font-mono text-xs" />
           </div>
           <div>
              <label className="block text-sm font-medium text-zinc-400 mb-2">Age</label>
              <input 
                type="number" 
                value={isEditing ? editForm.age : (profile.age || '')} 
                onChange={(e) => setEditForm(prev => ({ ...prev, age: e.target.value }))}
                disabled={!isEditing || saving} 
                className={"w-full border rounded-xl px-4 py-3 transition-colors " + (!isEditing ? "bg-zinc-950 border-white/10 text-zinc-500 cursor-not-allowed" : "bg-zinc-900 border-indigo-500/50 text-white focus:outline-none focus:border-indigo-500")}
              />
           </div>
           <div>
              <label className="block text-sm font-medium text-zinc-400 mb-2">Gender</label>
              <select 
                value={isEditing ? editForm.gender : (profile.gender || '')} 
                onChange={(e) => setEditForm(prev => ({ ...prev, gender: e.target.value }))}
                disabled={!isEditing || saving} 
                className={"w-full border rounded-xl px-4 py-3 transition-colors " + (!isEditing ? "bg-zinc-950 border-white/10 text-zinc-500 cursor-not-allowed" : "bg-zinc-900 border-indigo-500/50 text-white focus:outline-none focus:border-indigo-500")}
              >
                <option value="" disabled>Not specified</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Non-binary">Non-binary</option>
                <option value="Prefer not to say">Prefer not to say</option>
              </select>
           </div>
           <div>
              <label className="block text-sm font-medium text-zinc-400 mb-2">Occupation</label>
              <input 
                type="text" 
                value={isEditing ? editForm.occupation : (profile.occupation || '')} 
                onChange={(e) => setEditForm(prev => ({ ...prev, occupation: e.target.value }))}
                disabled={!isEditing || saving} 
                className={"w-full border rounded-xl px-4 py-3 transition-colors " + (!isEditing ? "bg-zinc-950 border-white/10 text-zinc-500 cursor-not-allowed" : "bg-zinc-900 border-indigo-500/50 text-white focus:outline-none focus:border-indigo-500")}
              />
           </div>
           <div>
              <label className="block text-sm font-medium text-zinc-400 mb-2">Primary Source of Income</label>
              <select 
                value={isEditing ? editForm.primarySourceOfIncome : (profile.primarySourceOfIncome || '')} 
                onChange={(e) => setEditForm(prev => ({ ...prev, primarySourceOfIncome: e.target.value }))}
                disabled={!isEditing || saving} 
                className={"w-full border rounded-xl px-4 py-3 transition-colors " + (!isEditing ? "bg-zinc-950 border-white/10 text-zinc-500 cursor-not-allowed" : "bg-zinc-900 border-indigo-500/50 text-white focus:outline-none focus:border-indigo-500")}
              >
                <option value="" disabled>Not specified</option>
                <option value="Salary">Salary</option>
                <option value="Business/Self-Employed">Business / Self-Employed</option>
                <option value="Investments">Investments</option>
                <option value="Freelance/Contract">Freelance / Contract</option>
                <option value="Other">Other</option>
              </select>
           </div>
           <div>
              <label className="block text-sm font-medium text-zinc-400 mb-2">AI Data Analysis Consent</label>
              <div className="flex items-center gap-3 p-4 rounded-xl bg-zinc-950 border border-white/10 mt-2">
                <input 
                  type="checkbox" 
                  checked={isEditing ? editForm.aiConsent : (profile.aiConsent || false)}
                  onChange={(e) => setEditForm(prev => ({ ...prev, aiConsent: e.target.checked }))}
                  disabled={!isEditing || saving}
                  className={"w-4 h-4 rounded border-zinc-700 text-indigo-600 focus:ring-indigo-600 focus:ring-offset-zinc-900 " + (!isEditing ? "bg-zinc-800 cursor-not-allowed" : "bg-zinc-900 cursor-pointer")}
                />
                <span className="text-sm text-zinc-400">
                  Allow AI-driven financial insights based on your data.
                </span>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
