
import React, { useState, useEffect } from 'react';
import { QuizQuestion, Language, AwardXPCallback } from '../types';
import { generateQuizQuestions } from '../services/geminiService';
import { FlameIcon } from './Icons';

interface QuizProps {
  onAwardXP: AwardXPCallback;
  language: Language;
}

const TOPICS = [
    "Information Representation", "Communication & Networking", "Hardware", "Processor Fundamentals",
    "System Software", "Security & Data", "Ethics & Ownership", "Databases",
    "Algorithm Design", "Data Types", "Programming", "Software Development", "AI"
];

const TOPICS_ZH: Record<string, string> = {
    "Information Representation": "信息表示",
    "Communication & Networking": "通信与网络",
    "Hardware": "硬件",
    "Processor Fundamentals": "处理器基础",
    "System Software": "系统软件",
    "Security & Data": "安全与数据",
    "Ethics & Ownership": "伦理与所有权",
    "Databases": "数据库",
    "Algorithm Design": "算法设计",
    "Data Types": "数据类型",
    "Programming": "编程",
    "Software Development": "软件开发",
    "AI": "人工智能"
};

const translations = {
    en: {
        configTitle: 'Select Topics',
        configDesc: 'Choose areas to focus your revision.',
        start: 'Start Quiz',
        loadingTitle: 'Generating Quiz...',
        loadingDesc: 'Consulting Cambridge Syllabus',
        backSetup: 'Back',
        complete: 'Lesson Complete!',
        performance: "You've strengthened your skills!",
        grade: 'Accuracy',
        score: 'Score',
        earned: 'Total XP',
        newQuiz: 'Start Another',
        next: 'Next',
        finish: 'Complete Lesson',
        correct: 'Correct!',
        incorrect: 'Incorrect',
        combo: 'Combo'
    },
    zh: {
        configTitle: '选择主题',
        configDesc: '选择您要复习的领域。',
        start: '开始测验',
        loadingTitle: '正在生成测验...',
        loadingDesc: '正在查阅剑桥大纲',
        backSetup: '返回',
        complete: '课程完成！',
        performance: "您的技能已得到强化！",
        grade: '准确率',
        score: '分数',
        earned: '总经验',
        newQuiz: '开始新测验',
        next: '下一题',
        finish: '完成课程',
        correct: '正确！',
        incorrect: '错误',
        combo: '连击'
    }
};

