
import React, { useState, useRef } from 'react';
import { generateOrEditImage } from '../services/geminiService';
import { Language, AwardXPCallback } from '../types';
import { ImageIcon, AttachmentIcon, XIcon, SendIcon } from './Icons';

interface ImageStudioProps {
    language: Language;
    onAwardXP: AwardXPCallback;
}

const translations = {
    en: {
        title: 'Image Studio',
        desc: 'Generate high-quality 4K images or edit existing photos using Gemini.',
        promptPlaceholder: 'Describe the image you want to create or edit...',
        generate: 'Generate',
        generating: 'Dreaming...',
        aspectRatio: 'Aspect Ratio',
        size: 'Resolution',
        uploadRef: 'Reference Image (for editing)',
        download: 'Download',
        generated: 'Generated Result',
        editMode: 'Use "Flash" for editing, "Pro" for generating.'
    },
    zh: {
        title: '图像工作室',
        desc: '使用 Gemini 生成高质量 4K 图像或编辑现有照片。',
        promptPlaceholder: '描述您想要创建或编辑的图像...',
        generate: '生成',
        generating: '构思中...',
        aspectRatio: '纵横比',
        size: '分辨率',
        uploadRef: '参考图像（用于编辑）',
        download: '下载',
        generated: '生成结果',
        editMode: '使用“Flash”进行编辑，使用“Pro”进行生成。'
    }
};

const ImageStudio: React.FC<ImageStudioProps> = ({ language, onAwardXP }) => {
    const t = translations[language];
    const [prompt, setPrompt] = useState('');
    const [resultImage, setResultImage] = useState<string | null>(null);
    const [refImage, setRefImage] = useState<string | null>(null);
    const [aspectRatio, setAspectRatio] = useState('1:1');
    const [size, setSize] = useState('1K');
    const [loading, setLoading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onloadend = () => {
                setRefImage(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleGenerate = async () => {
        if (!prompt.trim()) return;
        setLoading(true);
        setResultImage(null);

        // Strip data:image/png;base64, prefix for service if present
        const refImageBase64 = refImage ? refImage.split(',')[1] : null;

        const base64Data = await generateOrEditImage(prompt, refImageBase64, aspectRatio, size, language);
        
        if (base64Data) {
            setResultImage(`data:image/png;base64,${base64Data}`);
            onAwardXP(20, refImage ? 'Image Edited' : 'Image Generated');
        }
        setLoading(false);
    };

    return (
        <div className="p-8 h-full overflow-y-auto w-full max-w-6xl mx-auto custom-scrollbar animate-enter">
            <div className="flex flex-col h-full">
                <div className="mb-8">
                    <h2 className="text-3xl font-bold text-slate-800 dark:text-white mb-2">{t.title}</h2>
                    <p className="text-slate-500 dark:text-gray-400 text-sm">{t.desc}</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0 pb-6">
                    {/* Controls */}
                    <div className="lg:col-span-1 h-full">
                        <div className="glass-panel p-6 rounded-[2rem] h-full flex flex-col shadow-tier-2">
                            {/* Prompt Input */}
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Prompt</label>
                            <textarea
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                placeholder={t.promptPlaceholder}
                                className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#007AFF] outline-none text-black dark:text-white resize-none h-32 mb-4"
                            />

                            {/* Reference Image */}
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">{t.uploadRef}</label>
                            <div className="mb-4">
                                {refImage ? (
                                    <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-white/10 shadow-sm">
                                        <img src={refImage} alt="Ref" className="w-full h-32 object-cover" />
                                        <button 
                                            onClick={() => setRefImage(null)}
                                            className="absolute top-2 right-2 bg-black/50 text-white p-1 rounded-full hover:bg-red-500 transition-colors interactive"
                                        >
                                            <XIcon />
                                        </button>
                                    </div>
                                ) : (
                                    <button 
                                        onClick={() => fileInputRef.current?.click()}
                                        className="w-full h-32 border-2 border-dashed border-gray-300 dark:border-white/10 rounded-2xl flex flex-col items-center justify-center text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors interactive"
                                    >
                                        <AttachmentIcon />
                                        <span className="text-xs mt-2">Upload Image</span>
                                    </button>
                                )}
                                <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileChange} accept="image/*" />
                            </div>

                            {/* Settings */}
                            <div className="grid grid-cols-2 gap-4 mb-6">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">{t.aspectRatio}</label>
                                    <select 
                                        value={aspectRatio}
                                        onChange={(e) => setAspectRatio(e.target.value)}
                                        className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl px-3 py-2 text-sm text-black dark:text-white outline-none"
                                    >
                                        {['1:1', '3:4', '4:3', '9:16', '16:9'].map(r => <option key={r} value={r}>{r}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">{t.size}</label>
                                    <select 
                                        value={size}
                                        onChange={(e) => setSize(e.target.value)}
                                        disabled={!!refImage} // Size config only for Pro Image Gen
                                        className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl px-3 py-2 text-sm text-black dark:text-white outline-none disabled:opacity-50"
                                    >
                                        {['1K', '2K', '4K'].map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                </div>
                            </div>

                            <button 
                                onClick={handleGenerate}
                                disabled={!prompt.trim() || loading}
                                className="w-full py-3 bg-[#007AFF] hover:bg-[#0062cc] text-white font-bold rounded-2xl shadow-tier-2 disabled:opacity-50 disabled:cursor-not-allowed interactive flex items-center justify-center space-x-2 mt-auto"
                            >
                                {loading ? (
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                ) : (
                                    <>
                                        <ImageIcon />
                                        <span>{t.generate}</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Result Area */}
                    <div className="lg:col-span-2 glass-panel rounded-[2rem] shadow-tier-2 flex items-center justify-center relative overflow-hidden h-full">
                        {resultImage ? (
                            <div className="relative w-full h-full flex flex-col">
                                <img src={resultImage} alt="Generated" className="w-full h-full object-contain p-4" />
                                <a 
                                    href={resultImage} 
                                    download={`gemini-generated-${Date.now()}.png`}
                                    className="absolute bottom-6 right-6 bg-white dark:bg-[#1C1C1E] text-black dark:text-white px-6 py-2 rounded-full shadow-tier-2 font-medium interactive"
                                >
                                    {t.download}
                                </a>
                            </div>
                        ) : (
                            <div className="text-center opacity-40">
                                <div className="w-24 h-24 mx-auto mb-4 bg-gray-200 dark:bg-white/10 rounded-full flex items-center justify-center">
                                    <ImageIcon />
                                </div>
                                <p className="text-lg font-medium text-slate-500 dark:text-gray-400">{t.generated}</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ImageStudio;
