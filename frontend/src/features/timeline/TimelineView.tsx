import { useMemo } from 'react';
import { useNavigate } from 'react-router';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { useEventsStore } from '@/shared/stores/eventsStore';
import { useProgressStore } from '@/shared/stores/progressStore';
import { ERAS } from '@/shared/utils/constants';
import { EVENT_ICONS } from '@/features/globe/eventMarkers';

const ERA_HEX: Record<string, string> = {
  prehistory: '#8d7b68', ancient: '#c49a44', classical: '#b85454',
  medieval: '#8b6faa', renaissance: '#5a7fb5', industrial: '#7a9e5a', modern: '#5a9aaa',
};

const CAT_HEX: Record<string, string> = {
  war: '#b85454', discovery: '#5a8fa5', cultural: '#c49a44',
  political: '#8b80b0', construction: '#6d9476', natural: '#b87a60',
};

function formatYear(y: number) {
  return y < 0 ? `${Math.abs(y)} BCE` : `${y} CE`;
}

function EraDivider({ name, startYear, endYear, eraId }: {
  name: string; startYear: number; endYear: number; eraId: string;
}) {
  const color = ERA_HEX[eraId] ?? '#5a9aaa';
  return (
    <motion.div
      className="relative flex items-center gap-4 py-8 md:py-10"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex-1 h-px" style={{ background: color, opacity: 0.4 }} />
      <div className="flex flex-col items-center gap-1 px-4 shrink-0">
        <span
          style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: '18px', fontWeight: 600, color, letterSpacing: '0.025em',
          }}
        >
          {name}
        </span>
        <span
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: '11px', color: '#55556a',
          }}
        >
          {formatYear(startYear)} &mdash; {formatYear(endYear)}
        </span>
      </div>
      <div className="flex-1 h-px" style={{ background: color, opacity: 0.4 }} />
    </motion.div>
  );
}

function EventCard({ id, title, year, category, icon, viewed, side, index }: {
  id: string; title: string; year: number; category: string;
  icon: string; viewed: boolean; side: 'left' | 'right'; index: number;
}) {
  const navigate = useNavigate();
  const color = CAT_HEX[category] ?? '#8a8a9a';

  return (
    <motion.div
      className={`
        flex items-center w-full
        md:w-[calc(50%-20px)]
        ${side === 'left' ? 'md:mr-auto md:flex-row' : 'md:ml-auto md:flex-row-reverse'}
      `}
      initial={{ opacity: 0, x: side === 'left' ? -24 : 24, y: 8 }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.45, delay: (index % 6) * 0.06, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Connector line (desktop only) */}
      <div
        className="hidden md:block w-5 h-px shrink-0"
        style={{ background: 'rgba(255,255,255,0.06)' }}
      />

      {/* Card */}
      <motion.button
        onClick={() => navigate(`/explore/${year}/${id}`)}
        className={`
          group relative flex items-center gap-3 w-full
          rounded-[12px] px-4 py-3 text-left cursor-pointer
          transition-all duration-200
          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c49a44]/50
          focus-visible:ring-offset-2 focus-visible:ring-offset-[#08080c]
        `}
        style={{
          background: 'rgba(14, 14, 20, 0.6)',
          backdropFilter: 'blur(24px)',
          border: '1px solid rgba(255, 255, 255, 0.06)',
          opacity: viewed ? 1 : 0.55,
        }}
        whileHover={{
          scale: 1.03,
          borderColor: `${color}55`,
          boxShadow: `0 0 20px ${color}18`,
        }}
        whileTap={{ scale: 0.97 }}
      >
        {/* Icon */}
        <span
          className="shrink-0 flex items-center justify-center rounded-[8px]"
          style={{
            width: '36px', height: '36px', fontSize: '18px',
            background: `${color}15`, border: `1px solid ${color}25`,
          }}
          aria-hidden="true"
        >
          {icon}
        </span>

        {/* Text */}
        <div className="flex-1 min-w-0">
          <span
            className="block truncate group-hover:text-[#e0e0e6] transition-colors"
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: '14px', fontWeight: 500, color: '#e0e0e6',
            }}
          >
            {title}
          </span>
          <span
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: '11px', color: '#55556a',
            }}
          >
            {formatYear(year)}
          </span>
        </div>

        {/* Category dot */}
        <span
          className="shrink-0 w-2 h-2 rounded-full"
          style={{ background: color, boxShadow: `0 0 6px ${color}50` }}
          title={category}
        />
      </motion.button>
    </motion.div>
  );
}

