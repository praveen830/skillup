import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { EvolvedCurriculum } from '../types';
import { EvolvingCurriculumVisualizer } from '../components/EvolvingCurriculumVisualizer';
import { Sparkles, RefreshCw, Printer } from 'lucide-react';

export const MyCurriculumPage: React.FC = () => {
  const { profile, setCurrentTab } = useAuth();
  const [curriculum, setCurriculum] = useState<EvolvedCurriculum | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadCurriculum = async () => {
    setIsLoading(true);
    try {
      const data = await api.getPersonalizedCurriculum();
      setCurriculum(data);
    } catch (err) {
      console.error('Failed to load personalized curriculum:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCurriculum();
  }, []);

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-3">
        <RefreshCw className="h-7 w-7 text-blue-600 animate-spin mx-auto" />
        <p className="text-xs text-slate-500 font-medium">Loading your personalized evolving curriculum...</p>
      </div>
    );
  }

  if (!curriculum) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-4">
        <h3 className="text-lg font-bold text-slate-900 font-['Outfit']">No Curriculum Evolved Yet</h3>
        <p className="text-xs text-slate-500">
          Upload your engineering syllabus in onboarding to generate your personalized KEEP, COMPRESS, and ADD topics.
        </p>
        <button
          onClick={() => setCurrentTab('onboarding')}
          className="px-5 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-semibold hover:bg-blue-700"
        >
          Go to Onboarding & Syllabus Upload
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
              Personalized Engineering Roadmap
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs font-semibold text-slate-600">{profile?.branch}</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 mt-1 tracking-tight font-['Outfit']">
            MY EVOLVING CURRICULUM
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            College gives you one curriculum. SkillUp evolves it for YOU.
          </p>
        </div>

        <div className="flex items-center space-x-2 self-start sm:self-auto">
          <button
            onClick={() => window.print()}
            className="px-3 py-2 bg-white text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold hover:bg-slate-50 flex items-center space-x-1.5 shadow-xs"
          >
            <Printer className="h-3.5 w-3.5 text-slate-500" />
            <span>Export / Print</span>
          </button>
          <button
            onClick={() => setCurrentTab('onboarding')}
            className="px-3.5 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 flex items-center space-x-1.5 shadow-xs shadow-blue-500/20"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>Re-Evolve with New Goal</span>
          </button>
        </div>
      </div>

      {/* Visualizer */}
      <EvolvingCurriculumVisualizer
        curriculum={curriculum}
        studentBranch={profile?.branch}
        careerGoal={profile?.career_goal}
        dailyMinutes={profile?.daily_learning_minutes}
      />

    </div>
  );
};
