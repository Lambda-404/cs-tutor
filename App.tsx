
import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import ChatArea from './components/ChatArea';
import QuizMode from './components/QuizMode';
import GraderMode from './components/GraderMode';
import CodeSandbox from './components/CodeSandbox';
import MistakesMode from './components/MistakesMode';
import ImageStudio from './components/ImageStudio';
import LiveTutor from './components/LiveTutor';
import Dashboard from './components/Dashboard';
import { AppMode, UserStats, Theme, Language } from './types';

// XP Notification Component (Toast)
const XPToast: React.FC<{ amount: number; reason: string; visible: boolean }> = ({ amount, reason, visible }) => {
    if (!visible) return null;
    return (
        <div className="absolute top-10 left-1/2 transform -translate-x-1/2 z-50 animate-fade-in pointer-events-none">
            <div className="bg-orange-500 text-white px-6 py-3 rounded-full shadow-lg shadow-orange-500/40 flex items-center space-x-2 font-bold text-lg">
                <span>+{amount} XP</span>
                <span className="text-sm font-normal opacity-90 border-l border-white/30 pl-2 ml-2">{reason}</span>
            </div>
        </div>
    );
};

const App: React.FC = () => {
  // Default mode changed to Dashboard for Hub-based architecture
  const [currentMode, setCurrentMode] = useState<AppMode>(AppMode.Dashboard);
  const [stats, setStats] = useState<UserStats>({
    points: 0,
    dailyXP: 0,
    streak: 0,
    level: 1,
    lastLogin: new Date().toISOString(),
    quizzesTaken: 0,
    achievements: []
  });
  const [theme, setTheme] = useState<Theme>('dark');
  const [language, setLanguage] = useState<Language>('en');

  // XP Toast State
  const [toast, setToast] = useState({ visible: false, amount: 0, reason: '' });

  // Load stats and theme from local storage
  useEffect(() => {
    const savedStats = localStorage.getItem('9618_tutor_stats');
    if (savedStats) {
      const parsed = JSON.parse(savedStats);
      
      const last = new Date(parsed.lastLogin);
      const now = new Date();
      const diffDays = Math.floor((now.getTime() - last.getTime()) / (1000 * 3600 * 24));
      const isToday = now.toDateString() === last.toDateString();
      
      let newStreak = parsed.streak;
      let newDailyXP = isToday ? (parsed.dailyXP || 0) : 0;

      if (!isToday) {
          if (diffDays === 1) newStreak++;
          else if (diffDays > 1) newStreak = 0; // Streak broken
      } else {
          // If it IS today, ensure streak is at least 1 if it was 0
          if (newStreak === 0) newStreak = 1;
      }
      
      setStats({
        ...parsed,
        dailyXP: newDailyXP,
        streak: newStreak,
        lastLogin: now.toISOString(),
        level: Math.floor((parsed.points || 0) / 1000) + 1,
        achievements: parsed.achievements || []
      });
    } else {
      localStorage.setItem('9618_tutor_stats', JSON.stringify(stats));
    }

    const savedTheme = localStorage.getItem('9618_theme') as Theme;
    if (savedTheme) {
        setTheme(savedTheme);
        document.documentElement.classList.toggle('dark', savedTheme === 'dark');
    } else {
        document.documentElement.classList.add('dark');
    }

    const savedLang = localStorage.getItem('9618_lang') as Language;
    if (savedLang) {
        setLanguage(savedLang);
    }
  }, []);

  // Save stats when updated
  useEffect(() => {
    localStorage.setItem('9618_tutor_stats', JSON.stringify(stats));
  }, [stats]);

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
        if (e.altKey) {
            if (e.key === '0') setCurrentMode(AppMode.Dashboard);
            if (e.key === '1') setCurrentMode(AppMode.Chat);
            if (e.key === '2') setCurrentMode(AppMode.LiveTutor);
            if (e.key === '3') setCurrentMode(AppMode.Quiz);
            if (e.key === '4') setCurrentMode(AppMode.Grader);
            if (e.key === '5') setCurrentMode(AppMode.Sandbox);
            if (e.key === '6') setCurrentMode(AppMode.ImageStudio);
            if (e.key === '7') setCurrentMode(AppMode.Mistakes);
        }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

  const toggleTheme = () => {
      const newTheme = theme === 'dark' ? 'light' : 'dark';
      setTheme(newTheme);
      document.documentElement.classList.toggle('dark', newTheme === 'dark');
      localStorage.setItem('9618_theme', newTheme);
  };

  const toggleLanguage = () => {
      const newLang = language === 'en' ? 'zh' : 'en';
      setLanguage(newLang);
      localStorage.setItem('9618_lang', newLang);
  };

  // Centralized Gamification Engine
  const handleAwardXP = (amount: number, reason: string = 'Exercise Complete') => {
      // Trigger Toast
      setToast({ visible: true, amount, reason });
      setTimeout(() => setToast(prev => ({ ...prev, visible: false })), 2000);

      setStats(prev => {
          const newPoints = prev.points + amount;
          const newDaily = prev.dailyXP + amount;
          return {
              ...prev,
              points: newPoints,
              dailyXP: newDaily,
              level: Math.floor(newPoints / 1000) + 1
          };
      });
  };

  return (
    <div className="h-screen w-screen overflow-hidden bg-[#F2F2F7] dark:bg-black flex items-center justify-center relative transition-colors duration-500 selection:bg-blue-500/30 font-sans">
      
      {/* Visual Feedback Toast */}
      <XPToast amount={toast.amount} reason={toast.reason} visible={toast.visible} />

      {/* Ambient Background Effects */}
      <div className="absolute top-1/4 left-1/4 w-[40vw] h-[40vh] bg-blue-500/10 rounded-full blur-[120px] pointer-events-none animate-pulse" style={{ animationDuration: '8s' }}></div>
      <div className="absolute bottom-1/4 right-1/4 w-[40vw] h-[40vh] bg-purple-500/10 rounded-full blur-[120px] pointer-events-none animate-pulse" style={{ animationDuration: '10s', animationDelay: '1s' }}></div>

      {/* Main App Floating Wrapper */}
      <div className="w-[96vw] h-[92vh] md:w-[94vw] md:h-[90vh] max-w-[1700px] flex flex-row gap-6 z-20">
        
        {/* Sidebar */}
        <div className="flex-shrink-0 h-full">
            <Sidebar 
                currentMode={currentMode} 
                setMode={setCurrentMode} 
                stats={stats} 
                theme={theme}
                toggleTheme={toggleTheme}
                language={language}
                toggleLanguage={toggleLanguage}
            />
        </div>
        
        {/* Main Content Area */}
        <main className="flex-1 h-full relative rounded-[2.5rem] bg-white dark:bg-[#1C1C1E] shadow-apple dark:shadow-apple-dark border border-white/50 dark:border-white/5 ring-1 ring-black/5 dark:ring-white/5 overflow-hidden transition-colors duration-300">
            <div key={currentMode} className="w-full h-full animate-enter">
              {currentMode === AppMode.Dashboard && <Dashboard stats={stats} language={language} setMode={setCurrentMode} />}
              {currentMode === AppMode.Chat && <ChatArea language={language} onAwardXP={handleAwardXP} />}
              {currentMode === AppMode.Quiz && <QuizMode onAwardXP={handleAwardXP} language={language} />}
              {currentMode === AppMode.Grader && <GraderMode language={language} onAwardXP={handleAwardXP} />}
              {currentMode === AppMode.Sandbox && <CodeSandbox language={language} onAwardXP={handleAwardXP} />}
              {currentMode === AppMode.Mistakes && <MistakesMode language={language} onAwardXP={handleAwardXP} />}
              {currentMode === AppMode.ImageStudio && <ImageStudio language={language} onAwardXP={handleAwardXP} />}
              {currentMode === AppMode.LiveTutor && <LiveTutor language={language} onAwardXP={handleAwardXP} />}
            </div>
        </main>
      </div>
    </div>
  );
};

export default App;
