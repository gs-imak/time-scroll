import { useMemo } from 'react';
import { useNavigate } from 'react-router';
import { motion } from 'framer-motion';
import { Clock, BookOpen, ChevronRight } from 'lucide-react';
import { JOURNEYS } from '@/shared/data/journeys';
import { useProgressStore } from '@/shared/stores/progressStore';
import { cn } from '@/shared/utils/cn';
import type { Journey } from '@/shared/data/journeys';

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

const DIFFICULTY_STYLES: Record<Journey['difficulty'], { bg: string; border: string; text: string; label: string }> = {
  beginner: {
    bg: 'rgba(109, 148, 118, 0.12)',
    border: 'rgba(109, 148, 118, 0.25)',
    text: '#6d9476',
    label: 'Beginner',
  },
  intermediate: {
    bg: 'rgba(90, 143, 165, 0.12)',
    border: 'rgba(90, 143, 165, 0.25)',
    text: '#5a8fa5',
    label: 'Intermediate',
  },
  advanced: {
    bg: 'rgba(184, 84, 84, 0.12)',
    border: 'rgba(184, 84, 84, 0.25)',
    text: '#b85454',
    label: 'Advanced',
  },
};

function GlassCard({ children, className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('rounded-[12px] transition-all duration-200', className)}
      style={{
        background: 'rgba(14, 14, 20, 0.6)',
        backdropFilter: 'blur(24px)',
        border: '1px solid rgba(255, 255, 255, 0.06)',
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.03)',
      }}
      {...props}
    >
      {children}
    </div>
  );
}

function JourneyCard({ journey, index }: { journey: Journey; index: number }) {
  const navigate = useNavigate();
  const viewedEvents = useProgressStore(s => s.viewedEvents);

  const viewedInJourney = useMemo(
    () => journey.eventIds.filter(id => viewedEvents.includes(id)).length,
    [journey.eventIds, viewedEvents],
  );

  const progress = journey.eventIds.length > 0 ? viewedInJourney / journey.eventIds.length : 0;
  const diff = DIFFICULTY_STYLES[journey.difficulty];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.15 + index * 0.06, ease: EASE }}
    >
      <GlassCard
        className={cn(
          'group relative overflow-hidden cursor-pointer',
          'hover:border-white/[0.14] hover:translate-y-[-2px]',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-gold/50',
          'focus-visible:ring-offset-2 focus-visible:ring-offset-void',
          'active:scale-[0.97]',
        )}
        onClick={() => navigate(`/journeys/${journey.id}`)}
        role="button"
        tabIndex={0}
        onKeyDown={e => e.key === 'Enter' && navigate(`/journeys/${journey.id}`)}
        aria-label={`${journey.title} \u2014 ${journey.eventIds.length} events, ${journey.estimatedMinutes} minutes`}
      >
        {progress > 0 && (
          <div
            className="absolute top-0 left-0 h-[3px]"
            style={{
              width: `${progress * 100}%`,
              background: 'linear-gradient(90deg, #c49a44, #a07830)',
            }}
          />
        )}

        <div className="px-5 py-4">
          <div className="flex items-start gap-4">
            <div
              className="flex-shrink-0 flex items-center justify-center rounded-[12px]"
              style={{
                width: '52px',
                height: '52px',
                fontSize: '24px',
                background: 'rgba(196, 154, 68, 0.08)',
                border: '1px solid rgba(196, 154, 68, 0.12)',
              }}
            >
              {journey.icon}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3
                  className="text-text-primary group-hover:text-[#c49a44] transition-colors truncate"
                  style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '16px', fontWeight: 600 }}
                >
                  {journey.title}
                </h3>
                <ChevronRight
                  size={16}
                  className="flex-shrink-0 text-text-muted group-hover:text-[#c49a44] transition-colors group-hover:translate-x-0.5 transition-transform"
                  style={{ transition: 'color 200ms, transform 200ms' }}
                />
              </div>

              <p
                className="line-clamp-2 mb-3"
                style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '13px', color: '#8a8a9a', lineHeight: 1.5 }}
              >
                {journey.description}
              </p>

              <div className="flex items-center flex-wrap gap-2">
                <span
                  className="inline-flex items-center rounded-full px-2.5 py-0.5"
                  style={{
                    background: diff.bg,
                    border: `1px solid ${diff.border}`,
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: '11px',
                    fontWeight: 500,
                    color: diff.text,
                  }}
                >
                  {diff.label}
                </span>

                <span
                  className="inline-flex items-center gap-1"
                  style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '11px', color: '#55556a' }}
                >
                  <BookOpen size={12} />
                  {journey.eventIds.length} events
                </span>

                <span
                  className="inline-flex items-center gap-1"
                  style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '11px', color: '#55556a' }}
                >
                  <Clock size={12} />
                  {journey.estimatedMinutes} min
                </span>

                {viewedInJourney > 0 && (
                  <span
                    className="inline-flex items-center gap-1 ml-auto"
                    style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '11px', color: '#c49a44' }}
                  >
                    {viewedInJourney}/{journey.eventIds.length} viewed
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </GlassCard>
    </motion.div>
  );
}

export default function JourneyBrowser() {
  return (
    <div
      className="min-h-screen w-full overflow-x-hidden overflow-y-auto lg:pl-[64px]"
      style={{
        background: 'radial-gradient(ellipse 80% 50% at 50% 20%, #14141e 0%, #0c0c12 30%, #08080c 60%, #050508 100%)',
      }}
    >
      <div className="w-full max-w-[1100px] mx-auto px-6 md:px-10 py-12 md:py-16">
        <motion.header
          className="mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease: EASE }}
        >
          <h1
            className="text-text-primary leading-tight"
            style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 'clamp(24px, 4vw, 32px)', fontWeight: 700 }}
          >
            Guided Journeys
          </h1>
          <p
            style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '13px', color: '#55556a', marginTop: '4px' }}
          >
            Curated paths through history, connecting events into narrative arcs
          </p>
        </motion.header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {JOURNEYS.map((journey, i) => (
            <JourneyCard key={journey.id} journey={journey} index={i} />
          ))}
        </div>
      </div>
    </div>
  );
}
