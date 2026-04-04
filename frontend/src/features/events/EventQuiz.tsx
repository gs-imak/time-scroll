import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, ChevronRight, RotateCcw } from 'lucide-react';
import { EVENT_QUIZZES } from '@/shared/data/eventQuizzes';

interface EventQuizProps {
  eventId: string;
  eventTitle: string;
  categoryColor: string;
  onComplete?: (score: number) => void;
}

export function EventQuiz({ eventId, eventTitle, categoryColor, onComplete }: EventQuizProps) {
  const questions = EVENT_QUIZZES[eventId];
  const [currentQ, setCurrentQ] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [finished, setFinished] = useState(false);
  const [started, setStarted] = useState(false);

  if (!questions || questions.length === 0) return null;

  const question = questions[currentQ];
  const isCorrect = selected === question?.correctIndex;
  const total = questions.length;
  const scorePercent = Math.round((correctCount / total) * 100);

  const handleSelect = useCallback((idx: number) => {
    if (answered) return;
    setSelected(idx);
    setAnswered(true);
    if (idx === question?.correctIndex) {
      setCorrectCount(prev => prev + 1);
    }
  }, [answered, question]);

  const handleNext = useCallback(() => {
    if (currentQ < total - 1) {
      setCurrentQ(prev => prev + 1);
      setSelected(null);
      setAnswered(false);
    } else {
      const finalScore = Math.round(((correctCount + (isCorrect ? 0 : 0)) / total) * 100);
      setFinished(true);
      onComplete?.(finalScore);
    }
  }, [currentQ, total, correctCount, isCorrect, onComplete]);

  const handleRestart = useCallback(() => {
    setCurrentQ(0);
    setSelected(null);
    setAnswered(false);
    setCorrectCount(0);
    setFinished(false);
  }, []);

  if (!started) {
    return (
      <motion.div
        className="rounded-2xl p-8 text-center"
        style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="text-[40px] mb-4">🧠</div>
        <h3 className="text-[18px] font-semibold text-[#e0e0e6] mb-2">Test Your Knowledge</h3>
        <p className="text-[13px] text-[#55556a] mb-6">
          {total} questions about {eventTitle}
        </p>
        <motion.button
          onClick={() => setStarted(true)}
          className="px-6 py-3 rounded-xl text-[13px] font-semibold cursor-pointer transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-gold/50 focus-visible:ring-offset-2 focus-visible:ring-offset-void"
          style={{ background: categoryColor + '20', color: categoryColor, border: `1px solid ${categoryColor}30` }}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
        >
          Start Quiz
        </motion.button>
      </motion.div>
    );
  }

  if (finished) {
    const emoji = scorePercent === 100 ? '🏆' : scorePercent >= 66 ? '⭐' : scorePercent >= 33 ? '👍' : '📖';
    const message = scorePercent === 100 ? 'Perfect Score!' : scorePercent >= 66 ? 'Great Job!' : scorePercent >= 33 ? 'Good Effort!' : 'Keep Learning!';

    return (
      <motion.div
        className="rounded-2xl p-8 text-center"
        style={{ background: 'rgba(255,255,255,0.02)', border: `1px solid ${categoryColor}20` }}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <motion.div
          className="text-[56px] mb-4"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 15, delay: 0.2 }}
        >
          {emoji}
        </motion.div>
        <h3 className="text-[20px] font-semibold text-[#e0e0e6] mb-1">{message}</h3>
        <p className="text-[14px] text-[#8a8a9a] mb-6">
          You got <span style={{ color: categoryColor, fontWeight: 600 }}>{correctCount} out of {total}</span> correct
        </p>

        {/* Score bar */}
        <div className="w-48 mx-auto h-2 rounded-full bg-white/[0.05] mb-6 overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{ background: categoryColor }}
            initial={{ width: 0 }}
            animate={{ width: `${scorePercent}%` }}
            transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          />
        </div>

        <div className="flex items-center justify-center gap-3">
          <motion.button
            onClick={handleRestart}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-[12px] font-medium cursor-pointer transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-gold/50 focus-visible:ring-offset-2 focus-visible:ring-offset-void"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#8a8a9a' }}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            <RotateCcw size={13} />
            Try Again
          </motion.button>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.06)' }}>
      {/* Progress header */}
      <div className="px-6 py-4 flex items-center justify-between" style={{ background: 'rgba(255,255,255,0.02)' }}>
        <span className="text-[11px] font-semibold tracking-wider uppercase text-[#55556a]">
          Question {currentQ + 1} of {total}
        </span>
        <div className="flex gap-1.5">
          {questions.map((_, i) => (
            <div
              key={i}
              className="w-2 h-2 rounded-full transition-all duration-300"
              style={{
                background: i < currentQ ? categoryColor : i === currentQ ? categoryColor + '80' : '#28282f',
              }}
            />
          ))}
        </div>
      </div>

      {/* Question */}
      <div className="px-6 py-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQ}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <p className="text-[16px] font-medium text-[#e0e0e6] mb-6 leading-relaxed">
              {question?.question}
            </p>

            {/* Options */}
            <div className="space-y-3">
              {question?.options.map((option, i) => {
                const isThis = selected === i;
                const isRight = i === question.correctIndex;
                let bg = 'rgba(255,255,255,0.02)';
                let border = 'rgba(255,255,255,0.06)';
                let textColor = '#8a8a9a';

                if (answered) {
                  if (isRight) {
                    bg = 'rgba(109, 148, 118, 0.12)';
                    border = 'rgba(109, 148, 118, 0.3)';
                    textColor = '#6d9476';
                  } else if (isThis && !isRight) {
                    bg = 'rgba(184, 84, 84, 0.1)';
                    border = 'rgba(184, 84, 84, 0.25)';
                    textColor = '#b85454';
                  }
                } else if (isThis) {
                  bg = `${categoryColor}10`;
                  border = `${categoryColor}30`;
                  textColor = '#e0e0e6';
                }

                return (
                  <motion.button
                    key={i}
                    onClick={() => handleSelect(i)}
                    disabled={answered}
                    className="w-full flex items-center gap-3 p-4 rounded-xl text-left transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-gold/50 focus-visible:ring-offset-2 focus-visible:ring-offset-void"
                    style={{ background: bg, border: `1px solid ${border}` }}
                    whileHover={!answered ? { scale: 1.01, borderColor: `${categoryColor}40` } : {}}
                    whileTap={!answered ? { scale: 0.99 } : {}}
                  >
                    {/* Letter indicator */}
                    <span className="w-7 h-7 rounded-lg flex items-center justify-center text-[11px] font-semibold shrink-0"
                      style={{ background: 'rgba(255,255,255,0.04)', color: '#55556a' }}>
                      {String.fromCharCode(65 + i)}
                    </span>

                    <span className="text-[14px] flex-1" style={{ color: textColor }}>
                      {option}
                    </span>

                    {/* Result icon */}
                    {answered && isRight && (
                      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 400 }}>
                        <CheckCircle size={18} className="text-[#6d9476]" />
                      </motion.div>
                    )}
                    {answered && isThis && !isRight && (
                      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 400 }}>
                        <XCircle size={18} className="text-[#b85454]" />
                      </motion.div>
                    )}
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Next button */}
        <AnimatePresence>
          {answered && (
            <motion.div
              className="mt-6 flex justify-end"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <motion.button
                onClick={handleNext}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-medium cursor-pointer transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-gold/50 focus-visible:ring-offset-2 focus-visible:ring-offset-void"
                style={{ background: categoryColor + '18', color: categoryColor, border: `1px solid ${categoryColor}25` }}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                {currentQ < total - 1 ? 'Next Question' : 'See Results'}
                <ChevronRight size={14} />
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
