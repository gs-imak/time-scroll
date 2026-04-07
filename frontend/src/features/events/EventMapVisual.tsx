import { useRef, useEffect, useState } from 'react';
import { motion, useInView } from 'framer-motion';

// ── Types ──

interface StatEntry {
  label: string;
  value: string;
  numericValue?: number;
  unit?: string;
  suffix?: string;
}

interface EventVisualConfig {
  type: 'empire' | 'timeline' | 'impact';
  title: string;
  stats: StatEntry[];
}

// ── Visual data for 25 events ──

const EVENT_VISUALS: Record<string, EventVisualConfig> = {
  // ── Empire Extent Cards ──
  'alexander-empire': {
    type: 'empire',
    title: 'Empire of Alexander the Great',
    stats: [
      { label: 'Territory', value: '5.2 million km\u00B2', numericValue: 5.2, unit: 'M km\u00B2' },
      { label: 'Span', value: 'From Greece to India', numericValue: 5000, unit: 'km' },
      { label: 'Conquered in', value: '13 years', numericValue: 13, unit: 'years' },
      { label: 'Battles won', value: 'Every single one', numericValue: 100, unit: '%', suffix: ' win rate' },
    ],
  },
  'persian-empire-cyrus': {
    type: 'empire',
    title: 'The Achaemenid Empire',
    stats: [
      { label: 'World population ruled', value: '44% at its peak', numericValue: 44, unit: '%' },
      { label: 'Territory', value: '5.5 million km\u00B2', numericValue: 5.5, unit: 'M km\u00B2' },
      { label: 'Duration', value: '220 years', numericValue: 220, unit: 'years' },
      { label: 'Satrapies', value: '23 provinces', numericValue: 23, unit: 'provinces' },
    ],
  },
  'genghis-khan': {
    type: 'empire',
    title: 'The Mongol Empire',
    stats: [
      { label: 'Largest contiguous land empire', value: '24 million km\u00B2', numericValue: 24, unit: 'M km\u00B2' },
      { label: 'World population ruled', value: '25% of the world', numericValue: 25, unit: '%' },
      { label: 'Peak extent', value: 'China to Hungary', numericValue: 33, unit: 'M km\u00B2' },
      { label: 'Postal stations', value: '1,400+ relay posts', numericValue: 1400, unit: 'posts' },
    ],
  },
  'founding-rome': {
    type: 'empire',
    title: 'The Roman Empire',
    stats: [
      { label: 'Peak territory', value: '5 million km\u00B2', numericValue: 5, unit: 'M km\u00B2' },
      { label: 'Population at peak', value: '70 million people', numericValue: 70, unit: 'M people' },
      { label: 'Roads built', value: '400,000 km', numericValue: 400000, unit: 'km' },
      { label: 'Duration', value: 'Over 1,000 years', numericValue: 1000, unit: 'years' },
    ],
  },
  'roman-forum': {
    type: 'empire',
    title: 'Rome at Its Height',
    stats: [
      { label: 'Peak territory', value: '5 million km\u00B2', numericValue: 5, unit: 'M km\u00B2' },
      { label: 'Provinces', value: '46 provinces', numericValue: 46, unit: 'provinces' },
      { label: 'Latin speakers', value: '70 million', numericValue: 70, unit: 'million' },
      { label: 'Aqueducts in Rome', value: '11 major systems', numericValue: 11, unit: 'systems' },
    ],
  },
  'maurya-ashoka': {
    type: 'empire',
    title: 'The Maurya Empire',
    stats: [
      { label: 'Territory', value: '5 million km\u00B2', numericValue: 5, unit: 'M km\u00B2' },
      { label: 'Population', value: '50\u201360 million', numericValue: 55, unit: 'M people' },
      { label: 'Edicts erected', value: '33 rock and pillar edicts', numericValue: 33, unit: 'edicts' },
      { label: "Ashoka's reign", value: '37 years of peace', numericValue: 37, unit: 'years' },
    ],
  },

  // ── Timeline Comparison Bars ──
  'great-pyramid': {
    type: 'timeline',
    title: 'The Great Pyramid in Numbers',
    stats: [
      { label: 'Construction time', value: '20 years', numericValue: 20, unit: 'years' },
      { label: 'Tallest structure for', value: '3,800 years', numericValue: 3800, unit: 'years' },
      { label: 'Stone blocks', value: '2.3 million', numericValue: 2300000, unit: 'blocks' },
      { label: 'Original height', value: '146.5 meters', numericValue: 146.5, unit: 'm' },
    ],
  },
  'great-wall-begin': {
    type: 'timeline',
    title: 'The Great Wall of China',
    stats: [
      { label: 'Total length', value: '21,196 km', numericValue: 21196, unit: 'km' },
      { label: 'Half of Earth\u2019s circumference', value: '53% around the globe', numericValue: 53, unit: '%' },
      { label: 'Construction span', value: '2,000+ years', numericValue: 2000, unit: 'years' },
      { label: 'Workers involved', value: 'Millions over centuries', numericValue: 1000000, unit: 'workers' },
    ],
  },
  'colosseum': {
    type: 'timeline',
    title: 'The Roman Colosseum',
    stats: [
      { label: 'Capacity', value: '80,000 spectators', numericValue: 80000, unit: 'seats' },
      { label: 'Opening games', value: '100 days of spectacle', numericValue: 100, unit: 'days' },
      { label: 'Construction time', value: '8 years', numericValue: 8, unit: 'years' },
      { label: 'Height', value: '48 meters (4 stories)', numericValue: 48, unit: 'm' },
    ],
  },
  'hagia-sophia': {
    type: 'timeline',
    title: 'Hagia Sophia',
    stats: [
      { label: 'Construction time', value: '5 years', numericValue: 5, unit: 'years' },
      { label: 'Dome diameter', value: '31 meters', numericValue: 31, unit: 'm' },
      { label: 'Largest cathedral for', value: '1,000 years', numericValue: 1000, unit: 'years' },
      { label: 'Workers', value: '10,000 laborers', numericValue: 10000, unit: 'workers' },
    ],
  },
  'angkor-wat': {
    type: 'timeline',
    title: 'Angkor Wat',
    stats: [
      { label: 'Construction time', value: '37 years', numericValue: 37, unit: 'years' },
      { label: 'Temple area', value: '162.6 hectares', numericValue: 162, unit: 'ha' },
      { label: 'Moat length', value: '5.5 km perimeter', numericValue: 5500, unit: 'm' },
      { label: 'Largest religious structure', value: 'In the world', numericValue: 1, unit: 'st' },
    ],
  },
  'eiffel-tower': {
    type: 'timeline',
    title: 'The Eiffel Tower',
    stats: [
      { label: 'Construction time', value: '2 years, 2 months', numericValue: 26, unit: 'months' },
      { label: 'Height', value: '330 meters', numericValue: 330, unit: 'm' },
      { label: 'Iron pieces', value: '18,038 pieces', numericValue: 18038, unit: 'pieces' },
      { label: 'Rivets', value: '2.5 million', numericValue: 2500000, unit: 'rivets' },
    ],
  },
  'taj-mahal': {
    type: 'timeline',
    title: 'The Taj Mahal',
    stats: [
      { label: 'Construction time', value: '22 years', numericValue: 22, unit: 'years' },
      { label: 'Workers', value: '20,000 artisans', numericValue: 20000, unit: 'workers' },
      { label: 'White marble', value: 'From 200 km away', numericValue: 200, unit: 'km' },
      { label: 'Gemstones', value: '28 types inlaid', numericValue: 28, unit: 'types' },
    ],
  },
  'suez-canal': {
    type: 'timeline',
    title: 'The Suez Canal',
    stats: [
      { label: 'Length', value: '193 km', numericValue: 193, unit: 'km' },
      { label: 'Construction time', value: '10 years', numericValue: 10, unit: 'years' },
      { label: 'Workers', value: '1.5 million total', numericValue: 1500000, unit: 'workers' },
      { label: 'Travel saved', value: '7,000 km shorter route', numericValue: 7000, unit: 'km' },
    ],
  },
  'panama-canal': {
    type: 'timeline',
    title: 'The Panama Canal',
    stats: [
      { label: 'Length', value: '82 km', numericValue: 82, unit: 'km' },
      { label: 'Construction time', value: '10 years', numericValue: 10, unit: 'years' },
      { label: 'Earth excavated', value: '200 million m\u00B3', numericValue: 200, unit: 'M m\u00B3' },
      { label: 'Ships per year', value: '14,000+', numericValue: 14000, unit: 'ships' },
    ],
  },

  // ── Impact Radius Visualizations ──
  'black-death': {
    type: 'impact',
    title: 'The Black Death',
    stats: [
      { label: 'European population killed', value: '30\u201360%', numericValue: 50, unit: '%' },
      { label: 'Deaths in Europe', value: '25 million', numericValue: 25, unit: 'M deaths' },
      { label: 'Years to recover', value: '200+ years', numericValue: 200, unit: 'years' },
      { label: 'Spread speed', value: 'Across Europe in 6 years', numericValue: 6, unit: 'years' },
    ],
  },
  'gutenberg-press': {
    type: 'impact',
    title: 'Gutenberg\u2019s Printing Revolution',
    stats: [
      { label: 'Volumes printed by 1500', value: '20 million', numericValue: 20, unit: 'M volumes' },
      { label: 'Printing presses by 1500', value: '1,000+ across Europe', numericValue: 1000, unit: 'presses' },
      { label: 'Cost reduction', value: '80% cheaper books', numericValue: 80, unit: '%' },
      { label: 'Literacy surge', value: 'Doubled within a century', numericValue: 100, unit: '% increase' },
    ],
  },
  'silk-road': {
    type: 'impact',
    title: 'The Silk Road',
    stats: [
      { label: 'Total length', value: '6,400 km', numericValue: 6400, unit: 'km' },
      { label: 'Active for', value: '1,500 years', numericValue: 1500, unit: 'years' },
      { label: 'Civilizations connected', value: 'Rome to China', numericValue: 40, unit: 'nations' },
      { label: 'Goods traded', value: 'Silk, spices, ideas, faith', numericValue: 100, unit: '+ goods' },
    ],
  },
  'columbus-americas': {
    type: 'impact',
    title: 'Columbus and the Americas',
    stats: [
      { label: 'Voyage distance', value: '6,500 km', numericValue: 6500, unit: 'km' },
      { label: 'Indigenous population decline', value: '90% within a century', numericValue: 90, unit: '%' },
      { label: 'New crops to Europe', value: 'Potato, tomato, maize', numericValue: 30, unit: '+ crops' },
      { label: 'Voyage duration', value: '36 days', numericValue: 36, unit: 'days' },
    ],
  },
  'french-revolution': {
    type: 'impact',
    title: 'The French Revolution',
    stats: [
      { label: 'Duration', value: '10 years', numericValue: 10, unit: 'years' },
      { label: 'Executed during Terror', value: '17,000 officially', numericValue: 17000, unit: 'executed' },
      { label: 'Monarchies abolished', value: 'Inspired revolutions worldwide', numericValue: 20, unit: '+ nations' },
      { label: 'New laws created', value: 'Declaration of Rights', numericValue: 17, unit: 'articles' },
    ],
  },
  'ww1': {
    type: 'impact',
    title: 'World War I',
    stats: [
      { label: 'Military deaths', value: '10 million', numericValue: 10, unit: 'M deaths' },
      { label: 'Civilian deaths', value: '7 million', numericValue: 7, unit: 'M deaths' },
      { label: 'Nations involved', value: '30+ countries', numericValue: 30, unit: 'nations' },
      { label: 'Duration', value: '4 years', numericValue: 4, unit: 'years' },
    ],
  },
  'ww2': {
    type: 'impact',
    title: 'World War II',
    stats: [
      { label: 'Total deaths', value: '70\u201385 million', numericValue: 75, unit: 'M deaths' },
      { label: 'Nations involved', value: '61 countries', numericValue: 61, unit: 'nations' },
      { label: 'Duration', value: '6 years', numericValue: 6, unit: 'years' },
      { label: 'Displaced persons', value: '60 million refugees', numericValue: 60, unit: 'M people' },
    ],
  },
  'moon-landing': {
    type: 'impact',
    title: 'Apollo 11 Moon Landing',
    stats: [
      { label: 'Distance traveled', value: '384,400 km', numericValue: 384400, unit: 'km' },
      { label: 'Mission duration', value: '8 days', numericValue: 8, unit: 'days' },
      { label: 'TV viewers', value: '600 million worldwide', numericValue: 600, unit: 'M viewers' },
      { label: 'Moon samples returned', value: '21.5 kg', numericValue: 21.5, unit: 'kg' },
    ],
  },
  'viking-expansion': {
    type: 'empire',
    title: 'The Viking Expansion',
    stats: [
      { label: 'Range', value: 'Newfoundland to Baghdad', numericValue: 8000, unit: 'km' },
      { label: 'Era of expansion', value: '793\u20131066 CE', numericValue: 273, unit: 'years' },
      { label: 'Settlements founded', value: 'Dublin, Normandy, Kyiv', numericValue: 50, unit: '+ cities' },
      { label: 'Ship speed', value: 'Up to 15 knots', numericValue: 15, unit: 'knots' },
    ],
  },
  'fall-of-constantinople': {
    type: 'impact',
    title: 'Fall of Constantinople',
    stats: [
      { label: 'Siege duration', value: '53 days', numericValue: 53, unit: 'days' },
      { label: 'Ottoman cannons', value: 'The Great Bombard — 8m long', numericValue: 8, unit: 'm' },
      { label: 'Defenders', value: '7,000 vs 80,000', numericValue: 7000, unit: 'defenders' },
      { label: 'Byzantine Empire ended', value: '1,123 years of history', numericValue: 1123, unit: 'years' },
    ],
  },
};

