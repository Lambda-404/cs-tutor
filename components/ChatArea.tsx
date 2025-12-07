
import React, { useState, useRef, useEffect } from 'react';
import { Message, Sender, Attachment, TeachingPersona, Language, AwardXPCallback, ChatConfig } from '../types';
import { SendIcon, AttachmentIcon, XIcon, RobotIcon, CopyIcon, CheckIcon, BrainIcon, SearchIcon, GlobeIcon } from './Icons';
import { chatWithGemini } from '../services/geminiService';

declare global {
  interface Window {
    mermaid: any;
    marked: {
        parse: (text: string) => string;
    };
    hljs: {
        highlightElement: (element: HTMLElement) => void;
    };
    katex: {
        renderToString: (tex: string, options?: any) => string;
    };
  }
}

interface ChatAreaProps {
    language: Language;
    onAwardXP: AwardXPCallback;
}

const translations = {
    en: {
        standard: 'Standard',
        socratic: 'Socratic',
        examiner: 'Examiner',
        placeholder: 'Ask a question...',
        placeholderExaminer: "Type 'start'...",
        upload: 'Upload',
        send: 'Send',
        greeting: "Hello. I'm your A-Level Computer Science tutor. How can I help you today?",
        copy: 'Copy',
        copied: 'Copied',
        thinking: 'Deep Think',
        search: 'Search',
        sources: 'Sources'
    },
    zh: {
        standard: '标准',
        socratic: '启发式',
        examiner: '考官',
        placeholder: '输入问题...',
        placeholderExaminer: "输入 '开始'...",
        upload: '上传',
        send: '发送',
        greeting: "你好。我是你的 A-Level 计算机科学导师。今天我能为你做些什么？",
        copy: '复制',
        copied: '已复制',
        thinking: '深度思考',
        search: '联网搜索',
        sources: '来源'
    }
};

const CodeBlock: React.FC<{ code: string; language: string; t: any }> = ({ code, language, t }) => {
    const [copied, setCopied] = useState(false);
    const codeRef = useRef<HTMLElement>(null);

    useEffect(() => {
        if (codeRef.current && window.hljs) {
            window.hljs.highlightElement(codeRef.current);
        }
    }, [code, language]);

    const handleCopy = () => {
        navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="my-3 rounded-2xl overflow-hidden border border-gray-200 dark:border-white/10 bg-[#1e1e1e] shadow-tier-1">
            <div className="flex items-center justify-between px-4 py-2 bg-[#252526] border-b border-white/5">
                <span className="text-[10px] font-mono text-gray-400 lowercase">{language || 'code'}</span>
                <button 
                    onClick={handleCopy}
                    className="flex items-center space-x-1.5 text-[10px] text-gray-400 hover:text-white transition-colors px-2 py-1 hover:bg-white/10 rounded-full interactive"
                >
                    {copied ? <CheckIcon /> : <CopyIcon />}
                    <span>{copied ? t.copied : t.copy}</span>
                </button>
            </div>
            <pre className="p-4 m-0 overflow-x-auto text-sm leading-relaxed custom-scrollbar">
                <code ref={codeRef} className={`language-${language} bg-transparent`}>
                    {code}
                </code>
            </pre>
        </div>
    );
};

const MarkdownText: React.FC<{ content: string }> = ({ content }) => {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!containerRef.current) return;

        if (window.marked && window.katex) {
            const renderMath = (tex: string, displayMode: boolean) => {
                try {
                    return window.katex.renderToString(tex, { displayMode, throwOnError: false });
                } catch (e) {
                    return tex;
                }
            };

            const renderedContent = content
               .replace(/\$\$([\s\S]*?)\$\$/g, (_, tex) => renderMath(tex, true))
               .replace(/\$([^$\n]+?)\$/g, (_, tex) => renderMath(tex, false));
               
            containerRef.current.innerHTML = window.marked.parse(renderedContent);
            
            const links = containerRef.current.querySelectorAll('a');
            links.forEach(a => {
                a.className = "text-[#007AFF] hover:underline font-medium";
                a.target = "_blank";
            });
        } else {
            containerRef.current.textContent = content;
        }
    }, [content]);

    return <div ref={containerRef} className="prose dark:prose-invert max-w-none text-[15px] leading-relaxed break-words text-current" />;
};


