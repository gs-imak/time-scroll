import { useState, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { BrainCircuit, Zap, Calendar, BookOpen, Trophy, Flame, Target, ChevronRight } from 'lucide-react';
import { useQuizSession } from './hooks/useQuizSession';
import { QuizSession } from './QuizSession';
import { QuizResults } from './QuizResults';
import { QuizFilters } from './components/QuizFilters';
import { QUIZ_QUESTIONS } from './data/quizQuestions';
import type { QuizMode, QuizSessionConfig } from './types';
import type { EventCategory } from '@/shared/types/events';
import { useProgressStore } from '@/shared/stores/progressStore';

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

function GlassCard({ children, className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`rounded-xl transition-all duration-200 ${className ?? ''}`} style={{
      background: 'rgba(14, 14, 20, 0.6)', backdropFilter: 'blur(24px)',
      border: '1px solid rgba(255, 255, 255, 0.06)',
      boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.03)',
    }} {...props}>
      {children}
    </div>
  );
}

const section = (delay: number) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.6, delay, ease: EASE } },
});

const MODES: { mode: QuizMode; icon: typeof BookOpen; title: string; desc: string; color: string }[] = [
  { mode: 'practice', icon: BookOpen, title: 'Practice', desc: 'Learn at your own pace. Explanations after each answer.', color: '#6d9476' },
  { mode: 'challenge', icon: Zap, title: 'Challenge', desc: '30 seconds per question. Speed bonus points.', color: '#b85454' },
  { mode: 'daily', icon: Calendar, title: 'Daily Quiz', desc: 'A new quiz every day. Same questions for everyone.', color: '#c49a44' },
];