// ── Animated Counter Hook ──

function useAnimatedCounter(target: number, inView: boolean, duration = 1500): number {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const start = 0;
    const startTime = performance.now();
    let rafId: number;

    const tick = (now: number) => {
      const elapsed = now - startTime;
      const t = Math.min(1, elapsed / duration);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - t, 3);
      setCurrent(start + (target - start) * eased);
      if (t < 1) {
        rafId = requestAnimationFrame(tick);
      }
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [inView, target, duration]);

  return current;
}

// ── Format a numeric value for display ──

function formatAnimatedValue(raw: number, numericValue: number): string {
  if (numericValue >= 1000000) {
    return Math.round(raw).toLocaleString();
  }
  if (numericValue >= 1000) {
    return Math.round(raw).toLocaleString();
  }
  if (Number.isInteger(numericValue)) {
    return Math.round(raw).toLocaleString();
  }
  return raw.toFixed(1);
}

// ── Single Stat Card with animated counter ──

function StatCard({ stat, index, type }: { stat: StatEntry; index: number; type: 'empire' | 'timeline' | 'impact' }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });
  const animatedValue = useAnimatedCounter(stat.numericValue ?? 0, inView);

  const hasNumeric = stat.numericValue !== undefined;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
      className="relative overflow-hidden rounded-xl border p-4"
      style={{
        background: 'var(--glass-bg)',
        borderColor: 'rgba(196, 154, 68, 0.12)',
      }}
    >
      {/* Top label */}
      <p
        className="text-[11px] font-medium tracking-wide uppercase mb-2"
        style={{ color: 'rgba(196, 154, 68, 0.7)' }}
      >
        {stat.label}
      </p>

      {/* Animated number */}
      {hasNumeric ? (
        <div className="flex items-baseline gap-1 mb-1">
          <span
            className="text-[24px] sm:text-[28px] font-bold tabular-nums"
            style={{ color: '#c49a44' }}
          >
            {formatAnimatedValue(animatedValue, stat.numericValue!)}
          </span>
          {stat.unit && (
            <span className="text-[12px] font-medium" style={{ color: 'rgba(196, 154, 68, 0.6)' }}>
              {stat.suffix ?? stat.unit}
            </span>
          )}
        </div>
      ) : (
        <p className="text-[16px] font-semibold mb-1" style={{ color: '#c49a44' }}>
          {stat.value}
        </p>
      )}

      {/* Sub value text */}
      <p className="text-[12px] text-[#6a6a7a]">{stat.value}</p>

      {/* Type-specific decoration */}
      {type === 'empire' && (
        <div
          className="absolute top-0 right-0 w-16 h-16 opacity-[0.04]"
          style={{
            background: 'radial-gradient(circle at top right, #c49a44, transparent 70%)',
          }}
        />
      )}
      {type === 'timeline' && (
        <motion.div
          className="absolute bottom-0 left-0 h-[2px]"
          style={{ background: 'rgba(196, 154, 68, 0.3)' }}
          initial={{ width: '0%' }}
          animate={inView ? { width: '100%' } : {}}
          transition={{ duration: 1.2, delay: index * 0.15 + 0.3, ease: [0.16, 1, 0.3, 1] }}
        />
      )}
      {type === 'impact' && (
        <motion.div
          className="absolute bottom-0 left-0 h-[3px] rounded-full"
          style={{ background: '#c49a44' }}
          initial={{ width: '0%' }}
          animate={inView ? { width: `${Math.min((stat.numericValue ?? 50) / 1, 100)}%` } : {}}
          transition={{ duration: 1.4, delay: index * 0.12 + 0.2, ease: [0.16, 1, 0.3, 1] }}
        />
      )}
    </motion.div>
  );
}

