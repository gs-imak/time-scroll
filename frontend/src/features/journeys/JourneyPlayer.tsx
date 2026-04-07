import { useState, useCallback, useMemo, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { motion, AnimatePresence, type Variants } from 'framer-motion';
import { ArrowLeft, ArrowRight, X, Check, Clock, BookOpen } from 'lucide-react';
import { JOURNEYS } from '@/shared/data/journeys';
import { useEventsStore } from '@/shared/stores/eventsStore';
import { useProgressStore } from '@/shared/stores/progressStore';
import { cn } from '@/shared/utils/cn';

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

function formatYear(y: number) {
  return y < 0 ? `${Math.abs(y)} BCE` : `${y} CE`;
}

const CATEGORY_COLORS: Record<string, string> = {
  war: '#b85454',
  discovery: '#5a8fa5',
  cultural: '#c49a44',
  political: '#8b80b0',
  construction: '#6d9476',
  natural: '#b87a60',
};

type StepType = 'event' | 'transition';

interface Step {
  type: StepType;
  index: number;
}

export default function JourneyPlayer() {
  const { journeyId } = useParams<{ journeyId: string }>();
  const navigate = useNavigate();
  const events = useEventsStore(s => s.events);
  const markEventViewed = useProgressStore(s => s.markEventViewed);
  const viewedEvents = useProgressStore(s => s.viewedEvents);

  const journey = useMemo(
    () => JOURNEYS.find(j => j.id === journeyId),
    [journeyId],
  );

  const journeyEvents = useMemo(() => {
    if (!journey) return [];
    return journey.eventIds
      .map(id => events.find(e => e.id === id))
      .filter(Boolean) as typeof events;
  }, [journey, events]);

  const steps = useMemo<Step[]>(() => {
    if (!journey) return [];
    const result: Step[] = [];
    journey.eventIds.forEach((_, i) => {
      result.push({ type: 'event', index: i });
      if (i < journey.transitions.length) {
        result.push({ type: 'transition', index: i });
      }
    });
    return result;
  }, [journey]);

  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [direction, setDirection] = useState(1);

  const currentStep = steps[currentStepIdx] as Step | undefined;
  const totalSteps = steps.length;
  const progressFraction = totalSteps > 0 ? (currentStepIdx + 1) / totalSteps : 0;
  const isLastStep = currentStepIdx === totalSteps - 1;
  const isFirstStep = currentStepIdx === 0;

  const currentEventIndex = currentStep?.type === 'event'
    ? currentStep.index
    : currentStep
      ? currentStep.index + 1
      : 0;

  useEffect(() => {
    if (currentStep?.type === 'event') {
      const eventId = journey?.eventIds[currentStep.index];
      if (eventId) {
        markEventViewed(eventId);
      }
    }
  }, [currentStep, journey, markEventViewed]);

  const goNext = useCallback(() => {
    if (currentStepIdx < totalSteps - 1) {
      setDirection(1);
      setCurrentStepIdx(prev => prev + 1);
    }
  }, [currentStepIdx, totalSteps]);

  const goPrev = useCallback(() => {
    if (currentStepIdx > 0) {
      setDirection(-1);
      setCurrentStepIdx(prev => prev - 1);
    }
  }, [currentStepIdx]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'ArrowRight' || e.key === ' ') {
      e.preventDefault();
      goNext();
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      goPrev();
    } else if (e.key === 'Escape') {
      navigate('/journeys');
    }
  }, [goNext, goPrev, navigate]);

  if (!journey || journeyEvents.length === 0) {
    return (
      <div
        className="min-h-screen w-full flex items-center justify-center lg:pl-[64px]"
        style={{ background: 'var(--color-void)' }}
      >
        <div className="text-center">
          <p style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '18px', color: 'var(--color-text-secondary)' }}>
            Journey not found
          </p>
          <button
            onClick={() => navigate('/journeys')}
            className="mt-4 px-5 h-[44px] rounded-[10px] cursor-pointer"
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: '14px',
              fontWeight: 600,
              background: 'rgba(196, 154, 68, 0.15)',
              border: '1px solid rgba(196, 154, 68, 0.3)',
              color: '#c49a44',
            }}
          >
            Back to Journeys
          </button>
        </div>
      </div>
    );
  }

  const completedEvents = journey.eventIds.filter(id => viewedEvents.includes(id)).length;
  const isComplete = isLastStep && currentStep?.type === 'event';

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const slideVariants: any = {
    enter: (dir: number) => ({
      x: dir > 0 ? 80 : -80,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (dir: number) => ({
      x: dir > 0 ? -80 : 80,
      opacity: 0,
    }),
  };

  return (
    <div
      className="min-h-screen w-full overflow-x-hidden overflow-y-auto lg:pl-[64px]"
      style={{
        background: 'radial-gradient(ellipse 80% 50% at 50% 20%, var(--color-elevated) 0%, var(--color-surface) 30%, var(--color-void) 60%, var(--color-void) 100%)',
      }}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="main"
      aria-label={`Journey: ${journey.title}`}
    >
      {/* Progress bar */}
      <div
        className="fixed top-0 left-0 lg:left-[64px] right-0 z-30 h-[3px]"
        style={{ background: 'rgba(255, 255, 255, 0.06)' }}
      >
        <motion.div
          className="h-full"
          style={{ background: 'linear-gradient(90deg, #c49a44, #a07830)' }}
          animate={{ width: `${progressFraction * 100}%` }}
          transition={{ duration: 0.4, ease: EASE }}
        />
      </div>

      {/* Top nav */}
      <div className="sticky top-0 z-20 px-6 md:px-10 py-4">
        <div className="max-w-[900px] mx-auto flex items-center justify-between">
          <button
            onClick={() => navigate('/journeys')}
            className={cn(
              'flex items-center gap-2 h-[44px] px-4 rounded-[10px] cursor-pointer',
              'transition-all duration-200 hover:bg-white/[0.04]',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-gold/50',
            )}
            style={{
              background: 'var(--glass-strong-bg)',
              backdropFilter: 'blur(16px)',
              border: '1px solid var(--color-border-subtle)',
            }}
            aria-label="Exit journey"
          >
            <X size={16} style={{ color: 'var(--color-text-secondary)' }} />
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '12px', color: 'var(--color-text-secondary)' }}>
              Exit
            </span>
          </button>

          <div
            className="flex items-center gap-3 h-[44px] px-4 rounded-[10px]"
            style={{
              background: 'var(--glass-strong-bg)',
              backdropFilter: 'blur(16px)',
              border: '1px solid var(--color-border-subtle)',
            }}
          >
            <span style={{ fontSize: '16px' }}>{journey.icon}</span>
            <span
              className="hidden sm:inline"
              style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '13px', fontWeight: 500, color: 'var(--color-text-primary)' }}
            >
              {journey.title}
            </span>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '11px', color: 'var(--color-text-muted)' }}>
              {currentEventIndex + 1} of {journey.eventIds.length}
            </span>
          </div>
        </div>
      </div>

      {/* Content area */}
      <div className="w-full max-w-[900px] mx-auto px-6 md:px-10 pb-32 pt-4">
        <AnimatePresence mode="wait" custom={direction}>
          {currentStep?.type === 'event' && (
            <EventCard
              key={`event-${currentStep.index}`}
              event={journeyEvents[currentStep.index]!}
              stepNumber={currentStep.index + 1}
              totalEvents={journey.eventIds.length}
              direction={direction}
              variants={slideVariants}
            />
          )}

          {currentStep?.type === 'transition' && (
            <TransitionCard
              key={`transition-${currentStep.index}`}
              text={journey.transitions[currentStep.index]!}
              fromEvent={journeyEvents[currentStep.index]!}
              toEvent={journeyEvents[currentStep.index + 1]!}
              direction={direction}
              variants={slideVariants}
            />
          )}
        </AnimatePresence>

        {/* Completion card */}
        {isComplete && currentStepIdx === totalSteps - 1 && (
          <motion.div
            className="mt-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3, ease: EASE }}
          >
            <div
              className="rounded-[16px] p-8 text-center"
              style={{
                background: 'rgba(196, 154, 68, 0.06)',
                border: '1px solid rgba(196, 154, 68, 0.2)',
                backdropFilter: 'blur(24px)',
              }}
            >
              <div
                className="inline-flex items-center justify-center rounded-full mb-4"
                style={{
                  width: '64px',
                  height: '64px',
                  background: 'rgba(196, 154, 68, 0.15)',
                  border: '1px solid rgba(196, 154, 68, 0.3)',
                }}
              >
                <Check size={28} style={{ color: '#c49a44' }} />
              </div>
              <h2
                style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '24px', fontWeight: 700, color: 'var(--color-text-primary)' }}
              >
                Journey Complete
              </h2>
              <p
                className="mt-2 mb-6"
                style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '14px', color: 'var(--color-text-secondary)' }}
              >
                You explored {completedEvents} events across the "{journey.title}" journey
              </p>
              <div className="flex items-center justify-center gap-6 mb-6">
                <div className="flex items-center gap-2">
                  <BookOpen size={16} style={{ color: 'var(--color-text-muted)' }} />
                  <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '12px', color: 'var(--color-text-secondary)' }}>
                    {journey.eventIds.length} events
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock size={16} style={{ color: 'var(--color-text-muted)' }} />
                  <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '12px', color: 'var(--color-text-secondary)' }}>
                    ~{journey.estimatedMinutes} min
                  </span>
                </div>
              </div>
              <button
                onClick={() => navigate('/journeys')}
                className="h-[44px] px-6 rounded-[10px] cursor-pointer transition-all duration-200"
                style={{
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontSize: '14px',
                  fontWeight: 600,
                  background: 'linear-gradient(135deg, #c49a44 0%, #a07830 100%)',
                  color: '#08080c',
                }}
              >
                Back to Journeys
              </button>
            </div>
          </motion.div>
        )}
      </div>

      {/* Bottom navigation */}
      <div
        className="fixed bottom-0 left-0 lg:left-[64px] right-0 z-20"
        style={{
          background: 'linear-gradient(to top, var(--color-overlay) 0%, var(--glass-bg) 70%, transparent 100%)',
          paddingTop: '48px',
        }}
      >
        <div className="max-w-[900px] mx-auto px-6 md:px-10 pb-6 flex items-center justify-between gap-4">
          <motion.button
            onClick={goPrev}
            disabled={isFirstStep}
            className={cn(
              'flex items-center gap-2 h-[44px] px-5 rounded-[10px] cursor-pointer',
              'transition-all duration-200',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-gold/50',
              isFirstStep && 'opacity-30 cursor-not-allowed',
            )}
            style={{
              background: 'var(--glass-strong-bg)',
              backdropFilter: 'blur(16px)',
              border: '1px solid var(--color-border-subtle)',
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: '14px',
              fontWeight: 500,
              color: 'var(--color-text-primary)',
            }}
            whileHover={!isFirstStep ? { scale: 1.03 } : undefined}
            whileTap={!isFirstStep ? { scale: 0.97 } : undefined}
            aria-label="Previous step"
          >
            <ArrowLeft size={16} />
            <span className="hidden sm:inline">Previous</span>
          </motion.button>

          {/* Step dots */}
          <div className="flex items-center gap-1.5" role="progressbar" aria-valuenow={currentStepIdx + 1} aria-valuemax={totalSteps}>
            {journey.eventIds.map((_, i) => {
              const eventStepIdx = steps.findIndex(s => s.type === 'event' && s.index === i);
              const isCurrentOrPast = eventStepIdx <= currentStepIdx;
              const isCurrent = currentStep?.type === 'event' && currentStep.index === i;
              return (
                <div
                  key={i}
                  className="rounded-full transition-all duration-300"
                  style={{
                    width: isCurrent ? '20px' : '8px',
                    height: '8px',
                    background: isCurrent
                      ? '#c49a44'
                      : isCurrentOrPast
                        ? 'rgba(196, 154, 68, 0.4)'
                        : 'rgba(255, 255, 255, 0.1)',
                  }}
                />
              );
            })}
          </div>

          <motion.button
            onClick={isLastStep ? () => navigate('/journeys') : goNext}
            className={cn(
              'flex items-center gap-2 h-[44px] px-5 rounded-[10px] cursor-pointer',
              'transition-all duration-200',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-gold/50',
            )}
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: '14px',
              fontWeight: 600,
              background: isLastStep
                ? 'linear-gradient(135deg, #c49a44 0%, #a07830 100%)'
                : 'rgba(196, 154, 68, 0.15)',
              border: isLastStep ? 'none' : '1px solid rgba(196, 154, 68, 0.3)',
              color: isLastStep ? '#08080c' : '#c49a44',
            }}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            aria-label={isLastStep ? 'Finish journey' : 'Next step'}
          >
            <span className="hidden sm:inline">{isLastStep ? 'Finish' : 'Next'}</span>
            {isLastStep ? <Check size={16} /> : <ArrowRight size={16} />}
          </motion.button>
        </div>
      </div>
    </div>
  );
}

