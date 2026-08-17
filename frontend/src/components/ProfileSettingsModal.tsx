'use client';

import { useState, useRef } from 'react';
import { Camera, Loader2, X } from 'lucide-react';
import api, { authApi } from '@/utils/api';
import { useUserProfile } from '@/context/UserProfileContext';
import { DEFAULT_AVATARS } from '@/utils/avatars';

interface ProfileSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}


export default function ProfileSettingsModal({ isOpen, onClose }: ProfileSettingsModalProps) {
  const { userProfile, setUserProfile } = useUserProfile();
  const [loadingPic, setLoadingPic] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen || !userProfile) return null;

  const getInitials = (name: string) => {
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
    setLoadingPic(true);
    try {
      const token = localStorage.getItem('token');
      const res = await authApi.put('/auth/me/picture', { base64Image: base64Str });
      setUserProfile(res.data);
    } catch (err) {
      console.error('Failed to upload picture', err);
      alert('Failed to upload picture. Please try again.');
    } finally {
      setLoadingPic(false);
    }
  };

  const removePicture = async () => {
    setLoadingPic(true);
    try {
      const token = localStorage.getItem('token');
      const res = await authApi.delete('/auth/me/picture');
      setUserProfile(res.data);
    } catch (err) {
      console.error('Failed to remove picture', err);
      alert('Failed to remove picture. Please try again.');
    } finally {
      setLoadingPic(false);
    }
  };


  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-zinc-900 border border-white/10 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/5">
          <h2 className="text-xl font-bold text-white">Profile Settings</h2>
          <button 
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 flex flex-col gap-8">
          
          {/* Avatar Section */}
          <div className="flex flex-col items-center gap-4">
            <div className="relative group flex-shrink-0">
              <div className="w-24 h-24 rounded-full bg-zinc-800 border-2 border-indigo-500/30 flex items-center justify-center overflow-hidden">
                {loadingPic ? (
                  <Loader2 className="w-6 h-6 text-indigo-400 animate-spin" />
                ) : userProfile.profilePictureBase64 ? (
                  <img src={userProfile.profilePictureBase64} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-3xl font-bold text-indigo-400">{getInitials(userProfile.name)}</span>
                )}
              </div>
              
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={loadingPic}
                className="absolute bottom-0 right-0 p-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full shadow-lg transition-colors disabled:opacity-50"
              >
                <Camera className="w-4 h-4" />
              </button>
              <input 
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/png, image/jpeg, image/jpg, image/webp"
                className="hidden"
              />
            </div>
            
            <div className="text-center">
              <h3 className="text-lg font-bold text-white">{userProfile.name}</h3>
              <p className="text-sm text-zinc-400">{userProfile.email}</p>
            </div>

            {userProfile.profilePictureBase64 && (
              <button 
                onClick={removePicture}
                disabled={loadingPic}
                className="text-sm text-red-400 hover:text-red-300 font-medium disabled:opacity-50 transition-colors"
              >
                Remove Picture
              </button>
            )}

            <div className="w-full mt-2">
              <p className="text-sm text-zinc-400 mb-3 text-center">Or select a default avatar:</p>
              <div className="flex flex-wrap justify-center gap-3">
                {DEFAULT_AVATARS.map((avatar, idx) => (
                  <button 
                    key={idx}
                    onClick={() => uploadPicture(avatar)}
                    disabled={loadingPic}
                    className={`w-12 h-12 rounded-full overflow-hidden border-2 transition-transform hover:scale-110 ${userProfile.profilePictureBase64 === avatar ? 'border-indigo-500 scale-110' : 'border-transparent'}`}
                  >
                    <img src={avatar} alt={`Avatar ${idx+1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          </div>



        </div>
      </div>
    </div>
  );
}
