import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import {
  Sparkles,
  BookOpen,
  Calendar,
  Award,
  BarChart3,
  Home,
  Clock,
  Key,
  LogOut,
  User as UserIcon,
  ChevronDown,
  Layers
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, profile, currentTab, setCurrentTab, logout, setShowGroqModal } = useAuth();
  const [groqStatus, setGroqStatus] = useState<{ hasKey: boolean; maskedKey: string | null } | null>(null);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  useEffect(() => {
    api.getGroqStatus()
      .then(res => setGroqStatus({ hasKey: res.hasKey, maskedKey: res.maskedKey }))
      .catch(() => setGroqStatus({ hasKey: false, maskedKey: null }));
  }, []);

  if (!user || currentTab === 'auth') return null;

  const navItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'curriculum', label: 'My Curriculum', icon: Sparkles, badge: 'USP' },
    { id: 'plan', label: 'My Plan', icon: Calendar },
    { id: 'milestones', label: 'Milestones', icon: Award },
    { id: 'progress', label: 'Progress', icon: BarChart3 }
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo and Tagline */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setCurrentTab('home')}>
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-sm shadow-blue-500/20">
              <Layers className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-xl tracking-tight text-slate-900 font-['Outfit']">SkillUp<span className="text-blue-600"> AI</span></span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200/60">
                  Engineering
                </span>
              </div>
              <p className="text-[11px] text-slate-500 hidden sm:block">College gives one curriculum. SkillUp evolves it for YOU.</p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1">
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentTab(item.id as any)}
                  className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 font-semibold shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Icon className={`h-4 w-4 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-indigo-100 text-indigo-700 uppercase">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Section: Time Badge, Groq Key, Profile */}
          <div className="flex items-center space-x-3">
            
            {/* Daily Study Time Badge */}
            {profile && (
              <div className="hidden lg:flex items-center space-x-1.5 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700">
                <Clock className="h-3.5 w-3.5 text-blue-600" />
                <span className="font-medium text-slate-500">Pace:</span>
                <span className="font-semibold text-slate-900">{profile.daily_learning_minutes}m/day</span>
              </div>
            )}

            {/* Groq Engine Indicator */}
            <button
              onClick={() => setShowGroqModal(true)}
              className="flex items-center space-x-1.5 px-2.5 py-1.5 text-xs rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 transition-colors"
              title="Groq AI Engine Configuration"
            >
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="font-medium hidden sm:inline">Groq AI</span>
              <Key className="h-3 w-3 text-emerald-600" />
            </button>

            {/* User Dropdown */}
            <div className="relative">
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center space-x-2 p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors"
              >
                <div className="h-7 w-7 rounded-md bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <span className="text-xs font-semibold text-slate-800 max-w-[90px] truncate hidden sm:inline">
                  {user.name}
                </span>
                <ChevronDown className="h-3 w-3 text-slate-400" />
              </button>

              {profileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-slate-200 py-2 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                  <div className="px-4 py-2 border-b border-slate-100">
                    <p className="text-xs font-bold text-slate-900">{user.name}</p>
                    <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
                    {profile && (
                      <div className="mt-2 text-[11px] bg-slate-50 p-2 rounded-md border border-slate-100 text-slate-600">
                        <div className="font-semibold text-slate-800">{profile.branch}</div>
                        <div className="text-blue-600 truncate">{profile.career_goal}</div>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => {
                      setProfileDropdownOpen(false);
                      setCurrentTab('onboarding');
                    }}
                    className="w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center space-x-2"
                  >
                    <BookOpen className="h-3.5 w-3.5 text-slate-400" />
                    <span>Update Curriculum / Onboarding</span>
                  </button>

                  <button
                    onClick={() => {
                      setProfileDropdownOpen(false);
                      setShowGroqModal(true);
                    }}
                    className="w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center space-x-2"
                  >
                    <Key className="h-3.5 w-3.5 text-slate-400" />
                    <span>Groq API Key Settings</span>
                  </button>

                  <div className="border-t border-slate-100 my-1"></div>

                  <button
                    onClick={() => {
                      setProfileDropdownOpen(false);
                      logout();
                    }}
                    className="w-full text-left px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 flex items-center space-x-2"
                  >
                    <LogOut className="h-3.5 w-3.5 text-rose-500" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>

          </div>

        </div>
      </div>

      {/* Mobile Navigation bar */}
      <div className="md:hidden border-t border-slate-200 bg-white px-2 py-1 flex justify-around">
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentTab(item.id as any)}
              className={`flex flex-col items-center py-1 px-2 text-[11px] font-medium ${
                isActive ? 'text-blue-600 font-bold' : 'text-slate-500'
              }`}
            >
              <Icon className="h-4 w-4 mb-0.5" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </header>
  );
};
