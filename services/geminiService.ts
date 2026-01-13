import { GoogleGenAI, Type } from "@google/genai";
import { QuizQuestion, Attachment, TeachingPersona, Language, ChatConfig, GroundingChunk, MockExamPaper, MockExamQuestion, MockExamResult } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Models
const MODEL_CHAT_DEFAULT = 'gemini-3-pro-preview'; // "AI powered chatbot" -> 3 Pro
const MODEL_FAST = 'gemini-2.5-flash'; // For simple tasks/Search
const MODEL_THINKING = 'gemini-3-pro-preview'; // Thinking
const MODEL_IMAGE_GEN = 'gemini-3-pro-image-preview';
const MODEL_IMAGE_EDIT = 'gemini-2.5-flash-image';
const MODEL_LIVE = 'gemini-2.5-flash-native-audio-preview-09-2025';

// Cambridge 9618 Pseudocode Standard
const PSEUDOCODE_GUIDE = `
 STRICT CAMBRIDGE 9618 PSEUDOCODE GUIDE:
 - Assignment: Use '<-' (e.g., Count <- 0)
 - Comparison: =, <>, >, <, >=, <=
 - Logic: AND, OR, NOT
 - Input/Output: INPUT x, OUTPUT "Hello"
 - Selection:
   IF condition THEN ... ELSE ... ENDIF
   CASE OF variable ... value1: ... value2: ... OTHERWISE ... ENDCASE
 - Iteration:
   FOR i <- 1 TO 10 ... NEXT i
   REPEAT ... UNTIL condition
   WHILE condition DO ... ENDWHILE
 - Arrays: DECLARE MyArr : ARRAY[1:10] OF INTEGER
 - File Handling: OPENFILE, READFILE, WRITEFILE, CLOSEFILE
 - Procedures: PROCEDURE MyProc(BYVAL x : INTEGER) ... ENDPROCEDURE
 - Functions: FUNCTION MyFunc() RETURNS INTEGER ... ENDFUNCTION
 - Comments: // Comment
 - Variables: DECLARE MyVar : STRING
 ALWAYS USE THESE CONVENTIONS.
`;

// CORE SYSTEM PROMPT
const CORE_SYSTEM_PROMPT_EN = `
⚙️ Role Definition
You are not a simple chatbot; you are an Educational Platform Architect + Product Manager + AI Teaching Expert + System Design Lead.
Your task is to continuously build an intelligent learning platform named "A-level CS Tutor".
Follow structured learning: Concept -> Example -> Pitfall -> Practice -> Feedback.
`;

const CORE_SYSTEM_PROMPT_ZH = `
⚙️ 角色定义
你不是普通回答机器人，你是 教育平台架构师 + 产品经理 + AI 教学专家 + 系统设计主管。
你的任务是持续构建一个名为 A-level CS Tutor 的智能学习平台。
遵循结构化学习：概念 -> 示例 -> 误区 -> 练习 -> 反馈。
`;

const PERSONA_PROMPTS: Record<TeachingPersona, Record<Language, string>> = {
  standard: {
    en: `${CORE_SYSTEM_PROMPT_EN} Provide clear explanations and practical applications.`,
    zh: `${CORE_SYSTEM_PROMPT_ZH} 提供清晰的解释和实际应用。`
  },
  socratic: {
    en: `${CORE_SYSTEM_PROMPT_EN} Ask guiding questions to help students derive answers.`,
    zh: `${CORE_SYSTEM_PROMPT_ZH} 提出引导性问题，帮助学生推导出答案。`
  },
  examiner: {
    en: `${CORE_SYSTEM_PROMPT_EN} Assess answers using real marking scheme language.`,
    zh: `${CORE_SYSTEM_PROMPT_ZH} 使用真实的评分标准语言评估答案。`
  }
};

export const chatWithGemini = async (
  history: string[],
  message: string,
  attachments: Attachment[],
  persona: TeachingPersona,
  language: Language,
  config: ChatConfig = { useSearch: false, useThinking: false }
): Promise<{ text: string, groundingSources?: { title: string; uri: string }[] }> => {
  try {
    const systemInstruction = PERSONA_PROMPTS[persona][language];
    const contentParts: any[] = [];
    if (history.length > 0) { contentParts.push({ text: `History:\n${history.join("\n")}\n` }); }
    for (const att of attachments) {
        contentParts.push({ inlineData: { mimeType: att.mimeType, data: att.data } });
    }
    contentParts.push({ text: message });

    let selectedModel = MODEL_CHAT_DEFAULT;
    const requestConfig: any = { systemInstruction: systemInstruction };
    if (config.useThinking) {
        selectedModel = MODEL_THINKING;
        requestConfig.thinkingConfig = { thinkingBudget: 32768 };
    } else if (config.useSearch) {
        selectedModel = MODEL_FAST;
        requestConfig.tools = [{ googleSearch: {} }];
    }

    const response = await ai.models.generateContent({
      model: selectedModel,
      contents: { role: 'user', parts: contentParts },
      config: requestConfig
    });

    const groundingSources: { title: string; uri: string }[] = [];
    if (response.candidates?.[0]?.groundingMetadata?.groundingChunks) {
        response.candidates[0].groundingMetadata.groundingChunks.forEach((chunk: GroundingChunk) => {
            if (chunk.web) { groundingSources.push({ title: chunk.web.title, uri: chunk.web.uri }); }
        });
    }

    return { text: response.text || "No response.", groundingSources };
  } catch (error) {
    console.error("Chat Error:", error);
    return { text: "Connection error." };
  }
};

