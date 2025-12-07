
import React, { useState } from 'react';
import { UserStats, Language, AppMode } from '../types';
import { FlameIcon, TrophyIcon, TargetIcon, ChatIcon, QuizIcon, GradeIcon, CodeIcon, BookIcon } from './Icons';

interface DashboardProps {
    stats: UserStats;
    language: Language;
    setMode: (mode: AppMode) => void;
}

const translations = {
    en: {
        welcome: 'Welcome back, Student',
        ready: 'Ready to master Cambridge 9618 today?',
        systemOnline: 'System Online',
        dailyGoal: 'Daily Goal',
        xp: 'XP',
        days: 'Days',
        streak: 'Day Streak',
        keepItUp: 'Keep it up! Consistency is key.',
        level: 'Level',
        totalXP: 'Total XP',
        continueLearning: 'Continue Learning',
        quickActions: 'Quick Actions',
        achievements: 'Recent Achievements',
        startChat: 'Ask Tutor',
        takeQuiz: 'Take Quiz',
        submitCode: 'Submit Code',
        reviewMistakes: 'Review Mistakes',
        mockExam: 'Mock Exam (Coming Soon)',
        skillTree: 'Skill Progress',
        viewAll: 'View All',
        showLess: 'Show Less',
        unit1: 'Unit 1: Information Representation',
        unit2: 'Unit 2: Communication & Networking',
        unit3: 'Unit 3: Hardware',
        unit4: 'Unit 4: Processor Fundamentals',
        unit5: 'Unit 5: System Software',
        mastered: 'Mastered',
        inProgress: 'In Progress',
        locked: 'Locked',
        resume: 'Resume',
        achieve1Title: 'Newbie',
        achieve1Desc: 'Log in for the first time',
        achieve2Title: 'On Fire',
        achieve2Desc: 'Reach a 3-day streak',
        achieve3Title: 'Coder',
        achieve3Desc: 'Run code in Sandbox',
        weakAreas: 'Weak Areas',
        fsm: 'FSM',
        logicGates: 'Logic Gates'
    },
    zh: {
        welcome: '欢迎回来',
        ready: '准备好征服A_level计算机科学了吗？',
        systemOnline: '系统在线',
        dailyGoal: '每日目标',
        xp: '经验值',
        days: '天',
        streak: '连胜纪录',
        keepItUp: '保持下去！坚持就是胜利。',
        level: '当前等级',
        totalXP: '总经验',
        continueLearning: '继续学习',
        quickActions: '快速开始',
        achievements: '近期成就',
        startChat: '咨询导师',
        takeQuiz: '开始测验',
        submitCode: '提交代码',
        reviewMistakes: '复习错题',
        mockExam: '模拟考试 (即将推出)',
        skillTree: '技能进度',
        viewAll: '查看全部',
        showLess: '收起',
        unit1: '第一单元：信息表示',
        unit2: '第二单元：通信与网络',
        unit3: '第三单元：硬件',
        unit4: '第四单元：处理器基础',
        unit5: '第五单元：系统软件',
        mastered: '已掌握',
        inProgress: '进行中',
        locked: '未解锁',
        resume: '继续',
        achieve1Title: '新手上路',
        achieve1Desc: '首次登录系统',
        achieve2Title: '火力全开',
        achieve2Desc: '达到 3 天连胜',
        achieve3Title: '程序员',
        achieve3Desc: '在沙盒中运行代码',
        weakAreas: '薄弱环节',
        fsm: '有限状态机',
        logicGates: '逻辑门'
    }
};

