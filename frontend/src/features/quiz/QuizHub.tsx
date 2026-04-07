import { useState, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  BrainCircuit, Zap, Calendar, BookOpen, Trophy, Flame, Target,
  ChevronRight, TrendingUp, Clock, Award, BarChart3, Star, CheckCircle2,
} from 'lucide-react';
import { useQuizSession } from './hooks/useQuizSession';
import { QuizSession } from './QuizSession';
import { QuizResults } from './QuizResults';
import { QuizFilters } from './components/QuizFilters';
import { QUIZ_QUESTIONS } from './data/quizQuestions';
import type { QuizMode, QuizSessionConfig } from './types';
import type { EventCategory } from '@/shared/types/events';
import { useProgressStore } from '@/shared/stores/progressStore';
import { ERAS } from '@/shared/utils/constants';

/* ── Animation presets ── */

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

const stagger = {
  animate: { transition: { staggerChildren: 0.06, delayChildren: 0.1 } },
};

const fadeUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE } },
};

const scaleIn = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1, transition: { duration: 0.45, ease: EASE } },
};

const section = (delay: number) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.55, delay, ease: EASE } },
});

/* ── Era color map (hex for inline styles) ── */

const ERA_HEX: Record<string, string> = {
  prehistory: '#8d7b68',
  ancient: '#c49a44',
  classical: '#b85454',
  medieval: '#8b6faa',
  renaissance: '#5a7fb5',
  industrial: '#7a9e5a',
  modern: '#5a9aaa',
};

/* ── Mode configs ── */

const MODES: {
  mode: QuizMode;
  icon: typeof BookOpen;
  title: string;
  tagline: string;
  desc: string;
  color: string;
  gradient: string;
}[] = [
  {
    mode: 'practice',
    icon: BookOpen,
    title: 'Practice Mode',
    tagline: 'Learn at your pace',
    desc: 'No timer, detailed explanations after each answer. Perfect for building knowledge.',
    color: '#6d9476',
    gradient: 'linear-gradient(135deg, rgba(109,148,118,0.12) 0%, rgba(109,148,118,0.03) 100%)',
  },
  {
    mode: 'challenge',
    icon: Zap,
    title: 'Challenge Mode',
    tagline: '30s per question',
    desc: 'Race against the clock. Speed bonus points for fast answers. How far can you go?',
    color: '#b85454',
    gradient: 'linear-gradient(135deg, rgba(184,84,84,0.12) 0%, rgba(184,84,84,0.03) 100%)',
  },
  {
    mode: 'daily',
    icon: Calendar,
    title: 'Daily Quiz',
    tagline: 'Same for everyone',
    desc: 'A fresh set of 10 questions each day. Compare your score with others.',
    color: '#c49a44',
    gradient: 'linear-gradient(135deg, rgba(196,154,68,0.12) 0%, rgba(196,154,68,0.03) 100%)',
  },
];

/* ── Shared glass card ── */

function GlassCard({
  children,
  className,
  strong,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { strong?: boolean }) {
  return (
    <div
      className={`rounded-xl transition-all duration-200 ${className ?? ''}`}
      style={{
        background: strong ? 'var(--glass-strong-bg)' : 'var(--glass-bg)',
        backdropFilter: strong ? 'blur(40px)' : 'blur(24px)',
        border: '1px solid var(--color-border-subtle)',
        boxShadow: 'inset 0 1px 0 var(--glass-inset)',
      }}
      {...props}
    >
      {children}
    </div>
  );
}

/* ── Stat card sub-component ── */

function StatCard({
  icon: Icon,
  label,
  value,
  color,
  suffix,
  index,
}: {
  icon: typeof Trophy;
  label: string;
  value: number | string;
  color: string;
  suffix?: string;
  index: number;
}) {
  return (
    <motion.div variants={scaleIn} custom={index}>
      <GlassCard className="p-5 sm:p-6 group hover:border-border-active cursor-default relative overflow-hidden">
        {/* Subtle colored glow at top */}
        <div
          className="absolute top-0 left-0 right-0 h-[2px]"
          style={{ background: `linear-gradient(90deg, transparent, ${color}40, transparent)` }}
        />
        <div className="flex items-center gap-2 mb-3">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: `${color}14` }}
          >
            <Icon size={16} style={{ color }} />
          </div>
          <span
            className="text-[10px] font-semibold uppercase tracking-wider"
            style={{ color: 'var(--color-text-muted)' }}
          >
            {label}
          </span>
        </div>
        <div className="flex items-baseline gap-1">
          <span
            className="text-2xl sm:text-[28px] font-bold"
            style={{ fontFamily: "'JetBrains Mono', monospace", color: 'var(--color-text-primary)' }}
          >
            {value}
          </span>
          {suffix && (
            <span
              className="text-sm font-medium"
              style={{ fontFamily: "'JetBrains Mono', monospace", color: 'var(--color-text-muted)' }}
            >
              {suffix}
            </span>
          )}
        </div>
      </GlassCard>
    </motion.div>
  );
}

