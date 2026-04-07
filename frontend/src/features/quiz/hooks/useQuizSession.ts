import { useReducer, useCallback } from 'react';
import type {
  QuizQuestion, QuizSessionConfig, QuizSessionState,
  QuizAnswer, QuizSessionResult,
  MCQQuestion, TrueFalseQuestion, ImageIdQuestion, TimelineOrderQuestion,
} from '../types';
import { generateQuizSession } from '../data/questionGenerator';

type Action =
  | { type: 'START'; config: QuizSessionConfig; allQuestions: QuizQuestion[] }
  | { type: 'SELECT_ANSWER'; answer: number | boolean | number[] }
  | { type: 'CONFIRM_ANSWER' }
  | { type: 'USE_HINT' }
  | { type: 'NEXT_QUESTION' }
  | { type: 'FINISH' }
  | { type: 'RESET' };

const initialState: QuizSessionState = {
  screen: 'hub',
  config: { mode: 'practice', questionCount: 10, eras: [], categories: [] },
  questions: [],
  currentIndex: 0,
  answers: [],
  streak: 0,
  bestStreak: 0,
  hintsUsed: 0,
  startTime: 0,
  questionStartTime: 0,
  isAnswered: false,
  selectedAnswer: null,
  hintActive: false,
  eliminatedOptions: [],
};

function checkCorrect(question: QuizQuestion, answer: number | boolean | number[]): boolean {
  switch (question.type) {
    case 'mcq':
    case 'image-id':
      return answer === (question as MCQQuestion | ImageIdQuestion).correctIndex;
    case 'true-false':
      return answer === (question as TrueFalseQuestion).isTrue;
    case 'timeline-order': {
      const q = question as TimelineOrderQuestion;
      const sorted = [...q.items]
        .map((item, i) => ({ item, idx: i }))
        .sort((a, b) => a.item.year - b.item.year)
        .map(x => x.idx);
      return JSON.stringify(answer) === JSON.stringify(sorted);
    }
    default:
      return false;
  }
}

function getEliminatedOptions(question: QuizQuestion): number[] {
  if (question.type !== 'mcq' && question.type !== 'image-id') return [];
  const q = question as MCQQuestion | ImageIdQuestion;
  const wrong = q.options
    .map((_, i) => i)
    .filter(i => i !== q.correctIndex);
  // Eliminate 2 random wrong options
  const shuffled = wrong.sort(() => Math.random() - 0.5);
  return shuffled.slice(0, 2);
}

function reducer(state: QuizSessionState, action: Action): QuizSessionState {
  switch (action.type) {
    case 'START': {
      const questions = generateQuizSession(action.config, action.allQuestions);
      return {
        ...initialState,
        screen: 'session',
        config: action.config,
        questions,
        startTime: Date.now(),
        questionStartTime: Date.now(),
      };
    }

    case 'SELECT_ANSWER':
      if (state.isAnswered) return state;
      return { ...state, selectedAnswer: action.answer };

    case 'CONFIRM_ANSWER': {
      if (state.isAnswered || state.selectedAnswer === null) return state;
      const question = state.questions[state.currentIndex]!;
      const correct = checkCorrect(question, state.selectedAnswer);
      const timeMs = Date.now() - state.questionStartTime;

      let pointsEarned = 0;
      if (correct) {
        pointsEarned = state.hintActive ? Math.floor(question.points / 2) : question.points;
        // Challenge speed bonus
        if (state.config.mode === 'challenge' && timeMs < 10000) {
          pointsEarned += 5;
        }
      }

      const newStreak = correct ? state.streak + 1 : 0;
      const newBestStreak = Math.max(state.bestStreak, newStreak);

      // Streak bonus: +10 every 3 consecutive
      if (correct && newStreak > 0 && newStreak % 3 === 0) {
        pointsEarned += 10;
      }

      const answer: QuizAnswer = {
        questionId: question.id,
        answer: state.selectedAnswer,
        correct,
        usedHint: state.hintActive,
        pointsEarned,
        timeMs,
      };

      return {
        ...state,
        isAnswered: true,
        answers: [...state.answers, answer],
        streak: newStreak,
        bestStreak: newBestStreak,
        hintsUsed: state.hintsUsed + (state.hintActive ? 1 : 0),
      };
    }

    case 'USE_HINT': {
      if (state.hintActive || state.isAnswered) return state;
      const question = state.questions[state.currentIndex]!;
      return {
        ...state,
        hintActive: true,
        eliminatedOptions: getEliminatedOptions(question),
      };
    }

    case 'NEXT_QUESTION': {
      const nextIndex = state.currentIndex + 1;
      if (nextIndex >= state.questions.length) {
        return { ...state, screen: 'results' };
      }
      return {
        ...state,
        currentIndex: nextIndex,
        isAnswered: false,
        selectedAnswer: null,
        hintActive: false,
        eliminatedOptions: [],
        questionStartTime: Date.now(),
      };
    }

    case 'FINISH':
      return { ...state, screen: 'results' };

    case 'RESET':
      return initialState;

    default:
      return state;
  }
}

export function useQuizSession() {
  const [state, dispatch] = useReducer(reducer, initialState);

  const startQuiz = useCallback((config: QuizSessionConfig, allQuestions: QuizQuestion[]) => {
    dispatch({ type: 'START', config, allQuestions });
  }, []);

  const selectAnswer = useCallback((answer: number | boolean | number[]) => {
    dispatch({ type: 'SELECT_ANSWER', answer });
  }, []);

  const confirmAnswer = useCallback(() => {
    dispatch({ type: 'CONFIRM_ANSWER' });
  }, []);

  const useHint = useCallback(() => {
    dispatch({ type: 'USE_HINT' });
  }, []);

  const nextQuestion = useCallback(() => {
    dispatch({ type: 'NEXT_QUESTION' });
  }, []);

  const reset = useCallback(() => {
    dispatch({ type: 'RESET' });
  }, []);

  const getResult = useCallback((): QuizSessionResult => {
    const totalScore = state.answers.reduce((sum, a) => sum + a.pointsEarned, 0);
    const maxScore = state.questions.reduce((sum, q) => sum + q.points, 0);
    const correctCount = state.answers.filter(a => a.correct).length;
    return {
      id: `quiz-${Date.now()}`,
      date: new Date().toISOString(),
      mode: state.config.mode,
      score: totalScore,
      maxScore,
      correctCount,
      totalQuestions: state.questions.length,
      bestStreak: state.bestStreak,
      hintsUsed: state.hintsUsed,
      totalTimeMs: Date.now() - state.startTime,
      answers: state.answers,
      questions: state.questions,
    };
  }, [state]);

  return {
    state,
    startQuiz,
    selectAnswer,
    confirmAnswer,
    useHint,
    nextQuestion,
    reset,
    getResult,
  };
}
