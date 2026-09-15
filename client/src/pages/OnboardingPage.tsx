import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import {
  Sparkles,
  BookOpen,
  Clock,
  Briefcase,
  Upload,
  CheckCircle2,
  ArrowRight,
  BrainCircuit,
  GraduationCap,
  Loader2,
  FileCheck2,
  Target
} from 'lucide-react';
import confetti from 'canvas-confetti';

const BRANCH_OPTIONS = [
  'Mechanical Engineering',
  'Civil Engineering',
  'Electronics & Communication',
  'Computer Science & Engineering',
  'Electrical & Electronics',
  'Aerospace Engineering',
  'Chemical Engineering',
  'Automobile Engineering',
  'Mechatronics Engineering',
  'Biotechnology',
  'AI & Data Science',
  'Other Engineering Branch'
];

const TIME_OPTIONS = [
  { minutes: 30, label: '30 minutes / day', desc: 'Focused bite-sized pace' },
  { minutes: 60, label: '60 minutes / day', desc: 'Recommended balanced pace' },
  { minutes: 120, label: '120 minutes (2 hrs) / day', desc: 'Accelerated skill builder' },
  { minutes: 180, label: '3 hours / day', desc: 'Intensive career transition' },
  { minutes: 240, label: '4 hours / day', desc: 'Immersive engineering mastery' }
];

