
import React, { useState } from 'react';
import { analyzeCode } from '../services/geminiService';
import { Language, AwardXPCallback } from '../types';

interface SandboxProps {
    language: Language;
    onAwardXP: AwardXPCallback;
}

const translations = {
    en: {
        title: 'Code Sandbox',
        desc: 'Simulate execution, debug logic, and analyze Big O complexity.',
        editor: 'editor',
        clear: 'Clear',
        output: 'output & analysis',
        run: 'RUN',
        running: 'Running...',
        placeholder: (lang: string) => `Write your ${lang} code here...`,
        empty: 'Output will appear here...',
        analyzing: 'Analyzing and simulating execution...'
    },
    zh: {
        title: '代码沙盒',
        desc: '模拟执行、调试逻辑并分析时间复杂度。',
        editor: '编辑器',
        clear: '清空',
        output: '输出与分析',
        run: '运行',
        running: '运行中...',
        placeholder: (lang: string) => `在此编写您的 ${lang} 代码...`,
        empty: '输出将显示在这里...',
        analyzing: '正在分析并模拟执行...'
    }
};

const CodeSandbox: React.FC<SandboxProps> = ({ language, onAwardXP }) => {
    const t = translations[language];
    const [code, setCode] = useState('');
    const [lang, setLang] = useState('Python');
    const [output, setOutput] = useState('');
    const [isRunnning, setIsRunning] = useState(false);

    const handleRun = async () => {
        if (!code.trim()) return;
        setIsRunning(true);
        setOutput(t.analyzing);
        const analysis = await analyzeCode(code, lang, language);
        setOutput(analysis);
        setIsRunning(false);
        // XP for active experimentation/learning
        onAwardXP(5, 'Code Run');
    };

    return (
        <div className="p-8 h-full overflow-y-auto w-full max-w-6xl mx-auto custom-scrollbar animate-enter">
            <div className="flex flex-col h-full">
                <div className="mb-6 flex justify-between items-end">
                    <div>
                        <h2 className="text-3xl font-bold text-slate-800 dark:text-white mb-2">{t.title}</h2>
                        <p className="text-slate-500 dark:text-gray-400 text-sm">{t.desc}</p>
                    </div>
                    <div className="relative">
                        <select 
                            value={lang} 
                            onChange={(e) => setLang(e.target.value)}
                            className="appearance-none glass-panel rounded-2xl px-5 py-2 pr-8 text-sm text-slate-800 dark:text-white focus:ring-2 focus:ring-[#007AFF] outline-none cursor-pointer font-medium shadow-tier-1"
                        >
                            <option value="Python">Python</option>
                            <option value="Pseudocode">Pseudocode</option>
                            <option value="VB.NET">VB.NET</option>
                            <option value="Java">Java</option>
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                        </div>
                    </div>
                </div>

                <div className="flex-1 flex flex-col md:flex-row gap-6 min-h-0 pb-6">
                    {/* Editor Column */}
                    <div className="flex-1 flex flex-col gap-3 min-h-0">
                        {/* Detached Header */}
                        <div className="glass-panel px-6 py-2.5 rounded-[2rem] flex justify-between items-center shadow-tier-1 flex-shrink-0">
                            <span className="text-xs font-mono text-slate-500 dark:text-gray-400 uppercase tracking-widest">{t.editor}</span>
                            <button 
                                onClick={() => setCode('')}
                                className="text-xs text-red-400 hover:text-red-500 font-medium px-2 py-1 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors interactive"
                            >
                                {t.clear}
                            </button>
                        </div>
                        
                        {/* Detached Body */}
                        <div className="flex-1 flex flex-col glass-panel rounded-[2rem] overflow-hidden shadow-tier-2 bg-slate-50/50 dark:bg-[#151516]/50">
                            <textarea 
                                value={code}
                                onChange={(e) => setCode(e.target.value)}
                                className="flex-1 bg-transparent border-none p-6 font-mono text-sm text-slate-800 dark:text-gray-200 resize-none focus:ring-0 leading-relaxed"
                                placeholder={t.placeholder(lang)}
                                spellCheck={false}
                            />
                        </div>
                    </div>

                    {/* Output Column */}
                    <div className="flex-1 flex flex-col gap-3 min-h-0">
                        {/* Detached Header */}
                        <div className="glass-panel px-6 py-2.5 rounded-[2rem] flex justify-between items-center shadow-tier-1 flex-shrink-0">
                            <span className="text-xs font-mono text-slate-500 dark:text-gray-400 uppercase tracking-widest">{t.output}</span>
                            <button 
                                onClick={handleRun}
                                disabled={isRunnning || !code.trim()}
                                className="bg-[#34C759] hover:bg-[#2da84a] text-white px-4 py-1.5 rounded-full text-xs font-bold interactive disabled:opacity-50 shadow-tier-1"
                            >
                                {isRunnning ? t.running : t.run}
                            </button>
                        </div>

                        {/* Detached Body */}
                        <div className="flex-1 flex flex-col glass-panel rounded-[2rem] overflow-hidden shadow-tier-2 relative">
                            <div className="flex-1 p-6 overflow-y-auto custom-scrollbar bg-transparent">
                                {output ? (
                                    <div className="prose prose-sm prose-slate dark:prose-invert max-w-none">
                                        <pre className="bg-transparent p-0 m-0 whitespace-pre-wrap font-mono text-xs md:text-sm text-slate-700 dark:text-gray-300">
                                            {output}
                                        </pre>
                                    </div>
                                ) : (
                                    <div className="h-full flex items-center justify-center text-slate-400 dark:text-gray-600 text-sm italic">
                                        {t.empty}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CodeSandbox;
