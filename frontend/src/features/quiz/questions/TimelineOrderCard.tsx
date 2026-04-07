import { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUp, ArrowDown, Check } from 'lucide-react';
import type { TimelineOrderQuestion } from '../types';

interface Props {
  question: TimelineOrderQuestion;
  isAnswered: boolean;
  onSubmit: (order: number[]) => void;
}

export function TimelineOrderCard({ question, isAnswered, onSubmit }: Props) {
  // Shuffled indices as initial order
  const initialOrder = useMemo(() => {
    const indices = question.items.map((_, i) => i);
    // Fisher-Yates shuffle
    for (let i = indices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const a = indices[i]!;
      const b = indices[j]!;
      indices[i] = b;
      indices[j] = a;
    }
    return indices;
  }, [question]);

  const [order, setOrder] = useState(initialOrder);

  const correctOrder = useMemo(() => {
    return [...question.items]
      .map((item, i) => ({ item, origIdx: i }))
      .sort((a, b) => a.item.year - b.item.year)
      .map(x => x.origIdx);
  }, [question]);

  const moveUp = useCallback((pos: number) => {
    if (pos === 0 || isAnswered) return;
    setOrder(prev => {
      const next = [...prev];
      const a = next[pos - 1]!;
      const b = next[pos]!;
      next[pos - 1] = b;
      next[pos] = a;
      return next;
    });
  }, [isAnswered]);

  const moveDown = useCallback((pos: number) => {
    if (pos === order.length - 1 || isAnswered) return;
    setOrder(prev => {
      const next = [...prev];
      const a = next[pos]!;
      const b = next[pos + 1]!;
      next[pos] = b;
      next[pos + 1] = a;
      return next;
    });
  }, [order.length, isAnswered]);

  const handleSubmit = useCallback(() => {
    onSubmit(order);
  }, [order, onSubmit]);

  return (
    <div>
      <p className="text-[17px] sm:text-[18px] font-medium text-text-primary mb-2 leading-relaxed text-center">
        {question.instruction}
      </p>
      <p className="text-[12px] text-text-muted mb-6 text-center">
        Arrange from earliest to latest
      </p>

      <div className="space-y-2 max-w-[500px] mx-auto">
        {order.map((itemIdx, pos) => {
          const item = question.items[itemIdx];
          const isCorrectPos = isAnswered && correctOrder[pos] === itemIdx;
          const isWrongPos = isAnswered && correctOrder[pos] !== itemIdx;

          let bg = 'rgba(255,255,255,0.02)';
          let border = 'rgba(255,255,255,0.06)';
          let textColor = '#8a8a9a';

          if (isCorrectPos) {
            bg = 'rgba(109, 148, 118, 0.12)';
            border = 'rgba(109, 148, 118, 0.3)';
            textColor = '#6d9476';
          } else if (isWrongPos) {
            bg = 'rgba(184, 84, 84, 0.1)';
            border = 'rgba(184, 84, 84, 0.25)';
            textColor = '#b85454';
          }

          return (
            <motion.div
              key={itemIdx}
              className="flex items-center gap-3 p-4 rounded-xl"
              style={{ background: bg, border: `1px solid ${border}` }}
              layout
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            >
              {/* Position number */}
              <span className="w-7 h-7 rounded-lg flex items-center justify-center text-[11px] font-semibold shrink-0"
                style={{ background: 'rgba(255,255,255,0.04)', color: textColor }}>
                {pos + 1}
              </span>

              <span className="text-[14px] flex-1" style={{ color: textColor }}>
                {item?.label}
              </span>

              {/* Year shown after answering */}
              {isAnswered && (
                <span className="text-[11px] font-mono" style={{ color: textColor }}>
                  {item && item.year < 0 ? `${Math.abs(item.year)} BCE` : `${item?.year} CE`}
                </span>
              )}

              {/* Move buttons */}
              {!isAnswered && (
                <div className="flex flex-col gap-0.5">
                  <button
                    onClick={() => moveUp(pos)}
                    disabled={pos === 0}
                    className="w-6 h-6 rounded flex items-center justify-center cursor-pointer disabled:opacity-20 disabled:cursor-default hover:bg-white/[0.06] transition-colors"
                  >
                    <ArrowUp size={12} className="text-text-muted" />
                  </button>
                  <button
                    onClick={() => moveDown(pos)}
                    disabled={pos === order.length - 1}
                    className="w-6 h-6 rounded flex items-center justify-center cursor-pointer disabled:opacity-20 disabled:cursor-default hover:bg-white/[0.06] transition-colors"
                  >
                    <ArrowDown size={12} className="text-text-muted" />
                  </button>
                </div>
              )}

              {isCorrectPos && (
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                  <Check size={16} className="text-[#6d9476]" />
                </motion.div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Submit button (only for timeline - needs explicit submit since no single answer click) */}
      {!isAnswered && (
        <div className="mt-5 flex justify-center">
          <motion.button
            onClick={handleSubmit}
            className="px-6 py-3 rounded-xl text-[13px] font-semibold cursor-pointer"
            style={{ background: 'rgba(196, 154, 68, 0.15)', color: '#c49a44', border: '1px solid rgba(196, 154, 68, 0.3)' }}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            <Check size={14} className="inline mr-2" />
            Lock In Order
          </motion.button>
        </div>
      )}

      <AnimatePresence>
        {isAnswered && question.explanation && (
          <motion.div
            className="mt-5 p-4 rounded-xl"
            style={{ background: 'rgba(109, 148, 118, 0.06)', border: '1px solid rgba(109, 148, 118, 0.15)' }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <p className="text-[13px] text-text-secondary leading-relaxed">
              <span className="text-[#6d9476] font-semibold">The correct order: </span>
              {correctOrder.map((idx, i) => {
                const item = question.items[idx];
                return `${i + 1}. ${item?.label} (${item && item.year < 0 ? `${Math.abs(item.year)} BCE` : `${item?.year} CE`})`;
              }).join(' → ')}
              {question.explanation && `. ${question.explanation}`}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
