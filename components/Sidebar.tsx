import React from 'react';
import { AppMode, UserStats, Theme, Language } from '../types';
import { ChatIcon, QuizIcon, GradeIcon, CodeIcon, FlameIcon, SunIcon, MoonIcon, GlobeIcon, BookIcon, ImageIcon, MicIcon, HomeIcon } from './Icons';

interface SidebarProps {
  currentMode: AppMode;
  setMode: (mode: AppMode) => void;
  stats: UserStats;
  theme: Theme;
  toggleTheme: () => void;
  language: Language;
  toggleLanguage: () => void;
}

const translations = {
    en: {
        dashboard: 'Dashboard',
        chat: 'Tutor Chat',
        quiz: 'Quiz',
        grader: 'Grader',
        sandbox: 'Sandbox',
        mistakes: 'Mistakes',
        image: 'Image Studio',
        live: 'Live Tutor',
        progress: 'Progress',
        points: 'XP',
        level: 'Lvl'
    },
    zh: {
        dashboard: '仪表盘',
        chat: 'AI 导师',
        quiz: '测验',
        grader: '批改',
        sandbox: '沙盒',
        mistakes: '错题本',
        image: '图像工作室',
        live: '语音导师',
        progress: '进度',
        points: '经验',
        level: '等级'
    }
};

const Sidebar: React.FC<SidebarProps> = ({ currentMode, setMode, stats, theme, toggleTheme, language, toggleLanguage }) => {
  const t = translations[language];

  // Reordered Navigation: Dashboard first (Hub model)
  const navItems = [
    { mode: AppMode.Dashboard, icon: HomeIcon, label: t.dashboard },
    { mode: AppMode.Chat, icon: ChatIcon, label: t.chat },
    { mode: AppMode.LiveTutor, icon: MicIcon, label: t.live },
    { mode: AppMode.Quiz, icon: QuizIcon, label: t.quiz },
    { mode: AppMode.Grader, icon: GradeIcon, label: t.grader },
    { mode: AppMode.Sandbox, icon: CodeIcon, label: t.sandbox },
    { mode: AppMode.ImageStudio, icon: ImageIcon, label: t.image },
    { mode: AppMode.Mistakes, icon: BookIcon, label: t.mistakes },
  ];

  return (
    <div className="w-20 md:w-64 h-full flex flex-col rounded-[2.5rem] glass-panel shadow-tier-2 animate-slide-in overflow-hidden z-30 relative">
      
      {/* App Header */}
      <div className="p-6 pb-4 flex items-center justify-center md:justify-start space-x-3 mt-2 flex-shrink-0">
        <div className="w-10 h-10 bg-gradient-to-br from-[#007AFF] to-[#5856D6] rounded-2xl shadow-lg flex items-center justify-center text-white font-bold text-xs tracking-tighter shadow-tier-1 interactive">9618</div>
        <span className="hidden md:block font-bold text-xl tracking-tight text-black dark:text-white leading-none">CS Tutor</span>
      </div>

      {/* Navigation */}
      <div className="flex-1 px-3 space-y-2 overflow-y-auto custom-scrollbar">
        <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2 px-3 hidden md:block mt-4">Menu</div>
        {navItems.map((item) => (
          <button
            key={item.mode}
            onClick={() => setMode(item.mode)}
            className={`w-full flex items-center space-x-3 px-3 py-3 rounded-2xl interactive group transition-all duration-300 ${
              currentMode === item.mode
                ? 'bg-[#007AFF] text-white shadow-tier-1 translate-x-1'
                : 'text-gray-500 dark:text-gray-400 hover:bg-black/5 dark:hover:bg-white/10 hover:text-black dark:hover:text-white'
            }`}
          >
            <item.icon />
            <span className="hidden md:block font-medium text-sm flex-1 text-left leading-none">{item.label}</span>
          </button>
        ))}
      </div>

      {/* Bottom Section: Stats & Controls */}
      <div className="p-3 mt-auto flex-shrink-0 flex flex-col gap-3 pb-6">
        {/* Stats Card */}
        <div className="glass-panel p-4 flex flex-col space-y-3 rounded-[2rem] border-none bg-white/40 dark:bg-white/5 interactive">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-orange-400 to-red-500 flex items-center justify-center text-white shadow-md">
                        <FlameIcon />
                    </div>
                    <div className="hidden md:block">
                        <div className="text-xs text-gray-500 font-medium">{t.points}</div>
                        <div className="text-sm font-bold text-black dark:text-white">{stats.points}</div>
                    </div>
                </div>
                <div className="text-xs font-bold text-orange-500 bg-orange-100 dark:bg-orange-500/20 px-2 py-1 rounded-full">
                    {stats.streak} 🔥
                </div>
            </div>
            
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 overflow-hidden">
                <div 
                className="bg-[#007AFF] h-full rounded-full transition-all duration-500 shadow-[0_0_10px_rgba(0,122,255,0.5)]" 
                style={{ width: `${Math.min(stats.points % 1000 / 10, 100)}%` }}
                ></div>
            </div>
        </div>

        {/* Toggles */}
        <div className="space-y-1">
            <button
                onClick={toggleTheme}
                className="w-full flex items-center justify-center md:justify-start space-x-3 px-3 py-3 rounded-2xl text-gray-500 dark:text-gray-400 hover:bg-black/5 dark:hover:bg-white/10 interactive"
            >
                {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
                <span className="hidden md:block font-medium text-sm leading-none">Appearance</span>
            </button>
            <button
                onClick={toggleLanguage}
                className="w-full flex items-center justify-center md:justify-start space-x-3 px-3 py-3 rounded-2xl text-gray-500 dark:text-gray-400 hover:bg-black/5 dark:hover:bg-white/10 interactive"
            >
                <GlobeIcon />
                <span className="hidden md:block font-medium text-sm leading-none">Language</span>
            </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;