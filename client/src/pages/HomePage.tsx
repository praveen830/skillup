import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { TodayOverview, BacklogTask } from '../types';
import { WeeklyAdaptationModal } from '../components/WeeklyAdaptationModal';
import {
  Clock,
  Award,
  ArrowRight,
  TrendingUp,
  Inbox,
  RefreshCw,
  ChevronRight,
  ListTodo,
  Sparkles
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const HomePage: React.FC = () => {
  const { profile, setCurrentTab } = useAuth();
  const [overview, setOverview] = useState<TodayOverview | null>(null);
  const [backlogTasks, setBacklogTasks] = useState<BacklogTask[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [updatingTaskId, setUpdatingTaskId] = useState<string | null>(null);
  const [showAdaptationModal, setShowAdaptationModal] = useState(false);
  const [showBacklogSection, setShowBacklogSection] = useState(false);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [todayData, backlogData] = await Promise.all([
        api.getTodayOverview(),
        api.getBacklog()
      ]);
      setOverview(todayData);
      setBacklogTasks(backlogData.tasks || []);
    } catch (err) {
      console.error('Failed to load home data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleTaskStatusChange = async (taskId: string, newStatus: string) => {
    setUpdatingTaskId(taskId);
    try {
      await api.updateTaskStatus(taskId, newStatus);
      if (newStatus === 'Completed') {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.7 }
        });
      }
      await loadData();
    } catch (err) {
      console.error('Failed to update task:', err);
    } finally {
      setUpdatingTaskId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-3">
        <RefreshCw className="h-7 w-7 text-blue-600 animate-spin mx-auto" />
        <p className="text-xs text-slate-500 font-medium">Loading your personalized daily schedule...</p>
      </div>
    );
  }

  if (!overview) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-4">
        <h3 className="text-lg font-bold text-slate-900 font-['Outfit']">No Active Schedule Found</h3>
        <p className="text-xs text-slate-500">
          Upload your syllabus and set your goals in Onboarding to start your dynamic curriculum.
        </p>
        <button
          onClick={() => setCurrentTab('onboarding')}
          className="px-5 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-semibold hover:bg-blue-700"
        >
          Go to Onboarding
        </button>
      </div>
    );
  }

  const timeUsedPercent = Math.min(
    100,
    Math.round((overview.todayCompletedMinutes / overview.dailyBudgetMinutes) * 100)
  );

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      
      {/* Flagship Question Banner: "WHAT SHOULD I LEARN TODAY?" */}
      <div className="bg-gradient-to-r from-blue-700 to-indigo-800 rounded-2xl p-6 sm:p-8 text-white shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-[11px] font-bold uppercase tracking-wider text-blue-100">
              {overview.dayName} Focus
            </span>
            <span className="text-xs text-blue-200 font-medium">
              {profile?.branch} • {profile?.career_goal}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-['Outfit']">
            WHAT SHOULD I LEARN TODAY?
          </h1>

          <div className="flex items-center space-x-2 text-xs text-blue-100">
            <span className="font-semibold text-white">Today's Priority:</span>
            <span className="bg-white/15 px-2.5 py-1 rounded-md border border-white/20 font-medium">
              {overview.priorityTopic}
            </span>
          </div>
        </div>

        {/* Daily Time Budget Progress */}
        <div className="bg-white/10 backdrop-blur-xs rounded-xl p-4 border border-white/20 sm:min-w-[240px] space-y-2.5">
          <div className="flex items-center justify-between text-xs">
            <span className="flex items-center space-x-1.5 text-blue-100 font-medium">
              <Clock className="h-4 w-4" />
              <span>Today's Time</span>
            </span>
            <span className="font-bold text-white font-mono">
              {overview.todayCompletedMinutes} / {overview.dailyBudgetMinutes} min
            </span>
          </div>

          <div className="w-full bg-white/20 rounded-full h-2">
            <div
              className="bg-white h-2 rounded-full transition-all duration-500"
              style={{ width: `${timeUsedPercent}%` }}
            ></div>
          </div>

          <p className="text-[10px] text-blue-200 text-right">
            Calibrated to your {overview.dailyBudgetMinutes}m/day limit
          </p>
        </div>
      </div>

      {/* Metrics Row: Weekly Progress, Backlog Count, Next Milestone */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        {/* Weekly Progress */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 font-medium">Week {overview.weeklyProgress.weekNumber} Progress</span>
            <div className="text-xl font-extrabold text-slate-900 font-['Outfit'] mt-0.5">
              {overview.weeklyProgress.percent}%
            </div>
            <span className="text-[11px] text-slate-400">
              {overview.weeklyProgress.completedTasks} of {overview.weeklyProgress.totalTasks} tasks done
            </span>
          </div>
          <div className="h-10 w-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <TrendingUp className="h-5 w-5" />
          </div>
        </div>

        {/* Backlog Alert */}
        <div
          onClick={() => setShowBacklogSection(!showBacklogSection)}
          className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between cursor-pointer hover:border-slate-300 transition-colors"
        >
          <div>
            <span className="text-xs text-slate-500 font-medium">Active Backlog</span>
            <div className="text-xl font-extrabold text-slate-900 font-['Outfit'] mt-0.5">
              {overview.backlogCount} <span className="text-xs font-normal text-slate-400">missed items</span>
            </div>
            <span className="text-[11px] text-blue-600 font-semibold flex items-center">
              <span>{showBacklogSection ? 'Hide backlog' : 'Review backlog'}</span>
              <ChevronRight className="h-3 w-3 ml-0.5" />
            </span>
          </div>
          <div className={`h-10 w-10 rounded-xl flex items-center justify-center font-bold ${
            overview.backlogCount > 0 ? 'bg-amber-50 text-amber-600' : 'bg-slate-50 text-slate-400'
          }`}>
            <Inbox className="h-5 w-5" />
          </div>
        </div>

        {/* Next Milestone */}
        <div
          onClick={() => setCurrentTab('milestones')}
          className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between cursor-pointer hover:border-slate-300 transition-colors"
        >
          <div>
            <span className="text-xs text-slate-500 font-medium">Next Milestone</span>
            <div className="text-sm font-bold text-slate-900 font-['Outfit'] mt-0.5 truncate max-w-[170px]">
              {overview.nextMilestone?.title || 'Month 1 Milestone'}
            </div>
            <span className="text-[11px] text-emerald-600 font-semibold flex items-center">
              <span>Stage {overview.nextMilestone?.month || 1} Assessment</span>
              <ArrowRight className="h-3 w-3 ml-0.5" />
            </span>
          </div>
          <div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <Award className="h-5 w-5" />
          </div>
        </div>

      </div>

      {/* Backlog Quick Section (Expandable) */}
      {showBacklogSection && (
        <div className="bg-amber-50/50 border border-amber-200/80 rounded-2xl p-5 space-y-3 animate-in fade-in duration-150">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-xs font-bold text-amber-900 uppercase tracking-wider">
              <Inbox className="h-4 w-4 text-amber-600" />
              <span>Backlog Management (Automatically Captured Missed Tasks)</span>
            </div>
            <span className="text-[11px] text-amber-700">Groq reprioritizes backlog into your adaptive weekly schedules</span>
          </div>

          {backlogTasks.length === 0 ? (
            <p className="text-xs text-slate-500 py-2">No pending backlog! All tasks are up to date.</p>
          ) : (
            <div className="space-y-2">
              {backlogTasks.map((item) => (
                <div key={item.id} className="p-3 bg-white rounded-xl border border-slate-200 text-xs flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-slate-900">{item.title}</div>
                    <div className="text-[11px] text-slate-500">{item.topic} • {item.reason}</div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                      {item.priority} Priority
                    </span>
                    <span className="text-xs font-mono text-slate-600">{item.duration_minutes}m</span>
                    <button
                      onClick={() => handleTaskStatusChange(item.original_task_id, 'Completed')}
                      className="px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-[11px] font-semibold hover:bg-emerald-100"
                    >
                      Mark Done
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Today's Tasks Section */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-5">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-3">
          <div>
            <h2 className="text-lg font-bold text-slate-900 font-['Outfit'] flex items-center space-x-2">
              <ListTodo className="h-5 w-5 text-blue-600" />
              <span>Today's Learning Tasks</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Complete each task to stay on track with your target career milestone.
            </p>
          </div>

          {/* Trigger End-of-Week AI Adaptation */}
          <button
            onClick={() => setShowAdaptationModal(true)}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 bg-blue-50 text-blue-700 border border-blue-200 rounded-xl text-xs font-semibold hover:bg-blue-100 transition-colors self-start sm:self-auto"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>Weekly AI Adaptation Review</span>
          </button>
        </div>

        {/* Task Cards List */}
        <div className="space-y-3">
          {overview.tasks?.length === 0 ? (
            <p className="text-xs text-slate-500 py-4 text-center">No tasks scheduled for today.</p>
          ) : (
            overview.tasks.map((task) => {
              const isUpdating = updatingTaskId === task.id;
              return (
                <div
                  key={task.id}
                  className={`p-4 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    task.status === 'Completed'
                      ? 'bg-slate-50/80 border-slate-200 opacity-80'
                      : task.status === 'Missed'
                      ? 'bg-rose-50/40 border-rose-200'
                      : 'bg-white border-slate-200 hover:border-slate-300 shadow-xs'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
                        task.task_type === 'Theory'
                          ? 'bg-blue-50 text-blue-700 border-blue-200'
                          : task.task_type === 'Practice'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : task.task_type === 'Assessment'
                          ? 'bg-purple-50 text-purple-700 border-purple-200'
                          : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}>
                        {task.task_type}
                      </span>
                      <span className="text-xs font-semibold text-slate-500 truncate max-w-xs">{task.topic}</span>
                    </div>

                    <h3 className={`text-sm font-bold font-['Outfit'] ${
                      task.status === 'Completed' ? 'line-through text-slate-400' : 'text-slate-900'
                    }`}>
                      {task.title}
                    </h3>
                  </div>

                  {/* Right side: Duration + Status Selector */}
                  <div className="flex items-center space-x-3 shrink-0">
                    <span className="flex items-center space-x-1 text-xs font-mono font-medium text-slate-600 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200">
                      <Clock className="h-3.5 w-3.5 text-slate-400" />
                      <span>{task.duration_minutes} min</span>
                    </span>

                    {/* Status Toggle Buttons */}
                    <div className="flex items-center space-x-1">
                      <button
                        disabled={isUpdating}
                        onClick={() => handleTaskStatusChange(task.id, 'Completed')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                          task.status === 'Completed'
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : 'bg-slate-100 text-slate-600 hover:bg-emerald-50 hover:text-emerald-700 border border-slate-200'
                        }`}
                      >
                        Completed
                      </button>

                      <button
                        disabled={isUpdating}
                        onClick={() => handleTaskStatusChange(task.id, 'In Progress')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                          task.status === 'In Progress'
                            ? 'bg-blue-600 text-white shadow-xs'
                            : 'bg-slate-100 text-slate-600 hover:bg-blue-50 hover:text-blue-700 border border-slate-200'
                        }`}
                      >
                        In Progress
                      </button>

                      <button
                        disabled={isUpdating}
                        onClick={() => handleTaskStatusChange(task.id, 'Missed')}
                        title="Marks task as missed and automatically transfers it to your Backlog"
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                          task.status === 'Missed'
                            ? 'bg-rose-600 text-white shadow-xs'
                            : 'bg-slate-100 text-slate-600 hover:bg-rose-50 hover:text-rose-700 border border-slate-200'
                        }`}
                      >
                        Missed
                      </button>
                    </div>

                  </div>

                </div>
              );
            })
          )}
        </div>

      </div>

      {/* Modal for Weekly Adaptation */}
      <WeeklyAdaptationModal
        isOpen={showAdaptationModal}
        onClose={() => setShowAdaptationModal(false)}
        onAdaptationComplete={loadData}
        currentWeekNumber={overview.weeklyProgress.weekNumber}
      />

    </div>
  );
};
