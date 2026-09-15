import React, { useState } from 'react';
import { AssessmentData } from '../types';
import { api } from '../services/api';
import { Award, CheckCircle2, XCircle, AlertCircle, X, ArrowRight } from 'lucide-react';
import confetti from 'canvas-confetti';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  assessment: AssessmentData | null;
  onComplete: (score: number, passed: boolean) => void;
}

export const BranchAssessmentModal: React.FC<Props> = ({
  isOpen,
  onClose,
  assessment,
  onComplete
}) => {
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  if (!isOpen || !assessment) return null;

  const currentQ = assessment.questions[currentQIndex];
  const totalQuestions = assessment.questions.length;

  const handleSelectOption = (option: string) => {
    if (isSubmitted) return;
    setSelectedAnswers(prev => ({ ...prev, [currentQ.id]: option }));
  };

  const handleFinish = () => {
    let correct = 0;
    assessment.questions.forEach(q => {
      if (selectedAnswers[q.id] === q.correctAnswer) {
        correct++;
      }
    });

    const calculatedScore = Math.round((correct / totalQuestions) * 100);
    setScore(calculatedScore);
    setIsSubmitted(true);

    if (calculatedScore >= 70) {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    }

    onComplete(calculatedScore, calculatedScore >= 70);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-2xl w-full overflow-hidden max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 p-5 text-white flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2 py-0.5 bg-blue-500/20 text-blue-300 text-[10px] font-bold rounded uppercase border border-blue-400/30">
                {assessment.branch}
              </span>
              <span className="text-xs text-slate-400 font-medium">Difficulty: {assessment.difficulty}</span>
            </div>
            <h3 className="font-bold text-base font-['Outfit'] mt-1">{assessment.title}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          
          {!isSubmitted ? (
            <div className="space-y-5">
              
              {/* Question progress */}
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>Question {currentQIndex + 1} of {totalQuestions}</span>
                <span className="font-mono text-slate-700 font-semibold uppercase">{currentQ.type} question</span>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-slate-100 rounded-full h-1.5">
                <div
                  className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
                  style={{ width: `${((currentQIndex + 1) / totalQuestions) * 100}%` }}
                ></div>
              </div>

              {/* Question statement */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
                <p className="text-sm font-semibold text-slate-900 leading-relaxed font-['Outfit']">
                  {currentQ.question}
                </p>
                {currentQ.context && (
                  <div className="p-2.5 bg-white rounded-lg border border-slate-200 text-xs text-slate-600 font-mono">
                    {currentQ.context}
                  </div>
                )}
              </div>

              {/* Options */}
              <div className="space-y-2">
                {currentQ.options?.map((opt, idx) => {
                  const isSelected = selectedAnswers[currentQ.id] === opt;
                  return (
                    <button
                      key={idx}
                      onClick={() => handleSelectOption(opt)}
                      className={`w-full text-left p-3.5 rounded-xl border text-xs font-medium transition-all flex items-center justify-between ${
                        isSelected
                          ? 'border-blue-500 bg-blue-50/70 text-blue-900 shadow-xs font-semibold'
                          : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <span>{opt}</span>
                      <div className={`h-4 w-4 rounded-full border flex items-center justify-center ${
                        isSelected ? 'border-blue-600 bg-blue-600 text-white' : 'border-slate-300'
                      }`}>
                        {isSelected && <div className="h-1.5 w-1.5 bg-white rounded-full"></div>}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Navigation buttons */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <button
                  type="button"
                  disabled={currentQIndex === 0}
                  onClick={() => setCurrentQIndex(prev => prev - 1)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40"
                >
                  Previous
                </button>

                {currentQIndex < totalQuestions - 1 ? (
                  <button
                    type="button"
                    onClick={() => setCurrentQIndex(prev => prev + 1)}
                    className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors flex items-center space-x-1.5"
                  >
                    <span>Next Question</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleFinish}
                    className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs transition-colors"
                  >
                    Submit Assessment
                  </button>
                )}
              </div>

            </div>
          ) : (
            /* Results Screen */
            <div className="space-y-6 text-center py-4">
              <div className={`h-20 w-20 rounded-full mx-auto flex items-center justify-center border-4 ${
                score >= 70 ? 'border-emerald-500 bg-emerald-50 text-emerald-600' : 'border-amber-500 bg-amber-50 text-amber-600'
              }`}>
                <span className="text-2xl font-extrabold font-['Outfit']">{score}%</span>
              </div>

              <div className="space-y-1">
                <h4 className="font-bold text-lg text-slate-900 font-['Outfit']">
                  {score >= 70 ? 'Assessment Passed!' : 'Reinforcement Needed'}
                </h4>
                <p className="text-xs text-slate-500">
                  {score >= 70
                    ? `Congratulations! You demonstrated strong competence in ${assessment.topic}.`
                    : `Score is below the 70% threshold. SkillUp AI has logged mistakes into your performance history.`}
                </p>
              </div>

              {/* Review answers */}
              <div className="space-y-3 text-left pt-2">
                <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400">Step-by-Step Technical Review:</h5>
                {assessment.questions.map((q, idx) => {
                  const userAns = selectedAnswers[q.id];
                  const isCorrect = userAns === q.correctAnswer;
                  return (
                    <div key={idx} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-1.5 text-xs">
                      <div className="flex items-start justify-between">
                        <span className="font-semibold text-slate-900 leading-snug">{idx + 1}. {q.question}</span>
                        {isCorrect ? (
                          <span className="flex items-center text-emerald-600 font-bold shrink-0 ml-2">
                            <CheckCircle2 className="h-4 w-4 mr-1" /> Correct
                          </span>
                        ) : (
                          <span className="flex items-center text-rose-600 font-bold shrink-0 ml-2">
                            <XCircle className="h-4 w-4 mr-1" /> Incorrect
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-600">
                        <span className="font-semibold">Correct Answer:</span> {q.correctAnswer}
                      </div>
                      <div className="p-2 bg-white rounded border border-slate-200/60 text-[11px] text-slate-600 leading-relaxed">
                        <span className="font-semibold text-blue-700">Explanation:</span> {q.explanation}
                      </div>
                    </div>
                  );
                })}
              </div>

              <button
                onClick={onClose}
                className="px-6 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-800 transition-colors"
              >
                Close & Return to Dashboard
              </button>

            </div>
          )}

        </div>

      </div>
    </div>
  );
};
