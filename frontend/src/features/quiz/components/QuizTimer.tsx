import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Clock } from 'lucide-react';

interface Props {
  duration: number; // seconds
  isRunning: boolean;
  onExpire: () => void;
}

export function QuizTimer({ duration, isRunning, onExpire }: Props) {
  const [remaining, setRemaining] = useState(duration);
  const expiredRef = useRef(false);

  useEffect(() => {
    setRemaining(duration);
    expiredRef.current = false;
  }, [duration]);

  useEffect(() => {
    if (!isRunning) return;
    const interval = setInterval(() => {
      setRemaining(prev => {
        const next = prev - 0.1;
        if (next <= 0 && !expiredRef.current) {
          expiredRef.current = true;
          onExpire();
          return 0;
        }
        return Math.max(0, next);
      });
    }, 100);
    return () => clearInterval(interval);
  }, [isRunning, onExpire]);

  const pct = (remaining / duration) * 100;
  const isLow = remaining < 10;
  const color = isLow ? '#b85454' : remaining < 20 ? '#c49a44' : '#6d9476';

  return (
    <motion.div
      className="flex items-center gap-2 px-3 py-1.5 rounded-full"
      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
      animate={isLow ? { scale: [1, 1.05, 1] } : {}}
      transition={isLow ? { repeat: Infinity, duration: 0.5 } : {}}
    >
      <Clock size={12} style={{ color }} />
      <span className="text-[12px] font-mono font-semibold" style={{ color }}>
        {Math.ceil(remaining)}s
      </span>
      <div className="w-16 h-1 rounded-full bg-white/[0.06] overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ background: color }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.1 }}
        />
      </div>
    </motion.div>
  );
}