// ── Progress Ring for impact-type events ──

function ImpactRing({ value, inView }: { value: number; inView: boolean }) {
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const displayVal = useAnimatedCounter(value, inView, 1800);
  const offset = circumference - (displayVal / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-2">
      <svg width="88" height="88" viewBox="0 0 88 88" className="transform -rotate-90">
        {/* Track */}
        <circle
          cx="44" cy="44" r={radius}
          fill="none"
          stroke="rgba(196, 154, 68, 0.1)"
          strokeWidth="5"
        />
        {/* Filled arc */}
        <motion.circle
          cx="44" cy="44" r={radius}
          fill="none"
          stroke="#c49a44"
          strokeWidth="5"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={inView ? offset : circumference}
          initial={false}
          style={{ transition: 'stroke-dashoffset 1.5s cubic-bezier(0.16, 1, 0.3, 1)' }}
        />
      </svg>
      <span
        className="text-[20px] font-bold tabular-nums absolute"
        style={{ color: '#c49a44', transform: 'translateY(2px)' }}
      >
        {Math.round(displayVal)}%
      </span>
    </div>
  );
}

// ── Section title chip ──

function VisualSectionTitle({ title, type }: { title: string; type: string }) {
  const typeLabels: Record<string, string> = {
    empire: 'Empire Scale',
    timeline: 'By the Numbers',
    impact: 'Global Impact',
  };

  return (
    <div className="flex items-center gap-3 mb-6">
      <div
        className="w-8 h-8 rounded-lg flex items-center justify-center text-[14px]"
        style={{ background: 'rgba(196, 154, 68, 0.12)', color: '#c49a44' }}
      >
        {type === 'empire' ? '\u{1F30D}' : type === 'timeline' ? '\u{1F4CA}' : '\u{26A1}'}
      </div>
      <div>
        <p className="text-[11px] font-semibold tracking-[0.14em] uppercase" style={{ color: '#c49a44' }}>
          {typeLabels[type] ?? 'Data'}
        </p>
        <p className="text-[14px] text-text-secondary font-medium">{title}</p>
      </div>
    </div>
  );
}

