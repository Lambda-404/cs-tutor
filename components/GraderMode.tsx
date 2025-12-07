
import React, { useState, useRef } from 'react';
import { gradeSubmission } from '../services/geminiService';
import { Attachment, Language, AwardXPCallback } from '../types';
import { AttachmentIcon, XIcon } from './Icons';

interface GraderProps {
    language: Language;
    onAwardXP: AwardXPCallback;
}

const translations = {
    en: {
        title: 'AI Grader',
        desc: 'Upload your pseudo-code, program code, or theory answers. The AI will mark it against Cambridge 9618 standards.',
        placeholder: 'Paste your code or answer here...',
        gradeBtn: 'Grade & Earn XP',
        marking: 'Marking...',
        feedbackTitle: 'Examiner Feedback',
        analyzing: 'Analyzing against marking scheme...',
        empty: 'Submit work to receive feedback.',
        submission: 'Submission',
        clear: 'Clear'
    },
    zh: {
        title: 'AI 智能批改',
        desc: '上传您的伪代码、程序代码或理论答案。AI 将根据剑桥 9618 标准进行批改。',
        placeholder: '在此粘贴代码或答案...',
        gradeBtn: '评分并获取经验',
        marking: '评分中...',
        feedbackTitle: '考官反馈',
        analyzing: '正在根据评分标准分析...',
        empty: '提交作业以获取反馈。',
        submission: '提交内容',
        clear: '清空'
    }
};

