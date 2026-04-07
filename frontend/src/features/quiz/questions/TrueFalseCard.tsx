import { motion, AnimatePresence } from 'framer-motion';
import { Check, X } from 'lucide-react';
import type { TrueFalseQuestion } from '../types';

interface Props {
  question: TrueFalseQuestion;
  selected: boolean | null;
  isAnswered: boolean;
  onSelect: (value: boolean) => void;
}

export function TrueFalseCard({ question, selected, isAnswered, onSelect }: Props) {
  const buttons: { value: boolean; label: string; icon: typeof Check; color: string }[] = [
    { value: true, label: 'True', icon: Check, color: '#6d9476' },
    { value: false, label: 'False', icon: X, color: '#b85454' },
  ];

  return (
    <div>
      <p className="text-[17px] sm:text-[18px] font-medium text-text-primary mb-8 leading-relaxed text-center">
        "{question.statement}"
      </p>

      <div className="grid grid-cols-2 gap-4 max-w-[400px] mx-auto">
        {buttons.map(({ value, label, icon: Icon, color }) => {
          const isSelected = selected === value;
          const isCorrectAnswer = question.isTrue === value;

          let bg = 'rgba(255,255,255,0.02)';
          let border = 'rgba(255,255,255,0.06)';
          let textColor = '#8a8a9a';

          if (isAnswered) {
            if (isCorrectAnswer) {
              bg = 'rgba(109, 148, 118, 0.12)';
              border = 'rgba(109, 148, 118, 0.3)';
              textColor = '#6d9476';
            } else if (isSelected && !isCorrectAnswer) {
              bg = 'rgba(184, 84, 84, 0.1)';
              border = 'rgba(184, 84, 84, 0.25)';
              textColor = '#b85454';
            }
          } else if (isSelected) {
            bg = `${color}15`;
            border = `${color}40`;
            textColor = color;
          }

          return (
            <motion.button
              key={label}
              onClick={() => onSelect(value)}
              disabled={isAnswered}
              className="flex flex-col items-center gap-3 p-6 rounded-xl cursor-pointer disabled:cursor-default transition-all"
              style={{ background: bg, border: `1px solid ${border}` }}
              whileHover={!isAnswered ? { scale: 1.03 } : {}}
              whileTap={!isAnswered ? { scale: 0.97 } : {}}
            >
              <Icon size={28} style={{ color: textColor }} />
              <span className="text-[15px] font-semibold" style={{ color: textColor }}>{label}</span>
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
