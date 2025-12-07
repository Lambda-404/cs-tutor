
import React, { useState, useEffect, useRef } from 'react';
import { Modality } from "@google/genai";
import { getLiveClient } from '../services/geminiService';
import { Language, AwardXPCallback } from '../types';
import { MicIcon, MicOffIcon, BrainIcon } from './Icons';

interface LiveTutorProps {
    language: Language;
    onAwardXP: AwardXPCallback;
}

const translations = {
    en: {
        title: 'Live Tutor',
        desc: 'Have a real-time conversation with Gemini 2.5.',
        speaking: 'AI Speaking...',
        listening: 'Listening...',
        tapToConnect: 'Tap to Connect'
    },
    zh: {
        title: '语音导师',
        desc: '与 Gemini 进行实时语音对话，像真人一样学习。',
        speaking: 'AI 正在说话...',
        listening: '正在聆听...',
        tapToConnect: '点击连接'
    }
};

const LiveTutor: React.FC<LiveTutorProps> = ({ language, onAwardXP }) => {
    const t = translations[language];
    const [connected, setConnected] = useState(false);
    const [speaking, setSpeaking] = useState(false);
    const videoRef = useRef<HTMLVideoElement>(null);
    const [audioContext, setAudioContext] = useState<AudioContext | null>(null);

    // Audio Processing Refs
    const inputContextRef = useRef<AudioContext | null>(null);
    const outputContextRef = useRef<AudioContext | null>(null);
    const nextStartTimeRef = useRef<number>(0);
    const sourcesRef = useRef<AudioBufferSourceNode[]>([]);
    
    useEffect(() => {
        return () => {
            disconnect();
        };
    }, []);

    const disconnect = () => {
        inputContextRef.current?.close();
        outputContextRef.current?.close();
        setConnected(false);
        setSpeaking(false);
    };

    const startSession = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            
            const inputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
            const outputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
            
            inputContextRef.current = inputCtx;
            outputContextRef.current = outputCtx;

            const liveClient = getLiveClient();

            const sessionPromise = liveClient.connect({
                model: 'gemini-2.5-flash-native-audio-preview-09-2025',
                callbacks: {
                    onopen: () => {
                        console.log('Live Session Opened');
                        setConnected(true);
                        
                        // Input Stream Setup
                        const source = inputCtx.createMediaStreamSource(stream);
                        const processor = inputCtx.createScriptProcessor(4096, 1, 1);
                        
                        processor.onaudioprocess = (e) => {
                            const inputData = e.inputBuffer.getChannelData(0);
                            const pcmData = createBlob(inputData);
                            
                            sessionPromise.then(session => {
                                session.sendRealtimeInput({ media: pcmData });
                            });
                        };
                        
                        source.connect(processor);
                        processor.connect(inputCtx.destination);
                    },
                    onmessage: async (msg: any) => {
                        const audioData = msg.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
                        if (audioData) {
                            setSpeaking(true);
                            await playAudio(audioData, outputCtx);
                            // Simple visual feedback timeout
                            setTimeout(() => setSpeaking(false), 2000); 
                        }
                    },
                    onclose: () => {
                        console.log('Session Closed');
                        setConnected(false);
                    },
                    onerror: (err) => {
                        console.error('Session Error', err);
                        setConnected(false);
                    }
                },
                config: {
                    responseModalities: [Modality.AUDIO],
                    systemInstruction: "You are a friendly Cambridge A-Level Computer Science Tutor. Keep answers concise and spoken naturally."
                }
            });
            
            // Gamification
            onAwardXP(50, 'Live Session Started');

        } catch (e) {
            console.error("Failed to start live session", e);
            alert("Could not access microphone or connect to API.");
        }
    };

    // Helper: PCM Blob Creation (Int16)
    const createBlob = (float32Array: Float32Array): { mimeType: string, data: string } => {
        const int16Array = new Int16Array(float32Array.length);
        for (let i = 0; i < float32Array.length; i++) {
            int16Array[i] = Math.max(-1, Math.min(1, float32Array[i])) * 32767;
        }
        
        // Simple base64 encode of buffer
        let binary = '';
        const bytes = new Uint8Array(int16Array.buffer);
        const len = bytes.byteLength;
        for (let i = 0; i < len; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        
        return {
            mimeType: 'audio/pcm;rate=16000',
            data: btoa(binary)
        };
    };

    // Helper: Audio Playback
    const playAudio = async (base64String: string, ctx: AudioContext) => {
        const binaryString = atob(base64String);
        const len = binaryString.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }
        
        const dataInt16 = new Int16Array(bytes.buffer);
        const float32 = new Float32Array(dataInt16.length);
        for(let i=0; i<dataInt16.length; i++) {
            float32[i] = dataInt16[i] / 32768.0;
        }

        const buffer = ctx.createBuffer(1, float32.length, 24000);
        buffer.getChannelData(0).set(float32);

        const source = ctx.createBufferSource();
        source.buffer = buffer;
        source.connect(ctx.destination);
        
        const currentTime = ctx.currentTime;
        const startTime = Math.max(currentTime, nextStartTimeRef.current);
        source.start(startTime);
        nextStartTimeRef.current = startTime + buffer.duration;
    };

    return (
        <div className="flex flex-col items-center justify-center h-full w-full p-8 relative overflow-hidden animate-enter">
            {/* Ambient Background */}
            <div className={`absolute inset-0 transition-opacity duration-1000 ${connected ? 'opacity-100' : 'opacity-0'}`}>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-500/20 rounded-full blur-[100px] animate-pulse"></div>
            </div>

            <div className="z-10 text-center flex flex-col items-center">
                <div className="mb-12">
                    <h2 className="text-4xl font-bold text-slate-800 dark:text-white mb-4">
                        {t.title}
                    </h2>
                    <p className="text-xl text-slate-500 dark:text-gray-400">
                        {t.desc}
                    </p>
                </div>

                {/* Visualizer / Status */}
                <div className="mb-12 h-32 flex items-center justify-center space-x-2">
                    {connected ? (
                        <>
                            {[1,2,3,4,5].map(i => (
                                <div 
                                    key={i} 
                                    className={`w-3 bg-purple-500 rounded-full transition-all duration-150 ${speaking ? 'animate-bounce' : 'h-4'}`}
                                    style={{ height: speaking ? `${Math.random() * 60 + 20}px` : '16px', animationDelay: `${i * 0.1}s` }}
                                ></div>
                            ))}
                        </>
                    ) : (
                        <div className="w-24 h-24 rounded-full bg-gray-100 dark:bg-white/5 border-4 border-slate-200 dark:border-white/10 flex items-center justify-center shadow-tier-1">
                            <BrainIcon />
                        </div>
                    )}
                </div>

                <button
                    onClick={connected ? disconnect : startSession}
                    className={`w-20 h-20 rounded-full flex items-center justify-center shadow-tier-2 interactive ${
                        connected 
                        ? 'bg-red-500 hover:bg-red-600 text-white shadow-red-500/30' 
                        : 'bg-[#007AFF] hover:bg-[#0062cc] text-white shadow-blue-500/30'
                    }`}
                >
                    {connected ? <MicOffIcon /> : <MicIcon />}
                </button>
                
                <p className="mt-6 text-sm font-medium text-slate-500 dark:text-gray-500 uppercase tracking-widest">
                    {connected 
                        ? (speaking ? t.speaking : t.listening) 
                        : t.tapToConnect}
                </p>
            </div>
        </div>
    );
};

export default LiveTutor;