export const OnboardingPage: React.FC = () => {
  const { profile, refreshUser, setCurrentTab } = useAuth();
  
  // Form State - Starts completely clean with ZERO pre-existing or mock data!
  const [branch, setBranch] = useState(profile?.branch || 'Computer Science & Engineering');
  const [customBranch, setCustomBranch] = useState('');
  const [yearSemester, setYearSemester] = useState(profile?.year_semester || 'Semester 5');
  const [careerGoal, setCareerGoal] = useState(profile?.career_goal || '');
  const [interests, setInterests] = useState(profile?.interests || '');
  const [currentSkills, setCurrentSkills] = useState(profile?.current_skills || '');
  const [dailyMinutes, setDailyMinutes] = useState<number>(profile?.daily_learning_minutes || 60);

  // Curriculum State
  const [rawText, setRawText] = useState('');
  const [fileName, setFileName] = useState('');
  const [isExtractingPdf, setIsExtractingPdf] = useState(false);
  const [pdfExtractionSuccess, setPdfExtractionSuccess] = useState<string | null>(null);

  // Loading & Progress State
  const [isProcessing, setIsProcessing] = useState(false);
  const [progressStep, setProgressStep] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    setErrorMessage(null);
    setPdfExtractionSuccess(null);

    // If PDF file, use server-side pdf-parse to extract real text!
    if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
      setIsExtractingPdf(true);
      try {
        const data = await api.extractPdf(file);
        setRawText(data.extractedText);
        setPdfExtractionSuccess(`Successfully extracted ${data.characterCount.toLocaleString()} characters from "${file.name}"`);
      } catch (err: any) {
        setErrorMessage(err.message || 'Failed to parse PDF. You can paste the syllabus text directly.');
      } finally {
        setIsExtractingPdf(false);
      }
    } else {
      // Plain text or markdown
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        setRawText(content);
        setPdfExtractionSuccess(`Loaded ${content.length.toLocaleString()} characters from text file.`);
      };
      reader.readAsText(file);
    }
  };

  const steps = [
    'AI parsing college syllabus & identifying degree accreditation requirements...',
    'Analyzing your baseline skills & interests to isolate exactly 2-3 focused semester skills...',
    'Evolving KEEP, COMPRESS, and ADD topics with explicit engineering rationales...',
    'Synthesizing structured 16-week semester roadmap (Semester ➔ Month ➔ Week)...',
    'Calibrating day-by-day tasks strictly within your daily study minutes limit...'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rawText || rawText.trim().length < 20) {
      setErrorMessage('Please provide a college curriculum text or upload a syllabus PDF/file.');
      return;
    }

    const resolvedBranch = branch === 'Other Engineering Branch' && customBranch ? customBranch : branch;

    setIsProcessing(true);
    setErrorMessage(null);
    setProgressStep(0);

    // Simulate animated progress steps
    const interval = setInterval(() => {
      setProgressStep((prev) => (prev < 4 ? prev + 1 : prev));
    }, 1200);

    try {
      await api.uploadAndEvolveCurriculum({
        rawText,
        branch: resolvedBranch,
        semester: yearSemester,
        fileName,
        profileData: {
          branch: resolvedBranch,
          year_semester: yearSemester,
          career_goal: careerGoal,
          interests,
          current_skills: currentSkills,
          daily_learning_minutes: dailyMinutes
        }
      });

      clearInterval(interval);
      confetti({ particleCount: 100, spread: 80, origin: { y: 0.5 } });
      await refreshUser();
      setCurrentTab('curriculum');
    } catch (err: any) {
      clearInterval(interval);
      setIsProcessing(false);
      setErrorMessage(err.message || 'Failed to evolve curriculum with Groq AI');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 space-y-8">
      
      {/* Title */}
      <div className="text-center space-y-2">
        <span className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-bold uppercase tracking-wider rounded-full border border-blue-200/60">
          Tailored For Any Engineering Discipline
        </span>
        <h1 className="text-3xl font-extrabold text-slate-900 font-['Outfit']">
          Tell SkillUp What You Want To Become
        </h1>
        <p className="text-sm text-slate-500 max-w-xl mx-auto">
          Upload your college syllabus PDF or paste text. The AI will analyze your actual syllabus, current skills, and interests to recommend <strong>only 2–3 targeted skills</strong> this semester with a structured weekly schedule.
        </p>
      </div>

      {/* Realistic Pacing Highlight Banner */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-2xl border border-blue-200/80 flex items-start space-x-3 text-xs text-slate-700">
        <Target className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-slate-900 font-['Outfit']">Realistic Semester Pacing Guaranteed:</span>
          <p className="text-slate-600 mt-0.5 leading-relaxed">
            Unlike generic course sites that dump dozens of technologies at once, SkillUp AI limits your semester additions to <strong>exactly 2 to 3 high-impact industry skills</strong>, sequenced progressively across 4 months so you achieve true mastery alongside your college coursework.
          </p>
        </div>
      </div>

      {/* Zero Pre-Existing Mock Data Assurance */}
      <div className="bg-emerald-50/60 p-4 rounded-2xl border border-emerald-200/80 flex items-start space-x-3 text-xs text-emerald-900">
        <Sparkles className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold font-['Outfit']">100% AI Extracted from Your Syllabus:</span>
          <p className="text-emerald-800 mt-0.5 leading-relaxed">
            There is zero pre-existing or hardcoded mock data. Every subject, unit, and chapter is dynamically extracted from your uploaded syllabus PDF or pasted text using Groq AI (with automatic Google Gemini fallback).
          </p>
        </div>
      </div>

      {/* Onboarding Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-8">
        
        {/* Section 1: Academic & Career Profile */}
        <div className="space-y-4">
          <h3 className="text-base font-bold text-slate-900 font-['Outfit'] border-b border-slate-100 pb-2 flex items-center space-x-2">
            <GraduationCap className="h-4 w-4 text-blue-600" />
            <span>1. Academic & Career Personalization</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Branch */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Engineering Branch
              </label>
              <select
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
                className="w-full text-xs p-2.5 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {BRANCH_OPTIONS.map((b) => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
              {branch === 'Other Engineering Branch' && (
                <input
                  type="text"
                  value={customBranch}
                  onChange={(e) => setCustomBranch(e.target.value)}
                  placeholder="Enter your specific engineering discipline"
                  className="mt-2 w-full text-xs p-2.5 bg-white border border-slate-300 rounded-lg"
                />
              )}
            </div>

            {/* Year / Semester */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Current Year / Semester
              </label>
              <input
                type="text"
                value={yearSemester}
                onChange={(e) => setYearSemester(e.target.value)}
                placeholder="e.g. 3rd Year / Semester 5"
                className="w-full text-xs p-2.5 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

          </div>

          {/* Career Goal */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Target Career Goal (The role or industry you want to enter)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Briefcase className="h-4 w-4" />
              </div>
              <input
                type="text"
                required
                value={careerGoal}
                onChange={(e) => setCareerGoal(e.target.value)}
                placeholder="e.g. EV Powertrain Engineer, BIM Infrastructure Specialist, Embedded Edge AI"
                className="w-full pl-9 pr-3 py-2.5 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Groq AI uses this to filter and prioritize the 2-3 most essential industry skills.
            </p>
          </div>

          {/* Areas of Interest & Current Skills */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Areas of Interest
              </label>
              <input
                type="text"
                value={interests}
                onChange={(e) => setInterests(e.target.value)}
                placeholder="e.g. Battery Tech, Aerodynamics, Microcontrollers"
                className="w-full text-xs p-2.5 bg-white border border-slate-300 rounded-lg"
              />
              <p className="text-[10px] text-slate-400 mt-0.5">AI matches your 2-3 semester skills to these interests.</p>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Current Skills (Your Baseline)
              </label>
              <input
                type="text"
                value={currentSkills}
                onChange={(e) => setCurrentSkills(e.target.value)}
                placeholder="e.g. SolidWorks Basics, C Programming, AutoCAD 2D"
                className="w-full text-xs p-2.5 bg-white border border-slate-300 rounded-lg"
              />
              <p className="text-[10px] text-slate-400 mt-0.5">AI builds upon these stepping stones rather than repeating what you know.</p>
            </div>
          </div>

        </div>

        {/* Section 2: Daily Learning Time */}
        <div className="space-y-4">
          <div className="border-b border-slate-100 pb-2 flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 font-['Outfit'] flex items-center space-x-2">
              <Clock className="h-4 w-4 text-blue-600" />
              <span>2. Available Daily Learning Time</span>
            </h3>
            <span className="text-xs text-blue-600 font-semibold">Strictly Enforced on Daily Tasks</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {TIME_OPTIONS.map((opt) => {
              const isSelected = dailyMinutes === opt.minutes;
              return (
                <button
                  type="button"
                  key={opt.minutes}
                  onClick={() => setDailyMinutes(opt.minutes)}
                  className={`p-3.5 rounded-xl border text-left transition-all ${
                    isSelected
                      ? 'border-blue-600 bg-blue-50/70 text-blue-900 shadow-xs'
                      : 'border-slate-200 bg-white hover:border-slate-300 text-slate-700'
                  }`}
                >
                  <span className="font-extrabold text-sm block font-['Outfit']">{opt.minutes} min</span>
                  <span className="text-[11px] font-medium text-slate-500 block mt-0.5">{opt.desc}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Section 3: Upload College Curriculum */}
        <div className="space-y-4">
          <div className="border-b border-slate-100 pb-2 flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 font-['Outfit'] flex items-center space-x-2">
              <BookOpen className="h-4 w-4 text-blue-600" />
              <span>3. Upload College Syllabus (PDF / Text)</span>
            </h3>
            <span className="text-xs text-slate-400">PDFs automatically parsed via pdf-parse</span>
          </div>

          <div className="space-y-3">
            {/* File Upload Trigger */}
            <div className="flex flex-wrap items-center gap-3">
              <label className="cursor-pointer inline-flex items-center space-x-2 px-3.5 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-xs font-semibold border border-blue-200 transition-colors">
                <Upload className="h-3.5 w-3.5 text-blue-600" />
                <span>Upload College Syllabus PDF (.pdf, .txt, .md)</span>
                <input
                  type="file"
                  accept=".pdf,.txt,.md"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>

              {isExtractingPdf && (
                <div className="flex items-center space-x-1.5 text-xs text-blue-600 font-medium animate-pulse">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Extracting text from PDF via parser...</span>
                </div>
              )}

              {pdfExtractionSuccess && (
                <div className="flex items-center space-x-1 text-xs text-emerald-700 font-medium bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                  <FileCheck2 className="h-3.5 w-3.5 text-emerald-600" />
                  <span>{pdfExtractionSuccess}</span>
                </div>
              )}
            </div>

            {/* Textarea */}
            <div>
              <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1">
                <span>Extracted Syllabus Content (Ready for Groq Analysis):</span>
                <span>{rawText.length.toLocaleString()} characters</span>
              </div>
              <textarea
                rows={8}
                required
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
                placeholder="Upload your college department syllabus PDF above or paste course units here..."
                className="w-full p-3.5 text-xs font-mono bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white"
              ></textarea>
            </div>
          </div>
        </div>

        {errorMessage && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800">
            {errorMessage}
          </div>
        )}

        {/* Submit & Progress Animation */}
        {!isProcessing ? (
          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-500/20 transition-all flex items-center space-x-2 cursor-pointer"
            >
              <Sparkles className="h-4 w-4" />
              <span>Analyze Syllabus & Evolve Curriculum</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <div className="p-6 bg-blue-50/60 border border-blue-200 rounded-2xl space-y-4">
            <div className="flex items-center space-x-3 text-blue-900 font-bold font-['Outfit'] text-sm">
              <BrainCircuit className="h-5 w-5 text-blue-600 animate-spin" />
              <span>SkillUp AI is Analyzing Your Syllabus & Synthesizing Curriculum...</span>
            </div>

            <div className="space-y-2">
              {steps.map((text, idx) => {
                const isCurrent = progressStep === idx;
                const isDone = progressStep > idx;
                return (
                  <div
                    key={idx}
                    className={`flex items-center space-x-2 text-xs transition-opacity ${
                      isDone
                        ? 'text-emerald-700 font-semibold'
                        : isCurrent
                        ? 'text-blue-700 font-bold'
                        : 'text-slate-400 opacity-60'
                    }`}
                  >
                    {isDone ? (
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                    ) : (
                      <div className={`h-2 w-2 rounded-full shrink-0 ${isCurrent ? 'bg-blue-600 animate-ping' : 'bg-slate-300'}`}></div>
                    )}
                    <span>{text}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </form>

    </div>
  );
};
