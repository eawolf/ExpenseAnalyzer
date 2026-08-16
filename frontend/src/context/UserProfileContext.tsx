'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';

interface UserProfile {
  id?: string;
  name: string;
  email: string;
  profilePictureBase64?: string;
  currency: string;
  age?: number;
  gender?: string;
  occupation?: string;
  primarySourceOfIncome?: string;
  aiConsent?: boolean;
  consentCompleted?: boolean;
}

interface UserProfileContextType {
  userProfile: UserProfile | null;
  setUserProfile: React.Dispatch<React.SetStateAction<UserProfile | null>>;
  loading: boolean;
}

const UserProfileContext = createContext<UserProfileContextType>({
  userProfile: null,
  setUserProfile: () => {},
  loading: true,
});

export const useUserProfile = () => useContext(UserProfileContext);

export const UserProfileProvider = ({ children }: { children: React.ReactNode }) => {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const res = await axios.get('/api-proxy/auth/auth/me', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUserProfile(res.data);
      } catch (err: any) {
        console.error('Failed to load user profile', err);
        if (err.response?.status === 401 || err.response?.status === 403 || err.response?.status === 400) {
          localStorage.removeItem('token');
          router.push('/login');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  return (
    <UserProfileContext.Provider value={{ userProfile, setUserProfile, loading }}>
      {children}
    </UserProfileContext.Provider>
  );
};
