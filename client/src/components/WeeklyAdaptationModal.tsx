import React, { useState } from 'react';
import { api } from '../services/api';
import { Sparkles, CheckCircle2, AlertTriangle, RefreshCw, X, BrainCircuit } from 'lucide-react';
import confetti from 'canvas-confetti';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onAdaptationComplete: () => void;
  currentWeekNumber?: number;
}

export const WeeklyAdaptationModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onAdaptationComplete,
  currentWeekNumber = 1
}) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleTriggerAdaptation = async () => {
    setIsAnalyzing(true);
    setError(null);
    try {
      const data = await api.adaptWeekReview();
      setResult(data.adaptationResult);
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.6 }
      });
      onAdaptationComplete();
    } catch (err: any) {
      setError(err.message || 'Failed to adapt weekly plan');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-2xl w-full overflow-hidden max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-700 to-indigo-800 p-5 text-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-white/15 border border-white/20">
              <BrainCircuit className="h-5 w-5 text-blue-100" />
            </div>
            <div>
              <h3 className="font-bold text-base font-['Outfit']">Groq Weekly AI Adaptation</h3>
              <p className="text-xs text-blue-100">Learn ➔ Observe ➔ Analyze ➔ Adapt ➔ Learn Again</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-blue-200 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          
          {!result ? (
            <div className="space-y-4 text-center py-6">
              <div className="h-16 w-16 bg-blue-50 text-blue-600 rounded-2xl border border-blue-100 flex items-center justify-center mx-auto">
                <Sparkles className="h-8 w-8 animate-pulse" />
              </div>
              <div className="max-w-md mx-auto space-y-1">
                <h4 className="font-bold text-base text-slate-900 font-['Outfit']">
                  Ready to adapt Week {currentWeekNumber + 1}?
                </h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Groq will audit your completed tasks, backlog items, and consistency. It will never copy last week's schedule—it customizes the next week to address any weaknesses while advancing your career competencies.
                </p>
              </div>

              {error && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-800">
                  {error}
                </div>
              )}

              <button
                onClick={handleTriggerAdaptation}
                disabled={isAnalyzing}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 transition-all flex items-center space-x-2 mx-auto disabled:opacity-50"
              >
                {isAnalyzing ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    <span>Groq is analyzing your week...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    <span>Run AI Weekly Adaptation</span>
                  </>
                )}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              
              {/* Summary */}
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl text-xs space-y-2">
                <div className="flex items-center space-x-2 text-blue-900 font-bold font-['Outfit'] text-sm">
                  <CheckCircle2 className="h-4 w-4 text-blue-600" />
                  <span>Performance Analysis & Adaptive Synthesis</span>
                </div>
                <p className="text-slate-700 leading-relaxed">
                  {result.performanceSummary}
                </p>
              </div>

              {/* Strengths and Weaknesses Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 flex items-center space-x-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                    <span>Demonstrated Strengths</span>
                  </span>
                  <ul className="text-xs text-slate-700 space-y-1 list-disc list-inside">
                    {result.strengthsIdentified?.map((s: string, idx: number) => (
                      <li key={idx} className="leading-snug">{s}</li>
                    ))}
                  </ul>
                </div>

                <div className="p-3.5 bg-amber-50/70 border border-amber-200 rounded-xl space-y-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800 flex items-center space-x-1.5">
                    <AlertTriangle className="h-3.5 w-3.5 text-amber-600" />
                    <span>Identified Reinforcement Needs</span>
                  </span>
                  <ul className="text-xs text-slate-700 space-y-1 list-disc list-inside">
                    {result.weaknessesIdentified?.map((w: string, idx: number) => (
                      <li key={idx} className="leading-snug">{w}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Action Taken Explanation */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1">
                <div className="font-bold text-slate-900 font-['Outfit']">How SkillUp Adapted Week {currentWeekNumber + 1}:</div>
                <p className="text-slate-600 leading-relaxed">
                  "{result.adaptiveActionTaken}"
                </p>
              </div>

              {/* Rescheduled Backlog Items */}
              {result.rescheduledBacklog?.length > 0 && (
                <div className="space-y-1.5">
                  <div className="text-xs font-semibold text-slate-700">Backlog Items Rescheduled Into Next Week:</div>
                  <div className="space-y-1">
                    {result.rescheduledBacklog.map((item: any, idx: number) => (
                      <div key={idx} className="flex items-center justify-between px-3 py-2 bg-white rounded-lg border border-slate-200 text-xs">
                        <span className="font-medium text-slate-800 truncate">{item.title}</span>
                        <div className="flex items-center space-x-2 shrink-0">
                          <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                            {item.scheduledDay}
                          </span>
                          <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                            {item.priority} Priority
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-2 flex justify-end space-x-3">
                <button
                  onClick={onClose}
                  className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-800 transition-colors"
                >
                  View Adapted Week {currentWeekNumber + 1} Plan
                </button>
              </div>

            </div>
          )}

        </div>

      </div>
    </div>
  );
};
