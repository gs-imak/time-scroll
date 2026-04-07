import { useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, X } from 'lucide-react';
import { QuizQuestionRenderer } from './QuizQuestion';
import { QuizProgressBar } from './components/QuizProgressBar';
import { StreakCounter } from './components/StreakCounter';
import { HintButton } from './components/HintButton';
import { QuizTimer } from './components/QuizTimer';
import type { QuizQuestion, QuizSessionState } from './types';

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

const DIFFICULTY_BADGE: Record<string, { label: string; color: string }> = {
  easy: { label: 'Easy', color: '#6d9476' },
  medium: { label: 'Medium', color: '#c49a44' },
  hard: { label: 'Hard', color: '#b85454' },
};

const TYPE_LABEL: Record<string, string> = {
  'mcq': 'Multiple Choice',
  'true-false': 'True or False',
  'image-id': 'Identify the Image',
  'timeline-order': 'Timeline Order',
};

interface Props {
  state: QuizSessionState;
  onSelectAnswer: (answer: number | boolean | number[]) => void;
  onConfirmAnswer: () => void;
  onUseHint: () => void;
  onNextQuestion: () => void;
  onQuit: () => void;
}

export function QuizSession({ state, onSelectAnswer, onConfirmAnswer, onUseHint, onNextQuestion, onQuit }: Props) {
  const question: QuizQuestion | undefined = state.questions[state.currentIndex];
  if (!question) return null;

  const diff = DIFFICULTY_BADGE[question.difficulty];
  const isLastQuestion = state.currentIndex >= state.questions.length - 1;
  const canHint = question.type === 'mcq' || question.type === 'image-id';

  const handleTimerExpire = useCallback(() => {
    if (!state.isAnswered) {
      // Auto-submit wrong answer on timeout
      onConfirmAnswer();
    }
  }, [state.isAnswered, onConfirmAnswer]);

  return (
    <div className="min-h-screen w-full overflow-x-hidden overflow-y-auto lg:pl-[64px]">
      <div className="w-full max-w-[720px] mx-auto px-5 md:px-8 py-8 md:py-12">
        {/* Top bar */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <QuizProgressBar
              total={state.questions.length}
              current={state.currentIndex}
              answers={state.answers}
              accentColor="#c49a44"
            />
            <span className="text-[11px] text-text-muted font-mono">
              {state.currentIndex + 1}/{state.questions.length}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <StreakCounter streak={state.streak} />
            {state.config.mode === 'challenge' && (
              <QuizTimer
                duration={30}
                isRunning={!state.isAnswered}
                onExpire={handleTimerExpire}
                key={state.currentIndex}
              />
            )}
            <button
              onClick={onQuit}
              className="w-8 h-8 rounded-full flex items-center justify-center cursor-pointer hover:bg-white/[0.06] transition-colors"
            >
              <X size={16} className="text-text-muted" />
            </button>
          </div>
        </div>

        {/* Question type + difficulty badges */}
        <div className="flex items-center gap-2 mb-6">
          <span className="text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full"
            style={{ background: 'rgba(255,255,255,0.04)', color: 'var(--color-text-muted)', border: '1px solid var(--color-border-subtle)' }}>
            {TYPE_LABEL[question.type] ?? question.type}
          </span>
          {diff && (
            <span className="text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full"
              style={{ background: `${diff.color}12`, color: diff.color, border: `1px solid ${diff.color}25` }}>
              {diff.label}
            </span>
          )}
          <span className="text-[10px] text-[#28282f] ml-auto font-mono">{question.points} pts</span>
        </div>

        {/* Supporting image (when available) */}
        {question.imageUrl && question.type !== 'image-id' && (
          <motion.div
            key={`img-${state.currentIndex}`}
            className="mb-4 rounded-xl overflow-hidden relative"
            style={{ maxHeight: 180 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <img
              src={question.imageUrl}
              alt=""
              className="w-full h-[180px] object-cover"
              loading="eager"
              onError={(e) => { (e.target as HTMLImageElement).parentElement!.style.display = 'none'; }}
            />
            <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, var(--glass-strong-bg) 0%, transparent 40%)' }} />
          </motion.div>
        )}

        {/* Question card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={state.currentIndex}
            className="rounded-2xl p-6 sm:p-8"
            style={{ background: 'var(--glass-bg)', backdropFilter: 'blur(24px)', border: '1px solid var(--color-border-subtle)' }}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.35, ease: EASE }}
          >
            <QuizQuestionRenderer
              question={question}
              selectedAnswer={state.selectedAnswer}
              isAnswered={state.isAnswered}
              eliminatedOptions={state.eliminatedOptions}
              onSelect={onSelectAnswer}
              onConfirm={onConfirmAnswer}
            />
          </motion.div>
        </AnimatePresence>

        {/* Bottom actions */}
        <div className="flex items-center justify-between mt-6">
          <div>
            {!state.isAnswered && canHint && (
              <HintButton
                onUseHint={onUseHint}
                disabled={state.hintActive || state.isAnswered}
                active={state.hintActive}
              />
            )}
          </div>

          <AnimatePresence>
            {state.isAnswered && (
              <motion.button
                onClick={onNextQuestion}
                className="flex items-center gap-2 px-5 py-3 rounded-xl text-[13px] font-semibold cursor-pointer"
                style={{ background: 'rgba(196, 154, 68, 0.15)', color: '#c49a44', border: '1px solid rgba(196, 154, 68, 0.3)' }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, ease: EASE }}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                {isLastQuestion ? 'See Results' : 'Next Question'}
                <ChevronRight size={14} />
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
