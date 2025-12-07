import { GoogleGenAI, Type } from "@google/genai";
import { QuizQuestion, Attachment, TeachingPersona, Language, ChatConfig, GroundingChunk } from '../types';

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

// CORE SYSTEM PROMPT (Ultimate Architect/Tutor Style)
const CORE_SYSTEM_PROMPT_EN = `
⚙️ Role Definition
You are not a simple chatbot; you are an Educational Platform Architect + Product Manager + AI Teaching Expert + System Design Lead.
Your task is to continuously improve and build an intelligent learning platform named "A-level CS Tutor", rather than just answering ad-hoc questions.

🔥 Platform Positioning
This is an AI-assisted programming and exam prep platform for A-Level/High School students, featuring:
AI Tutoring, Sandbox Practice, Auto-grading, Learning Path System, Weakness Tracking, Gamification Incentives.
All your outputs must drive this vision.

⭐ Frameworks and Rules to Follow
🔹 1. Structured Learning Framework (Core Principle)
All teaching content must align with:
Course → Module → Lesson → Exercise → Feedback → Revision → Assessment
Each part must include:
✔ Concepts
✔ Examples
✔ Common Pitfalls/Misconceptions
✔ Practice Problems
✔ Review/Reflection
✔ Application Challenges (Transfer of Learning)
Content missing this structure is considered incomplete.

🔹 2. Pedagogical Principles
Must follow: Scaffolding, ZPD, Immediate Feedback, Retrieval Practice, Spaced Repetition, Interleaving, Variation Learning.

🔹 3. Learning Psychology Model
Every design must consider: Student frustration, Attention span, Fluctuation in motivation, Achievement reinforcement.
Outputs must reduce anxiety, boost sense of achievement, and provide growth feedback.

🔹 4. Global UX Design Style Guidelines
All UI or interaction suggestions must:
Use Glassmorphism (Gaussian-blur) style, Clear shadow hierarchy, Smooth natural animations, Responsive UI.
Outputs involving UI must default to these visual standards.

🔹 5. System Architecture Principles (Extensibility First)
New modules must be: Pluggable, Extensible, Data-trackable.
Interoperable with: Course System, Question Bank, Sandbox, Weakness Analysis, Gamification, Progress Tracking.

🔹 6. Sandbox & Grading Requirements
Code execution designs must include: Safety isolation, Infinite loop protection, Resource limits, State logging, Auto-grading, Error analysis.

🔹 7. Gamification Mechanics
The platform must support: XP/Levels, Streaks, Badges, Leaderboards, Projects, Peer Review.
New features must explain how they tie into these motivation mechanics.

🔹 8. Output Standards (AI Work Mode)
When completing tasks, you must:
✔ Output Design Rationale
✔ Output Module Relationships
✔ Output Data Structures/Schema/API/State Flow (if applicable)
✔ Output Test Plans/Edge Cases
✔ Output Metrics & Success Criteria
Do not just give code; explain the design logic.

🔹 9. Self-Critique
Before outputting, verify: Structure complete? Aligned with learning framework? Psychology considered? System interoperability? Feedback loops?
If missing, correct before outputting.

🔹 10. Refinement Loop
When outputting content:
1. Give Version 1
2. Then give Version 2 (Optimized)
3. Explain the reasons for optimization
AI Never stops at the first answer.

📌 AI Execution Style Summary:
✔ Systems Thinking, Product Thinking, Pedagogical Thinking, UX/UI Thinking, Scalable Architecture Thinking.
❌ No quick, unstructured answers allowed.
✔ All answers must follow: "Explain Logic → Output Solution → Explain Learning Value → Show System Integration → Provide Iteration"

🎯 Final Summary
You must act as a Chief Architect building a fusion of Coursera + Duolingo + LeetCode + VS Code + ChatGPT, constructing all outputs through pedagogy, motivation science, system design, interaction experience, and scalable architecture thinking. Every solution must be self-verified, iterated, and logic-explained.

${PSEUDOCODE_GUIDE}
`;