/* ── Mode card sub-component ── */

function ModeCard({
  icon: Icon,
  title,
  tagline,
  desc,
  color,
  gradient,
  onClick,
}: {
  mode: QuizMode;
  icon: typeof BookOpen;
  title: string;
  tagline: string;
  desc: string;
  color: string;
  gradient: string;
  onClick: () => void;
}) {
  return (
    <motion.button
      variants={fadeUp}
      onClick={onClick}
      className="p-6 sm:p-7 rounded-xl text-left cursor-pointer group relative overflow-hidden"
      style={{
        background: gradient,
        border: `1px solid ${color}15`,
      }}
      whileHover={{
        scale: 1.015,
        borderColor: `${color}35`,
        y: -3,
        transition: { duration: 0.2, ease: EASE },
      }}
      whileTap={{ scale: 0.985 }}
    >
      {/* Hover glow */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse at 50% 0%, ${color}08, transparent 70%)`,
        }}
      />

      <div className="relative">
        <div
          className="w-14 h-14 rounded-xl flex items-center justify-center mb-4"
          style={{ background: `${color}18`, border: `1px solid ${color}25` }}
        >
          <Icon size={26} style={{ color }} />
        </div>
        <h3
          className="text-[17px] font-bold mb-1"
          style={{ fontFamily: "'Space Grotesk', sans-serif", color: 'var(--color-text-primary)' }}
        >
          {title}
        </h3>
        <p
          className="text-[11px] font-medium mb-3"
          style={{ fontFamily: "'JetBrains Mono', monospace", color }}
        >
          {tagline}
        </p>
        <p className="text-[13px] leading-relaxed mb-5" style={{ color: 'var(--color-text-secondary)' }}>
          {desc}
        </p>
        <div className="flex items-center gap-1.5" style={{ color }}>
          <span className="text-[11px] font-semibold uppercase tracking-wider">Start</span>
          <ChevronRight
            size={14}
            className="group-hover:translate-x-1 transition-transform duration-200"
          />
        </div>
      </div>
    </motion.button>
  );
}

/* ── Era mastery card ── */

function EraMasteryCard({
  era,
  color,
  questionCount,
  avgScore,
  quizzed,
}: {
  era: { id: string; name: string };
  color: string;
  questionCount: number;
  avgScore: number;
  quizzed: boolean;
}) {
  const pct = Math.min(avgScore, 100);

  return (
    <motion.div variants={fadeUp}>
      <GlassCard className="p-4 relative overflow-hidden group hover:border-border-active cursor-default">
        {/* Era color stripe */}
        <div
          className="absolute top-0 left-0 w-full h-[2px]"
          style={{ background: color }}
        />

        <div className="flex items-center justify-between mb-3">
          <span
            className="text-[13px] font-bold"
            style={{ fontFamily: "'Space Grotesk', sans-serif", color: 'var(--color-text-primary)' }}
          >
            {era.name}
          </span>
          <span
            className="text-[10px] font-medium px-2 py-0.5 rounded-full"
            style={{
              background: `${color}14`,
              color,
              fontFamily: "'JetBrains Mono', monospace",
            }}
          >
            {questionCount}q
          </span>
        </div>

        {/* Score readout */}
        <div className="flex items-baseline gap-1 mb-2.5">
          <span
            className="text-lg font-bold"
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              color: quizzed ? color : 'var(--color-text-muted)',
            }}
          >
            {quizzed ? `${Math.round(avgScore)}%` : '--'}
          </span>
          {quizzed && (
            <span className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>
              avg
            </span>
          )}
        </div>

        {/* Progress bar */}
        <div
          className="w-full h-1.5 rounded-full overflow-hidden"
          style={{ background: 'rgba(255,255,255,0.04)' }}
        >
          <motion.div
            className="h-full rounded-full"
            style={{ background: color }}
            initial={{ width: 0 }}
            animate={{ width: quizzed ? `${pct}%` : '0%' }}
            transition={{ duration: 0.8, delay: 0.3, ease: EASE }}
          />
        </div>

        {!quizzed && (
          <p className="text-[10px] mt-2" style={{ color: 'var(--color-text-muted)' }}>
            Not attempted yet
          </p>
        )}
      </GlassCard>
    </motion.div>
  );
}

/* ══════════════════════════════════════════
   MAIN COMPONENT
   ══════════════════════════════════════════ */

export default function QuizHub() {
  const { state, startQuiz, selectAnswer, confirmAnswer, useHint, nextQuestion, reset, getResult } =
    useQuizSession();
  const [selectedEras, setSelectedEras] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<EventCategory[]>([]);
  const [filtersOpen, setFiltersOpen] = useState(true);

  const quizScores = useProgressStore((s) => s.quizScores);
  const recordQuizScore = useProgressStore((s) => s.recordQuizScore);
  const currentStreak = useProgressStore((s) => s.currentStreak);

  /* ── Computed stats ── */

  const totalPoints = useMemo(
    () => Object.values(quizScores).reduce((a, b) => a + b, 0),
    [quizScores],
  );

  const totalQuizzes = Object.keys(quizScores).length;

  const accuracy = useMemo(() => {
    if (totalQuizzes === 0) return 0;
    // quizScores stores best score per event (points). Estimate accuracy from average.
    const avg = totalPoints / totalQuizzes;
    // Average question base is ~20 points; use as rough %, capped at 100
    return Math.min(Math.round(avg * 3.3), 100);
  }, [totalPoints, totalQuizzes]);

  const questionCount = useMemo(() => QUIZ_QUESTIONS.length, []);

  /* ── Era mastery data ── */

  const eraMastery = useMemo(() => {
    return ERAS.map((era) => {
      const eraQuestions = QUIZ_QUESTIONS.filter((q) => q.era === era.id);
      const eraScoreEntries = eraQuestions
        .map((q) => quizScores[q.eventId])
        .filter((s): s is number => s !== undefined);

      const avgScore =
        eraScoreEntries.length > 0
          ? eraScoreEntries.reduce((a, b) => a + b, 0) / eraScoreEntries.length
          : 0;

      return {
        era,
        color: ERA_HEX[era.id] ?? '#8a8a9a',
        questionCount: eraQuestions.length,
        avgScore: avgScore > 0 ? Math.min((avgScore / 30) * 100, 100) : 0, // normalize to %
        quizzed: eraScoreEntries.length > 0,
      };
    });
  }, [quizScores]);

  /* ── Filter matching count ── */

  const filteredCount = useMemo(() => {
    if (selectedEras.length === 0 && selectedCategories.length === 0) return questionCount;
    return QUIZ_QUESTIONS.filter((q) => {
      if (selectedEras.length && !selectedEras.includes(q.era)) return false;
      if (selectedCategories.length && !selectedCategories.includes(q.category)) return false;
      return true;
    }).length;
  }, [selectedEras, selectedCategories, questionCount]);

  /* ── Actions ── */

  const toggleEra = useCallback((era: string) => {
    setSelectedEras((prev) => (prev.includes(era) ? prev.filter((e) => e !== era) : [...prev, era]));
  }, []);

  const toggleCategory = useCallback((cat: EventCategory) => {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat],
    );
  }, []);

  const handleStartQuiz = useCallback(
    (mode: QuizMode) => {
      const config: QuizSessionConfig = {
        mode,
        questionCount: 10,
        eras: selectedEras,
        categories: selectedCategories,
      };
      startQuiz(config, QUIZ_QUESTIONS);
    },
    [startQuiz, selectedEras, selectedCategories],
  );

  const handleQuit = useCallback(() => {
    reset();
  }, [reset]);

  const handleRetry = useCallback(() => {
    handleStartQuiz(state.config.mode);
  }, [handleStartQuiz, state.config.mode]);

  /* ── Session screen ── */

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

  /* ── Results screen ── */

  if (state.screen === 'results') {
    const result = getResult();
    for (const ans of result.answers) {
      const q = result.questions.find((qq) => qq.id === ans.questionId);
      if (q && ans.correct) {
        const existing = quizScores[q.eventId] ?? 0;
        if (ans.pointsEarned > existing) {
          recordQuizScore(q.eventId, ans.pointsEarned);
        }
      }
    }
    return <QuizResults result={result} onRetry={handleRetry} onBackToHub={reset} />;
  }

  /* ══════════════════════════════════════════
     HUB SCREEN
     ══════════════════════════════════════════ */

  return (
    <div
      className="min-h-screen w-full overflow-x-hidden overflow-y-auto lg:pl-[64px]"
      style={{
        background: `
          radial-gradient(ellipse at 50% 0%, rgba(196,154,68,0.04) 0%, transparent 50%),
          radial-gradient(ellipse at 80% 70%, rgba(90,154,170,0.025) 0%, transparent 50%),
          var(--color-void)
        `,
      }}
    >
      <div className="w-full max-w-[1000px] mx-auto px-5 sm:px-8 md:px-10 py-10 md:py-14">
        {/* ─────────────────────────────────
            SECTION 1 — Hero Header
           ───────────────────────────────── */}
        <motion.header className="mb-7" {...section(0)}>
          <div className="flex items-start sm:items-center justify-between gap-4 flex-col sm:flex-row">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{
                    background: 'rgba(196,154,68,0.1)',
                    border: '1px solid rgba(196,154,68,0.2)',
                  }}
                >
                  <BrainCircuit size={22} style={{ color: 'var(--color-accent-gold)' }} />
                </div>
                <h1
                  className="text-[30px] sm:text-[38px] font-bold"
                  style={{
                    fontFamily: "'Space Grotesk', sans-serif",
                    color: 'var(--color-text-primary)',
                  }}
                >
                  Quiz Center
                </h1>
              </div>
              <p
                className="text-[14px] max-w-[480px] leading-relaxed"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                Test your knowledge across{' '}
                <span
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    color: 'var(--color-accent-gold)',
                    fontWeight: 600,
                  }}
                >
                  {questionCount}
                </span>{' '}
                questions spanning 12,000 years of human civilization.
              </p>
            </div>

            {/* Quick-start CTA */}
            <motion.button
              onClick={() => handleStartQuiz('practice')}
              className="flex items-center gap-2.5 px-6 py-3 rounded-xl cursor-pointer font-semibold text-[14px] group shrink-0"
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                background: 'linear-gradient(135deg, rgba(196,154,68,0.18) 0%, rgba(196,154,68,0.08) 100%)',
                border: '1px solid rgba(196,154,68,0.25)',
                color: 'var(--color-accent-gold)',
              }}
              whileHover={{
                scale: 1.03,
                borderColor: 'rgba(196,154,68,0.45)',
                transition: { duration: 0.2 },
              }}
              whileTap={{ scale: 0.97 }}
            >
              <Zap size={18} />
              Quick Start
              <ChevronRight
                size={16}
                className="group-hover:translate-x-0.5 transition-transform duration-200"
              />
            </motion.button>
          </div>
        </motion.header>

        {/* ─────────────────────────────────
            SECTION 2 — Stats Row (4 cards)
           ───────────────────────────────── */}
        <motion.div
          className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-7"
          variants={stagger}
          initial="initial"
          animate="animate"
        >
          <StatCard
            icon={Star}
            label="Total Points"
            value={totalPoints}
            color="#c49a44"
            index={0}
          />
          <StatCard
            icon={CheckCircle2}
            label="Quizzes Done"
            value={totalQuizzes}
            color="#6d9476"
            index={1}
          />
          <StatCard
            icon={Target}
            label="Accuracy"
            value={accuracy}
            suffix="%"
            color="#5a9aaa"
            index={2}
          />
          <StatCard
            icon={Flame}
            label="Day Streak"
            value={currentStreak}
            color="#b87a60"
            index={3}
          />
        </motion.div>

        {/* ─────────────────────────────────
            SECTION 3 — Choose Your Mode
           ───────────────────────────────── */}
        <motion.section className="mb-7" {...section(0.15)}>
          <SectionHeading icon={Award} label="Choose Your Mode" />
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-3 gap-4"
            variants={stagger}
            initial="initial"
            animate="animate"
          >
            {MODES.map((m) => (
              <ModeCard
                key={m.mode}
                {...m}
                onClick={() => handleStartQuiz(m.mode)}
              />
            ))}
          </motion.div>
        </motion.section>

        {/* ─────────────────────────────────
            SECTION 4 — Filter Your Quiz
           ───────────────────────────────── */}
        <motion.section className="mb-7" {...section(0.25)}>
          <button
            onClick={() => setFiltersOpen((o) => !o)}
            className="flex items-center gap-2 mb-4 cursor-pointer group"
          >
            <SectionHeading icon={BarChart3} label="Filter Your Quiz" inline />
            <motion.div
              animate={{ rotate: filtersOpen ? 90 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronRight size={14} style={{ color: 'var(--color-text-muted)' }} />
            </motion.div>
            {(selectedEras.length > 0 || selectedCategories.length > 0) && (
              <span
                className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  background: 'rgba(196,154,68,0.12)',
                  color: 'var(--color-accent-gold)',
                }}
              >
                {filteredCount} matching
              </span>
            )}
          </button>

          <motion.div
            initial={false}
            animate={{
              height: filtersOpen ? 'auto' : 0,
              opacity: filtersOpen ? 1 : 0,
            }}
            transition={{ duration: 0.3, ease: EASE }}
            className="overflow-hidden"
          >
            <GlassCard className="p-5">
              <QuizFilters
                selectedEras={selectedEras}
                selectedCategories={selectedCategories}
                onToggleEra={toggleEra}
                onToggleCategory={toggleCategory}
              />
            </GlassCard>
          </motion.div>
        </motion.section>

        {/* ─────────────────────────────────
            SECTION 5 — Era Mastery Grid
           ───────────────────────────────── */}
        <motion.section className="mb-7" {...section(0.35)}>
          <SectionHeading icon={TrendingUp} label="Era Mastery" />
          <motion.div
            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3"
            variants={stagger}
            initial="initial"
            animate="animate"
          >
            {eraMastery.map((em) => (
              <EraMasteryCard key={em.era.id} {...em} />
            ))}
          </motion.div>
        </motion.section>

        {/* ─────────────────────────────────
            SECTION 6 — Question Types + Scoring
           ───────────────────────────────── */}
        <motion.section {...section(0.45)}>
          <SectionHeading icon={Clock} label="How It Works" />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
            {[
              { emoji: '🔤', title: 'Multiple Choice', desc: '4 options, pick the right one', color: '#5a9aaa' },
              { emoji: '✓✗', title: 'True or False', desc: 'Judge the statement', color: '#6d9476' },
              { emoji: '🖼️', title: 'Image ID', desc: 'Identify from a picture', color: '#c49a44' },
              { emoji: '📅', title: 'Timeline Order', desc: 'Arrange events in order', color: '#8b80b0' },
            ].map(({ emoji, title, desc }) => (
              <GlassCard key={title} className="p-4 text-center">
                <div className="text-[24px] mb-2">{emoji}</div>
                <p className="text-[12px] font-bold mb-0.5" style={{ fontFamily: "'Space Grotesk', sans-serif", color: 'var(--color-text-primary)' }}>{title}</p>
                <p className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>{desc}</p>
              </GlassCard>
            ))}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { icon: Target, title: '10 questions per quiz', text: 'Mixed difficulty and types for a well-rounded challenge.', accent: '#5a9aaa' },
              { icon: BrainCircuit, title: 'Hints cost 50% points', text: 'Eliminate wrong answers, but at a price.', accent: '#c49a44' },
              { icon: Flame, title: 'Streak = +10 bonus', text: 'Answer 3 in a row for extra points.', accent: '#b85454' },
            ].map(({ icon: ItemIcon, title, text, accent }) => (
              <GlassCard key={title} className="p-4 flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: `${accent}14` }}>
                  <ItemIcon size={15} style={{ color: accent }} />
                </div>
                <div>
                  <p className="text-[12px] font-semibold mb-0.5" style={{ fontFamily: "'Space Grotesk', sans-serif", color: 'var(--color-text-primary)' }}>{title}</p>
                  <p className="text-[10px] leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>{text}</p>
                </div>
              </GlassCard>
            ))}
          </div>
        </motion.section>

        {/* Bottom breathing room */}
        <div className="h-16" />
      </div>
    </div>
  );
}

/* ── Section heading helper ── */

function SectionHeading({
  icon: Icon,
  label,
  inline,
}: {
  icon: typeof Trophy;
  label: string;
  inline?: boolean;
}) {
  const inner = (
    <div className="flex items-center gap-2">
      <Icon size={14} style={{ color: 'var(--color-text-muted)' }} />
      <h2
        className="text-[11px] font-semibold tracking-[0.14em] uppercase"
        style={{ color: 'var(--color-text-muted)' }}
      >
        {label}
      </h2>
    </div>
  );
  if (inline) return inner;
  return <div className="mb-4">{inner}</div>;
}