const Dashboard: React.FC<DashboardProps> = ({ stats, language, setMode }) => {
    const t = translations[language];
    const [viewAllCourses, setViewAllCourses] = useState(false);

    // Calculated Progress for Daily Goal (e.g., 500 XP goal)
    const dailyGoalTarget = 500;
    const dailyProgress = Math.min((stats.dailyXP / dailyGoalTarget) * 100, 100);

    return (
        <div className="p-8 h-full overflow-y-auto w-full max-w-7xl mx-auto custom-scrollbar animate-enter">
            {/* Header / Welcome Section */}
            <div className="mb-8 flex flex-col md:flex-row items-start md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-bold text-slate-800 dark:text-white mb-2 tracking-tight">
                        {t.welcome}
                    </h1>
                    <p className="text-slate-500 dark:text-gray-400 text-lg">
                        {t.ready}
                    </p>
                </div>
                <div className="glass-panel px-5 py-2 rounded-full flex items-center space-x-2 shadow-tier-1">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                    <span className="text-xs font-bold text-slate-600 dark:text-gray-300 uppercase tracking-wider">{t.systemOnline}</span>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {/* Daily Goal Card */}
                <div className="glass-panel p-6 rounded-[2rem] shadow-tier-2 relative overflow-hidden group interactive">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <TargetIcon />
                    </div>
                    <div className="flex items-center space-x-3 mb-4">
                        <div className="p-2 bg-blue-100 dark:bg-blue-500/20 text-blue-500 rounded-xl">
                            <TargetIcon />
                        </div>
                        <h3 className="font-bold text-slate-700 dark:text-white">{t.dailyGoal}</h3>
                    </div>
                    <div className="text-3xl font-bold text-slate-800 dark:text-white mb-2">
                        {stats.dailyXP} <span className="text-sm text-slate-400 font-normal">/ {dailyGoalTarget} {t.xp}</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-white/10 rounded-full h-2 overflow-hidden">
                        <div 
                            className="bg-blue-500 h-full rounded-full transition-all duration-1000 ease-out"
                            style={{ width: `${dailyProgress}%` }}
                        ></div>
                    </div>
                </div>

                {/* Streak Card */}
                <div className="glass-panel p-6 rounded-[2rem] shadow-tier-2 relative overflow-hidden group interactive">
                     <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity text-orange-500">
                        <FlameIcon />
                    </div>
                    <div className="flex items-center space-x-3 mb-4">
                        <div className="p-2 bg-orange-100 dark:bg-orange-500/20 text-orange-500 rounded-xl">
                            <FlameIcon />
                        </div>
                        <h3 className="font-bold text-slate-700 dark:text-white">{t.streak}</h3>
                    </div>
                    <div className="text-3xl font-bold text-slate-800 dark:text-white mb-1">
                        {stats.streak} <span className="text-sm text-slate-400 font-normal">{t.days}</span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-gray-400">{t.keepItUp}</p>
                </div>

                {/* Level Card */}
                <div className="glass-panel p-6 rounded-[2rem] shadow-tier-2 relative overflow-hidden group interactive">
                     <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity text-purple-500">
                        <TrophyIcon />
                    </div>
                    <div className="flex items-center space-x-3 mb-4">
                        <div className="p-2 bg-purple-100 dark:bg-purple-500/20 text-purple-500 rounded-xl">
                            <TrophyIcon />
                        </div>
                        <h3 className="font-bold text-slate-700 dark:text-white">{t.level}</h3>
                    </div>
                    <div className="text-3xl font-bold text-slate-800 dark:text-white mb-1">
                        {stats.level}
                    </div>
                    <p className="text-xs text-slate-500 dark:text-gray-400">{t.totalXP}: {stats.points}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Quick Actions & Path */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Quick Actions */}
                    <div>
                        <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-4 flex items-center">
                            {t.quickActions}
                        </h2>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                            <button 
                                onClick={() => setMode(AppMode.Chat)}
                                className="glass-panel p-4 rounded-[2rem] flex flex-col items-center justify-center gap-3 hover:bg-white/60 dark:hover:bg-white/10 transition-colors shadow-tier-1 interactive h-32"
                            >
                                <div className="p-3 bg-blue-500/10 text-blue-500 rounded-full">
                                    <ChatIcon />
                                </div>
                                <span className="font-semibold text-sm text-slate-700 dark:text-gray-200">{t.startChat}</span>
                            </button>

                            <button 
                                onClick={() => setMode(AppMode.Quiz)}
                                className="glass-panel p-4 rounded-[2rem] flex flex-col items-center justify-center gap-3 hover:bg-white/60 dark:hover:bg-white/10 transition-colors shadow-tier-1 interactive h-32"
                            >
                                <div className="p-3 bg-purple-500/10 text-purple-500 rounded-full">
                                    <QuizIcon />
                                </div>
                                <span className="font-semibold text-sm text-slate-700 dark:text-gray-200">{t.takeQuiz}</span>
                            </button>

                            <button 
                                onClick={() => setMode(AppMode.Grader)}
                                className="glass-panel p-4 rounded-[2rem] flex flex-col items-center justify-center gap-3 hover:bg-white/60 dark:hover:bg-white/10 transition-colors shadow-tier-1 interactive h-32"
                            >
                                <div className="p-3 bg-green-500/10 text-green-500 rounded-full">
                                    <GradeIcon />
                                </div>
                                <span className="font-semibold text-sm text-slate-700 dark:text-gray-200">{t.submitCode}</span>
                            </button>

                            <button 
                                onClick={() => setMode(AppMode.Mistakes)}
                                className="glass-panel p-4 rounded-[2rem] flex flex-col items-center justify-center gap-3 hover:bg-white/60 dark:hover:bg-white/10 transition-colors shadow-tier-1 interactive h-32"
                            >
                                <div className="p-3 bg-orange-500/10 text-orange-500 rounded-full">
                                    <BookIcon />
                                </div>
                                <span className="font-semibold text-sm text-slate-700 dark:text-gray-200">{t.reviewMistakes}</span>
                            </button>
                        </div>
                    </div>

                    {/* Skill Tree / Progress Preview */}
                    <div className="glass-panel p-6 rounded-[2rem] shadow-tier-2">
                        <div className="flex items-center justify-between mb-6">
                             <h2 className="text-xl font-bold text-slate-800 dark:text-white">
                                {t.skillTree}
                            </h2>
                            <button 
                                onClick={() => setViewAllCourses(!viewAllCourses)}
                                className="text-sm text-blue-500 font-medium hover:underline interactive px-2 py-1 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20"
                            >
                                {viewAllCourses ? t.showLess : t.viewAll}
                            </button>
                        </div>
                        
                        <div className="space-y-4">
                            {/* Mock Course Items */}
                            <div className="flex items-center p-3 rounded-2xl hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer interactive">
                                <div className="w-10 h-10 rounded-full bg-green-500/20 text-green-500 flex items-center justify-center font-bold mr-4">
                                    ✓
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-bold text-slate-700 dark:text-white text-sm">{t.unit1}</h4>
                                    <p className="text-xs text-slate-500 dark:text-gray-400">{t.mastered} • 150/150 XP</p>
                                </div>
                            </div>

                            <div className="flex items-center p-3 rounded-2xl bg-blue-500/5 border border-blue-500/20 cursor-pointer interactive">
                                <div className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold mr-4 shadow-lg shadow-blue-500/30">
                                    2
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-bold text-slate-700 dark:text-white text-sm">{t.unit2}</h4>
                                    <p className="text-xs text-slate-500 dark:text-gray-400">{t.inProgress} • 45/200 XP</p>
                                </div>
                                <button className="px-4 py-1.5 bg-blue-500 text-white text-xs font-bold rounded-full shadow-md">
                                    {t.resume}
                                </button>
                            </div>

                            <div className="flex items-center p-3 rounded-2xl hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-not-allowed opacity-60">
                                <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-white/10 text-gray-400 flex items-center justify-center font-bold mr-4">
                                    3
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-bold text-slate-700 dark:text-white text-sm">{t.unit3}</h4>
                                    <p className="text-xs text-slate-500 dark:text-gray-400">{t.locked}</p>
                                </div>
                            </div>

                            {/* Additional items shown when View All is clicked */}
                            {viewAllCourses && (
                                <div className="animate-enter space-y-4 pt-4 border-t border-gray-100 dark:border-white/5">
                                    <div className="flex items-center p-3 rounded-2xl hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-not-allowed opacity-60">
                                        <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-white/10 text-gray-400 flex items-center justify-center font-bold mr-4">
                                            4
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-bold text-slate-700 dark:text-white text-sm">{t.unit4}</h4>
                                            <p className="text-xs text-slate-500 dark:text-gray-400">{t.locked}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center p-3 rounded-2xl hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-not-allowed opacity-60">
                                        <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-white/10 text-gray-400 flex items-center justify-center font-bold mr-4">
                                            5
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-bold text-slate-700 dark:text-white text-sm">{t.unit5}</h4>
                                            <p className="text-xs text-slate-500 dark:text-gray-400">{t.locked}</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Column: Achievements & Status */}
                <div className="space-y-6">
                    <div className="glass-panel p-6 rounded-[2rem] shadow-tier-2 h-full">
                         <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-4">
                            {t.achievements}
                        </h2>
                        
                        <div className="space-y-4">
                            {/* Static Achievements for Demo */}
                            <div className="flex items-center gap-3">
                                <div className="text-2xl grayscale opacity-50">🥚</div>
                                <div>
                                    <h4 className="text-sm font-bold text-slate-700 dark:text-gray-300">{t.achieve1Title}</h4>
                                    <p className="text-xs text-slate-500">{t.achieve1Desc}</p>
                                </div>
                            </div>
                             <div className="flex items-center gap-3">
                                <div className="text-2xl">🔥</div>
                                <div>
                                    <h4 className="text-sm font-bold text-slate-800 dark:text-white">{t.achieve2Title}</h4>
                                    <p className="text-xs text-slate-500">{t.achieve2Desc}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="text-2xl grayscale opacity-50">💻</div>
                                <div>
                                    <h4 className="text-sm font-bold text-slate-700 dark:text-gray-300">{t.achieve3Title}</h4>
                                    <p className="text-xs text-slate-500">{t.achieve3Desc}</p>
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 pt-6 border-t border-gray-200 dark:border-white/10">
                            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3">{t.weakAreas}</h3>
                            <div className="flex flex-wrap gap-2">
                                <span className="px-3 py-1 rounded-full bg-red-100 dark:bg-red-900/20 text-red-500 text-xs font-bold border border-red-200 dark:border-red-500/20">{t.fsm}</span>
                                <span className="px-3 py-1 rounded-full bg-red-100 dark:bg-red-900/20 text-red-500 text-xs font-bold border border-red-200 dark:border-red-500/20">{t.logicGates}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