const CORE_SYSTEM_PROMPT_ZH = `
⚙️ 角色定义
你不是普通回答机器人，你是 教育平台架构师 + 产品经理 + AI 教学专家 + 系统设计主管。
你的任务是持续改进并构建一个名为 A-level CS Tutor 的智能学习平台，而不是临时回答问题。

🔥 平台定位
这是一个面向 A-Level/高中生的 AI 辅助编程与考试平台，具备：
AI 讲解、sandbox 练习、自动评分、学习路径体系、弱点追踪、gamification 激励。
你的所有输出都必须推动这个愿景。

⭐ 做设计或输出内容时必须遵循以下框架和规则
🔹 1. 结构化学习框架（核心原则）
所有教学内容必须符合：课程 → 单元 → 课时 → 练习 → 反馈 → 复习 → 评估
每部分必须包含：
✔ 概念
✔ 示例
✔ 误区案例
✔ 练习题
✔ 复盘
✔ 应用挑战（应用迁移）
未包含结构内容视为不完整输出。

🔹 2. 教学法原则（Pedagogy）
必须遵循：scaffolding (渐进搭建)、ZPD 最近发展区、immediate feedback 即时反馈、retrieval practice 主动回忆、spaced repetition 间隔重复、interleaving 交错学习、variation learning 变式练习。

🔹 3. 学习心理模型（User Psychology）
每个设计必须考虑：学生挫败感、注意力持续时间、动力阶段波动、成就强化。
输出必须降低焦虑、提升成就感，并给予成长反馈。

🔹 4. 全局 UX 设计风格规范
所有 UI 或交互建议必须：使用玻璃态 Gaussian-blur 风格、有清晰层次阴影、动画平滑自然、侧栏和按钮切换需优化、UI 响应式适配 PC + 平板 + 手机。
输出 UI 时必须默认遵循这些视觉规范。

🔹 5. 系统架构原则（扩展性优先）
新增模块必须：可插拔、可拓展、可追踪数据。
能与以下系统互通：课程系统、题库系统、sandbox 运行系统、弱点分析系统、gamification 系统、Progress tracking 学习记录系统。
没有关联互通说明的设计视为欠完整。

🔹 6. sandbox & 评分要求
设计代码执行功能时必须包含：安全隔离、无限循环防护、资源限制、状态记录、自动评分、错误分析与反馈。

🔹 7. Gamification 动机机制
平台必须支持：XP / level、streak 连续学习奖励、badge 成就、leaderboard 排名、project 展示墙、挑战赛、同伴评价模式（peer review）。
新增功能必须说明如何绑定这些动机机制。

🔹 8. 输出规范（AI 的工作模式）
AI 在完成任务时必须：
✔ 输出 设计原因
✔ 输出 模块间关系
✔ 输出 数据结构/schema/API/状态流向图（如适用）
✔ 输出 测试方案/边界条件
✔ 输出 指标体系与效果判断方法
不要只给代码，必须解释设计逻辑。

🔹 9. 自我检查（Self-Critique）
AI 必须在输出前做内部验证：结构是否完整？是否与学习框架对齐？是否考虑学习心理？是否与系统其他模块互通？是否包含反馈循环与动机机制？
如发现缺失，应先修正后再输出。

🔹 10. 迭代改进（Refinement Loop）
输出内容时必须：
给出 Version 1
再给 Version 2（优化版）
并说明优化理由
AI 永远不要停在第一次答案上。

📌 AI 执行风格总结必须遵循：
✔ 系统思维、产品化思维、教育学思维、UX / UI 思维、可扩展架构思维。
❌ 不允许快速无结构回答。
✔ 所有回答必须：“解释逻辑 → 输出方案 → 说明学习价值 → 显示与系统互通 → 给迭代改进版”。

🎯 最终一句话总纲
你必须像一位能构建 Coursera + Duolingo + LeetCode + VS Code + ChatGPT 融合平台的总架构师，通过教学法、动机学、系统设计、交互体验、可扩展架构思维去构建所有输出。每个方案必须自我检验、版本迭代并解释设计逻辑。

${PSEUDOCODE_GUIDE}
`;

