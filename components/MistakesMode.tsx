
import React, { useState, useEffect } from 'react';
import { MistakeEntry, Language, AwardXPCallback } from '../types';
import { PlusIcon, XIcon, BookIcon, CheckIcon, FlameIcon } from './Icons';

interface MistakesProps {
    language: Language;
    onAwardXP: AwardXPCallback;
}

const translations = {
    en: {
        title: 'Skill Strengthening',
        desc: 'Review concepts to maintain your streak and boost retention.',
        addBtn: 'Add Note',
        topic: 'Topic',
        question: 'Concept / Question',
        notes: 'Solution / Notes',
        save: 'Save to Deck',
        cancel: 'Cancel',
        empty: 'No revision cards yet. Add one to start building your deck!',
        delete: 'Remove',
        placeholderTopic: 'e.g., FSM, Sorting Algorithms',
        placeholderQuestion: 'What concept needs practice?',
        placeholderNotes: 'Key points to remember...',
        review: 'Practice',
        reviewed: 'Practiced Today',
        addedXP: '+10 XP added!'
    },
    zh: {
        title: '技能强化',
        desc: '复习概念以保持连胜并增强记忆。',
        addBtn: '添加笔记',
        topic: '主题',
        question: '概念 / 问题',
        notes: '答案 / 笔记',
        save: '保存到卡组',
        cancel: '取消',
        empty: '暂无复习卡。添加一张开始构建卡组！',
        delete: '移除',
        placeholderTopic: '例如：有限状态机，排序算法',
        placeholderQuestion: '什么概念需要练习？',
        placeholderNotes: '需要记住的关键点...',
        review: '练习',
        reviewed: '今日已练习',
        addedXP: '已增加 +10 经验！'
    }
};