export const generateOrEditImage = async (prompt: string, image: string | null, aspectRatio: string = "1:1", size: string = "1K", language: Language): Promise<string | null> => {
    try {
        if (image) {
            const response = await ai.models.generateContent({
                model: MODEL_IMAGE_EDIT,
                contents: { parts: [{ inlineData: { mimeType: 'image/png', data: image } }, { text: prompt }] }
            });
            for (const part of response.candidates?.[0]?.content?.parts || []) { if (part.inlineData) return part.inlineData.data; }
        } else {
             const response = await ai.models.generateContent({
                model: MODEL_IMAGE_GEN,
                contents: { parts: [{ text: prompt }] },
                config: { imageConfig: { aspectRatio: aspectRatio as any, imageSize: size as any } }
            });
             for (const part of response.candidates?.[0]?.content?.parts || []) { if (part.inlineData) return part.inlineData.data; }
        }
        return null;
    } catch (e) { return null; }
}

export const generateQuizQuestions = async (topics: string[], language: Language): Promise<QuizQuestion[]> => {
    try {
        const prompt = `Generate 5 multiple-choice questions for A-Level CS 9618 about: ${topics.join(", ")}. Return JSON.`;
        const response = await ai.models.generateContent({
            model: MODEL_FAST,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            question: { type: Type.STRING },
                            options: { type: Type.ARRAY, items: { type: Type.STRING } },
                            correctIndex: { type: Type.INTEGER },
                            explanation: { type: Type.STRING }
                        },
                        required: ["question", "options", "correctIndex", "explanation"]
                    }
                }
            }
        });
        return response.text ? JSON.parse(response.text) : [];
    } catch (e) { return []; }
}

export const gradeSubmission = async (text: string, files: Attachment[], language: Language): Promise<string> => {
    try {
        const parts = files.map(f => ({ inlineData: { mimeType: f.mimeType, data: f.data } }));
        parts.push({ text: `Grade submission for 9618: ${text}` } as any);
        const response = await ai.models.generateContent({
            model: MODEL_CHAT_DEFAULT,
            contents: { parts },
            config: { systemInstruction: language === 'zh' ? CORE_SYSTEM_PROMPT_ZH : CORE_SYSTEM_PROMPT_EN }
        });
        return response.text || "No feedback.";
    } catch (e) { return "Error grading."; }
}

export const analyzeCode = async (code: string, language: string, userLang: Language): Promise<string> => {
     try {
        const prompt = `Analyze ${language} code for logic and Big O. Code: ${code}`;
        const response = await ai.models.generateContent({
            model: MODEL_CHAT_DEFAULT,
            contents: prompt,
            config: { systemInstruction: userLang === 'zh' ? CORE_SYSTEM_PROMPT_ZH : CORE_SYSTEM_PROMPT_EN }
        });
        return response.text || "Analysis failed.";
    } catch (e) { return "Error analyzing code."; }
}

export const generateMockPaper = async (type: 'paper1' | 'paper2', language: Language): Promise<MockExamPaper> => {
    try {
        const prompt = `Generate a mini Mock Exam for Cambridge 9618 ${type === 'paper1' ? 'Theory' : 'Coding'}. 3 questions. JSON.`;
        const response = await ai.models.generateContent({
            model: MODEL_CHAT_DEFAULT,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        title: { type: Type.STRING },
                        questions: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    id: { type: Type.INTEGER },
                                    question: { type: Type.STRING },
                                    marks: { type: Type.INTEGER }
                                }
                            }
                        }
                    }
                }
            }
        });
        const data = JSON.parse(response.text || '{}');
        return { id: Date.now().toString(), type, durationMinutes: 30, title: data.title, questions: data.questions };
    } catch (e) { return { id: 'error', type, title: 'Error', durationMinutes: 0, questions: [] }; }
};

export const gradeMockPaper = async (paper: MockExamPaper, answers: Record<number, string>, language: Language): Promise<MockExamResult> => {
    try {
        const prompt = `Grade this 9618 Mock Exam. Paper: ${JSON.stringify(paper)}. Answers: ${JSON.stringify(answers)}. JSON response.`;
        const response = await ai.models.generateContent({
            model: MODEL_CHAT_DEFAULT,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        totalMarks: { type: Type.INTEGER },
                        userMarks: { type: Type.INTEGER },
                        grade: { type: Type.STRING },
                        feedback: { type: Type.STRING },
                        questionFeedback: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    id: { type: Type.INTEGER },
                                    feedback: { type: Type.STRING },
                                    marksAwarded: { type: Type.INTEGER }
                                }
                            }
                        }
                    }
                }
            }
        });
        return JSON.parse(response.text || '{}');
    } catch (e) { return { totalMarks: 0, userMarks: 0, grade: 'U', feedback: 'Error', questionFeedback: [] }; }
};

export const getLiveClient = () => ai.live;