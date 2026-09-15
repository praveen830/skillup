import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, StudentProfile } from '../types';
import { api } from '../services/api';

type TabType = 'home' | 'curriculum' | 'plan' | 'milestones' | 'progress' | 'onboarding' | 'auth';

interface AuthContextType {
  user: User | null;
  profile: StudentProfile | null;
  hasProfile: boolean;
  hasPersonalizedCurriculum: boolean;
  currentTab: TabType;
  setCurrentTab: (tab: TabType) => void;
  isLoading: boolean;
  login: (token: string, user: User, profile?: StudentProfile, hasCurriculum?: boolean) => void;
  logout: () => void;
  refreshUser: () => Promise<void>;
  showGroqModal: boolean;
  setShowGroqModal: (show: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [hasProfile, setHasProfile] = useState(false);
  const [hasPersonalizedCurriculum, setHasPersonalizedCurriculum] = useState(false);
  const [currentTab, setCurrentTab] = useState<TabType>('home');
  const [isLoading, setIsLoading] = useState(true);
  const [showGroqModal, setShowGroqModal] = useState(false);

  const refreshUser = async () => {
    const token = localStorage.getItem('skillup_token');
    if (!token) {
      setUser(null);
      setProfile(null);
      setHasProfile(false);
      setHasPersonalizedCurriculum(false);
      setCurrentTab('auth');
      setIsLoading(false);
      return;
    }

    try {
      const data = await api.getMe();
      setUser(data.user);
      setProfile(data.profile);
      setHasProfile(data.hasProfile);
      setHasPersonalizedCurriculum(data.hasPersonalizedCurriculum);

      if (!data.hasProfile || !data.hasPersonalizedCurriculum) {
        setCurrentTab('onboarding');
      }
    } catch (err) {
      console.warn('Session expired or error loading user:', err);
      localStorage.removeItem('skillup_token');
      setUser(null);
      setCurrentTab('auth');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const login = (token: string, userData: User, profileData?: StudentProfile, hasCurriculum: boolean = false) => {
    localStorage.setItem('skillup_token', token);
    setUser(userData);
    if (profileData) {
      setProfile(profileData);
      setHasProfile(true);
    }
    setHasPersonalizedCurriculum(hasCurriculum);

    if (!profileData || !hasCurriculum) {
      setCurrentTab('onboarding');
    } else {
      setCurrentTab('home');
    }
  };

  const logout = () => {
    localStorage.removeItem('skillup_token');
    setUser(null);
    setProfile(null);
    setHasProfile(false);
    setHasPersonalizedCurriculum(false);
    setCurrentTab('auth');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        hasProfile,
        hasPersonalizedCurriculum,
        currentTab,
        setCurrentTab,
        isLoading,
        login,
        logout,
        refreshUser,
        showGroqModal,
        setShowGroqModal
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
