import { motion } from 'framer-motion';
import { ERAS } from '@/shared/utils/constants';
import type { EventCategory } from '@/shared/types/events';

const ERA_COLORS: Record<string, string> = {
  prehistory: '#8b6d47', ancient: '#c49a44', classical: '#6d9476',
  medieval: '#b85454', renaissance: '#5a8fa5', industrial: '#8b80b0',
  modern: '#b87a60',
};

const CATEGORY_CONFIG: { id: EventCategory; label: string; color: string }[] = [
  { id: 'war', label: 'War', color: '#b85454' },
  { id: 'discovery', label: 'Discovery', color: '#5a8fa5' },
  { id: 'cultural', label: 'Cultural', color: '#c49a44' },
  { id: 'political', label: 'Political', color: '#8b80b0' },
  { id: 'construction', label: 'Construction', color: '#6d9476' },
  { id: 'natural', label: 'Natural', color: '#b87a60' },
];

interface Props {
  selectedEras: string[];
  selectedCategories: EventCategory[];
  onToggleEra: (era: string) => void;
  onToggleCategory: (cat: EventCategory) => void;
}

/** 44px-tall invisible ::after hit area so slim filter pills meet the
    design-system 44px minimum touch target while staying visually compact. */
const PILL_HIT_AREA =
  "relative after:absolute after:inset-x-0 after:top-1/2 after:h-11 after:-translate-y-1/2 after:content-['']";

function Pill({ label, color, active, onClick }: { label: string; color: string; active: boolean; onClick: () => void }) {
  return (
    <motion.button
      onClick={onClick}
      aria-pressed={active}
      className={`px-3 py-1.5 rounded-full text-[11px] font-medium cursor-pointer transition-all ${PILL_HIT_AREA}`}
      style={{
        background: active ? `${color}20` : 'rgba(255,255,255,0.03)',
        border: `1px solid ${active ? `${color}40` : 'rgba(255,255,255,0.06)'}`,
        // Muted token, NOT #55556a — that hex is the failed-contrast value
        // tokens.css explicitly rejects.
        color: active ? color : 'var(--color-text-muted)',
      }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      {label}
    </motion.button>
  );
}

export function QuizFilters({ selectedEras, selectedCategories, onToggleEra, onToggleCategory }: Props) {
  return (
    <div className="space-y-4">
      {/* Era filters */}
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-wider text-text-muted mb-2">Era</p>
        <div className="flex flex-wrap gap-2">
          {ERAS.map(era => (
            <Pill
              key={era.id}
              label={era.name}
              color={ERA_COLORS[era.id] ?? '#8a8a9a'}
              active={selectedEras.includes(era.id)}
              onClick={() => onToggleEra(era.id)}
            />
          ))}
        </div>
      </div>
      {/* Category filters */}
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-wider text-text-muted mb-2">Category</p>
        <div className="flex flex-wrap gap-2">
          {CATEGORY_CONFIG.map(cat => (
            <Pill
              key={cat.id}
              label={cat.label}
              color={cat.color}
              active={selectedCategories.includes(cat.id)}
              onClick={() => onToggleCategory(cat.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
