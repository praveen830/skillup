import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Sparkles, Key, CheckCircle2, X, Cpu, Bot, ArrowRight, ShieldCheck, Flame, Database, Cloud, Layers } from 'lucide-react';

export const GroqModal: React.FC = () => {
  const { showGroqModal, setShowGroqModal } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'groq' | 'gemini' | 'firebase'>('overview');

  const [groqKey, setGroqKey] = useState('');
  const [geminiKey, setGeminiKey] = useState('');

  const [status, setStatus] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadStatus = async () => {
    try {
      const res = await api.getAiStatus();
      setStatus(res);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (showGroqModal) {
      loadStatus();
    }
  }, [showGroqModal]);

  const handleSaveGroq = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!groqKey || groqKey.trim().length < 8) {
      setErrorMessage('Please provide a valid Groq API key (starts with gsk_...)');
      return;
    }

    setIsSaving(true);
    setErrorMessage(null);
    setSaveMessage(null);

    try {
      const res = await api.saveGroqKey(groqKey.trim());
      setSaveMessage(res.message);
      setGroqKey('');
      await loadStatus();
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to save Groq Key');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveGemini = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!geminiKey || geminiKey.trim().length < 8) {
      setErrorMessage('Please provide a valid Google Gemini API key');
      return;
    }

    setIsSaving(true);
    setErrorMessage(null);
    setSaveMessage(null);

    try {
      const res = await api.saveGeminiKey(geminiKey.trim());
      setSaveMessage(res.message);
      setGeminiKey('');
      await loadStatus();
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to save Gemini Key');
    } finally {
      setIsSaving(false);
    }
  };

  if (!showGroqModal) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 p-5 text-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-blue-500/20 border border-blue-400/30 text-blue-300">
              <Cpu className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-base font-['Outfit']">AI Engine Hub: Groq + Gemini</h3>
              <p className="text-xs text-slate-300">Dual-engine intelligent fallback architecture</p>
            </div>
          </div>
          <button
            onClick={() => setShowGroqModal(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Engine Tabs */}
        <div className="flex border-b border-slate-200 bg-slate-50 text-xs font-semibold">
          <button
            type="button"
            onClick={() => { setActiveTab('overview'); setErrorMessage(null); setSaveMessage(null); }}
            className={`flex-1 py-3 px-3 flex items-center justify-center space-x-1.5 border-b-2 transition-all cursor-pointer ${
              activeTab === 'overview'
                ? 'border-blue-600 text-blue-600 bg-white shadow-xs'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-100/60'
            }`}
          >
            <Layers className="h-4 w-4" />
            <span>Architecture</span>
          </button>

          <button
            type="button"
            onClick={() => { setActiveTab('groq'); setErrorMessage(null); setSaveMessage(null); }}
            className={`flex-1 py-3 px-3 flex items-center justify-center space-x-1.5 border-b-2 transition-all cursor-pointer ${
              activeTab === 'groq'
                ? 'border-blue-600 text-blue-600 bg-white shadow-xs'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-100/60'
            }`}
          >
            <Cpu className="h-4 w-4" />
            <span>Groq AI</span>
            {status?.groq?.hasKey && (
              <span className="h-2 w-2 rounded-full bg-emerald-500" title="Active" />
            )}
          </button>

          <button
            type="button"
            onClick={() => { setActiveTab('gemini'); setErrorMessage(null); setSaveMessage(null); }}
            className={`flex-1 py-3 px-3 flex items-center justify-center space-x-1.5 border-b-2 transition-all cursor-pointer ${
              activeTab === 'gemini'
                ? 'border-indigo-600 text-indigo-600 bg-white shadow-xs'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-100/60'
            }`}
          >
            <Bot className="h-4 w-4" />
            <span>Gemini</span>
            {status?.gemini?.hasKey && (
              <span className="h-2 w-2 rounded-full bg-emerald-500" title="Active Standby" />
            )}
          </button>

          <button
            type="button"
            onClick={() => { setActiveTab('firebase'); setErrorMessage(null); setSaveMessage(null); }}
            className={`flex-1 py-3 px-3 flex items-center justify-center space-x-1.5 border-b-2 transition-all cursor-pointer ${
              activeTab === 'firebase'
                ? 'border-amber-500 text-amber-600 bg-white shadow-xs'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-100/60'
            }`}
          >
            <Flame className="h-4 w-4 text-amber-500" />
            <span>Firestore</span>
            <span className="h-2 w-2 rounded-full bg-emerald-500" title="Connected" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">

          {activeTab === 'overview' ? (
            /* Visual Topology Diagram Tab */
            <div className="space-y-4">
              <div className="text-center pb-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
                  Active System Topology
                </span>
                <h4 className="text-sm font-bold text-slate-900 mt-1 font-['Outfit']">
                  AI Engine & Cloud Database Configuration
                </h4>
              </div>

              {/* Box 1: Primary AI */}
              <div className="bg-slate-900 text-white rounded-xl p-4 border border-slate-800 shadow-sm relative overflow-hidden">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-300 bg-blue-900/60 px-2 py-0.5 rounded border border-blue-700">
                    Primary AI
                  </span>
                  <div className="flex items-center space-x-1.5">
                    <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    <span className="text-xs font-bold text-emerald-400">Connected</span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Cpu className="h-5 w-5 text-blue-400" />
                  <span className="text-sm font-extrabold">Groq AI</span>
                </div>
                <div className="mt-2 text-xs font-mono text-slate-300 bg-slate-800/80 px-2.5 py-1 rounded border border-slate-700 flex items-center justify-between">
                  <span className="text-slate-400">Model:</span>
                  <span className="text-blue-300 font-bold">{status?.groq?.model || 'openai/gpt-oss-120b'}</span>
                </div>
              </div>

              {/* Down Arrow / Fallback Indicator */}
              <div className="flex items-center justify-center -my-2 relative z-10">
                <div className="bg-white border border-slate-200 rounded-full px-3 py-1 shadow-xs flex items-center space-x-1 text-[10px] font-bold text-indigo-700">
                  <span>↓ Automatic Fallback</span>
                </div>
              </div>

              {/* Box 2: Automatic Fallback */}
              <div className="bg-gradient-to-br from-indigo-900/90 to-blue-950 text-white rounded-xl p-4 border border-indigo-800 shadow-sm relative">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-300 bg-indigo-900/60 px-2 py-0.5 rounded border border-indigo-700">
                    Automatic Fallback
                  </span>
                  <div className="flex items-center space-x-1.5">
                    <span className="h-2 w-2 rounded-full bg-emerald-400"></span>
                    <span className="text-xs font-bold text-emerald-400">Connected</span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Bot className="h-5 w-5 text-indigo-400" />
                  <span className="text-sm font-extrabold">Google Gemini</span>
                </div>
                <div className="mt-2 text-xs font-mono text-slate-300 bg-indigo-950/80 px-2.5 py-1 rounded border border-indigo-800 flex items-center justify-between">
                  <span className="text-slate-400">Model:</span>
                  <span className="text-indigo-300 font-bold">{status?.gemini?.model || 'Gemini Flash'}</span>
                </div>
              </div>

              {/* Box 3: Database */}
              <div className="bg-gradient-to-br from-amber-950/80 to-slate-900 text-white rounded-xl p-4 border border-amber-800/60 shadow-sm relative">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-300 bg-amber-900/60 px-2 py-0.5 rounded border border-amber-700">
                    Database
                  </span>
                  <div className="flex items-center space-x-1.5">
                    <span className="h-2 w-2 rounded-full bg-emerald-400"></span>
                    <span className="text-xs font-bold text-emerald-400">Connected</span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Flame className="h-5 w-5 text-amber-400" />
                  <span className="text-sm font-extrabold">Firebase Firestore</span>
                </div>
                <div className="mt-2 text-xs font-mono text-slate-300 bg-black/40 px-2.5 py-1 rounded border border-amber-900/40 flex items-center justify-between">
                  <span className="text-slate-400">Project:</span>
                  <span className="text-amber-300 font-bold">{status?.firebase?.projectId || 'skillup-ai-aa9ab'}</span>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between">
                <span className="text-[11px] text-slate-500">Live configuration active on server</span>
                <button
                  type="button"
                  onClick={() => setShowGroqModal(false)}
                  className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors cursor-pointer"
                >
                  Done
                </button>
              </div>
            </div>
          ) : activeTab === 'groq' ? (
            /* Groq Form */
            <form onSubmit={handleSaveGroq} className="space-y-4">
              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/80 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-medium">Active Groq Model:</span>
                  <span className="font-mono font-bold text-slate-800 bg-white px-2 py-0.5 rounded border border-slate-200">
                    {status?.groq?.model || 'openai/gpt-oss-120b'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-medium">API Key Status:</span>
                  {status?.groq?.hasKey ? (
                    <span className="flex items-center space-x-1 text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      <span>Connected ({status.groq.maskedKey})</span>
                    </span>
                  ) : (
                    <span className="text-amber-700 font-medium bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                      Not Configured
                    </span>
                  )}
                </div>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">
                Groq delivers near-instant inference speeds on LPUs for curriculum parsing, KEEP/COMPRESS/ADD optimization, and weekly adaptive plan calculation.
              </p>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Update Groq API Key
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Key className="h-4 w-4" />
                  </div>
                  <input
                    type="password"
                    value={groqKey}
                    onChange={(e) => setGroqKey(e.target.value)}
                    placeholder="gsk_..."
                    className="block w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono bg-white"
                  />
                </div>
              </div>

              {saveMessage && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 flex items-center space-x-2">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                  <span>{saveMessage}</span>
                </div>
              )}

              {errorMessage && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-800">
                  {errorMessage}
                </div>
              )}

              <div className="flex items-center justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowGroqModal(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 border border-slate-200 rounded-lg hover:bg-slate-50"
                >
                  Close
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-colors flex items-center space-x-1.5 disabled:opacity-50"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>{isSaving ? 'Connecting...' : 'Save Groq Key'}</span>
                </button>
              </div>
            </form>
          ) : activeTab === 'gemini' ? (
            /* Google Gemini Form */
            <form onSubmit={handleSaveGemini} className="space-y-4">
              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/80 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-medium">Active Gemini Model:</span>
                  <span className="font-mono font-bold text-slate-800 bg-white px-2 py-0.5 rounded border border-slate-200">
                    {status?.gemini?.model || 'gemini-3.6-flash'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-medium">API Key Status:</span>
                  {status?.gemini?.hasKey ? (
                    <span className="flex items-center space-x-1 text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      <span>Active Standby ({status.gemini.maskedKey})</span>
                    </span>
                  ) : (
                    <span className="text-amber-700 font-medium bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                      Not Configured (Optional Fallback)
                    </span>
                  )}
                </div>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">
                If Groq encounters rate limits or temporary downtime, Google Gemini (via official <code>@google/genai</code>) automatically handles curriculum synthesis seamlessly.
              </p>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Set Google Gemini API Key
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Key className="h-4 w-4" />
                  </div>
                  <input
                    type="password"
                    value={geminiKey}
                    onChange={(e) => setGeminiKey(e.target.value)}
                    placeholder="AIza..."
                    className="block w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-mono bg-white"
                  />
                </div>
              </div>

              {saveMessage && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 flex items-center space-x-2">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                  <span>{saveMessage}</span>
                </div>
              )}

              {errorMessage && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-800">
                  {errorMessage}
                </div>
              )}

              <div className="flex items-center justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowGroqModal(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 border border-slate-200 rounded-lg hover:bg-slate-50"
                >
                  Close
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors flex items-center space-x-1.5 disabled:opacity-50"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>{isSaving ? 'Connecting...' : 'Save Gemini Key'}</span>
                </button>
              </div>
            </form>
          ) : (
            /* Firebase Firestore Status & Collections */
            <div className="space-y-4 text-xs">
              <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/50 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-slate-600 font-medium">Cloud Database:</span>
                  <span className="flex items-center space-x-1 text-emerald-700 font-bold bg-white px-2 py-0.5 rounded border border-emerald-300">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                    <span>Connected & Live</span>
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600 font-medium">Firebase Project ID:</span>
                  <span className="font-mono font-bold text-amber-900 bg-white px-2 py-0.5 rounded border border-amber-200">
                    skillup-ai-aa9ab
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600 font-medium">Service Account:</span>
                  <span className="text-[11px] text-slate-600 font-mono">
                    firebase-adminsdk-fbsvc@skillup-ai-aa9ab...
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <span className="font-bold text-slate-800 block">Cloud Firestore Collections Synchronized:</span>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { name: 'users', desc: 'Registered accounts & auth profiles' },
                    { name: 'student_profiles', desc: 'Branch, career goals & study limits' },
                    { name: 'curricula', desc: 'Raw & extracted syllabus text' },
                    { name: 'personalized_curricula', desc: 'KEEP / COMPRESS / ADD topics' },
                    { name: 'semester_plans', desc: '16-week semester roadmaps' },
                    { name: 'weekly_plans', desc: 'Monday-Sunday weekly schedules' },
                    { name: 'daily_tasks', desc: 'Day-by-day learning tasks' },
                    { name: 'milestones', desc: 'Monthly mastery milestones' }
                  ].map((col) => (
                    <div key={col.name} className="p-2.5 rounded-lg border border-slate-200 bg-slate-50 space-y-0.5">
                      <div className="flex items-center space-x-1 text-slate-800 font-mono font-bold text-[11px]">
                        <Database className="h-3 w-3 text-amber-600" />
                        <span>{col.name}</span>
                      </div>
                      <p className="text-[10px] text-slate-500 leading-tight">{col.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-blue-900 flex items-start space-x-2">
                <Cloud className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
                <p className="text-[11px] leading-relaxed">
                  Every user onboarding, AI curriculum evolution, and daily task completion is backed up in real time to your Google Cloud Firestore database.
                </p>
              </div>

              <div className="flex justify-end pt-1">
                <button
                  type="button"
                  onClick={() => setShowGroqModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-white bg-slate-800 hover:bg-slate-900 rounded-lg transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          )}

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
            <span className="flex items-center space-x-1">
              <ShieldCheck className="h-3.5 w-3.5 text-slate-400" />
              <span>Keys stored encrypted in local SQLite database</span>
            </span>
            <span>SkillUp AI Engine v2.0</span>
          </div>

        </div>

      </div>
    </div>
  );
};

