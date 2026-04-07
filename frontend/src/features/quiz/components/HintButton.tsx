import { motion } from 'framer-motion';
import { Lightbulb } from 'lucide-react';

interface Props {
  onUseHint: () => void;
  disabled: boolean;
  active: boolean;
}

export function HintButton({ onUseHint, disabled, active }: Props) {
  return (
    <motion.button
      onClick={onUseHint}
      disabled={disabled}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-medium cursor-pointer disabled:cursor-not-allowed disabled:opacity-30 transition-all"
      style={{
        background: active ? 'rgba(196, 154, 68, 0.15)' : 'rgba(255,255,255,0.04)',
        border: `1px solid ${active ? 'rgba(196, 154, 68, 0.3)' : 'rgba(255,255,255,0.08)'}`,
        color: active ? '#c49a44' : '#55556a',
      }}
      whileHover={!disabled ? { scale: 1.05 } : {}}
      whileTap={!disabled ? { scale: 0.95 } : {}}
    >
      <Lightbulb size={12} />
      {active ? 'Hint active' : 'Use hint (-50%)'}
    </motion.button>
  );
}
