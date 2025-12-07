export enum AppMode {
  Dashboard = 'DASHBOARD',
  Chat = 'CHAT',
  LiveTutor = 'LIVE_TUTOR',
  ImageStudio = 'IMAGE_STUDIO',
  Quiz = 'QUIZ',
  Grader = 'GRADER',
  Sandbox = 'SANDBOX',
  Mistakes = 'MISTAKES'
}

export enum Sender {
  User = 'USER',
  AI = 'AI'
}

export type Theme = 'light' | 'dark';
export type Language = 'en' | 'zh';

export type TeachingPersona = 'standard' | 'socratic' | 'examiner';

export interface Attachment {
  type: 'image' | 'file' | 'video';
  mimeType: string;
  data: string; // base64
  name: string;
}

export interface ChatConfig {
  useSearch: boolean;
  useThinking: boolean;
}

export interface GroundingChunk {
  web?: { uri: string; title: string };
}

export interface Message {
  id: string;
  sender: Sender;
  content: string;
  attachments?: Attachment[];
  timestamp: number;
  persona?: TeachingPersona;
  isDiagram?: boolean;
  groundingSources?: { title: string; uri: string }[];
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface Achievement {
  id: string;
  title: string;
  desc: string;
  icon: string; // Emoji or icon name
  unlockedAt?: string;
}

export interface UserStats {
  points: number;       // Total Lifetime XP
  dailyXP: number;      // XP gained today (for daily goals)
  streak: number;       // Days active in a row
  level: number;        // Calculated from points (e.g., points / 1000)
  lastLogin: string;    // ISO date
  quizzesTaken: number;
  achievements: Achievement[];
}

export interface MistakeEntry {
  id: string;
  topic: string;
  question: string;
  notes: string;
  date: string;
  lastReviewed?: string;
}

export type AwardXPCallback = (amount: number, reason?: string) => void;