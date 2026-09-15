import React from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { GroqModal } from './components/GroqModal';
import { AuthPage } from './pages/AuthPage';
import { OnboardingPage } from './pages/OnboardingPage';
import { HomePage } from './pages/HomePage';
import { MyCurriculumPage } from './pages/MyCurriculumPage';
import { MyPlanPage } from './pages/MyPlanPage';
import { MilestonesPage } from './pages/MilestonesPage';
import { ProgressPage } from './pages/ProgressPage';
import { Layers } from 'lucide-react';

const AppContent: React.FC = () => {
  const { user, currentTab, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center space-y-4">
        <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-lg animate-pulse">
          <Layers className="h-6 w-6" />
        </div>
        <p className="text-xs font-semibold text-slate-500 font-['Outfit']">SkillUp AI is loading your workspace...</p>
      </div>
    );
  }

  if (!user || currentTab === 'auth') {
    return <AuthPage />;
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 pb-12">
        {currentTab === 'onboarding' && <OnboardingPage />}
        {currentTab === 'home' && <HomePage />}
        {currentTab === 'curriculum' && <MyCurriculumPage />}
        {currentTab === 'plan' && <MyPlanPage />}
        {currentTab === 'milestones' && <MilestonesPage />}
        {currentTab === 'progress' && <ProgressPage />}
      </main>

      <GroqModal />

      {/* Clean Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center space-x-2">
            <span className="font-extrabold text-slate-900 font-['Outfit']">SkillUp<span className="text-blue-600"> AI</span></span>
            <span className="text-slate-300">|</span>
            <span className="italic">"College gives you one curriculum. SkillUp evolves it for YOU."</span>
          </div>
          <p className="text-[11px] text-slate-400">
            Powered by Groq AI • Dynamic for all Engineering Branches
          </p>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
