import { Compass, List, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';
import { IconButton } from '@/shared/components';
import { useUIStore } from '@/shared/stores/uiStore';
import { useGlobeCamera } from '@/features/globe/useGlobeCamera';
import { cn } from '@/shared/utils/cn';

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
      <div className="glass rounded-[var(--radius-lg)] p-1 flex flex-col gap-1">
        <IconButton
          icon={MapPin}
          onClick={() => togglePanel('exploration')}
          className={cn(activePanel === 'exploration' && 'bg-accent-cyan/20 text-accent-cyan')}
          aria-label="Explore locations"
        />
        <IconButton
          icon={List}
          onClick={() => togglePanel('events')}
          className={cn(activePanel === 'events' && 'bg-accent-cyan/20 text-accent-cyan')}
          aria-label="Event list"
        />
        <IconButton
          icon={Compass}
          onClick={resetView}
          aria-label="Reset view"
        />
      </div>
    </motion.div>
  );
}