const QuizMode: React.FC<QuizProps> = ({ onAwardXP, language }) => {
  const t = translations[language];
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [loading, setLoading] = useState(false);
  const [score, setScore] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [quizState, setQuizState] = useState<'SETUP' | 'PLAYING' | 'FINISHED'>('SETUP');
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  
  // Gamification States
  const [combo, setCombo] = useState(0);
  const [sessionXP, setSessionXP] = useState(0);

  const startQuiz = async () => {
    setQuizState('PLAYING');
    setLoading(true);
    setCompleted(false);
    setCurrentQIndex(0);
    setScore(0);
    setCombo(0);
    setSessionXP(0);
    setSelectedOption(null);
    setIsAnswered(false);
    const qs = await generateQuizQuestions(selectedTopics, language);
    setQuestions(qs);
    setLoading(false);
  };

  const handleOptionClick = (index: number) => {
    if (isAnswered) return;
    setSelectedOption(index);
    setIsAnswered(true);

    const isCorrect = index === questions[currentQIndex].correctIndex;
    
    if (isCorrect) {
      setScore(s => s + 1);
      const newCombo = combo + 1;
      setCombo(newCombo);
      
      // XP Calculation: Base (10) + Combo Bonus (capped at 5)
      const baseXP = 10;
      const bonusXP = Math.min(newCombo, 5);
      const totalQXP = baseXP + bonusXP;
      
      setSessionXP(prev => prev + totalQXP);
      onAwardXP(totalQXP, newCombo > 1 ? `${t.combo} x${newCombo}!` : 'Correct');
    } else {
      setCombo(0); // Reset combo on error
      // Still award tiny XP for effort/practice, but no combo
      onAwardXP(2, 'Practice'); 
      setSessionXP(prev => prev + 2);
    }
  };

  const nextQuestion = () => {
    if (currentQIndex < questions.length - 1) {
      setCurrentQIndex(prev => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      finishQuiz();
    }
  };

  const finishQuiz = () => {
      setCompleted(true);
      setQuizState('FINISHED');
      
      // Completion Bonus
      const completionBonus = 20;
      setSessionXP(prev => prev + completionBonus);
      onAwardXP(completionBonus, 'Lesson Complete');
  };

  const toggleTopic = (topic: string) => {
      if (selectedTopics.includes(topic)) {
          setSelectedTopics(prev => prev.filter(t => t !== topic));
      } else {
          setSelectedTopics(prev => [...prev, topic]);
      }
  };

  // Bento Grid Setup for Topics
  if (quizState === 'SETUP') {
      return (
        <div className="flex flex-col h-full w-full p-8 overflow-y-auto custom-scrollbar animate-enter">
            <div className="max-w-5xl mx-auto w-full">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h2 className="text-3xl font-bold text-black dark:text-white tracking-tight">{t.configTitle}</h2>
                        <p className="text-gray-500 text-lg mt-1">{t.configDesc}</p>
                    </div>
                    <button
                        onClick={startQuiz}
                        disabled={selectedTopics.length === 0}
                        className="px-6 py-2.5 bg-[#007AFF] hover:bg-[#0062cc] rounded-full text-white font-medium shadow-tier-2 interactive disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {t.start}
                    </button>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 pb-20">
                    {TOPICS.map((topic, idx) => {
                        const isSelected = selectedTopics.includes(topic);
                        const colors = ['from-blue-500', 'from-purple-500', 'from-orange-500', 'from-green-500', 'from-pink-500'];
                        const colorClass = colors[idx % colors.length];

                        return (
                            <button 
                                key={topic}
                                onClick={() => toggleTopic(topic)}
                                className={`glass-panel p-5 h-32 flex flex-col justify-between text-left relative overflow-hidden group rounded-[2rem] interactive ${isSelected ? 'ring-2 ring-[#007AFF] ring-offset-2 ring-offset-[#F5F5F7] dark:ring-offset-black' : ''}`}
                            >
                                <div className={`absolute top-0 right-0 w-16 h-16 bg-gradient-to-br ${colorClass} to-transparent opacity-10 rounded-bl-[2rem] transition-opacity group-hover:opacity-20`}></div>
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${isSelected ? 'bg-[#007AFF] text-white' : 'bg-gray-100 dark:bg-white/10 text-gray-400'}`}>
                                    {isSelected ? '✓' : '+'}
                                </div>
                                <span className="font-semibold text-sm md:text-base text-black dark:text-white z-10">
                                    {language === 'zh' ? TOPICS_ZH[topic] : topic}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
      )
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full w-full">
        <div className="w-12 h-12 border-4 border-[#007AFF]/30 border-t-[#007AFF] rounded-full animate-spin mb-4"></div>
        <h3 className="text-lg font-medium text-black dark:text-white">{t.loadingTitle}</h3>
        <p className="text-gray-500">{t.loadingDesc}</p>
      </div>
    );
  }

  if (completed) {
    const percentage = Math.round((score / questions.length) * 100);
    return (
      <div className="flex items-center justify-center h-full p-8 animate-enter">
        <div className="glass-panel p-8 md:p-12 text-center max-w-md w-full rounded-[2.5rem] shadow-tier-2">
          <h2 className="text-2xl font-bold text-black dark:text-white mb-2">{t.complete}</h2>
          <div className="text-6xl font-bold text-orange-500 my-6">+{sessionXP} XP</div>
          <p className="text-gray-500 mb-8">{t.performance}</p>
          <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="bg-gray-50 dark:bg-white/5 p-4 rounded-[2rem]">
                  <div className="text-xs text-gray-400 uppercase font-bold">{t.grade}</div>
                  <div className="text-xl font-bold text-black dark:text-white mt-1">
                      {percentage}%
                  </div>
              </div>
              <div className="bg-gray-50 dark:bg-white/5 p-4 rounded-[2rem]">
                  <div className="text-xs text-gray-400 uppercase font-bold">{t.earned}</div>
                  <div className="text-xl font-bold text-orange-500 mt-1">{sessionXP}</div>
              </div>
          </div>
          <button 
            onClick={() => setQuizState('SETUP')}
            className="w-full py-3 bg-[#007AFF] hover:bg-[#0062cc] text-white font-semibold rounded-2xl interactive"
          >
            {t.newQuiz}
          </button>
        </div>
      </div>
    );
  }

  const currentQ = questions[currentQIndex];

  return (
    <div className="flex flex-col items-center justify-center h-full w-full p-8 max-w-3xl mx-auto">
      {/* Top Bar: Progress & Combo */}
      <div className="w-full mb-8 flex items-center space-x-4">
          <div className="flex-1">
            <div className="w-full h-2.5 bg-gray-200 dark:bg-white/10 rounded-full overflow-hidden">
                <div 
                    className="h-full bg-[#007AFF] transition-all duration-300 rounded-full"
                    style={{ width: `${((currentQIndex) / questions.length) * 100}%` }}
                ></div>
            </div>
          </div>
          {combo > 1 && (
            <div className="flex items-center space-x-1 px-3 py-1 bg-orange-100 dark:bg-orange-500/20 text-orange-500 rounded-full animate-bounce">
                <FlameIcon />
                <span className="font-bold text-sm">x{combo}</span>
            </div>
          )}
      </div>

      <div className="w-full animate-enter">
        {/* Question */}
        <h3 className="text-2xl font-bold text-black dark:text-white mb-8 leading-tight">
            {currentQ.question}
        </h3>

        {/* Options */}
        <div className="grid grid-cols-1 gap-3">
            {currentQ.options.map((opt, idx) => {
                let cardClass = "hover:bg-gray-50 dark:hover:bg-white/5 border-transparent";
                if (isAnswered) {
                    if (idx === currentQ.correctIndex) {
                        cardClass = "bg-[#34C759]/10 border-[#34C759] text-[#34C759]";
                    } else if (idx === selectedOption) {
                        cardClass = "bg-[#FF3B30]/10 border-[#FF3B30] text-[#FF3B30]";
                    } else {
                        cardClass = "opacity-50";
                    }
                } else if (selectedOption === idx) {
                   cardClass = "bg-gray-100 dark:bg-white/10";
                }

                return (
                    <button
                        key={idx}
                        onClick={() => handleOptionClick(idx)}
                        disabled={isAnswered}
                        className={`p-4 rounded-[1.5rem] border transition-all duration-200 text-left font-medium text-base md:text-lg flex items-center ${cardClass} ${!isAnswered ? 'glass-panel text-black dark:text-white interactive' : ''}`}
                    >
                        <span className="w-8 h-8 rounded-full border border-current flex items-center justify-center text-xs mr-4 opacity-70 flex-shrink-0">
                            {String.fromCharCode(65 + idx)}
                        </span>
                        {opt}
                    </button>
                );
            })}
        </div>

        {/* Feedback Bottom Sheet */}
        <div className="mt-8 h-32">
            {isAnswered && (
                <div className={`animate-enter flex flex-col md:flex-row items-center justify-between p-6 rounded-[2rem] shadow-tier-2 ${selectedOption === currentQ.correctIndex ? 'bg-green-50 dark:bg-[#34C759]/10' : 'bg-red-50 dark:bg-[#FF3B30]/10'}`}>
                    <div className="flex-1 mb-4 md:mb-0 mr-4">
                        <div className={`font-bold text-lg mb-1 ${selectedOption === currentQ.correctIndex ? 'text-[#34C759]' : 'text-[#FF3B30]'}`}>
                            {selectedOption === currentQ.correctIndex ? t.correct : t.incorrect}
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-300">{currentQ.explanation}</p>
                    </div>
                    <button
                        onClick={nextQuestion}
                        className={`px-8 py-3 font-bold rounded-2xl text-white shadow-lg interactive ${selectedOption === currentQ.correctIndex ? 'bg-[#34C759] hover:bg-[#2da84a] shadow-green-500/20' : 'bg-[#FF3B30] hover:bg-[#d6352b] shadow-red-500/20'}`}
                    >
                        {currentQIndex === questions.length - 1 ? t.finish : t.next}
                    </button>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default QuizMode;
