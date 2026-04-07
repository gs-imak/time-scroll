import { motion, AnimatePresence } from 'framer-motion';
import { Flame } from 'lucide-react';

export function StreakCounter({ streak }: { streak: number }) {
  return (
    <AnimatePresence>
      {streak > 0 && (
        <motion.div
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
          style={{ background: 'rgba(196, 154, 68, 0.12)', border: '1px solid rgba(196, 154, 68, 0.2)' }}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          key={streak}
        >
          <motion.div
            animate={{ scale: [1, 1.3, 1] }}
            transition={{ duration: 0.3 }}
          >
            <Flame size={14} className="text-[#c49a44]" />
          </motion.div>
          <span className="text-[12px] font-semibold text-[#c49a44]">{streak}</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
