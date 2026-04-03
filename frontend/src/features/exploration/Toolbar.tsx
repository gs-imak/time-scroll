import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Compass, List, MapPin, Home } from 'lucide-react';
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
          'flex items-center justify-center w-11 h-11 rounded-xl',
          'transition-all duration-200 cursor-pointer',
          active
            ? 'bg-accent-cyan/20 text-accent-cyan shadow-[0_0_12px_rgba(0,212,255,0.2)]'
            : 'text-text-secondary hover:text-text-primary hover:bg-elevated/60'
        )}
        aria-label={label}
      >
        <Icon size={20} />
      </button>

      {hovered && (
        <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 pointer-events-none z-50">
          <div className="glass-strong rounded-lg px-3 py-1.5 text-xs font-medium text-text-primary whitespace-nowrap shadow-lg">
            {label}
          </div>
        </div>
      )}
    </div>
  );
}

export function Toolbar() {
  const navigate = useNavigate();
  const activePanel = useUIStore(s => s.activePanel);
  const togglePanel = useUIStore(s => s.togglePanel);
  const { resetView } = useGlobeCamera();

  return (
    <motion.div
      className="absolute top-5 left-5 z-30 flex flex-col gap-3"
      initial={{ x: -60, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ delay: 0.4, type: 'spring', stiffness: 200, damping: 25 }}
    >
      {/* Home button */}
      <div className="glass-strong rounded-xl p-1.5">
        <ToolButton
          icon={Home}
          label="Back to home"
          onClick={() => navigate('/')}
        />
      </div>

      {/* Navigation tools */}
      <div className="glass-strong rounded-xl p-1.5 flex flex-col gap-1">
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
        <div className="h-px bg-border-subtle mx-2 my-0.5" />
        <ToolButton
          icon={Compass}
          label="Reset view"
          onClick={resetView}
        />
      </div>
    </motion.div>
  );
}
