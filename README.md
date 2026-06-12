# A-Level CS 9618 Tutor

An AI-powered tutor application specifically designed for Cambridge International AS & A Level Computer Science (9618). It features interactive chat, gamified quizzes, intelligent coursework grading, code sandboxing, and more, all wrapped in a modern, responsive liquid glass UI.

## Features

*   **Interactive Dashboard**: Hub for tracking your progress, streaks, XP, and navigating the app.
*   **AI Chat Tutor**: Conversational interface for getting help with A-Level CS concepts.
*   **Quiz Mode**: Test your knowledge with dynamically generated questions.
*   **Coursework Grader**: Intelligent grading tool to evaluate and provide feedback on your coursework.
*   **Code Sandbox**: Write, run, and test code snippets directly within the browser.
*   **Mistakes Review**: Analyze past mistakes to improve your understanding.
*   **Image Studio**: Tool for image-related CS tasks or visualizations.
*   **Live Tutor**: Real-time interactive sessions.
*   **Gamification System**: Earn XP, build learning streaks, and level up as you complete tasks and quizzes.
*   **Multi-language Support**: Seamlessly switch between English and Chinese (`en`/`zh`).
*   **Dark/Light Theme**: Built-in support for both dark and light modes with smooth transitions.
*   **Keyboard Shortcuts**: Fast navigation across different modes using `Alt + [0-7]`.

## Tech Stack

*   **Frontend Framework**: React 19 + TypeScript
*   **Build Tool**: Vite
*   **Styling**: Tailwind CSS (with custom Glassmorphism/Apple-inspired aesthetics)
*   **AI Integration**: `@google/genai` for advanced reasoning and content generation
*   **Markdown & Syntax Highlighting**: `marked`, `highlight.js`, and `katex`
*   **Diagrams**: `mermaid.js`

## File Structure

```text
/
├── components/          # Reusable React components for different modes
│   ├── ChatArea.tsx     # AI Chat interface
│   ├── CodeSandbox.tsx  # In-browser code editor and runner
│   ├── Dashboard.tsx    # Main user hub and stats display
│   ├── GraderMode.tsx   # Coursework evaluation interface
│   ├── Icons.tsx        # SVG icons collection
│   ├── ImageStudio.tsx  # Image processing/visualization
│   ├── LiveTutor.tsx    # Live tutoring interface
│   ├── MistakesMode.tsx # Mistake review system
│   ├── QuizMode.tsx     # Gamified quizzing interface
│   └── Sidebar.tsx      # App navigation
├── App.tsx              # Main application root and state management
├── index.html           # HTML entry point (contains global styles & CDN links)
├── index.tsx            # React DOM rendering
├── types.ts             # Global TypeScript interfaces and enums
└── vite.config.ts       # Vite configuration
```

## Gamification & State Management

The app tracks user progress using a centralized gamification engine. Stats are persisted in the browser's `localStorage` (`9618_tutor_stats`).

*   **Points & Levels**: Users gain XP from completing actions, leveling up for every 1000 XP.
*   **Streaks**: Daily logins and activities maintain a streak count.
*   **Toast Notifications**: Visual feedback for earning XP.

## Global Shortcuts

Quickly switch between modes using `Alt` + number keys:

*   `Alt + 0`: Dashboard
*   `Alt + 1`: Chat
*   `Alt + 2`: Live Tutor
*   `Alt + 3`: Quiz
*   `Alt + 4`: Grader
*   `Alt + 5`: Sandbox
*   `Alt + 6`: Image Studio
*   `Alt + 7`: Mistakes

## Getting Started

1.  **Install dependencies**:
    ```bash
    npm install
    ```
2.  **Environment Setup**:
    Ensure you have an environment variable set for the Gemini API in a root `.env` or `.env.local` file:
    ```env
    GEMINI_API_KEY=your_api_key_here
    ```
3.  **Start Development Server**:
    ```bash
    npm run dev
    ```
4.  **Build for Production**:
    ```bash
    npm run build
    ```

## Browser Compatibility

The application is built responsive-first using Tailwind CSS, supporting layouts from mobile screens up to ultra-wide displays. It leverages browser native features and requires standard modern web API access.
