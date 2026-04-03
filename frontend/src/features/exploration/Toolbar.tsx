import { useState } from 'react';
import { Compass, List, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';
import { useUIStore } from '@/shared/stores/uiStore';
import { useGlobeCamera } from '@/features/globe/useGlobeCamera';
import { cn } from '@/shared/utils/cn';
import type { LucideIcon } from 'lucide-react';

interface ToolButtonProps {
  icon: LucideIcon;
  label: string;
  active?: boolean;
  onClick: () => void;
}

function ToolButton({ icon: Icon, label, active, onClick }: ToolButtonProps) {
  const [hovered, setHovered] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={onClick}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className={cn(
          'flex items-center justify-center w-10 h-10 rounded-[var(--radius-md)]',
          'transition-all duration-200 cursor-pointer',
          active
            ? 'bg-accent-cyan/20 text-accent-cyan shadow-[0_0_12px_rgba(0,212,255,0.15)]'
            : 'text-text-secondary hover:text-text-primary hover:bg-elevated/60'
        )}
        aria-label={label}
      >
        <Icon size={18} />
      </button>

      {/* Tooltip */}
      {hovered && (
        <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 pointer-events-none z-50">
          <div className="glass-light rounded-md px-2.5 py-1 text-xs font-medium text-text-primary whitespace-nowrap">
            {label}
          </div>
        </div>
      )}
    </div>
  );
}

export function Toolbar() {
  const activePanel = useUIStore(s => s.activePanel);
  const togglePanel = useUIStore(s => s.togglePanel);
  const { resetView } = useGlobeCamera();

  return (
    <motion.div
      className="absolute top-4 left-4 z-30 flex flex-col gap-2"
      initial={{ x: -60, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ delay: 0.4, type: 'spring', stiffness: 200, damping: 25 }}
    >
      <div className="glass rounded-[var(--radius-lg)] p-1.5 flex flex-col gap-1">
        <ToolButton
          icon={MapPin}
          label="Explore locations"
          active={activePanel === 'exploration'}
          onClick={() => togglePanel('exploration')}
        />
        <ToolButton
          icon={List}
          label="Historical events"
          active={activePanel === 'events'}
          onClick={() => togglePanel('events')}
        />
        <div className="h-px bg-border-subtle mx-1" />
        <ToolButton
          icon={Compass}
          label="Reset view"
          onClick={resetView}
        />
      </div>
    </motion.div>
  );
}