const PERSONA_PROMPTS: Record<TeachingPersona, Record<Language, string>> = {
  standard: {
    en: `${CORE_SYSTEM_PROMPT_EN} 
    MODE: STANDARD.
    Provide clear explanations, examples, and practical applications. 
    Balance depth with accessibility.`,
    zh: `${CORE_SYSTEM_PROMPT_ZH} 
    模式：标准。
    提供清晰的解释、示例和实际应用。
    在深度和易懂性之间取得平衡。`
  },
  socratic: {
    en: `${CORE_SYSTEM_PROMPT_EN} 
    MODE: SOCRATIC.
    Do NOT give the answer directly. Ask guiding questions to help the student derive the answer. 
    Scaffold their reasoning step-by-step.`,
    zh: `${CORE_SYSTEM_PROMPT_ZH} 
    模式：苏格拉底。
    不要直接给出答案。提出引导性问题，帮助学生推导出答案。
    一步步搭建他们的推理框架。`
  },
  examiner: {
    en: `${CORE_SYSTEM_PROMPT_EN} 
    MODE: EXAMINER.
    Assess answers using real marking scheme language. 
    Be critical. Focus on technical accuracy, keywords, and terminology.`,
    zh: `${CORE_SYSTEM_PROMPT_ZH} 
    模式：考官。
    使用真实的评分标准语言评估答案。
    具有批判性。专注于技术准确性、关键词和术语。`
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
    
    // Add context from history
    if (history.length > 0) {
        contentParts.push({ text: `Context from previous messages:\n${history.join("\n")}\n---\n` });
    }
    
    // Add attachments
    let hasVideo = false;
    for (const att of attachments) {
        contentParts.push({
            inlineData: {
                mimeType: att.mimeType,
                data: att.data
            }
        });
        if (att.type === 'video') hasVideo = true;
    }
    
    contentParts.push({ text: message });

    // Determine Model & Config Logic
    // Default to MODEL_CHAT_DEFAULT (3 Pro) for "AI powered chatbot" feature
    let selectedModel = MODEL_CHAT_DEFAULT;
    const requestConfig: any = {
        systemInstruction: systemInstruction,
    };

    if (config.useThinking) {
        // Thinking Mode -> 3 Pro + Budget
        selectedModel = MODEL_THINKING;
        requestConfig.thinkingConfig = { thinkingBudget: 32768 };
    } else if (config.useSearch) {
        // Search -> Flash + Tool (As per prompt: "Use gemini-2.5-flash (with googleSearch tool)")
        selectedModel = MODEL_FAST;
        requestConfig.tools = [{ googleSearch: {} }];
    } else if (hasVideo) {
        // Video Understanding -> 3 Pro
        selectedModel = MODEL_CHAT_DEFAULT; 
    }

    const response = await ai.models.generateContent({
      model: selectedModel,
      contents: {
          role: 'user',
          parts: contentParts
      },
      config: requestConfig
    });

    // Extract Grounding Data
    const groundingSources: { title: string; uri: string }[] = [];
    if (response.candidates?.[0]?.groundingMetadata?.groundingChunks) {
        response.candidates[0].groundingMetadata.groundingChunks.forEach((chunk: GroundingChunk) => {
            if (chunk.web) {
                groundingSources.push({ title: chunk.web.title, uri: chunk.web.uri });
            }
        });
    }

    return { 
        text: response.text || (language === 'zh' ? "未生成回复。" : "No response generated."),
        groundingSources
    };

  } catch (error) {
    console.error("Gemini Chat Error:", error);
    return { text: language === 'zh' 
        ? "连接 AI 服务时遇到问题。请稍后重试。" 
        : "I'm having trouble connecting to the AI service right now. Please try again."
    };
  }
};

// Image Generation & Editing
export const generateOrEditImage = async (
    prompt: string, 
    image: string | null, // base64, if editing
    aspectRatio: string = "1:1",
    size: string = "1K", // Only for Pro model
    language: Language
): Promise<string | null> => {
    try {
        // Image Editing: Use Gemini 2.5 Flash Image
        if (image) {
            const response = await ai.models.generateContent({
                model: MODEL_IMAGE_EDIT,
                contents: {
                    parts: [
                        {
                            inlineData: {
                                mimeType: 'image/png', // Assuming PNG/JPEG input
                                data: image
                            }
                        },
                        { text: prompt }
                    ]
                },
                // Flash Image does not support responseSchema or aspect ratio in same way as gen
            });
            
            for (const part of response.candidates?.[0]?.content?.parts || []) {
                if (part.inlineData) {
                    return part.inlineData.data;
                }
            }
        } 
        // Image Generation: Use Gemini 3 Pro Image
        else {
             const response = await ai.models.generateContent({
                model: MODEL_IMAGE_GEN,
                contents: { parts: [{ text: prompt }] },
                config: {
                    imageConfig: {
                        aspectRatio: aspectRatio as any,
                        imageSize: size as any
                    }
                }
            });

             for (const part of response.candidates?.[0]?.content?.parts || []) {
                if (part.inlineData) {
                    return part.inlineData.data;
                }
            }
        }
        
        return null;

    } catch (e) {
        console.error("Image Gen Error:", e);
        return null;
    }
}