export default function QuizHub() {
  const { state, startQuiz, selectAnswer, confirmAnswer, useHint, nextQuestion, reset, getResult } = useQuizSession();
  const [selectedEras, setSelectedEras] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<EventCategory[]>([]);
  const quizScores = useProgressStore(s => s.quizScores);
  const recordQuizScore = useProgressStore(s => s.recordQuizScore);

  const totalQuizzes = Object.keys(quizScores).length;
  const avgScore = totalQuizzes > 0 ? Math.round(Object.values(quizScores).reduce((a, b) => a + b, 0) / totalQuizzes) : 0;

  const questionCount = useMemo(() => QUIZ_QUESTIONS.length, []);

  const toggleEra = useCallback((era: string) => {
    setSelectedEras(prev => prev.includes(era) ? prev.filter(e => e !== era) : [...prev, era]);
  }, []);

  const toggleCategory = useCallback((cat: EventCategory) => {
    setSelectedCategories(prev => prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]);
  }, []);

  const handleStartQuiz = useCallback((mode: QuizMode) => {
    const config: QuizSessionConfig = {
      mode,
      questionCount: 10,
      eras: selectedEras,
      categories: selectedCategories,
    };
    startQuiz(config, QUIZ_QUESTIONS);
  }, [startQuiz, selectedEras, selectedCategories]);

  const handleQuit = useCallback(() => {
    reset();
  }, [reset]);

  const handleRetry = useCallback(() => {
    handleStartQuiz(state.config.mode);
  }, [handleStartQuiz, state.config.mode]);

  // ── Session Screen ──
  if (state.screen === 'session') {
    return (
      <QuizSession
        state={state}
        onSelectAnswer={selectAnswer}
        onConfirmAnswer={confirmAnswer}
        onUseHint={useHint}
        onNextQuestion={nextQuestion}
        onQuit={handleQuit}
      />
    );
  }

  // ── Results Screen ──
  if (state.screen === 'results') {
    const result = getResult();
    // Persist best score per event
    for (const ans of result.answers) {
      const q = result.questions.find(qq => qq.id === ans.questionId);
      if (q && ans.correct) {
        const existing = quizScores[q.eventId] ?? 0;
        if (ans.pointsEarned > existing) {
          recordQuizScore(q.eventId, ans.pointsEarned);
        }
      }
    }
    return (
      <QuizResults
        result={result}
        onRetry={handleRetry}
        onBackToHub={reset}
      />
    );
  }

  // ── Hub Screen ──
  return (
    <div className="min-h-screen w-full overflow-x-hidden overflow-y-auto lg:pl-[64px]"
      style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(196, 154, 68, 0.03) 0%, transparent 60%)' }}>
      <div className="w-full max-w-[900px] mx-auto px-6 md:px-10 py-12 md:py-16">

        {/* Header */}
        <motion.header className="mb-12" {...section(0)}>
          <div className="flex items-center gap-3 mb-3">
            <BrainCircuit size={28} className="text-[#c49a44]" />
            <h1 className="text-[28px] sm:text-[32px] font-bold text-[#e0e0e6]"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              Quiz Center
            </h1>
          </div>
          <p className="text-[14px] text-[#55556a] max-w-[500px]">
            Test your knowledge of history across {questionCount} questions covering 12,000 years of human civilization.
          </p>
        </motion.header>

        {/* Stats row */}
        <motion.div className="grid grid-cols-3 gap-3 mb-10" {...section(0.1)}>
          {[
            { icon: Trophy, label: 'Quizzes Taken', value: totalQuizzes, color: '#c49a44' },
            { icon: Target, label: 'Avg Score', value: `${avgScore}%`, color: '#6d9476' },
            { icon: Flame, label: 'Questions Available', value: questionCount, color: '#b87a60' },
          ].map(stat => (
            <GlassCard key={stat.label} className="p-4 text-center">
              <stat.icon size={16} className="mx-auto mb-2" style={{ color: stat.color }} />
              <p className="text-[18px] font-bold text-[#e0e0e6]"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                {stat.value}
              </p>
              <p className="text-[10px] uppercase tracking-wider text-[#3a3a4a] mt-1">{stat.label}</p>
            </GlassCard>
          ))}
        </motion.div>

        {/* Mode selection */}
        <motion.section className="mb-10" {...section(0.2)}>
          <h2 className="text-[11px] font-semibold tracking-[0.14em] uppercase text-[#3a3a4a] mb-4">
            Choose Your Mode
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {MODES.map(({ mode, icon: Icon, title, desc, color }) => (
              <motion.button
                key={mode}
                onClick={() => handleStartQuiz(mode)}
                className="p-6 rounded-xl text-left cursor-pointer group"
                style={{
                  background: 'rgba(14, 14, 20, 0.6)', backdropFilter: 'blur(24px)',
                  border: `1px solid ${color}15`,
                }}
                whileHover={{ scale: 1.02, borderColor: `${color}40`, y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-4"
                  style={{ background: `${color}12` }}>
                  <Icon size={20} style={{ color }} />
                </div>
                <h3 className="text-[15px] font-semibold text-[#e0e0e6] mb-1 flex items-center gap-2">
                  {title}
                  <ChevronRight size={14} className="text-[#28282f] group-hover:text-[#55556a] transition-colors" />
                </h3>
                <p className="text-[12px] text-[#55556a] leading-relaxed">{desc}</p>
              </motion.button>
            ))}
          </div>
        </motion.section>

        {/* Filters */}
        <motion.section className="mb-10" {...section(0.3)}>
          <h2 className="text-[11px] font-semibold tracking-[0.14em] uppercase text-[#3a3a4a] mb-4">
            Focus Your Quiz
          </h2>
          <GlassCard className="p-5">
            <QuizFilters
              selectedEras={selectedEras}
              selectedCategories={selectedCategories}
              onToggleEra={toggleEra}
              onToggleCategory={toggleCategory}
            />
            {(selectedEras.length > 0 || selectedCategories.length > 0) && (
              <p className="text-[11px] text-[#55556a] mt-3">
                {QUIZ_QUESTIONS.filter(q => {
                  if (selectedEras.length && !selectedEras.includes(q.era)) return false;
                  if (selectedCategories.length && !selectedCategories.includes(q.category)) return false;
                  return true;
                }).length} questions match your filters
              </p>
            )}
          </GlassCard>
        </motion.section>

        {/* How it works */}
        <motion.section {...section(0.4)}>
          <h2 className="text-[11px] font-semibold tracking-[0.14em] uppercase text-[#3a3a4a] mb-4">
            How It Works
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { emoji: '🎯', text: '10 questions per quiz, mixed difficulty and types' },
              { emoji: '💡', text: 'Use hints to eliminate wrong answers (costs 50% points)' },
              { emoji: '🔥', text: 'Build streaks — 3 in a row earns bonus points' },
              { emoji: '📖', text: 'Learn from explanations after every question' },
            ].map(({ emoji, text }) => (
              <div key={text} className="flex items-start gap-3 p-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.02)' }}>
                <span className="text-[18px]">{emoji}</span>
                <p className="text-[12px] text-[#8a8a9a] leading-relaxed">{text}</p>
              </div>
            ))}
          </div>
        </motion.section>
      </div>
    </div>
  );
}