function EventCard({
  event,
  stepNumber,
  totalEvents,
  direction,
  variants,
}: {
  event: { id: string; title: string; description: string; year: number; category: string; imageUrl?: string; impactText?: string; locationName?: string };
  stepNumber: number;
  totalEvents: number;
  direction: number;
  variants: Variants;
}) {
  const catColor = CATEGORY_COLORS[event.category] ?? '#8a8a9a';

  const paragraphs = event.description.split('\n\n').filter(Boolean);

  return (
    <motion.article
      custom={direction}
      variants={variants}
      initial="enter"
      animate="center"
      exit="exit"
      transition={{ duration: 0.35, ease: EASE }}
      aria-label={`Event ${stepNumber} of ${totalEvents}: ${event.title}`}
    >
      {/* Event image */}
      {event.imageUrl && (
        <div
          className="w-full aspect-[21/9] rounded-[16px] overflow-hidden mb-6 relative"
          style={{ border: '1px solid var(--color-border-subtle)' }}
        >
          <img
            src={event.imageUrl}
            alt={event.title}
            className="w-full h-full object-cover"
            loading="eager"
          />
          <div
            className="absolute inset-0"
            style={{ background: 'linear-gradient(to top, var(--glass-bg) 0%, transparent 40%)' }}
          />
        </div>
      )}

      {/* Event meta */}
      <div className="flex items-center gap-3 mb-3">
        <div
          className="w-2.5 h-2.5 rounded-full flex-shrink-0"
          style={{ background: catColor, boxShadow: `0 0 8px ${catColor}60` }}
        />
        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '12px', color: 'var(--color-text-muted)' }}>
          {formatYear(event.year)}
        </span>
        {event.locationName && (
          <>
            <span style={{ color: 'var(--color-text-muted)' }}>&middot;</span>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '12px', color: 'var(--color-text-muted)' }}>
              {event.locationName}
            </span>
          </>
        )}
      </div>

      {/* Event title */}
      <h2
        className="mb-4"
        style={{
          fontFamily: "'Space Grotesk', sans-serif",
          fontSize: 'clamp(22px, 3.5vw, 28px)',
          fontWeight: 700,
          color: 'var(--color-text-primary)',
          lineHeight: 1.2,
        }}
      >
        {event.title}
      </h2>

      {/* Description */}
      <div className="space-y-4 mb-6">
        {paragraphs.map((p, i) => (
          <p
            key={i}
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: '15px',
              lineHeight: 1.7,
              color: 'var(--color-text-secondary)',
            }}
          >
            {p}
          </p>
        ))}
      </div>

      {/* Impact text */}
      {event.impactText && (
        <div
          className="rounded-[12px] px-5 py-4"
          style={{
            background: 'rgba(196, 154, 68, 0.06)',
            border: '1px solid rgba(196, 154, 68, 0.15)',
          }}
        >
          <span
            className="block mb-1"
            style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '10px', fontWeight: 600, color: '#c49a44', textTransform: 'uppercase', letterSpacing: '0.1em' }}
          >
            Did you know?
          </span>
          <p style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '14px', lineHeight: 1.6, color: 'var(--color-text-secondary)' }}>
            {event.impactText}
          </p>
        </div>
      )}
    </motion.article>
  );
}