// ── Main Component ──

interface EventMapVisualProps {
  eventId: string;
}

export function EventMapVisual({ eventId }: EventMapVisualProps) {
  const config = EVENT_VISUALS[eventId] as EventVisualConfig | undefined;
  const containerRef = useRef<HTMLDivElement>(null);
  const inView = useInView(containerRef, { once: true, margin: '-60px' });

  if (!config) return null;

  const firstStat = config.stats[0];
  const ringValue = firstStat?.numericValue;
  const showRing = config.type === 'impact' && ringValue !== undefined && ringValue <= 100;

  return (
    <motion.section
      ref={containerRef}
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      className="mb-16 rounded-2xl border p-5 sm:p-6"
      style={{
        background: 'var(--glass-bg)',
        borderColor: 'rgba(196, 154, 68, 0.08)',
        backdropFilter: 'blur(24px)',
      }}
    >
      <VisualSectionTitle title={config.title} type={config.type} />

      {/* Impact ring for percentage-based impact events */}
      {showRing && ringValue !== undefined && (
        <div className="flex justify-center relative mb-6">
          <ImpactRing value={ringValue} inView={inView} />
        </div>
      )}

      {/* Stat cards grid */}
      <div className="grid grid-cols-2 gap-3">
        {config.stats.map((stat, i) => (
          <StatCard key={stat.label} stat={stat} index={i} type={config.type} />
        ))}
      </div>

      {/* Bottom flourish line */}
      <motion.div
        className="mt-5 h-[1px] mx-auto rounded-full"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(196, 154, 68, 0.2), transparent)' }}
        initial={{ width: '0%', opacity: 0 }}
        animate={inView ? { width: '80%', opacity: 1 } : {}}
        transition={{ duration: 1.2, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
      />
    </motion.section>
  );
}
