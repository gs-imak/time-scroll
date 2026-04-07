import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle } from 'lucide-react';
import { getIllustrationUrl } from '@/shared/data/illustrationPlacements';
import type { ImageIdQuestion } from '../types';

interface Props {
  question: ImageIdQuestion;
  selected: number | null;
  isAnswered: boolean;
  eliminatedOptions: number[];
  onSelect: (index: number) => void;
}

export function ImageIdCard({ question, selected, isAnswered, eliminatedOptions, onSelect }: Props) {
  return (
    <div>
      <p className="text-[15px] text-text-secondary mb-4 text-center">{question.question}</p>

      {/* Image display */}
      <div className="mx-auto mb-6 max-w-[400px] rounded-xl overflow-hidden bg-[#0a0a12]">
        <img
          src={getIllustrationUrl(question.imageSlug, question.imageNum)}
          alt=""
          className="w-full h-auto object-contain max-h-[280px]"
          loading="eager"
          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
        />
      </div>

      {/* Options */}
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
              className="w-full flex items-center gap-3 p-4 rounded-xl text-left cursor-pointer disabled:cursor-default transition-all"
              style={{ background: bg, border: `1px solid ${border}`, opacity: isEliminated && !isAnswered ? 0.3 : 1 }}
              whileHover={!isAnswered && !isEliminated ? { scale: 1.01 } : {}}
              whileTap={!isAnswered && !isEliminated ? { scale: 0.99 } : {}}
            >
              <span className="w-7 h-7 rounded-lg flex items-center justify-center text-[11px] font-semibold shrink-0"
                style={{ background: 'rgba(255,255,255,0.04)', color: textColor }}>
                {String.fromCharCode(65 + i)}
              </span>
              <span className="text-[14px] flex-1" style={{ color: textColor }}>{option}</span>
              <AnimatePresence>
                {isAnswered && isCorrect && (
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}><CheckCircle size={18} className="text-[#6d9476]" /></motion.div>
                )}
                {isAnswered && isSelected && !isCorrect && (
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}><XCircle size={18} className="text-[#b85454]" /></motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          );
        })}
      </div>

      <AnimatePresence>
        {isAnswered && question.explanation && (
          <motion.div
            className="mt-5 p-4 rounded-xl"
            style={{ background: 'rgba(109, 148, 118, 0.06)', border: '1px solid rgba(109, 148, 118, 0.15)' }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
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
