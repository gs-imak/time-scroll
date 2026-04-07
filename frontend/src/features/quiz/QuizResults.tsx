import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { RotateCcw, ArrowLeft, CheckCircle, XCircle, Trophy, Flame, Lightbulb, Clock } from 'lucide-react';
import { ScoreRing } from './components/ScoreRing';
import type { QuizSessionResult, QuizQuestion } from './types';

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

const DIFFICULTY_COLORS: Record<string, string> = { easy: '#6d9476', medium: '#c49a44', hard: '#b85454' };
const TYPE_LABEL: Record<string, string> = { mcq: 'MCQ', 'true-false': 'T/F', 'image-id': 'Image', 'timeline-order': 'Timeline' };

function GlassCard({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={className} style={{
      background: 'rgba(14, 14, 20, 0.6)', backdropFilter: 'blur(24px)',
      border: '1px solid rgba(255, 255, 255, 0.06)',
      boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.03)',
      borderRadius: 12,
    }}>
      {children}
    </div>
  );
}

function formatAnswer(q: QuizQuestion, answer: number | boolean | number[]): string {
  switch (q.type) {
    case 'mcq':
    case 'image-id':
      return q.options[answer as number] ?? '—';
    case 'true-false':
      return answer ? 'True' : 'False';
    case 'timeline-order':
      return (answer as number[]).map(i => q.items[i]?.label).join(' → ');
    default:
      return '—';
  }
}

function getCorrectAnswer(q: QuizQuestion): string {
  switch (q.type) {
    case 'mcq':
    case 'image-id':
      return q.options[q.correctIndex] ?? '—';
    case 'true-false':
      return q.isTrue ? 'True' : 'False';
    case 'timeline-order':
      return [...q.items].sort((a, b) => a.year - b.year).map(i => i.label).join(' → ');
    default:
      return '—';
  }
}

interface Props {
  result: QuizSessionResult;
  onRetry: () => void;
  onBackToHub: () => void;
}