const GraderMode: React.FC<GraderProps> = ({ language, onAwardXP }) => {
  const t = translations[language];
  const [text, setText] = useState('');
  const [files, setFiles] = useState<Attachment[]>([]);
  const [feedback, setFeedback] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      Array.from(e.target.files).forEach((file: File) => {
          setUploadProgress(10);
          const reader = new FileReader();
          
          reader.onprogress = (event) => {
            if (event.lengthComputable) {
                setUploadProgress(Math.round((event.loaded / event.total) * 100));
            }
          };

          reader.onloadend = () => {
            const base64String = reader.result as string;
            const base64Data = base64String.split(',')[1];
            setFiles(prev => [...prev, {
              type: 'file',
              mimeType: file.type,
              data: base64Data,
              name: file.name
            }]);
            setUploadProgress(0);
          };
          reader.readAsDataURL(file);
      });
    }
  };

  const handleGrade = async () => {
    if (!text && files.length === 0) return;
    setLoading(true);
    setFeedback('');
    
    // Call AI
    const result = await gradeSubmission(text, files, language);
    setFeedback(result);
    setLoading(false);

    // Duolingo Logic: Reward the EFFORT of submitting homework, not just the result.
    onAwardXP(50, 'Coursework Submitted');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
        handleGrade();
    }
  };

  return (
    <div className="p-8 h-full overflow-y-auto w-full max-w-6xl mx-auto custom-scrollbar animate-enter">
      <div className="flex flex-col h-full">
        <div className="mb-6 md:mb-8 flex-shrink-0">
            <h2 className="text-3xl font-bold text-slate-800 dark:text-white mb-2">{t.title}</h2>
            <p className="text-slate-500 dark:text-gray-400">{t.desc}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1 min-h-0 pb-6">
          {/* Input Section */}
          <div className="flex-1 flex flex-col gap-3 min-h-0">
            {/* Detached Header */}
            <div className="glass-panel px-6 py-2.5 rounded-[2rem] flex justify-between items-center shadow-tier-1 flex-shrink-0">
                <span className="text-xs font-mono text-slate-500 dark:text-gray-400 uppercase tracking-widest">{t.submission}</span>
                <button 
                    onClick={() => { setText(''); setFiles([]); }}
                    className="text-xs text-red-400 hover:text-red-500 font-medium px-2 py-1 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors interactive"
                >
                    {t.clear}
                </button>
            </div>

            {/* Detached Body */}
            <div className="flex-1 flex flex-col glass-panel rounded-[2rem] shadow-tier-2 overflow-hidden bg-slate-50/50 dark:bg-[#151516]/50">
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={t.placeholder}
                className="w-full flex-1 bg-transparent border-none text-slate-800 dark:text-gray-200 placeholder-slate-400 dark:placeholder-gray-500 focus:ring-0 resize-none font-mono text-sm p-6 leading-relaxed custom-scrollbar"
              ></textarea>
              
              <div className="flex items-center justify-between p-4 border-t border-slate-200 dark:border-white/10 glass-panel rounded-b-[2rem] rounded-t-none border-x-0 border-b-0">
                 <div className="flex gap-2 overflow-x-auto max-w-[150px] md:max-w-[250px] custom-scrollbar">
                    {files.map((f, i) => (
                        <div key={i} className="relative group bg-white/50 dark:bg-black/30 px-3 py-1.5 rounded-2xl text-xs flex items-center border border-slate-200 dark:border-white/10 text-slate-700 dark:text-gray-300">
                            <span className="truncate max-w-[80px]">{f.name}</span>
                            <button 
                                onClick={() => setFiles(prev => prev.filter((_, idx) => idx !== i))}
                                className="ml-2 text-red-400 hover:text-red-300"
                            >
                                <XIcon />
                            </button>
                        </div>
                    ))}
                 </div>
                 <div className="flex space-x-2 items-center">
                    {uploadProgress > 0 && <span className="text-xs text-blue-400">{uploadProgress}%</span>}
                    <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileChange} multiple />
                    <button 
                        onClick={() => fileInputRef.current?.click()}
                        className="p-3 text-slate-500 dark:text-gray-400 hover:text-slate-800 dark:hover:text-white transition-colors hover:bg-slate-200 dark:hover:bg-white/10 rounded-full interactive"
                        title="Attach File"
                    >
                        <AttachmentIcon />
                    </button>
                    <button
                        onClick={handleGrade}
                        disabled={loading || (!text && files.length === 0)}
                        className="px-6 py-2.5 bg-[#007AFF] hover:bg-[#0062cc] text-white rounded-full font-medium disabled:opacity-50 interactive shadow-tier-2 text-sm"
                        title="Grade (Ctrl+Enter)"
                    >
                        {loading ? t.marking : t.gradeBtn}
                    </button>
                 </div>
              </div>
            </div>
          </div>

          {/* Output Section */}
          <div className="flex-1 flex flex-col gap-3 min-h-0">
             {/* Detached Header */}
            <div className="glass-panel px-6 py-2.5 rounded-[2rem] flex justify-between items-center shadow-tier-1 flex-shrink-0">
                <span className="text-xs font-mono text-slate-500 dark:text-gray-400 uppercase tracking-widest">{t.feedbackTitle}</span>
            </div>

            {/* Detached Body */}
            <div className="flex-1 flex flex-col glass-panel rounded-[2rem] overflow-hidden shadow-tier-2 relative">
                {loading ? (
                <div className="flex-1 flex flex-col items-center justify-center space-y-4 opacity-70">
                    <div className="relative w-16 h-16">
                        <div className="absolute inset-0 border-4 border-slate-300 dark:border-white/20 rounded-full"></div>
                        <div className="absolute inset-0 border-4 border-[#007AFF] border-t-transparent rounded-full animate-spin"></div>
                    </div>
                    <span className="text-sm animate-pulse text-slate-600 dark:text-gray-300">{t.analyzing}</span>
                </div>
                ) : feedback ? (
                    <div className="prose prose-slate dark:prose-invert prose-sm max-w-none overflow-y-auto flex-1 p-6 custom-scrollbar text-slate-700 dark:text-gray-200">
                        <div className="whitespace-pre-wrap">{feedback}</div>
                    </div>
                ) : (
                    <div className="flex-1 flex items-center justify-center text-slate-400 dark:text-gray-500 text-sm italic flex-col">
                        <span>{t.empty}</span>
                    </div>
                )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GraderMode;