function TransitionCard({
  text,
  fromEvent,
  toEvent,
  direction,
  variants,
}: {
  text: string;
  fromEvent: { title: string; year: number };
  toEvent: { title: string; year: number };
  direction: number;
  variants: Variants;
}) {
  return (
    <motion.div
      custom={direction}
      variants={variants}
      initial="enter"
      animate="center"
      exit="exit"
      transition={{ duration: 0.35, ease: EASE }}
      className="flex flex-col items-center justify-center min-h-[50vh] py-12"
    >
      {/* From label */}
      <div className="flex items-center gap-3 mb-6">
        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '11px', color: 'var(--color-text-muted)' }}>
          {formatYear(fromEvent.year)}
        </span>
        <span
          className="max-w-[200px] truncate"
          style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '13px', fontWeight: 500, color: 'var(--color-text-secondary)' }}
        >
          {fromEvent.title}
        </span>
      </div>

      {/* Connector line */}
      <div
        className="w-[1px] h-12 mb-6"
        style={{ background: 'linear-gradient(to bottom, rgba(196, 154, 68, 0.3), rgba(196, 154, 68, 0.08))' }}
      />

      {/* Narrative text */}
      <div
        className="max-w-[640px] rounded-[16px] px-8 py-8 mb-6"
        style={{
          background: 'var(--glass-bg)',
          backdropFilter: 'blur(24px)',
          border: '1px solid rgba(196, 154, 68, 0.12)',
          boxShadow: '0 0 40px rgba(196, 154, 68, 0.04)',
        }}
      >
        <p
          style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: '16px',
            lineHeight: 1.8,
            color: 'var(--color-text-primary)',
            textAlign: 'center',
          }}
        >
          {text}
        </p>
      </div>

      {/* Connector line */}
      <div
        className="w-[1px] h-12 mb-6"
        style={{ background: 'linear-gradient(to bottom, rgba(196, 154, 68, 0.08), rgba(196, 154, 68, 0.3))' }}
      />

      {/* To label */}
      <div className="flex items-center gap-3">
        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '11px', color: 'var(--color-text-muted)' }}>
          {formatYear(toEvent.year)}
        </span>
        <span
          className="max-w-[200px] truncate"
          style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '13px', fontWeight: 500, color: '#c49a44' }}
        >
          {toEvent.title}
        </span>
        <ArrowRight size={14} style={{ color: '#c49a44' }} />
      </div>
    </motion.div>
  );
}
