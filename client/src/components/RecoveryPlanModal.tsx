import React from 'react';
import { Milestone } from '../types';
import { AlertTriangle, CheckCircle2, Clock, Calendar, ArrowRight, X, ShieldAlert } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  milestone: Milestone | null;
  onStartRetest: () => void;
}

export const RecoveryPlanModal: React.FC<Props> = ({
  isOpen,
  onClose,
  milestone,
  onStartRetest
}) => {
  if (!isOpen || !milestone || !milestone.recoveryPlan) return null;

  const plan = milestone.recoveryPlan;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-2xl w-full overflow-hidden max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-600 to-rose-700 p-5 text-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-white/15 border border-white/20">
              <ShieldAlert className="h-5 w-5 text-amber-100" />
            </div>
            <div>
              <h3 className="font-bold text-base font-['Outfit']">Groq Targeted Recovery Plan</h3>
              <p className="text-xs text-amber-100">Month {milestone.month_number}: {milestone.title} (Score: {milestone.score}%)</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-amber-200 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          
          {/* AI Diagnosis */}
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl space-y-1.5">
            <div className="flex items-center space-x-1.5 text-xs font-bold uppercase tracking-wider text-amber-900">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              <span>Diagnostic Assessment:</span>
            </div>
            <p className="text-xs text-slate-700 leading-relaxed pl-5">
              {plan.diagnosis}
            </p>
          </div>

          {/* 3-Day Recovery Days */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Structured 3-Day Remediation Schedule:
            </h4>

            <div className="space-y-3">
              {plan.recoveryDays?.map((day) => (
                <div key={day.day} className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 font-['Outfit']">
                      Day {day.day}: {day.title}
                    </span>
                    <span className="text-[10px] font-semibold text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200 flex items-center space-x-1">
                      <Calendar className="h-3 w-3 text-slate-400" />
                      <span>Remediation Phase</span>
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    {day.tasks?.map((t, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2.5 bg-white rounded-lg border border-slate-200/80 text-xs">
                        <span className="text-slate-700 font-medium">{t.activity}</span>
                        <span className="text-slate-500 font-mono text-[11px] shrink-0 ml-3 flex items-center space-x-1">
                          <Clock className="h-3 w-3 text-slate-400" />
                          <span>{t.durationMinutes} min</span>
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Retest Readiness Criteria */}
          {plan.retestReadyCriteria && plan.retestReadyCriteria.length > 0 && (
            <div className="p-4 bg-blue-50/60 border border-blue-200 rounded-xl space-y-2">
              <span className="text-xs font-bold text-blue-900 font-['Outfit'] flex items-center space-x-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-blue-600" />
                <span>Retest Readiness Criteria:</span>
              </span>
              <ul className="text-xs text-slate-700 space-y-1 list-disc list-inside">
                {plan.retestReadyCriteria.map((crit, idx) => (
                  <li key={idx}>{crit}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Action buttons */}
          <div className="pt-2 flex items-center justify-between border-t border-slate-100">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 border border-slate-200 rounded-lg hover:bg-slate-50"
            >
              Close
            </button>
            <button
              onClick={() => {
                onClose();
                onStartRetest();
              }}
              className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-colors flex items-center space-x-1.5"
            >
              <span>Launch Retest Challenge</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