export default function TimelineView() {
  const navigate = useNavigate();
  const events = useEventsStore(s => s.events);
  const viewedEvents = useProgressStore(s => s.viewedEvents);

  const sortedEvents = useMemo(
    () => [...events].sort((a, b) => a.year - b.year),
    [events],
  );

  const grouped = useMemo(() => {
    const sections: {
      era: typeof ERAS[number];
      events: typeof sortedEvents;
    }[] = [];

    for (const era of ERAS) {
      const eraEvents = sortedEvents.filter(e => e.eraId === era.id);
      if (eraEvents.length > 0) sections.push({ era, events: eraEvents });
    }
    return sections;
  }, [sortedEvents]);

  const viewedCount = viewedEvents.length;
  const totalCount = events.length;

  return (
    <div
      className="min-h-screen w-full overflow-x-hidden"
      style={{ background: '#08080c' }}
    >
      <div className="w-full max-w-[900px] mx-auto px-4 md:px-8 py-12 md:py-16">

        {/* Header */}
        <motion.header
          className="flex items-center gap-4 mb-8"
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          <motion.button
            onClick={() => navigate('/dashboard')}
            className="flex items-center justify-center w-[44px] h-[44px] rounded-[10px] cursor-pointer shrink-0"
            style={{
              background: 'rgba(14, 14, 20, 0.6)',
              backdropFilter: 'blur(24px)',
              border: '1px solid rgba(255, 255, 255, 0.06)',
            }}
            whileHover={{ scale: 1.08, borderColor: 'rgba(196, 154, 68, 0.3)' }}
            whileTap={{ scale: 0.93 }}
            aria-label="Back to dashboard"
          >
            <ArrowLeft size={20} style={{ color: '#8a8a9a' }} />
          </motion.button>

          <div className="flex-1">
            <h1
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: 'clamp(24px, 4vw, 32px)', fontWeight: 700,
                color: '#e0e0e6', lineHeight: 1.1,
              }}
            >
              Timeline
            </h1>
            <p style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: '12px', color: '#55556a', marginTop: '4px',
            }}>
              {viewedCount} of {totalCount} events explored
            </p>
          </div>
        </motion.header>

        {/* Timeline body */}
        <div className="relative">
          {/* Center axis line (desktop) */}
          <div
            className="hidden md:block absolute left-1/2 top-0 bottom-0 w-px -translate-x-1/2"
            style={{ background: 'rgba(255,255,255,0.06)' }}
            aria-hidden="true"
          />

          {/* Left edge line (mobile) */}
          <div
            className="md:hidden absolute left-2 top-0 bottom-0 w-px"
            style={{ background: 'rgba(255,255,255,0.06)' }}
            aria-hidden="true"
          />

          {grouped.map(({ era, events: eraEvents }) => (
            <section key={era.id} aria-label={`${era.name} era`}>
              <EraDivider
                name={era.name}
                startYear={era.startYear}
                endYear={era.endYear}
                eraId={era.id}
              />

              <div className="flex flex-col gap-3 pl-6 md:pl-0">
                {eraEvents.map((event, i) => (
                  <EventCard
                    key={event.id}
                    id={event.id}
                    title={event.title}
                    year={event.year}
                    category={event.category}
                    icon={EVENT_ICONS[event.id] ?? '●'}
                    viewed={viewedEvents.includes(event.id)}
                    side={i % 2 === 0 ? 'left' : 'right'}
                    index={i}
                  />
                ))}
              </div>
            </section>
          ))}

          {/* Timeline terminus */}
          <motion.div
            className="flex justify-center py-12"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div
              className="w-3 h-3 rounded-full"
              style={{
                background: '#c49a44',
                boxShadow: '0 0 16px rgba(196, 154, 68, 0.35)',
              }}
            />
          </motion.div>
        </div>
      </div>
    </div>
  );
}