export function QuizResults({ result, onRetry, onBackToHub }: Props) {
  const correctPct = result.totalQuestions > 0 ? Math.round((result.correctCount / result.totalQuestions) * 100) : 0;

  const emoji = correctPct === 100 ? '🏆' : correctPct >= 70 ? '⭐' : correctPct >= 40 ? '👍' : '📖';
  const message = correctPct === 100 ? 'Perfect Score!' : correctPct >= 70 ? 'Great Job!' : correctPct >= 40 ? 'Good Effort!' : 'Keep Learning!';
  const color = correctPct >= 70 ? '#6d9476' : correctPct >= 40 ? '#c49a44' : '#b85454';

  const timeStr = useMemo(() => {
    const s = Math.round(result.totalTimeMs / 1000);
    return s >= 60 ? `${Math.floor(s / 60)}m ${s % 60}s` : `${s}s`;
  }, [result.totalTimeMs]);

  return (
    <div className="min-h-screen w-full overflow-x-hidden overflow-y-auto lg:pl-[64px]">
      <div className="w-full max-w-[720px] mx-auto px-5 md:px-8 py-10 md:py-16">
        {/* Score hero */}
        <motion.div
          className="text-center mb-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: EASE }}
        >
          <motion.div
            className="text-[48px] mb-4"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 15, delay: 0.2 }}
          >
            {emoji}
          </motion.div>
          <h2 className="text-[24px] font-bold text-[#e0e0e6] mb-2" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            {message}
          </h2>
          <p className="text-[14px] text-[#55556a] mb-8">
            {result.correctCount} of {result.totalQuestions} correct — {result.score} points earned
          </p>

          <div className="flex justify-center mb-8">
            <ScoreRing score={correctPct} color={color} />
          </div>
        </motion.div>

        {/* Stats row */}
        <motion.div
          className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6, ease: EASE }}
        >
          {[
            { icon: Trophy, label: 'Points', value: `${result.score}`, color: '#c49a44' },
            { icon: Flame, label: 'Best Streak', value: `${result.bestStreak}`, color: '#b87a60' },
            { icon: Lightbulb, label: 'Hints Used', value: `${result.hintsUsed}`, color: '#8b80b0' },
            { icon: Clock, label: 'Time', value: timeStr, color: '#5a8fa5' },
          ].map((stat) => (
            <GlassCard key={stat.label} className="p-4 text-center">
              <stat.icon size={16} className="mx-auto mb-2" style={{ color: stat.color }} />
              <p className="text-[16px] font-bold text-[#e0e0e6]">{stat.value}</p>
              <p className="text-[10px] uppercase tracking-wider text-[#3a3a4a] mt-1">{stat.label}</p>
            </GlassCard>
          ))}
        </motion.div>

        {/* Actions */}
        <div className="flex items-center justify-center gap-3 mb-12">
          <motion.button
            onClick={onRetry}
            className="flex items-center gap-2 px-5 py-3 rounded-xl text-[13px] font-medium cursor-pointer"
            style={{ background: 'rgba(196, 154, 68, 0.15)', color: '#c49a44', border: '1px solid rgba(196, 154, 68, 0.3)' }}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            <RotateCcw size={14} />
            Try Again
          </motion.button>
          <motion.button
            onClick={onBackToHub}
            className="flex items-center gap-2 px-5 py-3 rounded-xl text-[13px] font-medium cursor-pointer"
            style={{ background: 'rgba(255,255,255,0.04)', color: '#8a8a9a', border: '1px solid rgba(255,255,255,0.08)' }}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            <ArrowLeft size={14} />
            Back to Quiz Center
          </motion.button>
        </div>

        {/* Full Review */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6, ease: EASE }}
        >
          <h3 className="text-[11px] font-semibold tracking-[0.14em] uppercase text-[#3a3a4a] mb-6">
            Full Review
          </h3>

          <div className="space-y-4">
            {result.questions.map((q, i) => {
              const answer = result.answers[i];
              const isCorrect = answer?.correct ?? false;

              return (
                <GlassCard key={q.id} className="p-5">
                  {/* Header */}
                  <div className="flex items-center gap-2 mb-3">
                    <span className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold"
                      style={{ background: isCorrect ? 'rgba(109,148,118,0.15)' : 'rgba(184,84,84,0.15)', color: isCorrect ? '#6d9476' : '#b85454' }}>
                      {i + 1}
                    </span>
                    {isCorrect
                      ? <CheckCircle size={14} className="text-[#6d9476]" />
                      : <XCircle size={14} className="text-[#b85454]" />
                    }
                    <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full"
                      style={{ background: 'rgba(255,255,255,0.03)', color: '#55556a' }}>
                      {TYPE_LABEL[q.type]}
                    </span>
                    <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full"
                      style={{ color: DIFFICULTY_COLORS[q.difficulty] }}>
                      {q.difficulty}
                    </span>
                    <span className="text-[10px] text-[#28282f] ml-auto">
                      {answer?.usedHint ? '💡 hint used' : ''} {answer?.pointsEarned ?? 0} pts
                    </span>
                  </div>

                  {/* Question text */}
                  <p className="text-[14px] text-[#8a8a9a] mb-3 leading-relaxed">
                    {q.type === 'true-false' ? `"${q.statement}"` : q.type === 'timeline-order' ? q.instruction : q.question}
                  </p>

                  {/* Your answer vs correct */}
                  {answer && (
                    <div className="space-y-1.5 mb-3">
                      <p className="text-[12px]">
                        <span className="text-[#55556a]">Your answer: </span>
                        <span style={{ color: isCorrect ? '#6d9476' : '#b85454' }}>
                          {formatAnswer(q, answer.answer)}
                        </span>
                      </p>
                      {!isCorrect && (
                        <p className="text-[12px]">
                          <span className="text-[#55556a]">Correct answer: </span>
                          <span className="text-[#6d9476]">{getCorrectAnswer(q)}</span>
                        </p>
                      )}
                    </div>
                  )}

                  {/* Explanation */}
                  {q.explanation && (
                    <div className="p-3 rounded-lg" style={{ background: 'rgba(109,148,118,0.05)', border: '1px solid rgba(109,148,118,0.1)' }}>
                      <p className="text-[12px] text-[#8a8a9a] leading-relaxed">
                        <span className="text-[#6d9476] font-semibold">Why? </span>
                        {q.explanation}
                      </p>
                    </div>
                  )}
                </GlassCard>
              );
            })}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