const ChatArea: React.FC<ChatAreaProps> = ({ language, onAwardXP }) => {
  const t = translations[language];
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [persona, setPersona] = useState<TeachingPersona>('standard');
  const [chatConfig, setChatConfig] = useState<ChatConfig>({ useSearch: false, useThinking: false });
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    const savedHistory = localStorage.getItem('9618_chat_history');
    if (savedHistory) {
        try {
            setMessages(JSON.parse(savedHistory));
        } catch (e) {
            initDefaultMessage();
        }
    } else {
        initDefaultMessage();
    }
  }, []);

  useEffect(() => {
      if (messages.length === 0) {
          initDefaultMessage();
      }
  }, [language]);

  useEffect(() => {
    if (messages.length > 0) {
        localStorage.setItem('9618_chat_history', JSON.stringify(messages));
        scrollToBottom();
        setTimeout(() => {
            if (window.mermaid) {
                window.mermaid.init(undefined, document.querySelectorAll('.mermaid'));
            }
        }, 100);
    }
  }, [messages]);

  const initDefaultMessage = () => {
    setMessages([{
        id: '1',
        sender: Sender.AI,
        content: t.greeting,
        timestamp: Date.now(),
        persona: 'standard'
    }]);
  };

  const processFile = (file: File) => {
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
      const type = file.type.startsWith('image/') ? 'image' : file.type.startsWith('video/') ? 'video' : 'file';
      
      setAttachments(prev => [...prev, {
        type: type as any,
        mimeType: file.type,
        data: base64Data,
        name: file.name
      }]);
      setUploadProgress(0);
    };
    reader.readAsDataURL(file);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      Array.from(e.target.files).forEach((file: File) => processFile(file));
    }
  };

  const handleSend = async () => {
    if ((!input.trim() && attachments.length === 0) || isLoading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: Sender.User,
      content: input,
      attachments: [...attachments],
      timestamp: Date.now(),
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    const currentAttachments = [...attachments];
    setAttachments([]);
    setIsLoading(true);

    onAwardXP(2, 'Question Asked');

    const history = messages.slice(-10).map(m => `${m.sender}: ${m.content}`);
    const response = await chatWithGemini(history, userMsg.content, currentAttachments, persona, language, chatConfig);

    const aiMsg: Message = {
      id: (Date.now() + 1).toString(),
      sender: Sender.AI,
      content: response.text,
      timestamp: Date.now(),
      persona: persona,
      groundingSources: response.groundingSources
    };

    setMessages(prev => [...prev, aiMsg]);
    setIsLoading(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        handleSend();
    } else if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSend();
    }
  };

  const renderMessageContent = (content: string) => {
    const mermaidRegex = /```mermaid\n([\s\S]*?)```/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    const processTextChunk = (text: string, keyPrefix: string) => {
        const codeRegex = /```(\w+)?\n([\s\S]*?)```/g;
        const subParts = [];
        let subLastIndex = 0;
        let subMatch;

        while ((subMatch = codeRegex.exec(text)) !== null) {
            if (subMatch.index > subLastIndex) {
                const textSegment = text.substring(subLastIndex, subMatch.index);
                subParts.push(<MarkdownText key={`${keyPrefix}-md-${subLastIndex}`} content={textSegment} />);
            }
            subParts.push(
                <CodeBlock 
                    key={`${keyPrefix}-code-${subMatch.index}`} 
                    language={subMatch[1] || ''} 
                    code={subMatch[2]}
                    t={t}
                />
            );
            subLastIndex = codeRegex.lastIndex;
        }

        if (subLastIndex < text.length) {
            const textSegment = text.substring(subLastIndex);
            subParts.push(<MarkdownText key={`${keyPrefix}-md-end`} content={textSegment} />);
        }
        return subParts;
    };

    while ((match = mermaidRegex.exec(content)) !== null) {
        if (match.index > lastIndex) {
            parts.push(...processTextChunk(content.substring(lastIndex, match.index), `chunk-${lastIndex}`));
        }
        parts.push(
            <div key={`mermaid-${match.index}`} className="my-3 p-2 bg-white dark:bg-black rounded-xl border border-gray-200 dark:border-white/10 overflow-x-auto shadow-tier-1">
                <div className="mermaid text-center">
                    {match[1]}
                </div>
            </div>
        );
        lastIndex = mermaidRegex.lastIndex;
    }
    
    if (lastIndex < content.length) {
        parts.push(...processTextChunk(content.substring(lastIndex), `chunk-${lastIndex}`));
    }
    return parts;
  };

  return (
    <div className="flex flex-col h-full w-full relative animate-enter">
      
      {/* Messages Area */}
      <div className="flex-1 w-full h-full overflow-y-auto px-6 pt-6 pb-56 custom-scrollbar">
        <div className="max-w-4xl mx-auto space-y-6">
            {messages.map((msg) => (
            <div key={msg.id} className={`flex w-full ${msg.sender === Sender.User ? 'justify-end' : 'justify-start'}`}>
                {msg.sender === Sender.AI && (
                    <div className="w-8 h-8 mr-3 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-500 dark:text-gray-300 flex-shrink-0 self-end mb-1 shadow-tier-1">
                        <RobotIcon />
                    </div>
                )}
                <div className={`max-w-[85%] md:max-w-[75%] flex flex-col items-${msg.sender === Sender.User ? 'end' : 'start'}`}>
                    <div
                    className={`px-5 py-3 rounded-[2rem] shadow-tier-1 relative text-[15px] animate-enter border ${
                        msg.sender === Sender.User
                        ? 'bg-[#007AFF] text-white border-transparent'
                        : 'glass-panel text-black dark:text-white border-white/40 dark:border-white/10'
                    }`}
                    >
                    {msg.attachments && msg.attachments.length > 0 && (
                        <div className="mb-3 flex flex-wrap gap-2">
                        {msg.attachments.map((att, idx) => (
                            <div key={idx} className="relative rounded-3xl overflow-hidden border border-black/5 dark:border-white/10 shadow-sm">
                                {att.type === 'video' ? (
                                    <div className="bg-black text-white px-2 py-1 text-xs">{att.name} (Video)</div>
                                ) : (
                                    <img 
                                        src={`data:${att.mimeType};base64,${att.data}`} 
                                        alt="attachment" 
                                        className="max-h-40 object-cover"
                                    />
                                )}
                            </div>
                        ))}
                        </div>
                    )}
                    <div className="w-full overflow-hidden">
                        {renderMessageContent(msg.content)}
                    </div>
                    </div>
                    
                    {/* Grounding Sources */}
                    {msg.groundingSources && msg.groundingSources.length > 0 && (
                        <div className="mt-2 ml-2 flex flex-wrap gap-2">
                            {msg.groundingSources.map((source, idx) => (
                                <a key={idx} href={source.uri} target="_blank" rel="noopener noreferrer" className="flex items-center space-x-1 glass-panel rounded-full px-2 py-1 text-[10px] text-gray-500 hover:text-blue-500 interactive">
                                    <GlobeIcon />
                                    <span className="truncate max-w-[100px]">{source.title}</span>
                                </a>
                            ))}
                        </div>
                    )}
                </div>
            </div>
            ))}
            {isLoading && (
            <div className="flex justify-start animate-enter">
                <div className="w-8 h-8 mr-3 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-500 dark:text-gray-300 flex-shrink-0 self-end mb-1">
                    <RobotIcon />
                </div>
                <div className="glass-panel px-4 py-3 rounded-[2rem] flex items-center space-x-1.5 h-[46px] shadow-tier-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></div>
                </div>
            </div>
            )}
            <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area (Floating) */}
      <div className="absolute bottom-6 left-0 right-0 px-6 z-20 flex flex-col items-center pointer-events-none">
         <div className="pointer-events-auto w-full max-w-3xl flex flex-col items-center">
            
            {/* Toggles */}
            <div className="flex items-center gap-2 mb-3">
                {/* Persona Switch */}
                <div className="flex items-center p-1 rounded-full glass-panel shadow-tier-1">
                    {(['standard', 'socratic', 'examiner'] as TeachingPersona[]).map((p) => (
                        <button
                            key={p}
                            onClick={() => setPersona(p)}
                            className={`px-4 py-1.5 rounded-full text-xs font-medium interactive ${
                                persona === p 
                                ? 'bg-white dark:bg-[#636366] text-black dark:text-white shadow-tier-1' 
                                : 'text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white'
                            }`}
                        >
                            {t[p]}
                        </button>
                    ))}
                </div>

                {/* Features Toggles */}
                <div className="flex items-center p-1 rounded-full glass-panel shadow-tier-1">
                    <button 
                        onClick={() => setChatConfig(prev => ({ ...prev, useThinking: !prev.useThinking }))}
                        className={`p-1.5 rounded-full interactive ${chatConfig.useThinking ? 'bg-purple-100 text-purple-600 dark:bg-purple-500/20 dark:text-purple-300' : 'text-gray-400 hover:text-purple-500'}`}
                        title={t.thinking}
                    >
                        <BrainIcon />
                    </button>
                    <button 
                        onClick={() => setChatConfig(prev => ({ ...prev, useSearch: !prev.useSearch }))}
                        className={`p-1.5 rounded-full interactive ${chatConfig.useSearch ? 'bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-300' : 'text-gray-400 hover:text-blue-500'}`}
                        title={t.search}
                    >
                        <SearchIcon />
                    </button>
                </div>
            </div>

            <div className="relative w-full">
                {/* Attachments Preview */}
                {attachments.length > 0 && (
                    <div className="absolute bottom-full left-0 mb-2 flex flex-wrap gap-2 p-3 glass-panel rounded-[2rem] shadow-tier-2">
                        {attachments.map((att, idx) => (
                            <div key={idx} className="relative group">
                                <div className="w-12 h-12 rounded-2xl overflow-hidden border border-black/10 dark:border-white/10 bg-black/10 flex items-center justify-center">
                                    {att.type === 'video' ? <span className="text-[8px] text-center">Video</span> : (
                                        <img src={`data:${att.mimeType};base64,${att.data}`} alt="preview" className="w-full h-full object-cover" />
                                    )}
                                </div>
                                <button 
                                    onClick={() => setAttachments(prev => prev.filter((_, i) => i !== idx))}
                                    className="absolute -top-1 -right-1 bg-gray-500 text-white rounded-full p-0.5 shadow-sm transform scale-0 group-hover:scale-100 transition-transform"
                                >
                                    <XIcon />
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                {/* Input Bar */}
                <div className="glass-panel p-1.5 rounded-[2rem] shadow-tier-3 flex items-center gap-2 relative transition-all duration-200 focus-within:ring-2 focus-within:ring-[#007AFF]/30 focus-within:shadow-tier-3">
                    <input 
                        type="file" 
                        multiple 
                        ref={fileInputRef} 
                        className="hidden" 
                        onChange={handleFileSelect} 
                        accept="image/*,video/*,.pdf,.txt,.py,.java,.vb"
                    />
                    
                    <button 
                        onClick={() => fileInputRef.current?.click()}
                        className="p-2.5 text-gray-400 hover:text-[#007AFF] hover:bg-black/5 dark:hover:bg-white/10 rounded-full interactive"
                    >
                        <AttachmentIcon />
                    </button>

                    <div className="flex-1 py-3 flex items-center">
                        <textarea
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder={persona === 'examiner' ? t.placeholderExaminer : t.placeholder}
                            className="w-full bg-transparent border-none text-black dark:text-white placeholder-gray-400 focus:ring-0 resize-none max-h-32 min-h-[24px] overflow-y-auto py-0 custom-scrollbar text-[15px]"
                            rows={1}
                            style={{height: 'auto'}} 
                            onInput={(e) => {
                                const target = e.target as HTMLTextAreaElement;
                                target.style.height = 'auto';
                                target.style.height = `${Math.min(target.scrollHeight, 128)}px`;
                            }}
                        />
                    </div>

                    <button 
                        onClick={handleSend}
                        disabled={(!input.trim() && attachments.length === 0) || isLoading}
                        className={`p-2 rounded-full interactive flex items-center justify-center mr-1 ${
                            (!input.trim() && attachments.length === 0) || isLoading
                            ? 'bg-gray-200 dark:bg-white/10 text-gray-400 cursor-not-allowed'
                            : 'bg-[#007AFF] text-white hover:bg-[#0062cc] shadow-tier-1'
                        }`}
                    >
                        <SendIcon />
                    </button>
                </div>
            </div>
         </div>
      </div>
    </div>
  );
};

export default ChatArea;
