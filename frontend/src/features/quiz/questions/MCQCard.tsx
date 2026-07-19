import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle } from 'lucide-react';
import type { MCQQuestion } from '../types';

interface Props {
  question: MCQQuestion;
  selected: number | null;
  isAnswered: boolean;
  eliminatedOptions: number[];
  onSelect: (index: number) => void;
}

export function MCQCard({ question, selected, isAnswered, eliminatedOptions, onSelect }: Props) {
  return (
    <div>
      <p className="text-[17px] sm:text-[18px] font-medium text-text-primary mb-6 leading-relaxed">
        {question.question}
      </p>

      <div className="space-y-3">
        {question.options.map((option, i) => {
          const isEliminated = eliminatedOptions.includes(i);
          const isSelected = selected === i;
          const isCorrect = i === question.correctIndex;

          let bg = 'rgba(255,255,255,0.02)';
          let border = 'rgba(255,255,255,0.06)';
          let textColor = '#8a8a9a';

          if (isEliminated && !isAnswered) {
            bg = 'rgba(255,255,255,0.01)';
            textColor = '#28282f';
          } else if (isAnswered) {
            if (isCorrect) {
              bg = 'rgba(109, 148, 118, 0.12)';
              border = 'rgba(109, 148, 118, 0.3)';
              textColor = '#6d9476';
            } else if (isSelected && !isCorrect) {
              bg = 'rgba(184, 84, 84, 0.1)';
              border = 'rgba(184, 84, 84, 0.25)';
              textColor = '#b85454';
            }
          } else if (isSelected) {
            bg = 'rgba(196, 154, 68, 0.1)';
            border = 'rgba(196, 154, 68, 0.3)';
            textColor = '#e0e0e6';
          }

          return (
            <motion.button
              key={i}
              onClick={() => !isEliminated && onSelect(i)}
              disabled={isAnswered || isEliminated}
              className="w-full flex items-center gap-3 p-4 rounded-xl text-left transition-all cursor-pointer disabled:cursor-default"
              style={{ background: bg, border: `1px solid ${border}`, opacity: isEliminated && !isAnswered ? 0.3 : 1 }}
              whileHover={!isAnswered && !isEliminated ? { scale: 1.01, borderColor: 'rgba(196, 154, 68, 0.4)' } : {}}
              whileTap={!isAnswered && !isEliminated ? { scale: 0.99 } : {}}
              layout
            >
              <span
                className="w-7 h-7 rounded-lg flex items-center justify-center text-[11px] font-semibold shrink-0"
                style={{ background: 'rgba(255,255,255,0.04)', color: textColor }}
              >
                {String.fromCharCode(65 + i)}
              </span>

              <span className="text-[14px] flex-1" style={{ color: textColor, textDecoration: isEliminated && !isAnswered ? 'line-through' : 'none' }}>
                {option}
              </span>

              <AnimatePresence>
                {isAnswered && isCorrect && (
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 400 }}>
                    <CheckCircle size={18} className="text-[#6d9476]" />
                  </motion.div>
                )}
                {isAnswered && isSelected && !isCorrect && (
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 400 }}>
                    <XCircle size={18} className="text-[#b85454]" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          );
        })}
      </div>

      {/* Screen-reader result announcement (WCAG 4.1.3) */}
      <div aria-live="polite" className="sr-only">
        {isAnswered
          ? selected === question.correctIndex
            ? 'Correct'
            : `Incorrect. Correct answer: ${question.options[question.correctIndex] ?? ''}`
          : ''}
      </div>

      {/* Explanation */}
      <AnimatePresence>
        {isAnswered && question.explanation && (
          <motion.div
            className="mt-5 p-4 rounded-xl"
            style={{ background: 'rgba(109, 148, 118, 0.06)', border: '1px solid rgba(109, 148, 118, 0.15)' }}
            initial={{ opacity: 0, y: 10, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          >
            <p className="text-[13px] text-text-secondary leading-relaxed">
              <span className="text-[#6d9476] font-semibold">Why? </span>
              {question.explanation}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
