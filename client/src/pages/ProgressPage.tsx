import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { EvolvedCurriculum, BacklogTask, Milestone } from '../types';
import {
  TrendingUp,
  Award,
  Inbox,
  Sparkles,
  BookOpen,
  Briefcase,
  RefreshCw,
  ArrowRight
} from 'lucide-react';

export const ProgressPage: React.FC = () => {
  const { profile, setCurrentTab } = useAuth();
  const [curriculum, setCurriculum] = useState<EvolvedCurriculum | null>(null);
  const [backlogData, setBacklogData] = useState<{ tasks: BacklogTask[]; stats: any } | null>(null);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [currRes, backRes, mileRes] = await Promise.all([
        api.getPersonalizedCurriculum().catch(() => null),
        api.getBacklog().catch(() => null),
        api.getMilestones().catch(() => ({ milestones: [] }))
      ]);
      setCurriculum(currRes);
      setBacklogData(backRes);
      setMilestones(mileRes.milestones || []);
    } catch (err) {
      console.error('Failed to load progress data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-3">
        <RefreshCw className="h-7 w-7 text-blue-600 animate-spin mx-auto" />
        <p className="text-xs text-slate-500 font-medium">Calculating engineering progress analytics...</p>
      </div>
    );
  }

  const completedMilestones = milestones.filter(m => m.status === 'Completed').length;
  const careerReadinessScore = Math.min(
    100,
    Math.round(25 + completedMilestones * 20 + (backlogData?.stats?.completed || 0) * 5)
  );

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      
      {/* Header */}
      <div className="pb-4 border-b border-slate-200">
        <div className="flex items-center space-x-2">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
            Performance & Skill-Gap Audit
          </span>
          <span className="text-xs text-slate-400">•</span>
          <span className="text-xs font-semibold text-slate-600">{profile?.branch}</span>
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 mt-1 tracking-tight font-['Outfit']">
          STUDENT PROGRESS & CAREER READINESS
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Tracking your evolution from baseline college syllabus to industry readiness in {profile?.career_goal}.
        </p>
      </div>

      {/* Top 3 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        
        {/* Career Readiness Score */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Career Readiness Index</span>
            <div className="h-9 w-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <Briefcase className="h-4 w-4" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-extrabold text-slate-900 font-['Outfit']">
              {careerReadinessScore}%
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Evaluated against modern {profile?.career_goal} requirements.
            </p>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-700"
              style={{ width: `${careerReadinessScore}%` }}
            ></div>
          </div>
        </div>

        {/* Milestone Completion */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Stages Verified</span>
            <div className="h-9 w-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <Award className="h-4 w-4" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-extrabold text-slate-900 font-['Outfit']">
              {completedMilestones} / {milestones.length || 4}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Monthly mastery milestones passed with ≥70% score.
            </p>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2">
            <div
              className="bg-emerald-500 h-2 rounded-full transition-all duration-700"
              style={{ width: `${milestones.length > 0 ? (completedMilestones / milestones.length) * 100 : 0}%` }}
            ></div>
          </div>
        </div>

        {/* Backlog Health */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Backlog Health</span>
            <div className="h-9 w-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
              <Inbox className="h-4 w-4" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-extrabold text-slate-900 font-['Outfit']">
              {backlogData?.stats?.pending || 0} <span className="text-xs text-slate-400 font-normal">pending</span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {backlogData?.stats?.completed || 0} previously missed tasks successfully recovered!
            </p>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2">
            <div
              className="bg-amber-500 h-2 rounded-full transition-all duration-700"
              style={{ width: `${Math.min(100, ((backlogData?.stats?.completed || 0) / Math.max(1, (backlogData?.stats?.total || 1))) * 100)}%` }}
            ></div>
          </div>
        </div>

      </div>

      {/* Dual Comparative Progress: Academic Core vs Industry Additions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Academic Core Kept & Compressed */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center space-x-2">
              <BookOpen className="h-4 w-4 text-blue-600" />
              <h3 className="font-bold text-base text-slate-900 font-['Outfit']">Academic Foundations (College)</h3>
            </div>
            <span className="text-xs font-semibold text-slate-500">{curriculum?.keep?.length || 0} Core Topics</span>
          </div>

          <p className="text-xs text-slate-500">
            Mandatory engineering requirements preserved and compressed for efficiency.
          </p>

          <div className="space-y-2">
            {curriculum?.keep?.map((k, idx) => (
              <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs flex items-center justify-between">
                <span className="font-semibold text-slate-800 truncate">{k.topic}</span>
                <span className="text-[10px] font-bold text-blue-700 bg-white px-2 py-0.5 rounded border border-slate-200 shrink-0 ml-2">
                  Academic Core
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Industry Additions Learned */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center space-x-2">
              <Sparkles className="h-4 w-4 text-emerald-600" />
              <h3 className="font-bold text-base text-slate-900 font-['Outfit']">Industry Skills Evolved (SkillUp)</h3>
            </div>
            <span className="text-xs font-semibold text-emerald-700">{curriculum?.add?.length || 0} Missing Tools Injected</span>
          </div>

          <p className="text-xs text-slate-500">
            Modern tools and technologies added dynamically by Groq AI that college omitted.
          </p>

          <div className="space-y-2">
            {curriculum?.add?.map((a, idx) => (
              <div key={idx} className="p-3 bg-emerald-50/50 rounded-xl border border-emerald-200 text-xs flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-900">{a.topic}</span>
                  <div className="text-[10px] text-emerald-700 font-medium">{a.industryRelevance}</div>
                </div>
                <span className="text-[10px] font-bold text-emerald-800 bg-white px-2 py-0.5 rounded border border-emerald-200 shrink-0 ml-2">
                  Modern Standard
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Adaptive History Log */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center space-x-2">
            <TrendingUp className="h-4 w-4 text-blue-600" />
            <h3 className="font-bold text-base text-slate-900 font-['Outfit']">Adaptive Learning Loop Status</h3>
          </div>
          <button
            onClick={() => setCurrentTab('home')}
            className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center space-x-1"
          >
            <span>Go to Today's Tasks</span>
            <ArrowRight className="h-3 w-3" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-center text-xs">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-slate-400 block text-[10px] font-bold uppercase">1. Learn</span>
            <span className="font-semibold text-slate-800 mt-1 block">Daily Tasks Completed</span>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-slate-400 block text-[10px] font-bold uppercase">2. Observe</span>
            <span className="font-semibold text-slate-800 mt-1 block">Backlog & Timing Logs</span>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-slate-400 block text-[10px] font-bold uppercase">3. Analyze</span>
            <span className="font-semibold text-slate-800 mt-1 block">Groq Weakness Diagnosis</span>
          </div>
          <div className="p-3 bg-blue-50 text-blue-900 rounded-xl border border-blue-200">
            <span className="text-blue-600 block text-[10px] font-bold uppercase">4. Adapt</span>
            <span className="font-bold text-blue-900 mt-1 block">Next Week Evolved</span>
          </div>
        </div>
      </div>

    </div>
  );
};