const MistakesMode: React.FC<MistakesProps> = ({ language, onAwardXP }) => {
    const t = translations[language];
    const [mistakes, setMistakes] = useState<MistakeEntry[]>([]);
    const [isAdding, setIsAdding] = useState(false);
    const [newTopic, setNewTopic] = useState('');
    const [newQuestion, setNewQuestion] = useState('');
    const [newNotes, setNewNotes] = useState('');

    useEffect(() => {
        const saved = localStorage.getItem('9618_mistakes');
        if (saved) {
            try {
                setMistakes(JSON.parse(saved));
            } catch (e) {
                console.error("Failed to load mistakes", e);
            }
        }
    }, []);

    useEffect(() => {
        localStorage.setItem('9618_mistakes', JSON.stringify(mistakes));
    }, [mistakes]);

    const handleSave = () => {
        if (!newTopic.trim() || !newQuestion.trim()) return;
        
        const entry: MistakeEntry = {
            id: Date.now().toString(),
            topic: newTopic,
            question: newQuestion,
            notes: newNotes,
            date: new Date().toISOString()
        };

        setMistakes(prev => [entry, ...prev]);
        setNewTopic('');
        setNewQuestion('');
        setNewNotes('');
        setIsAdding(false);
        onAwardXP(10, 'Deck Updated'); 
    };

    const handleDelete = (id: string) => {
        setMistakes(prev => prev.filter(m => m.id !== id));
    };

    const handleReview = (id: string) => {
        const now = new Date();
        const today = now.toDateString();

        setMistakes(prev => prev.map(m => {
            if (m.id === id) {
                const last = m.lastReviewed ? new Date(m.lastReviewed).toDateString() : '';
                // Only award points if not reviewed today
                if (last !== today) {
                    onAwardXP(5, 'Concept Strengthened');
                    return { ...m, lastReviewed: now.toISOString() };
                }
            }
            return m;
        }));
    };

    const isReviewedToday = (dateStr?: string) => {
        if (!dateStr) return false;
        return new Date(dateStr).toDateString() === new Date().toDateString();
    };

    return (
        <div className="p-8 h-full overflow-y-auto w-full max-w-6xl mx-auto custom-scrollbar animate-enter">
            <div className="flex flex-col h-full">
                <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <h2 className="text-3xl font-bold text-slate-800 dark:text-white mb-2">{t.title}</h2>
                        <p className="text-slate-500 dark:text-gray-400 text-sm">{t.desc}</p>
                    </div>
                    <button
                        onClick={() => setIsAdding(!isAdding)}
                        className={`px-5 py-2.5 rounded-full font-medium shadow-md interactive flex items-center space-x-2 ${
                            isAdding 
                            ? 'bg-gray-200 dark:bg-white/10 text-gray-600 dark:text-gray-300' 
                            : 'bg-[#007AFF] text-white hover:bg-[#0062cc] shadow-tier-1'
                        }`}
                    >
                        {isAdding ? <XIcon /> : <PlusIcon />}
                        <span>{isAdding ? t.cancel : t.addBtn} <span className="text-xs opacity-70 ml-1">(+10 XP)</span></span>
                    </button>
                </div>

                {/* Add Form */}
                {isAdding && (
                    <div className="mb-8 glass-panel p-6 rounded-[2rem] shadow-tier-2 animate-enter">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">{t.topic}</label>
                                <input 
                                    type="text" 
                                    value={newTopic}
                                    onChange={(e) => setNewTopic(e.target.value)}
                                    placeholder={t.placeholderTopic}
                                    className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#007AFF] outline-none text-black dark:text-white"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">{t.question}</label>
                                <input 
                                    type="text" 
                                    value={newQuestion}
                                    onChange={(e) => setNewQuestion(e.target.value)}
                                    placeholder={t.placeholderQuestion}
                                    className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#007AFF] outline-none text-black dark:text-white"
                                />
                            </div>
                        </div>
                        <div className="space-y-2 mb-4">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">{t.notes}</label>
                            <textarea 
                                value={newNotes}
                                onChange={(e) => setNewNotes(e.target.value)}
                                placeholder={t.placeholderNotes}
                                rows={3}
                                className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#007AFF] outline-none resize-none text-black dark:text-white"
                            />
                        </div>
                        <div className="flex justify-end">
                            <button 
                                onClick={handleSave}
                                disabled={!newTopic.trim() || !newQuestion.trim()}
                                className="px-6 py-2 bg-[#34C759] hover:bg-[#2da84a] text-white font-bold rounded-full shadow-lg shadow-green-500/20 disabled:opacity-50 disabled:cursor-not-allowed interactive"
                            >
                                {t.save} (+10 XP)
                            </button>
                        </div>
                    </div>
                )}

                {/* List */}
                {mistakes.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-center opacity-50 space-y-4">
                        <div className="w-20 h-20 bg-gray-100 dark:bg-white/5 rounded-full flex items-center justify-center text-gray-400">
                            <BookIcon />
                        </div>
                        <p className="text-gray-500 dark:text-gray-400">{t.empty}</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-12">
                        {mistakes.map((entry) => {
                            const reviewedToday = isReviewedToday(entry.lastReviewed);
                            
                            return (
                                <div key={entry.id} className="glass-panel p-6 rounded-[2rem] shadow-tier-1 hover:shadow-tier-2 relative group flex flex-col interactive">
                                    <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button 
                                            onClick={() => handleDelete(entry.id)}
                                            className="text-gray-400 hover:text-red-500 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/10"
                                            title={t.delete}
                                        >
                                            <XIcon />
                                        </button>
                                    </div>
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="inline-block px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-500/10 text-blue-500 text-xs font-bold border border-blue-100 dark:border-blue-500/20">
                                            {entry.topic}
                                        </div>
                                    </div>
                                    <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2 pr-6 leading-tight">
                                        {entry.question}
                                    </h3>
                                    <div className="text-sm text-slate-600 dark:text-gray-400 whitespace-pre-wrap bg-gray-50/50 dark:bg-black/20 p-4 rounded-2xl border border-gray-100 dark:border-white/5 mb-4 flex-1">
                                        {entry.notes}
                                    </div>
                                    <div className="flex items-center justify-between mt-auto">
                                        <div className="text-[10px] text-gray-400 font-medium">
                                            {new Date(entry.date).toLocaleDateString()}
                                        </div>
                                        <button
                                            onClick={() => handleReview(entry.id)}
                                            disabled={reviewedToday}
                                            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-bold interactive ${
                                                reviewedToday 
                                                ? 'bg-green-100 dark:bg-green-500/20 text-green-600 dark:text-green-400 cursor-default' 
                                                : 'bg-orange-100 dark:bg-orange-500/10 text-orange-500 hover:bg-orange-200 dark:hover:bg-orange-500/20 cursor-pointer'
                                            }`}
                                        >
                                            {reviewedToday ? <CheckIcon /> : <FlameIcon />}
                                            <span>{reviewedToday ? t.reviewed : `${t.review} (+5 XP)`}</span>
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MistakesMode;