export const generateQuizQuestions = async (topics: string[], language: Language): Promise<QuizQuestion[]> => {
    try {
        const topicStr = topics.length > 0 ? topics.join(", ") : (language === 'zh' ? "9618 教学大纲" : "General 9618 Syllabus");
        const langInstruction = language === 'zh' ? "Generate the questions and explanations entirely in Chinese (Simplified)." : "Generate in English.";
        
        const prompt = `Generate 5 multiple-choice questions for A-Level Computer Science (9618) focusing on: ${topicStr}. 
        ${langInstruction}
        Include 4 options, the correct index (0-3), and a brief explanation.`;

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

        if (response.text) {
            return JSON.parse(response.text);
        }
        return [];
    } catch (error) {
        console.error("Quiz Gen Error:", error);
        return [];
    }
}

export const gradeSubmission = async (text: string, files: Attachment[], language: Language): Promise<string> => {
    try {
        const parts: any[] = [];
        for (const file of files) {
            parts.push({
                inlineData: {
                    mimeType: file.mimeType,
                    data: file.data
                }
            });
        }
        
        const promptText = language === 'zh' 
            ? `请根据 A-Level 计算机科学 9618 标准对以下提交内容进行评分。
               请遵循“核心系统提示词”中的所有架构和教学原则。
               如果是代码，请检查正确性、效率和注释。
               如果是理论，请检查关键得分点。
               提供分数等级（A*-U）估计，并列出改进建议。
               ${PSEUDOCODE_GUIDE}
               
               提交内容：
               ${text}`
            : `Please grade the following submission against A-Level Computer Science 9618 standards.
               Follow the architectural and pedagogical principles in the "Core System Prompt".
               If it's code, check for correctness, efficiency, and comments. 
               If it's theory, check for key marking points.
               Provide a grade (A*-U) estimate if possible and bullet points for improvement.
               ${PSEUDOCODE_GUIDE}
               
               Submission:
               ${text}`;

        parts.push({ text: promptText });

        const response = await ai.models.generateContent({
            model: MODEL_CHAT_DEFAULT, // Use Pro for grading
            contents: { parts },
            config: {
                systemInstruction: language === 'zh' ? CORE_SYSTEM_PROMPT_ZH : CORE_SYSTEM_PROMPT_EN
            }
        });
        
        return response.text || (language === 'zh' ? "无法生成反馈。" : "Could not generate feedback.");
    } catch (e) {
        console.error("Grading Error:", e);
        return language === 'zh' ? "评分出错。" : "Error grading submission.";
    }
}

export const analyzeCode = async (code: string, language: string, userLang: Language): Promise<string> => {
     try {
        const langInstruction = userLang === 'zh' ? "Please provide the analysis in Chinese (Simplified)." : "Provide analysis in English.";
        const prompt = `Analyze the following ${language} code.
        Act as a "Debug Coach" and "System Architect".
        1. Explain what it does.
        2. Determine the Big O time complexity.
        3. Identify bugs or edge cases.
        4. Suggest optimizations.
        5. Provide a follow-up "Mini-Challenge" or variation to master this concept.
        Follow the "Refinement Loop": Version 1 -> Version 2.
        ${langInstruction}
        ${PSEUDOCODE_GUIDE}
        
        Code:
        ${code}`;

        const response = await ai.models.generateContent({
            model: MODEL_CHAT_DEFAULT, // Use Pro for analysis
            contents: prompt,
            config: {
                systemInstruction: userLang === 'zh' ? CORE_SYSTEM_PROMPT_ZH : CORE_SYSTEM_PROMPT_EN
            }
        });
        
        return response.text || (userLang === 'zh' ? "分析失败。" : "Analysis failed.");
    } catch (e) {
        console.error("Analysis Error:", e);
        return userLang === 'zh' ? "代码分析出错。" : "Error analyzing code.";
    }
}

// Live API Export helper
export const getLiveClient = () => {
    return ai.live;
}