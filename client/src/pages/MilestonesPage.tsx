import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Milestone, AssessmentData } from '../types';
import { BranchAssessmentModal } from '../components/BranchAssessmentModal';
import { RecoveryPlanModal } from '../components/RecoveryPlanModal';
import {
  Award,
  Lock,
  CheckCircle2,
  AlertTriangle,
  PlayCircle,
  RefreshCw,
  Sparkles,
  ShieldCheck,
  RotateCcw
} from 'lucide-react';

export const MilestonesPage: React.FC = () => {
  const { profile } = useAuth();
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Assessment & Recovery Modals
  const [activeAssessment, setActiveAssessment] = useState<AssessmentData | null>(null);
  const [activeMilestoneId, setActiveMilestoneId] = useState<string | null>(null);
  const [showAssessmentModal, setShowAssessmentModal] = useState(false);
  const [recoveryMilestone, setRecoveryMilestone] = useState<Milestone | null>(null);
  const [showRecoveryModal, setShowRecoveryModal] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const loadMilestones = async () => {
    setIsLoading(true);
    try {
      const res = await api.getMilestones();
      setMilestones(res.milestones || []);
    } catch (err) {
      console.error('Failed to load milestones:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadMilestones();
  }, []);

  const handleStartMilestoneChallenge = async (milestone: Milestone) => {
    setIsGenerating(true);
    setActiveMilestoneId(milestone.id);
    try {
      const primaryTopic = milestone.requiredTopics?.[0] || 'Core Engineering Principles';
      const assessmentData = await api.getAssessment(primaryTopic);
      setActiveAssessment(assessmentData);
      setShowAssessmentModal(true);
    } catch (err) {
      console.error('Failed to load assessment:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAssessmentComplete = async (score: number, passed: boolean) => {
    if (!activeMilestoneId) return;

    try {
      const res = await api.submitMilestone(activeMilestoneId, score);
      await loadMilestones();

      if (!passed && res.recoveryPlan) {
        // Automatically prompt recovery plan
        const updated = await api.getMilestones();
        const found = updated.milestones.find(m => m.id === activeMilestoneId);
        if (found) {
          setRecoveryMilestone(found);
          setShowRecoveryModal(true);
        }
      }
    } catch (err) {
      console.error('Failed to submit milestone:', err);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-3">
        <RefreshCw className="h-7 w-7 text-blue-600 animate-spin mx-auto" />
        <p className="text-xs text-slate-500 font-medium">Loading engineering milestones...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      
      {/* Page Header */}
      <div className="pb-4 border-b border-slate-200">
        <div className="flex items-center space-x-2">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
            Stage Verification & Gateways
          </span>
          <span className="text-xs text-slate-400">•</span>
          <span className="text-xs font-semibold text-slate-600">{profile?.branch}</span>
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 mt-1 tracking-tight font-['Outfit']">
          MONTHLY MILESTONES & RECOVERY
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Pass monthly milestones to unlock the next stage. If you fall short, Groq constructs a 3-day recovery plan and retest.
        </p>
      </div>

      {/* Stage Progression Pipeline */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {milestones.map((m) => {
          const isCompleted = m.status === 'Completed';
          const isRecovery = m.status === 'Recovery';
          const isAvailable = m.status === 'Available';

          return (
            <div
              key={m.id}
              className={`rounded-2xl p-5 border flex flex-col justify-between transition-all space-y-4 ${
                isCompleted
                  ? 'bg-emerald-50/50 border-emerald-300 shadow-xs'
                  : isRecovery
                  ? 'bg-amber-50/50 border-amber-300 shadow-xs'
                  : isAvailable
                  ? 'bg-white border-blue-300 shadow-md ring-1 ring-blue-200'
                  : 'bg-slate-50 border-slate-200 opacity-60'
              }`}
            >
              <div>
                {/* Header tag */}
                <div className="flex items-center justify-between mb-3">
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
                    isCompleted
                      ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                      : isRecovery
                      ? 'bg-amber-100 text-amber-800 border-amber-300'
                      : isAvailable
                      ? 'bg-blue-100 text-blue-800 border-blue-300'
                      : 'bg-slate-200 text-slate-600 border-slate-300'
                  }`}>
                    Stage {m.month_number}
                  </span>

                  {isCompleted ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  ) : isRecovery ? (
                    <AlertTriangle className="h-4 w-4 text-amber-600" />
                  ) : isAvailable ? (
                    <Award className="h-4 w-4 text-blue-600 animate-pulse" />
                  ) : (
                    <Lock className="h-4 w-4 text-slate-400" />
                  )}
                </div>

                <h3 className="font-bold text-sm text-slate-900 font-['Outfit']">{m.title}</h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">{m.description}</p>

                {/* Score badge if evaluated */}
                {m.score > 0 && (
                  <div className="mt-3 flex items-center justify-between text-xs p-2 bg-white rounded-lg border border-slate-200">
                    <span className="text-slate-500">Recorded Score:</span>
                    <span className={`font-mono font-bold ${m.score >= 70 ? 'text-emerald-600' : 'text-amber-600'}`}>
                      {m.score}%
                    </span>
                  </div>
                )}
              </div>

              {/* Action Button */}
              <div className="pt-3 border-t border-slate-200/70">
                {isCompleted ? (
                  <div className="flex items-center justify-center space-x-1 text-xs text-emerald-700 font-semibold py-1">
                    <ShieldCheck className="h-4 w-4" />
                    <span>Stage Verified & Unlocked</span>
                  </div>
                ) : isRecovery ? (
                  <button
                    onClick={() => {
                      setRecoveryMilestone(m);
                      setShowRecoveryModal(true);
                    }}
                    className="w-full py-2 px-3 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center justify-center space-x-1.5 cursor-pointer"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    <span>View 3-Day Recovery Plan</span>
                  </button>
                ) : isAvailable ? (
                  <button
                    disabled={isGenerating}
                    onClick={() => handleStartMilestoneChallenge(m)}
                    className="w-full py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center justify-center space-x-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <PlayCircle className="h-3.5 w-3.5" />
                    <span>{isGenerating ? 'Generating...' : 'Take Milestone Challenge'}</span>
                  </button>
                ) : (
                  <div className="text-center text-xs text-slate-400 py-1 flex items-center justify-center space-x-1">
                    <Lock className="h-3 w-3" />
                    <span>Complete Month {m.month_number - 1} First</span>
                  </div>
                )}
              </div>

            </div>
          );
        })}
      </div>

      {/* Philosophy Callout Card */}
      <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-2 text-xs text-slate-600 leading-relaxed">
        <h4 className="font-bold text-slate-900 font-['Outfit'] text-sm flex items-center space-x-2">
          <Sparkles className="h-4 w-4 text-blue-600" />
          <span>The SkillUp Progression Rule: No Student Left Behind</span>
        </h4>
        <p>
          In conventional colleges, students often pass courses with blind spots that hurt them in technical job interviews. SkillUp AI enforces mastery gateways: if you score below 70%, you do not simply move ahead blindly. The AI creates a targeted 3-day recovery plan and a fresh retest, guaranteeing conceptual confidence.
        </p>
      </div>

      {/* Assessment Modal */}
      <BranchAssessmentModal
        isOpen={showAssessmentModal}
        onClose={() => setShowAssessmentModal(false)}
        assessment={activeAssessment}
        onComplete={handleAssessmentComplete}
      />

      {/* Recovery Plan Modal */}
      <RecoveryPlanModal
        isOpen={showRecoveryModal}
        onClose={() => setShowRecoveryModal(false)}
        milestone={recoveryMilestone}
        onStartRetest={() => {
          if (recoveryMilestone) {
            handleStartMilestoneChallenge(recoveryMilestone);
          }
        }}
      />

    </div>
  );
};
