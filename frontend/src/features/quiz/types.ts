import type { EventCategory } from '@/shared/types/events';

// ── Question Types ──

export type QuestionType = 'mcq' | 'true-false' | 'image-id' | 'timeline-order';
export type Difficulty = 'easy' | 'medium' | 'hard';
export type QuizMode = 'practice' | 'challenge' | 'daily';

interface BaseQuestion {
  id: string;
  eventId: string;
  type: QuestionType;
  difficulty: Difficulty;
  era: string;
  category: EventCategory;
  explanation: string;
  hint?: string;
  points: number; // easy=10, medium=20, hard=30
  /** Optional supporting image shown alongside the question */
  imageUrl?: string;
}

export interface MCQQuestion extends BaseQuestion {
  type: 'mcq';
  question: string;
  options: string[];
  correctIndex: number;
}

export interface TrueFalseQuestion extends BaseQuestion {
  type: 'true-false';
  statement: string;
  isTrue: boolean;
}

export interface ImageIdQuestion extends BaseQuestion {
  type: 'image-id';
  question: string;
  imageSlug: string;
  imageNum: number;
  options: string[];
  correctIndex: number;
}

export interface TimelineOrderQuestion extends BaseQuestion {
  type: 'timeline-order';
  instruction: string;
  items: { label: string; year: number }[];
}

export type QuizQuestion = MCQQuestion | TrueFalseQuestion | ImageIdQuestion | TimelineOrderQuestion;

// ── Session Types ──

export interface QuizSessionConfig {
  mode: QuizMode;
  questionCount: number;
  eras: string[];
  categories: EventCategory[];
}

export interface QuizAnswer {
  questionId: string;
  answer: number | boolean | number[]; // MCQ/ImageId index, T/F boolean, Timeline order array
  correct: boolean;
  usedHint: boolean;
  pointsEarned: number;
  timeMs: number;
}

export interface QuizSessionResult {
  id: string;
  date: string;
  mode: QuizMode;
  score: number;
  maxScore: number;
  correctCount: number;
  totalQuestions: number;
  bestStreak: number;
  hintsUsed: number;
  totalTimeMs: number;
  answers: QuizAnswer[];
  questions: QuizQuestion[];
}

// ── Session State ──

export type SessionScreen = 'hub' | 'session' | 'results';

export interface QuizSessionState {
  screen: SessionScreen;
  config: QuizSessionConfig;
  questions: QuizQuestion[];
  currentIndex: number;
  answers: QuizAnswer[];
  streak: number;
  bestStreak: number;
  hintsUsed: number;
  startTime: number;
  questionStartTime: number;
  isAnswered: boolean;
  selectedAnswer: number | boolean | number[] | null;
  hintActive: boolean;
  eliminatedOptions: number[];
}
