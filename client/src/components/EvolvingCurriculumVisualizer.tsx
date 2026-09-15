import React, { useState, useEffect, useMemo } from 'react';
import { EvolvedCurriculum } from '../types';
import { useAuth } from '../context/AuthContext';
import {
  Sparkles,
  CheckCircle2,
  Minimize2,
  PlusCircle,
  HelpCircle,
  GraduationCap,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  Search,
  Check,
  Smile,
  Compass,
  Layers,
  Zap,
  Target,
  BookOpen,
  ArrowUpRight
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface Props {
  curriculum: EvolvedCurriculum;
  studentBranch?: string;
  careerGoal?: string;
  dailyMinutes?: number;
}

type ViewMode = 'comfort' | 'roadmap' | 'academic';
type ZoneType = 'ALL' | 'COMFORT' | 'GROWTH' | 'CHALLENGE';

interface EnrichedTopic {
  id: string;
  topic: string;
  subject: string;
  originalType: 'KEEP' | 'COMPRESS' | 'ADD';
  zone: 'COMFORT' | 'GROWTH' | 'CHALLENGE';
  zoneLabel: string;
  difficulty: 'Beginner / Gentle' | 'Intermediate / Practical' | 'Advanced / Industry';
  plainEnglishExplanation: string;
  comfortStrategy: string;
  practicalProject: string;
  timeEstimate: string;
  whyOriginal: string;
  tag: string;
}

// Generate friendly, non-intimidating explanations and projects
function getStudentFriendlyDetails(topic: string, subject: string, type: 'KEEP' | 'COMPRESS' | 'ADD', why: string) {
  const t = topic.toLowerCase();
  
  if (t.includes('java') || t.includes('spring')) {
    return {
      plain: "Building backend servers and web APIs with clean, reliable Java code.",
      strategy: "Start by writing small functions, then connect a database. Don't worry about complex frameworks on Day 1.",
      project: "Create a simple student grade or task management REST API.",
      estimate: "3 - 5 days to feel confident"
    };
  }
  if (t.includes('react') || t.includes('front') || t.includes('web')) {
    return {
      plain: "Designing clickable, interactive user interfaces using reusable building blocks.",
      strategy: "Think of UI like Lego bricks. Start with buttons and cards, then add state.",
      project: "Build an interactive personal dashboard with dark mode and live filters.",
      estimate: "4 - 6 days for core mastery"
    };
  }
  if (t.includes('test') || t.includes('qa')) {
    return {
      plain: "Automating quick sanity checks so you never have to worry about breaking your app.",
      strategy: "Write 3 tests for simple functions (e.g. addition or login validator) to see how painless it is.",
      project: "Write unit tests for a login and password validation form.",
      estimate: "2 - 3 days to get comfortable"
    };
  }
  if (t.includes('cloud') || t.includes('docker') || t.includes('deploy')) {
    return {
      plain: "Publishing your code so anyone in the world can open it via a URL.",
      strategy: "Deploy a 1-page website first. Seeing your project live on the internet builds huge motivation!",
      project: "Deploy your web app to Vercel or Docker container with a single command.",
      estimate: "2 - 4 days step-by-step"
    };
  }
  if (t.includes('python') || t.includes('pandas') || t.includes('numpy')) {
    return {
      plain: "Manipulating and filtering data tables effortlessly without tedious manual work.",
      strategy: "Load a CSV file with movie or sports data and query your favorite stats.",
      project: "Analyze a dataset of college placements or tech salaries.",
      estimate: "3 - 4 days to feel fluent"
    };
  }
  if (t.includes('machine learning') || t.includes('ai') || t.includes('mining')) {
    return {
      plain: "Teaching computers to recognize patterns in data to make smart predictions.",
      strategy: "Focus on the big-picture concepts and ready-to-use libraries before complex mathematical proofs.",
      project: "Train a simple model to predict house prices or spam emails.",
      estimate: "1 - 2 weeks at a relaxed pace"
    };
  }
  if (t.includes('design') || t.includes('cad') || t.includes('solidworks')) {
    return {
      plain: "Visualizing 3D engineering components and checking how parts fit together.",
      strategy: "Model simple household objects first before designing complex machinery assemblies.",
      project: "Design a 3D printable bracket or phone stand with precise tolerances.",
      estimate: "4 - 6 days hands-on"
    };
  }
  if (type === 'COMPRESS') {
    return {
      plain: "Streamlined academic theory: key formulas and exam concepts summarized without busywork.",
      strategy: "Skim through the 20% core formulas that appear in exams and skip unnecessary historical fluff.",
      project: "Create a 1-page quick formula cheatsheet.",
      estimate: "1 - 2 study sessions"
    };
  }

  return {
    plain: why.length > 10 ? why : `Foundational engineering knowledge in ${subject} to support your future projects.`,
    strategy: "Take it one sub-topic at a time. Review core concepts first, then do 1 hands-on exercise.",
    project: `Apply ${topic} in a targeted mini exercise or portfolio demo.`,
    estimate: "3 - 5 days at your daily pace"
  };
}

export const EvolvingCurriculumVisualizer: React.FC<Props> = ({
  curriculum,
  studentBranch = 'Engineering',
  careerGoal = 'Industry Specialist',
  dailyMinutes = 60
}) => {
  const { setCurrentTab } = useAuth();
  const [viewMode, setViewMode] = useState<ViewMode>('comfort');
  const [zoneFilter, setZoneFilter] = useState<ZoneType>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Track user-mastered "Comfort Zone" items in localStorage
  const [comfortChecklist, setComfortChecklist] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem('skillup_comfort_checklist');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const toggleComfort = (topicId: string) => {
    setComfortChecklist(prev => {
      const next = { ...prev, [topicId]: !prev[topicId] };
      try {
        localStorage.setItem('skillup_comfort_checklist', JSON.stringify(next));
      } catch (err) {
        console.warn('Storage error', err);
      }
      if (!prev[topicId]) {
        confetti({
          particleCount: 40,
          spread: 60,
          origin: { y: 0.8 }
        });
      }
      return next;
    });
  };

  // Convert raw KEEP / COMPRESS / ADD into human-centered Comfort Zones
  const allTopics: EnrichedTopic[] = useMemo(() => {
    const list: EnrichedTopic[] = [];

    // 1. COMPRESS topics -> Comfort Zone (Gentle / Light touch, low stress)
    (curriculum.compress || []).forEach((c, idx) => {
      const details = getStudentFriendlyDetails(c.topic, c.subject, 'COMPRESS', c.why);
      list.push({
        id: `compress_${idx}_${c.topic}`,
        topic: c.topic,
        subject: c.subject || 'Streamlined Academic Core',
        originalType: 'COMPRESS',
        zone: 'COMFORT',
        zoneLabel: 'Comfort Zone • Foundations & Cheatsheets',
        difficulty: 'Beginner / Gentle',
        plainEnglishExplanation: details.plain,
        comfortStrategy: details.strategy,
        practicalProject: details.project,
        timeEstimate: details.estimate,
        whyOriginal: c.why,
        tag: c.timeReduction || '40% Compressed'
      });
    });

    // 2. KEEP topics -> Divided into Comfort Zone (earlier/fundamentals) and Growth Zone (core hands-on)
    (curriculum.keep || []).forEach((k, idx) => {
      const details = getStudentFriendlyDetails(k.topic, k.subject, 'KEEP', k.why);
      const isComfort = idx === 0 || k.topic.toLowerCase().includes('intro') || k.topic.toLowerCase().includes('basic');
      const zone = isComfort ? 'COMFORT' : 'GROWTH';

      list.push({
        id: `keep_${idx}_${k.topic}`,
        topic: k.topic,
        subject: k.subject || 'Core Engineering Subject',
        originalType: 'KEEP',
        zone,
        zoneLabel: isComfort ? 'Comfort Zone • Familiar Foundations' : 'Growth Zone • Core Practical Skills',
        difficulty: isComfort ? 'Beginner / Gentle' : 'Intermediate / Practical',
        plainEnglishExplanation: details.plain,
        comfortStrategy: details.strategy,
        practicalProject: details.project,
        timeEstimate: details.estimate,
        whyOriginal: k.why,
        tag: k.importance || 'Essential Core'
      });
    });

    // 3. ADD topics -> Divided into Growth Zone and Challenge Zone (High-Value Tools)
    (curriculum.add || []).forEach((a, idx) => {
      const details = getStudentFriendlyDetails(a.topic, a.category, 'ADD', a.why);
      const isChallenge = idx > 0;
      const zone = isChallenge ? 'CHALLENGE' : 'GROWTH';

      list.push({
        id: `add_${idx}_${a.topic}`,
        topic: a.topic,
        subject: a.category || 'Modern Industry Tool',
        originalType: 'ADD',
        zone,
        zoneLabel: isChallenge ? 'Challenge Zone • High-Demand Industry Edge' : 'Growth Zone • Modern Skill Booster',
        difficulty: isChallenge ? 'Advanced / Industry' : 'Intermediate / Practical',
        plainEnglishExplanation: details.plain,
        comfortStrategy: details.strategy,
        practicalProject: details.project,
        timeEstimate: details.estimate,
        whyOriginal: a.why,
        tag: a.industryRelevance || 'High Demand'
      });
    });

    return list;
  }, [curriculum]);

  // Filtered by Zone & Search
  const filteredTopics = useMemo(() => {
    return allTopics.filter(t => {
      const matchesZone = zoneFilter === 'ALL' || t.zone === zoneFilter;
      const matchesSearch =
        searchQuery.trim() === '' ||
        t.topic.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.plainEnglishExplanation.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesZone && matchesSearch;
    });
  }, [allTopics, zoneFilter, searchQuery]);

  const comfortCount = allTopics.filter(t => t.zone === 'COMFORT').length;
  const growthCount = allTopics.filter(t => t.zone === 'GROWTH').length;
  const challengeCount = allTopics.filter(t => t.zone === 'CHALLENGE').length;

  const masteredCount = Object.values(comfortChecklist).filter(Boolean).length;
  const progressPercent = allTopics.length > 0 ? Math.round((masteredCount / allTopics.length) * 100) : 0;

  return (
    <div className="space-y-6">
      
      {/* View Mode Switcher Header */}
      <div className="bg-white rounded-2xl p-2 border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center space-x-1 w-full sm:w-auto">
          <button
            onClick={() => setViewMode('comfort')}
            className={`flex-1 sm:flex-none px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-2 cursor-pointer ${
              viewMode === 'comfort'
                ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-500/20'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Smile className="h-4 w-4" />
            <span>Comfort Zone Mode</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${
              viewMode === 'comfort' ? 'bg-white/20 text-white' : 'bg-emerald-100 text-emerald-800'
            }`}>
              Recommended
            </span>
          </button>

          <button
            onClick={() => setViewMode('roadmap')}
            className={`flex-1 sm:flex-none px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-2 cursor-pointer ${
              viewMode === 'roadmap'
                ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Compass className="h-4 w-4" />
            <span>16-Week Roadmap</span>
          </button>

          <button
            onClick={() => setViewMode('academic')}
            className={`flex-1 sm:flex-none px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-2 cursor-pointer ${
              viewMode === 'academic'
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Layers className="h-4 w-4" />
            <span>Academic Diff (KEEP/ADD)</span>
          </button>
        </div>

        {/* Comfort Meter Quick Pill */}
        <div className="flex items-center space-x-2 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs">
          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          <span className="font-semibold text-slate-700">Comfort Mastery:</span>
          <span className="font-extrabold text-emerald-700">{masteredCount} of {allTopics.length}</span>
          <div className="w-16 bg-slate-200 h-2 rounded-full overflow-hidden">
            <div className="bg-emerald-500 h-full transition-all duration-500" style={{ width: `${progressPercent}%` }}></div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODE 1: COMFORT ZONE MODE (Student-Friendly & Stress-Free) */}
      {/* ========================================================================= */}
      {viewMode === 'comfort' && (
        <div className="space-y-6">
          
          {/* Comfort Philosophy Hero */}
          <div className="bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-blue-500/10 border border-emerald-200 rounded-2xl p-6 relative overflow-hidden">
            <div className="max-w-3xl">
              <div className="inline-flex items-center space-x-1.5 px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-bold mb-3 border border-emerald-200">
                <Smile className="h-3.5 w-3.5 text-emerald-700" />
                <span>Stress-Free Student Comfort Zone</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 font-['Outfit'] tracking-tight">
                No Intimidating Jargon. Learn At Your Own Comfortable Pace.
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 mt-1.5 leading-relaxed">
                College syllabi often look terrifying with dense academic textbooks. SkillUp reorganizes your semester into <strong>3 comfortable stepping stones</strong> so you build momentum without feeling overwhelmed.
              </p>
            </div>

            {/* 3 Step Cards Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-5">
              
              {/* Zone 1 Card */}
              <button
                onClick={() => setZoneFilter(zoneFilter === 'COMFORT' ? 'ALL' : 'COMFORT')}
                className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                  zoneFilter === 'COMFORT'
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-md'
                    : 'bg-white/80 hover:bg-white border-emerald-200/80 text-slate-800'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className={`text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded ${
                    zoneFilter === 'COMFORT' ? 'bg-white/20 text-white' : 'bg-emerald-100 text-emerald-800'
                  }`}>
                    Level 1
                  </span>
                  <span className={`text-xs font-bold ${zoneFilter === 'COMFORT' ? 'text-white' : 'text-emerald-700'}`}>
                    {comfortCount} Topics
                  </span>
                </div>
                <div className="font-bold text-sm font-['Outfit']">🟢 Comfort Zone</div>
                <p className={`text-[11px] mt-1 line-clamp-2 ${zoneFilter === 'COMFORT' ? 'text-emerald-100' : 'text-slate-500'}`}>
                  Easy foundations & compressed topics. Zero stress quick wins to build confidence.
                </p>
              </button>

              {/* Zone 2 Card */}
              <button
                onClick={() => setZoneFilter(zoneFilter === 'GROWTH' ? 'ALL' : 'GROWTH')}
                className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                  zoneFilter === 'GROWTH'
                    ? 'bg-amber-600 text-white border-amber-600 shadow-md'
                    : 'bg-white/80 hover:bg-white border-amber-200/80 text-slate-800'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className={`text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded ${
                    zoneFilter === 'GROWTH' ? 'bg-white/20 text-white' : 'bg-amber-100 text-amber-800'
                  }`}>
                    Level 2
                  </span>
                  <span className={`text-xs font-bold ${zoneFilter === 'GROWTH' ? 'text-white' : 'text-amber-700'}`}>
                    {growthCount} Topics
                  </span>
                </div>
                <div className="font-bold text-sm font-['Outfit']">🟡 Growth Zone</div>
                <p className={`text-[11px] mt-1 line-clamp-2 ${zoneFilter === 'GROWTH' ? 'text-amber-100' : 'text-slate-500'}`}>
                  Practical semester core skills. Hands-on coding & engineering with clear milestones.
                </p>
              </button>

              {/* Zone 3 Card */}
              <button
                onClick={() => setZoneFilter(zoneFilter === 'CHALLENGE' ? 'ALL' : 'CHALLENGE')}
                className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                  zoneFilter === 'CHALLENGE'
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-md'
                    : 'bg-white/80 hover:bg-white border-indigo-200/80 text-slate-800'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className={`text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded ${
                    zoneFilter === 'CHALLENGE' ? 'bg-white/20 text-white' : 'bg-indigo-100 text-indigo-800'
                  }`}>
                    Level 3
                  </span>
                  <span className={`text-xs font-bold ${zoneFilter === 'CHALLENGE' ? 'text-white' : 'text-indigo-700'}`}>
                    {challengeCount} Topics
                  </span>
                </div>
                <div className="font-bold text-sm font-['Outfit']">🟣 Challenge Zone</div>
                <p className={`text-[11px] mt-1 line-clamp-2 ${zoneFilter === 'CHALLENGE' ? 'text-indigo-100' : 'text-slate-500'}`}>
                  Modern industry tooling that wins job interviews, broken down into bite-sized tasks.
                </p>
              </button>

            </div>
          </div>

          {/* Search & Filter Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
            <div className="flex items-center space-x-2 w-full sm:w-auto">
              <button
                onClick={() => setZoneFilter('ALL')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  zoneFilter === 'ALL'
                    ? 'bg-slate-900 text-white'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                All Levels ({allTopics.length})
              </button>
              <button
                onClick={() => setZoneFilter('COMFORT')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1 cursor-pointer ${
                  zoneFilter === 'COMFORT'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-white text-emerald-700 hover:bg-emerald-50 border border-emerald-200'
                }`}
              >
                <span>🟢 Comfort Zone ({comfortCount})</span>
              </button>
              <button
                onClick={() => setZoneFilter('GROWTH')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1 cursor-pointer ${
                  zoneFilter === 'GROWTH'
                    ? 'bg-amber-600 text-white'
                    : 'bg-white text-amber-700 hover:bg-amber-50 border border-amber-200'
                }`}
              >
                <span>🟡 Growth Zone ({growthCount})</span>
              </button>
              <button
                onClick={() => setZoneFilter('CHALLENGE')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1 cursor-pointer ${
                  zoneFilter === 'CHALLENGE'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white text-indigo-700 hover:bg-indigo-50 border border-indigo-200'
                }`}
              >
                <span>🟣 Challenge Zone ({challengeCount})</span>
              </button>
            </div>

            {/* Quick Search Input */}
            <div className="relative w-full sm:w-64">
              <Search className="h-3.5 w-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search topic or skill..."
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Topics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredTopics.map((item) => {
              const isComfortable = !!comfortChecklist[item.id];
              const isZoneComfort = item.zone === 'COMFORT';
              const isZoneGrowth = item.zone === 'GROWTH';

              const borderAccent = isZoneComfort
                ? 'border-l-emerald-500 hover:border-emerald-300'
                : isZoneGrowth
                ? 'border-l-amber-500 hover:border-amber-300'
                : 'border-l-indigo-500 hover:border-indigo-300';

              const badgeColor = isZoneComfort
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : isZoneGrowth
                ? 'bg-amber-50 text-amber-800 border-amber-200'
                : 'bg-indigo-50 text-indigo-800 border-indigo-200';

              return (
                <div
                  key={item.id}
                  className={`bg-white rounded-2xl p-5 border-l-4 border border-slate-200 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4 ${borderAccent}`}
                >
                  <div>
                    {/* Header: Zone Pill & Subject */}
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className={`text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded border ${badgeColor}`}>
                        {item.zoneLabel}
                      </span>
                      <span className="text-[11px] font-semibold text-slate-400">
                        {item.timeEstimate}
                      </span>
                    </div>

                    {/* Topic Title */}
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="text-base font-bold text-slate-900 font-['Outfit'] leading-snug">
                          {item.topic}
                        </h3>
                        <p className="text-xs text-slate-500 mt-0.5">
                          In subject: <strong className="text-slate-700">{item.subject}</strong>
                        </p>
                      </div>

                      {/* Interactive Checklist Checkmark */}
                      <button
                        onClick={() => toggleComfort(item.id)}
                        title={isComfortable ? 'In your comfort zone!' : 'Click to mark as comfortable'}
                        className={`p-2 rounded-xl transition-all cursor-pointer shrink-0 ${
                          isComfortable
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : 'bg-slate-100 hover:bg-emerald-50 text-slate-400 hover:text-emerald-600'
                        }`}
                      >
                        <Check className="h-4 w-4" />
                      </button>
                    </div>

                    {/* Plain English Translation */}
                    <div className="mt-3 p-3 bg-slate-50/80 rounded-xl border border-slate-100 text-xs text-slate-700 space-y-1">
                      <div className="font-bold text-slate-800 flex items-center space-x-1">
                        <BookOpen className="h-3.5 w-3.5 text-blue-600" />
                        <span>In Plain, Simple English:</span>
                      </div>
                      <p className="text-slate-600 text-[11px] leading-relaxed pl-4.5">
                        {item.plainEnglishExplanation}
                      </p>
                    </div>

                    {/* How to Tackle Comfortably */}
                    <div className="mt-2.5 p-3 bg-emerald-50/40 rounded-xl border border-emerald-100/60 text-xs text-slate-700 space-y-1">
                      <div className="font-bold text-emerald-800 flex items-center space-x-1">
                        <Zap className="h-3.5 w-3.5 text-emerald-600" />
                        <span>Comfort Strategy (How to learn with zero stress):</span>
                      </div>
                      <p className="text-slate-600 text-[11px] leading-relaxed pl-4.5">
                        {item.comfortStrategy}
                      </p>
                    </div>

                    {/* What You Will Build */}
                    <div className="mt-2.5 flex items-center space-x-2 text-xs text-slate-600 bg-blue-50/40 p-2.5 rounded-lg border border-blue-100/60">
                      <Target className="h-3.5 w-3.5 text-blue-600 shrink-0" />
                      <span className="text-[11px]">
                        <strong>Mini Project:</strong> {item.practicalProject}
                      </span>
                    </div>
                  </div>

                  {/* Card Footer Actions */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <button
                      onClick={() => toggleComfort(item.id)}
                      className={`text-xs font-semibold flex items-center space-x-1.5 cursor-pointer ${
                        isComfortable ? 'text-emerald-700' : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      <CheckCircle2 className={`h-3.5 w-3.5 ${isComfortable ? 'text-emerald-600' : 'text-slate-300'}`} />
                      <span>{isComfortable ? 'In Your Comfort Zone' : 'Mark as Understood'}</span>
                    </button>

                    <button
                      onClick={() => setCurrentTab('plan')}
                      className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center space-x-1 cursor-pointer"
                    >
                      <span>Study in My Plan</span>
                      <ArrowRight className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredTopics.length === 0 && (
            <div className="text-center py-12 bg-white rounded-2xl border border-slate-200">
              <p className="text-xs text-slate-500">No topics match your search query "{searchQuery}".</p>
              <button
                onClick={() => { setSearchQuery(''); setZoneFilter('ALL'); }}
                className="mt-2 text-xs font-semibold text-blue-600 hover:underline"
              >
                Reset filters
              </button>
            </div>
          )}

        </div>
      )}

      {/* ========================================================================= */}
      {/* MODE 2: 16-WEEK ROADMAP (Step-by-step visual progression) */}
      {/* ========================================================================= */}
      {viewMode === 'roadmap' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
            <h3 className="text-lg font-bold text-slate-900 font-['Outfit']">16-Week Progressive Learning Journey</h3>
            <p className="text-xs text-slate-500 mt-1">
              Structured step-by-step so you never feel lost. Every week moves from foundational comfort into hands-on industry competence.
            </p>

            <div className="mt-6 space-y-4 relative before:absolute before:inset-0 before:left-6 before:w-0.5 before:bg-slate-200">
              
              {/* Milestone 1: Weeks 1-4 */}
              <div className="relative flex items-start space-x-4 pl-12">
                <div className="absolute left-4 -translate-x-1/2 w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold shadow-xs">
                  1
                </div>
                <div className="bg-emerald-50/50 border border-emerald-200 rounded-xl p-4 flex-1">
                  <span className="text-[10px] font-bold uppercase text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                    Weeks 1 to 4 • Comfort & Foundations
                  </span>
                  <h4 className="font-bold text-sm text-slate-900 mt-1 font-['Outfit']">Foundational Ease & Quick Wins</h4>
                  <p className="text-xs text-slate-600 mt-1">
                    Master the high-yield core concepts and review compressed formulas. Establish your daily {dailyMinutes}-minute routine with zero friction.
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {allTopics.filter(t => t.zone === 'COMFORT').map((t, idx) => (
                      <span key={idx} className="text-[11px] bg-white text-slate-700 px-2.5 py-1 rounded-md border border-slate-200 shadow-2xs font-medium">
                        ✓ {t.topic}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Milestone 2: Weeks 5-10 */}
              <div className="relative flex items-start space-x-4 pl-12">
                <div className="absolute left-4 -translate-x-1/2 w-6 h-6 rounded-full bg-amber-600 text-white flex items-center justify-center text-xs font-bold shadow-xs">
                  2
                </div>
                <div className="bg-amber-50/50 border border-amber-200 rounded-xl p-4 flex-1">
                  <span className="text-[10px] font-bold uppercase text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
                    Weeks 5 to 10 • Growth & Application
                  </span>
                  <h4 className="font-bold text-sm text-slate-900 mt-1 font-['Outfit']">Core Practical Skills & Mini Projects</h4>
                  <p className="text-xs text-slate-600 mt-1">
                    Apply engineering logic in code or designs. Connect theoretical subjects directly to practical industry use cases.
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {allTopics.filter(t => t.zone === 'GROWTH').map((t, idx) => (
                      <span key={idx} className="text-[11px] bg-white text-slate-700 px-2.5 py-1 rounded-md border border-slate-200 shadow-2xs font-medium">
                        ⚙️ {t.topic}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Milestone 3: Weeks 11-16 */}
              <div className="relative flex items-start space-x-4 pl-12">
                <div className="absolute left-4 -translate-x-1/2 w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-bold shadow-xs">
                  3
                </div>
                <div className="bg-indigo-50/50 border border-indigo-200 rounded-xl p-4 flex-1">
                  <span className="text-[10px] font-bold uppercase text-indigo-800 bg-indigo-100 px-2 py-0.5 rounded">
                    Weeks 11 to 16 • Challenge & Mastery
                  </span>
                  <h4 className="font-bold text-sm text-slate-900 mt-1 font-['Outfit']">Industry Tooling & Capstone Portfolio</h4>
                  <p className="text-xs text-slate-600 mt-1">
                    Integrate your target industry skills into a standout resume project aligned with <strong>{careerGoal}</strong>.
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {allTopics.filter(t => t.zone === 'CHALLENGE').map((t, idx) => (
                      <span key={idx} className="text-[11px] bg-white text-slate-700 px-2.5 py-1 rounded-md border border-slate-200 shadow-2xs font-medium">
                        🚀 {t.topic}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-500">Your daily schedule is already mapped inside My Plan.</span>
              <button
                onClick={() => setCurrentTab('plan')}
                className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 flex items-center space-x-1.5 cursor-pointer shadow-xs"
              >
                <span>Go to Day-by-Day Plan</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODE 3: ACADEMIC DETAILS (KEEP / COMPRESS / ADD) */}
      {/* ========================================================================= */}
      {viewMode === 'academic' && (
        <div className="space-y-6">
          
          {/* 3-Stage Visual Pipeline */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
            <div className="text-center max-w-2xl mx-auto mb-6">
              <span className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-bold uppercase tracking-wider rounded-full border border-blue-200/60">
                Syllabus Evolution Audit
              </span>
              <h2 className="text-2xl font-extrabold text-slate-900 mt-2 font-['Outfit']">
                How SkillUp Evolved Your College Syllabus
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                College gives you one curriculum. SkillUp evolves it for YOU.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                <span className="text-[10px] font-bold text-slate-500 uppercase">College Core</span>
                <div className="text-2xl font-black text-slate-900 font-['Outfit'] mt-1">{curriculum.keep?.length || 0}</div>
                <div className="text-xs text-slate-600 font-semibold mt-0.5">KEEP Topics Retained</div>
                <p className="text-[11px] text-slate-400 mt-1">Essential academic degree requirements</p>
              </div>

              <div className="bg-amber-50 rounded-xl p-4 border border-amber-200">
                <span className="text-[10px] font-bold text-amber-700 uppercase">Time Saved</span>
                <div className="text-2xl font-black text-amber-900 font-['Outfit'] mt-1">{curriculum.compress?.length || 0}</div>
                <div className="text-xs text-amber-800 font-semibold mt-0.5">COMPRESS Topics Streamlined</div>
                <p className="text-[11px] text-amber-600 mt-1">Condensed low-relevance theoretical fluff</p>
              </div>

              <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-200">
                <span className="text-[10px] font-bold text-emerald-700 uppercase">Job Readiness</span>
                <div className="text-2xl font-black text-emerald-900 font-['Outfit'] mt-1">{curriculum.add?.length || 0}</div>
                <div className="text-xs text-emerald-800 font-semibold mt-0.5">ADD Tools Injected</div>
                <p className="text-[11px] text-emerald-600 mt-1">Modern tooling required by companies</p>
              </div>
            </div>

            {curriculum.summary && (
              <div className="mt-5 p-4 rounded-xl bg-slate-50 border border-slate-200/90 text-xs text-slate-700 leading-relaxed flex items-start space-x-3">
                <Sparkles className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-slate-900 mr-1 font-['Outfit']">Strategic Rationale:</span>
                  <span>{curriculum.summary}</span>
                </div>
              </div>
            )}
          </div>

          {/* Academic Cards Breakdown */}
          <div className="space-y-4">
            
            {/* KEEP */}
            {curriculum.keep?.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center space-x-2 text-xs font-bold text-blue-800 uppercase tracking-wider">
                  <CheckCircle2 className="h-4 w-4 text-blue-600" />
                  <span>KEEP — Essential Core Academic Foundations</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {curriculum.keep.map((k, idx) => (
                    <div key={idx} className="bg-white rounded-xl p-5 border-l-4 border-l-blue-500 border border-slate-200 shadow-xs space-y-2">
                      <span className="text-[10px] font-bold px-2 py-0.5 bg-blue-50 text-blue-700 rounded uppercase">
                        {k.subject || 'Core Subject'}
                      </span>
                      <h4 className="font-bold text-sm text-slate-900 font-['Outfit']">{k.topic}</h4>
                      <p className="text-xs text-slate-600 italic">"{k.why}"</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* COMPRESS */}
            {curriculum.compress?.length > 0 && (
              <div className="space-y-3 pt-4">
                <div className="flex items-center space-x-2 text-xs font-bold text-amber-800 uppercase tracking-wider">
                  <Minimize2 className="h-4 w-4 text-amber-600" />
                  <span>COMPRESS — Streamlined & Condensed Content</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {curriculum.compress.map((c, idx) => (
                    <div key={idx} className="bg-white rounded-xl p-5 border-l-4 border-l-amber-500 border border-slate-200 shadow-xs space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold px-2 py-0.5 bg-amber-50 text-amber-700 rounded uppercase">
                          {c.subject || 'Streamlined'}
                        </span>
                        <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
                          {c.timeReduction || 'Compressed'}
                        </span>
                      </div>
                      <h4 className="font-bold text-sm text-slate-900 font-['Outfit']">{c.topic}</h4>
                      <p className="text-xs text-slate-600 italic">"{c.why}"</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ADD */}
            {curriculum.add?.length > 0 && (
              <div className="space-y-3 pt-4">
                <div className="flex items-center space-x-2 text-xs font-bold text-emerald-800 uppercase tracking-wider">
                  <PlusCircle className="h-4 w-4 text-emerald-600" />
                  <span>ADD — Modern Industry Tooling Missing from College</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {curriculum.add.map((a, idx) => (
                    <div key={idx} className="bg-white rounded-xl p-5 border-l-4 border-l-emerald-500 border border-slate-200 shadow-xs space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-50 text-emerald-800 rounded uppercase">
                          {a.category || 'Industry Skill'}
                        </span>
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                          {a.industryRelevance || 'High Demand'}
                        </span>
                      </div>
                      <h4 className="font-bold text-sm text-slate-900 font-['Outfit']">{a.topic}</h4>
                      <p className="text-xs text-slate-600 italic">"{a.why}"</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>

        </div>
      )}

    </div>
  );
};
