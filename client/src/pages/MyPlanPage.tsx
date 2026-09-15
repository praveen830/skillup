import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { DailyTask } from '../types';
import {
  Calendar,
  RefreshCw,
  Award
} from 'lucide-react';

export const MyPlanPage: React.FC = () => {
  const { profile } = useAuth();
  const [activeTab, setActiveTab] = useState<'semester' | 'weekly'>('weekly');
  const [semesterPlan, setSemesterPlan] = useState<any | null>(null);
  const [weeklyPlanData, setWeeklyPlanData] = useState<{ weeklyPlan: any; tasks: DailyTask[] } | null>(null);
  const [selectedWeek, setSelectedWeek] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  const loadPlans = async () => {
    setIsLoading(true);
    try {
      const [semRes, weekRes] = await Promise.all([
        api.getSemesterPlan().catch(() => null),
        api.getWeeklyPlan(selectedWeek).catch(() => null)
      ]);
      setSemesterPlan(semRes?.roadmap || null);
      setWeeklyPlanData(weekRes || null);
    } catch (err) {
      console.error('Failed to load plans:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPlans();
  }, [selectedWeek]);

  if (isLoading && !semesterPlan && !weeklyPlanData) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-3">
        <RefreshCw className="h-7 w-7 text-blue-600 animate-spin mx-auto" />
        <p className="text-xs text-slate-500 font-medium">Loading your study plans...</p>
      </div>
    );
  }

  // Group weekly tasks by day
  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const tasksByDay: Record<string, DailyTask[]> = {};
  daysOfWeek.forEach(d => { tasksByDay[d] = []; });

  weeklyPlanData?.tasks?.forEach(t => {
    if (tasksByDay[t.day_name]) {
      tasksByDay[t.day_name].push(t);
    }
  });

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
              {profile?.branch} Study Schedule
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs font-semibold text-slate-600">Daily Cap: {profile?.daily_learning_minutes} min/day</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 mt-1 tracking-tight font-['Outfit']">
            MY STUDY PLAN & ROADMAP
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Structured: Semester ➔ Month ➔ Week ➔ Day. Strict daily time budgeting.
          </p>
        </div>

        {/* View Switcher: Weekly Schedule vs Semester Roadmap */}
        <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('weekly')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'weekly'
                ? 'bg-white text-blue-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Weekly Schedule
          </button>
          <button
            onClick={() => setActiveTab('semester')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'semester'
                ? 'bg-white text-blue-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Semester Roadmap
          </button>
        </div>
      </div>

      {/* WEEKLY SCHEDULE VIEW */}
      {activeTab === 'weekly' && (
        <div className="space-y-6">
          
          {/* Week Selector Banner */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                  Week {weeklyPlanData?.weeklyPlan?.week_number || selectedWeek}
                </span>
                <h2 className="text-lg font-bold text-slate-900 font-['Outfit']">
                  {weeklyPlanData?.weeklyPlan?.title || 'Weekly Learning Schedule'}
                </h2>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                {weeklyPlanData?.weeklyPlan?.adaptive_notes || `Calibrated strictly for ${profile?.daily_learning_minutes} min/day.`}
              </p>
            </div>

            {/* Quick week selector buttons */}
            <div className="flex items-center space-x-1.5 overflow-x-auto pb-1">
              {[1, 2, 3, 4, 5, 6].map((w) => (
                <button
                  key={w}
                  onClick={() => setSelectedWeek(w)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shrink-0 ${
                    selectedWeek === w
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  Week {w}
                </button>
              ))}
            </div>
          </div>

          {/* 7-Day Grid: Monday to Sunday */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {daysOfWeek.map((dayName, idx) => {
              const dayTasks = tasksByDay[dayName] || [];
              const totalMins = dayTasks.reduce((acc, curr) => acc + curr.duration_minutes, 0);

              return (
                <div
                  key={dayName}
                  className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-col justify-between space-y-3 hover:border-slate-300 transition-colors"
                >
                  <div>
                    {/* Day header */}
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                      <span className="font-bold text-sm text-slate-900 font-['Outfit']">{dayName}</span>
                      <span className="text-[11px] font-mono font-medium text-slate-500 bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
                        {totalMins} min total
                      </span>
                    </div>

                    {/* Day Tasks */}
                    <div className="mt-3 space-y-2">
                      {dayTasks.length === 0 ? (
                        <div className="text-[11px] text-slate-400 py-3 text-center italic">
                          Rest or self-directed project drill
                        </div>
                      ) : (
                        dayTasks.map((t) => (
                          <div
                            key={t.id}
                            className={`p-2.5 rounded-xl border text-xs space-y-1.5 ${
                              t.status === 'Completed'
                                ? 'bg-slate-50 border-slate-200 opacity-75'
                                : t.status === 'Missed'
                                ? 'bg-rose-50/50 border-rose-200'
                                : 'bg-white border-slate-200/90'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded border ${
                                t.task_type === 'Theory'
                                  ? 'bg-blue-50 text-blue-700 border-blue-200'
                                  : t.task_type === 'Practice'
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                  : 'bg-purple-50 text-purple-700 border-purple-200'
                              }`}>
                                {t.task_type}
                              </span>
                              <span className="text-[10px] font-mono text-slate-500 font-medium">
                                {t.duration_minutes}m
                              </span>
                            </div>

                            <div className={`font-semibold text-[11px] leading-snug font-['Outfit'] ${
                              t.status === 'Completed' ? 'line-through text-slate-400' : 'text-slate-800'
                            }`}>
                              {t.title}
                            </div>
                            
                            <div className="text-[10px] text-slate-400 truncate">
                              {t.topic}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
                    <span>Day {idx + 1} of 7</span>
                    <span>Budget ≤ {profile?.daily_learning_minutes}m</span>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      )}

      {/* SEMESTER ROADMAP VIEW */}
      {activeTab === 'semester' && (
        <div className="space-y-6">
          
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900 font-['Outfit']">
                16-Week Semester Roadmap (Semester ➔ Month ➔ Week)
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Synthesized by Groq AI integrating college core fundamentals with industry specialization.
              </p>
            </div>
            <span className="text-xs font-mono font-bold text-blue-700 bg-blue-50 px-3 py-1 rounded-lg border border-blue-200">
              16 Weeks Total
            </span>
          </div>

          {/* 4 Months Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {semesterPlan?.months?.map((month: any) => (
              <div
                key={month.month}
                className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4 hover:border-slate-300 transition-colors"
              >
                {/* Month header */}
                <div className="flex items-start justify-between border-b border-slate-100 pb-3">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                      Month {month.month}
                    </span>
                    <h3 className="font-bold text-base text-slate-900 font-['Outfit'] mt-1.5">
                      {month.title}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">{month.focus}</p>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-50 text-slate-400 border border-slate-200 shrink-0">
                    <Calendar className="h-5 w-5" />
                  </div>
                </div>

                {/* Milestone callout */}
                <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-200/80 flex items-center space-x-2 text-xs text-emerald-800">
                  <Award className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span className="font-semibold">Milestone Target:</span>
                  <span className="truncate">{month.milestoneTitle}</span>
                </div>

                {/* Weeks in this month */}
                <div className="space-y-2">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Weeks Breakdown:</span>
                  <div className="grid grid-cols-1 gap-2">
                    {month.weeks?.map((w: any) => (
                      <div
                        key={w.week}
                        className="p-3 rounded-xl border border-slate-200/80 bg-slate-50/50 hover:bg-white text-xs space-y-1 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-900 font-['Outfit']">Week {w.week}: {w.theme}</span>
                        </div>
                        <div className="text-[11px] text-slate-500">
                          <span className="font-medium text-slate-600">Key Focus:</span> {w.keyTopics?.join(', ')}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            ))}
          </div>

        </div>
      )}

    </div>
  );
};
