import { useMemo, useEffect, useState, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { motion } from 'framer-motion';
import {
  Flame, Globe, Dices, Brain, Trophy, ArrowRight,
  Compass, Sparkles, Heart, CheckCircle, Scale, BookOpen, Clock, ChevronRight,
  Scroll, Lock,
} from 'lucide-react';
import { useProgressStore, ACHIEVEMENTS } from '@/shared/stores/progressStore';
import { useEventsStore } from '@/shared/stores/eventsStore';
import { ERAS } from '@/shared/utils/constants';
import { EVENT_QUIZZES } from '@/shared/data/eventQuizzes';
import { JOURNEYS } from '@/shared/data/journeys';

import { cn } from '@/shared/utils/cn';

/** Get the best available image for an event card */
function getCardImage(event: { id: string; imageUrl?: string; category: string }): string | null {
  return event.imageUrl ?? null;
}

const ERA_COLORS: Record<string, string> = {
  prehistory: '#8d7b68', ancient: '#c49a44', classical: '#b85454',
  medieval: '#8b6faa', renaissance: '#5a7fb5', industrial: '#7a9e5a', modern: '#5a9aaa',
};

const CATEGORY_COLORS: Record<string, string> = {
  war: '#b85454', discovery: '#5a8fa5', cultural: '#c49a44',
  political: '#8b80b0', construction: '#6d9476', natural: '#b87a60',
};

function formatYear(y: number) {
  return y < 0 ? `${Math.abs(y)} BCE` : `${y} CE`;
}

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

const section = (delay: number) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.6, delay, ease: EASE } },
});

function AnimatedNumber({ value, duration = 1000 }: { value: number; duration?: number }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    if (value === 0) { setDisplay(0); return; }
    const start = performance.now();
    let raf: number;
    const tick = (now: number) => {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(Math.round(eased * value));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value, duration]);
  return <>{display}</>;
}

function ProgressRing({ progress, size = 80, stroke = 6 }: { progress: number; size?: number; stroke?: number }) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  return (
    <svg width={size} height={size} className="transform -rotate-90">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={stroke} />
      <motion.circle
        cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#c49a44" strokeWidth={stroke}
        strokeLinecap="round" strokeDasharray={circ}
        initial={{ strokeDashoffset: circ }}
        animate={{ strokeDashoffset: circ * (1 - progress) }}
        transition={{ duration: 1, delay: 0.5, ease: EASE }}
      />
    </svg>
  );
}

function GlassCard({ children, className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('rounded-[12px] transition-all duration-200', className)}
      style={{
        background: 'var(--glass-bg)',
        backdropFilter: 'blur(24px)',
        border: '1px solid var(--color-border-subtle)',
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.03)',
      }}
      {...props}
    >
      {children}
    </div>
  );
}

type DashboardTab = 'overview' | 'events' | 'achievements';

const TABS: { id: DashboardTab; label: string; icon: typeof Globe }[] = [
  { id: 'overview', label: 'Overview', icon: Compass },
  { id: 'events', label: 'Events', icon: Scroll },
  { id: 'achievements', label: 'Achievements', icon: Trophy },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = (searchParams.get('tab') as DashboardTab) || 'overview';

  const viewedEvents = useProgressStore(s => s.viewedEvents);
  const quizScores = useProgressStore(s => s.quizScores);
  const unlockedAchievements = useProgressStore(s => s.unlockedAchievements);
  const currentStreak = useProgressStore(s => s.currentStreak);
  const updateStreak = useProgressStore(s => s.updateStreak);
  const favoriteEvents = useProgressStore(s => s.favoriteEvents);
  const getDailyChallenge = useProgressStore(s => s.getDailyChallenge);
  const dailyChallengeCompleted = useProgressStore(s => s.dailyChallengeCompleted);
  const setCompareEvent = useProgressStore(s => s.setCompareEvent);

  const events = useEventsStore(s => s.events);

  useEffect(() => { updateStreak(); }, [updateStreak]);

  const dailyEventId = useMemo(() => getDailyChallenge(), [getDailyChallenge]);
  const dailyEvent = useMemo(
    () => events.find(e => e.id === dailyEventId),
    [events, dailyEventId],
  );

  const totalEvents = events.length;
  const exploredCount = viewedEvents.length;
  const quizCount = Object.keys(quizScores).length;
  const avgScore = quizCount > 0
    ? Math.round(Object.values(quizScores).reduce((a, b) => a + b, 0) / quizCount)
    : 0;
  const achievementCount = unlockedAchievements.length;

  const unexplored = useMemo(
    () => events.filter(e => !viewedEvents.includes(e.id)),
    [events, viewedEvents],
  );

  const suggestedEvents = useMemo(() => {
    const shuffled = [...unexplored].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 4);
  }, [unexplored]);

  const favoritedEvents = useMemo(
    () => favoriteEvents.map(id => events.find(e => e.id === id)).filter(Boolean),
    [favoriteEvents, events],
  );

  const recentEvents = useMemo(() => {
    const last5 = viewedEvents.slice(-5).reverse();
    return last5.map(id => events.find(e => e.id === id)).filter(Boolean);
  }, [viewedEvents, events]);

  const eraStats = useMemo(() => ERAS.map(era => {
    const eraEvents = events.filter(e => e.eraId === era.id);
    const explored = eraEvents.filter(e => viewedEvents.includes(e.id)).length;
    return { ...era, total: eraEvents.length, explored };
  }), [events, viewedEvents]);

  const handleRandomEvent = useCallback(() => {
    if (unexplored.length === 0) return;
    const pick = unexplored[Math.floor(Math.random() * unexplored.length)]!;
    navigate(`/explore?event=${pick.id}`);
  }, [unexplored, navigate]);

  const handleRandomQuiz = useCallback(() => {
    const withQuiz = events.filter(e => EVENT_QUIZZES[e.id]);
    if (withQuiz.length === 0) return;
    const pick = withQuiz[Math.floor(Math.random() * withQuiz.length)]!;
    navigate(`/explore?event=${pick.id}`);
  }, [events, navigate]);

  return (
    <div
      className="min-h-screen w-full overflow-x-hidden overflow-y-auto lg:pl-[64px]"
      style={{
        background: 'radial-gradient(ellipse 80% 50% at 50% 20%, var(--color-elevated) 0%, var(--color-surface) 30%, var(--color-void) 60%, var(--color-void) 100%)',
      }}
    >
      <div className="w-full max-w-[1100px] mx-auto px-6 md:px-10 py-12 md:py-16">

        {/* ── Header ── */}
        <motion.header
          className="flex flex-wrap items-center justify-between gap-4 mb-12"
          {...section(0.1)}
        >
          <div>
            <h1
              className="text-text-primary leading-tight"
              style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 'clamp(24px, 4vw, 32px)', fontWeight: 700 }}
            >
              Welcome, Explorer
            </h1>
            <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '13px', color: 'var(--color-text-muted)', marginTop: '4px' }}>
              Your journey through time continues
            </p>
          </div>

          <div className="flex items-center gap-3">
            {currentStreak > 0 && (
              <div
                className="flex items-center gap-2 px-4 py-2 rounded-full"
                style={{
                  background: 'rgba(196, 154, 68, 0.12)',
                  border: '1px solid rgba(196, 154, 68, 0.2)',
                }}
              >
                <Flame size={16} style={{ color: '#c49a44' }} />
                <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '14px', fontWeight: 600, color: '#c49a44' }}>
                  {currentStreak}
                </span>
              </div>
            )}
            <motion.button
              onClick={() => navigate('/explore')}
              className="flex items-center gap-2 h-[44px] px-5 rounded-[10px] cursor-pointer"
              style={{
                fontFamily: "'Space Grotesk', sans-serif", fontSize: '14px', fontWeight: 600,
                background: 'linear-gradient(135deg, #c49a44 0%, #a07830 100%)', color: '#08080c',
              }}
              whileHover={{ scale: 1.04, boxShadow: '0 0 24px rgba(196, 154, 68, 0.3)' }}
              whileTap={{ scale: 0.96 }}
            >
              <Globe size={16} strokeWidth={2.2} />
              Enter Globe
            </motion.button>
          </div>
        </motion.header>

        {/* ── Tab Navigation ── */}
        <motion.div className="mb-10" {...section(0.12)}>
          <div className="flex gap-1 p-1 rounded-xl" style={{ background: 'var(--glass-bg)', border: '1px solid var(--color-border-subtle)' }}>
            {TABS.map(tab => {
              const isActive = activeTab === tab.id;
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setSearchParams(tab.id === 'overview' ? {} : { tab: tab.id })}
                  className={cn(
                    'flex items-center gap-2 px-4 py-2.5 rounded-lg text-[13px] font-medium transition-all duration-200 cursor-pointer flex-1 justify-center',
                    isActive
                      ? 'text-text-primary'
                      : 'text-text-muted hover:text-text-secondary',
                  )}
                  style={isActive ? {
                    background: 'var(--color-elevated)',
                    border: '1px solid var(--color-border-active)',
                    boxShadow: '0 2px 8px var(--glass-shadow)',
                  } : { border: '1px solid transparent' }}
                >
                  <Icon size={15} />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </motion.div>

        {activeTab === 'overview' && (<>
        {/* ── Daily Challenge ── */}
        {dailyEvent && (
          <motion.section className="mb-12" {...section(0.15)}>
            <GlassCard
              className="relative overflow-hidden"
              style={{
                border: dailyChallengeCompleted
                  ? '1px solid rgba(109, 148, 118, 0.35)'
                  : '1px solid rgba(196, 154, 68, 0.35)',
                boxShadow: dailyChallengeCompleted
                  ? '0 0 24px rgba(109, 148, 118, 0.08)'
                  : '0 0 24px rgba(196, 154, 68, 0.08)',
              }}
            >
              <div className="flex flex-col sm:flex-row gap-0">
                {/* Image */}
                <div
                  className="w-full sm:w-[220px] h-[140px] sm:h-auto relative flex-shrink-0 overflow-hidden"
                  style={{
                    background: getCardImage(dailyEvent)
                      ? `url(${getCardImage(dailyEvent)}) center/cover`
                      : `linear-gradient(135deg, ${CATEGORY_COLORS[dailyEvent.category] ?? '#8a8a9a'}30, ${CATEGORY_COLORS[dailyEvent.category] ?? '#8a8a9a'}10)`,
                  }}
                >
                  <div className="absolute inset-0" style={{ background: 'linear-gradient(to right, transparent 40%, rgba(14,14,20,0.95) 100%)' }} />
                  <div className="absolute inset-0 sm:hidden" style={{ background: 'linear-gradient(to bottom, transparent 40%, rgba(14,14,20,0.95) 100%)' }} />
                </div>

                {/* Content */}
                <div className="flex-1 px-5 py-4 sm:px-6 sm:py-5 flex flex-col justify-center">
                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full"
                      style={{
                        fontFamily: "'JetBrains Mono', monospace",
                        fontSize: '11px',
                        fontWeight: 600,
                        letterSpacing: '0.08em',
                        textTransform: 'uppercase' as const,
                        background: dailyChallengeCompleted ? 'rgba(109, 148, 118, 0.15)' : 'rgba(196, 154, 68, 0.15)',
                        color: dailyChallengeCompleted ? '#6d9476' : '#c49a44',
                        border: dailyChallengeCompleted ? '1px solid rgba(109, 148, 118, 0.2)' : '1px solid rgba(196, 154, 68, 0.2)',
                      }}
                    >
                      {dailyChallengeCompleted ? (
                        <><CheckCircle size={12} /> Completed</>
                      ) : (
                        <>Daily Challenge</>
                      )}
                    </span>
                    <span
                      className="px-2.5 py-0.5 rounded-full"
                      style={{
                        fontFamily: "'JetBrains Mono', monospace",
                        fontSize: '11px',
                        color: CATEGORY_COLORS[dailyEvent.category] ?? '#8a8a9a',
                        background: `${CATEGORY_COLORS[dailyEvent.category] ?? '#8a8a9a'}15`,
                      }}
                    >
                      {dailyEvent.category}
                    </span>
                  </div>

                  <h3
                    className="text-text-primary"
                    style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '20px', fontWeight: 600, lineHeight: 1.3 }}
                  >
                    {dailyEvent.title}
                  </h3>
                  <span
                    className="mt-1"
                    style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '13px', color: 'var(--color-text-muted)' }}
                  >
                    {formatYear(dailyEvent.year)}{dailyEvent.locationName ? ` \u00b7 ${dailyEvent.locationName}` : ''}
                  </span>

                  <div className="mt-4">
                    {dailyChallengeCompleted ? (
                      <p style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '14px', color: '#6d9476' }}>
                        Well done! Come back tomorrow for a new challenge.
                      </p>
                    ) : (
                      <motion.button
                        onClick={() => navigate(`/explore?event=${dailyEvent.id}`)}
                        className="flex items-center gap-2 h-[44px] px-5 rounded-[10px] cursor-pointer"
                        style={{
                          fontFamily: "'Space Grotesk', sans-serif",
                          fontSize: '14px',
                          fontWeight: 600,
                          background: 'linear-gradient(135deg, #c49a44 0%, #a07830 100%)',
                          color: '#08080c',
                        }}
                        whileHover={{ scale: 1.04, boxShadow: '0 0 24px rgba(196, 154, 68, 0.3)' }}
                        whileTap={{ scale: 0.96 }}
                      >
                        Take the Challenge
                        <ArrowRight size={16} strokeWidth={2.2} />
                      </motion.button>
                    )}
                  </div>
                </div>
              </div>
            </GlassCard>
          </motion.section>
        )}

        {/* ── Progress Overview ── */}
        <motion.section className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-12" {...section(0.2)}>
          <GlassCard className="flex items-center gap-4 p-5">
            <div className="relative flex items-center justify-center">
              <ProgressRing progress={totalEvents > 0 ? exploredCount / totalEvents : 0} />
              <div className="absolute inset-0 flex items-center justify-center">
                <Compass size={20} style={{ color: '#c49a44', opacity: 0.7 }} />
              </div>
            </div>
            <div>
              <span className="block text-text-primary" style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '32px', fontWeight: 700, lineHeight: 1 }}>
                <AnimatedNumber value={exploredCount} />
              </span>
              <span className="block mt-1" style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '12px', color: 'var(--color-text-muted)' }}>
                of {totalEvents} events explored
              </span>
            </div>
          </GlassCard>

          <GlassCard className="flex items-center gap-4 p-5">
            <div
              className="flex items-center justify-center rounded-[12px]"
              style={{ width: '56px', height: '56px', background: 'rgba(196, 154, 68, 0.1)' }}
            >
              <Brain size={24} style={{ color: '#c49a44', opacity: 0.7 }} />
            </div>
            <div>
              <span className="block text-text-primary" style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '32px', fontWeight: 700, lineHeight: 1 }}>
                <AnimatedNumber value={quizCount} />
              </span>
              <span className="block mt-1" style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '12px', color: 'var(--color-text-muted)' }}>
                quizzes{quizCount > 0 ? ` \u00b7 ${avgScore}% avg` : ' completed'}
              </span>
            </div>
          </GlassCard>

          <GlassCard className="flex items-center gap-4 p-5">
            <div
              className="flex items-center justify-center rounded-[12px]"
              style={{ width: '56px', height: '56px', background: 'rgba(196, 154, 68, 0.1)' }}
            >
              <Trophy size={24} style={{ color: '#c49a44', opacity: 0.7 }} />
            </div>
            <div>
              <span className="block text-text-primary" style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '32px', fontWeight: 700, lineHeight: 1 }}>
                <AnimatedNumber value={achievementCount} />
              </span>
              <span className="block mt-1" style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '12px', color: 'var(--color-text-muted)' }}>
                of {ACHIEVEMENTS.length} achievements
              </span>
            </div>
          </GlassCard>
        </motion.section>

        {/* ── Featured Journeys ── */}
        <motion.section className="mb-12" {...section(0.25)}>
          <div className="flex items-center justify-between mb-4">
            <SectionLabel>Featured Journeys</SectionLabel>
            <button
              onClick={() => navigate('/journeys')}
              className="flex items-center gap-1 cursor-pointer transition-colors duration-200 hover:text-[#c49a44]"
              style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '12px', color: 'var(--color-text-muted)' }}
            >
              View all <ChevronRight size={14} />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {JOURNEYS.slice(0, 3).map((journey, i) => {
              const viewedInJourney = journey.eventIds.filter(id => viewedEvents.includes(id)).length;
              const progress = journey.eventIds.length > 0 ? viewedInJourney / journey.eventIds.length : 0;
              return (
                <motion.div
                  key={journey.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 + i * 0.08, ease: EASE }}
                >
                  <GlassCard
                    className="group relative overflow-hidden cursor-pointer transition-all duration-200 hover:border-white/[0.14] hover:translate-y-[-2px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-gold/50 focus-visible:ring-offset-2 focus-visible:ring-offset-void active:scale-[0.97]"
                    style={{ border: '1px solid var(--color-border-subtle)' }}
                    onClick={() => navigate(`/journeys/${journey.id}`)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={e => e.key === 'Enter' && navigate(`/journeys/${journey.id}`)}
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
                      <div className="flex items-center gap-3 mb-2">
                        <span style={{ fontSize: '20px' }}>{journey.icon}</span>
                        <h3
                          className="text-text-primary group-hover:text-[#c49a44] transition-colors truncate"
                          style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '15px', fontWeight: 500 }}
                        >
                          {journey.title}
                        </h3>
                      </div>
                      <p
                        className="line-clamp-2 mb-3"
                        style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '13px', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}
                      >
                        {journey.description}
                      </p>
                      <div className="flex items-center gap-3">
                        <span className="inline-flex items-center gap-1" style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '11px', color: 'var(--color-text-muted)' }}>
                          <BookOpen size={12} /> {journey.eventIds.length} events
                        </span>
                        <span className="inline-flex items-center gap-1" style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '11px', color: 'var(--color-text-muted)' }}>
                          <Clock size={12} /> {journey.estimatedMinutes} min
                        </span>
                      </div>
                    </div>
                  </GlassCard>
                </motion.div>
              );
            })}
          </div>
        </motion.section>

        {/* ── Continue Exploring ── */}
        <motion.section className="mb-12" {...section(0.3)}>
          <SectionLabel>Continue Your Journey</SectionLabel>
          {suggestedEvents.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {suggestedEvents.map((event, i) => {
                const catColor = CATEGORY_COLORS[event.category] ?? '#8a8a9a';
                return (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.4 + i * 0.08, ease: EASE }}
                  >
                    <GlassCard className="group overflow-hidden cursor-pointer transition-all duration-200 hover:border-white/[0.14] hover:translate-y-[-2px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-gold/50 focus-visible:ring-offset-2 focus-visible:ring-offset-void active:scale-[0.97]"
                      style={{ border: '1px solid var(--color-border-subtle)' }}
                      onClick={() => navigate(`/explore?event=${event.id}`)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={e => e.key === 'Enter' && navigate(`/explore?event=${event.id}`)}
                    >
                      <div
                        className="w-full aspect-[16/10] relative overflow-hidden"
                        style={{
                          background: `linear-gradient(135deg, ${catColor}30, ${catColor}10)`,
                        }}
                      >
                        {getCardImage(event) && (
                          <img
                            src={getCardImage(event)!}
                            alt=""
                            loading="lazy"
                            className="absolute inset-0 w-full h-full object-cover"
                            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                          />
                        )}
                        <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(14,14,20,0.9) 0%, transparent 60%)' }} />
                        <div
                          className="absolute top-3 left-3 w-2.5 h-2.5 rounded-full"
                          style={{ background: catColor, boxShadow: `0 0 8px ${catColor}60` }}
                        />
                        <motion.button
                          className="absolute top-2.5 right-2.5 flex items-center justify-center rounded-[8px] opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                          style={{
                            width: '36px', height: '36px',
                            background: 'var(--color-overlay)',
                            backdropFilter: 'blur(8px)',
                            border: '1px solid rgba(255,255,255,0.1)',
                          }}
                          onClick={(e) => { e.stopPropagation(); setCompareEvent(event.id); }}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          title="Compare this event"
                        >
                          <Scale size={14} style={{ color: 'var(--color-text-secondary)' }} />
                        </motion.button>
                      </div>
                      <div className="px-4 py-3">
                        <h3
                          className="text-text-primary group-hover:text-[#c49a44] transition-colors truncate"
                          style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '15px', fontWeight: 500 }}
                        >
                          {event.title}
                        </h3>
                        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '12px', color: 'var(--color-text-muted)' }}>
                          {formatYear(event.year)}
                        </span>
                      </div>
                    </GlassCard>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <GlassCard className="flex items-center justify-center gap-3 py-10 px-6">
              <Sparkles size={20} style={{ color: '#c49a44' }} />
              <span className="text-text-primary" style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '16px', fontWeight: 500 }}>
                You have explored every event!
              </span>
            </GlassCard>
          )}
        </motion.section>

        {/* ── Favorites ── */}
        {favoritedEvents.length > 0 && (
          <motion.section className="mb-12" {...section(0.35)}>
            <SectionLabel>
              <span className="inline-flex items-center gap-2">
                <Heart size={13} fill="#c49a44" stroke="#c49a44" />
                Favorites
              </span>
            </SectionLabel>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {favoritedEvents.map((event, i) => {
                if (!event) return null;
                const catColor = CATEGORY_COLORS[event.category] ?? '#8a8a9a';
                return (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.4 + i * 0.08, ease: EASE }}
                  >
                    <GlassCard className="group overflow-hidden cursor-pointer transition-all duration-200 hover:border-white/[0.14] hover:translate-y-[-2px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-gold/50 focus-visible:ring-offset-2 focus-visible:ring-offset-void active:scale-[0.97]"
                      style={{ border: '1px solid var(--color-border-subtle)' }}
                      onClick={() => navigate(`/explore?event=${event.id}`)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={e => e.key === 'Enter' && navigate(`/explore?event=${event.id}`)}
                    >
                      <div
                        className="w-full aspect-[16/10] relative overflow-hidden"
                        style={{
                          background: `linear-gradient(135deg, ${catColor}30, ${catColor}10)`,
                        }}
                      >
                        {getCardImage(event) && (
                          <img
                            src={getCardImage(event)!}
                            alt=""
                            loading="lazy"
                            className="absolute inset-0 w-full h-full object-cover"
                            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                          />
                        )}
                        <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(14,14,20,0.9) 0%, transparent 60%)' }} />
                        <div
                          className="absolute top-3 left-3 w-2.5 h-2.5 rounded-full"
                          style={{ background: catColor, boxShadow: `0 0 8px ${catColor}60` }}
                        />
                        <Heart size={14} fill="#c49a44" stroke="#c49a44" className="absolute top-3 right-3" />
                        <motion.button
                          className="absolute top-2.5 right-8 flex items-center justify-center rounded-[8px] opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                          style={{
                            width: '36px', height: '36px',
                            background: 'var(--color-overlay)',
                            backdropFilter: 'blur(8px)',
                            border: '1px solid rgba(255,255,255,0.1)',
                          }}
                          onClick={(e) => { e.stopPropagation(); setCompareEvent(event.id); }}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          title="Compare this event"
                        >
                          <Scale size={14} style={{ color: 'var(--color-text-secondary)' }} />
                        </motion.button>
                      </div>
                      <div className="px-4 py-3">
                        <h3
                          className="text-text-primary group-hover:text-[#c49a44] transition-colors truncate"
                          style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '15px', fontWeight: 500 }}
                        >
                          {event.title}
                        </h3>
                        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '12px', color: 'var(--color-text-muted)' }}>
                          {formatYear(event.year)}
                        </span>
                      </div>
                    </GlassCard>
                  </motion.div>
                );
              })}
            </div>
          </motion.section>
        )}

        {/* ── Era Breakdown ── */}
        <motion.section className="mb-12" {...section(0.4)}>
          <SectionLabel>Eras</SectionLabel>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {eraStats.map((era, i) => {
              const color = ERA_COLORS[era.id] ?? '#5a9aaa';
              const pct = era.total > 0 ? era.explored / era.total : 0;
              return (
                <motion.div
                  key={era.id}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.5 + i * 0.06, ease: EASE }}
                >
                  <GlassCard
                    className="group px-5 py-4 cursor-pointer transition-all duration-200 hover:border-white/[0.14] hover:translate-y-[-2px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-gold/50 focus-visible:ring-offset-2 focus-visible:ring-offset-void active:scale-[0.97]"
                    style={{ border: '1px solid var(--color-border-subtle)' }}
                    onClick={() => navigate(`/explore/${era.startYear}`)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={e => e.key === 'Enter' && navigate(`/explore/${era.startYear}`)}
                    aria-label={`${era.name}: ${era.explored} of ${era.total} explored`}
                  >
                    <div className="w-10 h-[3px] rounded-full mb-3" style={{ background: color }} />
                    <h3
                      className="text-text-primary group-hover:text-white transition-colors"
                      style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '15px', fontWeight: 500 }}
                    >
                      {era.name}
                    </h3>
                    <div className="flex items-center gap-3 mt-3">
                      <div className="flex-1 h-[6px] rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                        <motion.div
                          className="h-full rounded-full"
                          style={{ background: color }}
                          initial={{ width: 0 }}
                          animate={{ width: `${pct * 100}%` }}
                          transition={{ duration: 0.8, delay: 0.6 + i * 0.06, ease: EASE }}
                        />
                      </div>
                      <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '12px', color: 'var(--color-text-secondary)', whiteSpace: 'nowrap' }}>
                        {era.explored}/{era.total}
                      </span>
                    </div>
                  </GlassCard>
                </motion.div>
              );
            })}
          </div>
        </motion.section>

        {/* ── Recent Activity ── */}
        {recentEvents.length > 0 && (
          <motion.section className="mb-12" {...section(0.5)}>
            <SectionLabel>Recent Discoveries</SectionLabel>
            <GlassCard className="divide-y divide-white/[0.04]">
              {recentEvents.map((event) => {
                if (!event) return null;
                const catColor = CATEGORY_COLORS[event.category] ?? '#8a8a9a';
                return (
                  <button
                    key={event.id}
                    onClick={() => navigate(`/explore?event=${event.id}`)}
                    className="w-full flex items-center gap-3 px-5 py-3 text-left cursor-pointer hover:bg-white/[0.03] transition-colors active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-gold/50 focus-visible:ring-offset-2 focus-visible:ring-offset-void"
                  >
                    <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: catColor }} />
                    <span
                      className="flex-1 text-text-primary truncate"
                      style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '14px', fontWeight: 500 }}
                    >
                      {event.title}
                    </span>
                    <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '12px', color: 'var(--color-text-muted)' }}>
                      {formatYear(event.year)}
                    </span>
                    <motion.span
                      className="flex items-center justify-center rounded-[8px] cursor-pointer opacity-0 hover:opacity-100 focus-visible:opacity-100 transition-opacity ml-1"
                      style={{
                        width: '36px', height: '36px', flexShrink: 0,
                        background: 'rgba(255,255,255,0.04)',
                        border: '1px solid var(--color-border-subtle)',
                      }}
                      onClick={(e) => { e.stopPropagation(); setCompareEvent(event.id); }}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      title="Compare this event"
                    >
                      <Scale size={14} style={{ color: 'var(--color-text-secondary)' }} />
                    </motion.span>
                  </button>
                );
              })}
            </GlassCard>
          </motion.section>
        )}

        {/* ── Achievements ── */}
        <motion.section className="mb-12" {...section(0.6)}>
          <SectionLabel>Achievements</SectionLabel>
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
            {ACHIEVEMENTS.map((ach, i) => {
              const unlocked = unlockedAchievements.includes(ach.id);
              return (
                <motion.div
                  key={ach.id}
                  className="flex-shrink-0 flex flex-col items-center gap-2"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, delay: 0.7 + i * 0.05, ease: EASE }}
                  title={`${ach.title}: ${ach.desc}`}
                >
                  <div
                    className={cn(
                      'flex items-center justify-center rounded-full transition-all duration-200',
                      unlocked ? 'hover:scale-110' : 'grayscale opacity-30',
                    )}
                    style={{
                      width: '56px',
                      height: '56px',
                      background: unlocked ? 'rgba(196, 154, 68, 0.15)' : 'rgba(255,255,255,0.04)',
                      border: unlocked ? '1px solid rgba(196, 154, 68, 0.3)' : '1px solid rgba(255,255,255,0.06)',
                      boxShadow: unlocked ? '0 0 16px rgba(196, 154, 68, 0.15)' : 'none',
                      fontSize: '22px',
                    }}
                  >
                    {ach.icon}
                  </div>
                  <span
                    className="text-center max-w-[72px] truncate"
                    style={{
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: '10px',
                      color: unlocked ? 'var(--color-text-secondary)' : 'var(--color-text-muted)',
                    }}
                  >
                    {ach.title}
                  </span>
                </motion.div>
              );
            })}
          </div>
        </motion.section>

        {/* ── Quick Actions ── */}
        <motion.section className="pb-12" {...section(0.7)}>
          <SectionLabel>Quick Actions</SectionLabel>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <ActionButton icon={Dices} label="Random Event" desc="Discover something new" onClick={handleRandomEvent} disabled={unexplored.length === 0} />
            <ActionButton icon={Brain} label="Take a Quiz" desc="Test your knowledge" onClick={handleRandomQuiz} />
            <ActionButton icon={Globe} label="Explore Globe" desc="Open the 3D atlas" onClick={() => navigate('/explore')} />
          </div>
        </motion.section>
        </>)}

        {/* ══════════════════════ EVENTS TAB ══════════════════════ */}
        {activeTab === 'events' && (
          <EventsTab events={events} viewedEvents={viewedEvents} navigate={navigate} />
        )}

        {/* ══════════════════════ ACHIEVEMENTS TAB ══════════════════════ */}
        {activeTab === 'achievements' && (
          <AchievementsTab
            viewedEvents={viewedEvents}
            quizScores={quizScores}
            unlockedAchievements={unlockedAchievements}
            currentStreak={currentStreak}
            totalEvents={events.length}
          />
        )}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════
// Events Tab
// ══════════════════════════════════════════════════════════════════

const EVENT_CATEGORIES: { id: string; label: string; color: string }[] = [
  { id: 'war', label: 'War', color: '#b85454' },
  { id: 'discovery', label: 'Discovery', color: '#5a8fa5' },
  { id: 'cultural', label: 'Cultural', color: '#c49a44' },
  { id: 'political', label: 'Political', color: '#8b80b0' },
  { id: 'construction', label: 'Construction', color: '#6d9476' },
  { id: 'natural', label: 'Natural', color: '#b87a60' },
];

function EventsTab({ events, viewedEvents, navigate }: {
  events: any[];
  viewedEvents: string[];
  navigate: (path: string) => void;
}) {
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [eraFilter, setEraFilter] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    return events.filter(e => {
      if (categoryFilter && e.category !== categoryFilter) return false;
      if (eraFilter && e.eraId !== eraFilter) return false;
      if (search && !e.title.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    }).sort((a: any, b: any) => a.year - b.year);
  }, [events, categoryFilter, eraFilter, search]);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <input
          type="text"
          placeholder="Search events..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="flex-1 min-w-[200px] px-4 py-2.5 rounded-lg text-[13px] text-text-primary placeholder:text-text-muted outline-none"
          style={{
            background: 'var(--glass-bg)',
            border: '1px solid var(--color-border-subtle)',
            fontFamily: "'Inter', sans-serif",
          }}
        />
        <select
          value={eraFilter || ''}
          onChange={e => setEraFilter(e.target.value || null)}
          className="px-3 py-2.5 rounded-lg text-[12px] text-text-secondary cursor-pointer outline-none"
          style={{
            background: 'var(--glass-bg)',
            border: '1px solid var(--color-border-subtle)',
          }}
        >
          <option value="">All Eras</option>
          {ERAS.map(era => (
            <option key={era.id} value={era.id}>{era.name}</option>
          ))}
        </select>
      </div>

      {/* Category pills */}
      <div className="flex flex-wrap gap-2 mb-8">
        <button
          onClick={() => setCategoryFilter(null)}
          className="px-3 py-1.5 rounded-full text-[11px] font-medium cursor-pointer transition-all"
          style={{
            background: !categoryFilter ? 'var(--color-accent-gold)' : 'var(--glass-bg)',
            color: !categoryFilter ? 'var(--color-void)' : 'var(--color-text-muted)',
            border: `1px solid ${!categoryFilter ? 'var(--color-accent-gold)' : 'var(--color-border-subtle)'}`,
          }}
        >
          All ({events.length})
        </button>
        {EVENT_CATEGORIES.map(cat => {
          const count = events.filter((e: any) => e.category === cat.id).length;
          const active = categoryFilter === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setCategoryFilter(active ? null : cat.id)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-medium cursor-pointer transition-all"
              style={{
                background: active ? `${cat.color}25` : 'var(--glass-bg)',
                color: active ? cat.color : 'var(--color-text-muted)',
                border: `1px solid ${active ? `${cat.color}60` : 'var(--color-border-subtle)'}`,
              }}
            >
              <span className="w-2 h-2 rounded-full" style={{ background: cat.color, opacity: active ? 1 : 0.4 }} />
              {cat.label} ({count})
            </button>
          );
        })}
      </div>

      {/* Event list */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {filtered.map((event: any) => {
          const catColor = CATEGORY_COLORS[event.category] ?? '#8a8a9a';
          const viewed = viewedEvents.includes(event.id);
          return (
            <motion.div
              key={event.id}
              whileHover={{ y: -2 }}
              transition={{ duration: 0.15 }}
            >
              <GlassCard
                className="overflow-hidden cursor-pointer group"
                style={{ border: '1px solid var(--color-border-subtle)' }}
                onClick={() => navigate(`/explore?event=${event.id}`)}
              >
                <div
                  className="w-full aspect-[16/10] relative overflow-hidden"
                  style={{ background: `linear-gradient(135deg, ${catColor}30, ${catColor}10)` }}
                >
                  {event.imageUrl && (
                    <img
                      src={event.imageUrl}
                      alt=""
                      loading="lazy"
                      className="absolute inset-0 w-full h-full object-cover"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                    />
                  )}
                  <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, var(--glass-strong-bg) 0%, transparent 60%)' }} />
                  <div className="absolute top-3 left-3 flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ background: catColor }} />
                    <span className="text-[10px] font-medium uppercase tracking-wide" style={{ color: catColor }}>{event.category}</span>
                  </div>
                  {viewed && (
                    <div className="absolute top-3 right-3">
                      <CheckCircle size={14} style={{ color: '#6d9476' }} />
                    </div>
                  )}
                </div>
                <div className="px-4 py-3">
                  <h3
                    className="text-text-primary group-hover:text-accent-gold transition-colors truncate"
                    style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '14px', fontWeight: 500 }}
                  >
                    {event.title}
                  </h3>
                  <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '11px', color: 'var(--color-text-muted)' }}>
                    {formatYear(event.year)}
                  </span>
                </div>
              </GlassCard>
            </motion.div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Scroll size={32} className="text-text-muted mb-3" />
          <p className="text-[14px] text-text-secondary">No events match your filters</p>
        </div>
      )}

      <p className="text-center text-[11px] text-text-muted mt-8 pb-8">
        {filtered.length} of {events.length} events
      </p>
    </motion.div>
  );
}

// ══════════════════════════════════════════════════════════════════
// Achievements Tab
// ══════════════════════════════════════════════════════════════════

function AchievementsTab({ viewedEvents, quizScores, unlockedAchievements, currentStreak, totalEvents }: {
  viewedEvents: string[];
  quizScores: Record<string, number>;
  unlockedAchievements: string[];
  currentStreak: number;
  totalEvents: number;
}) {
  const explored = viewedEvents.length;
  const quizCount = Object.keys(quizScores).length;
  const avgScore = quizCount > 0
    ? Math.round(Object.values(quizScores).reduce((a, b) => a + b, 0) / quizCount)
    : 0;

  const stats = [
    { label: 'Events Explored', value: explored, total: totalEvents, color: '#5a9aaa' },
    { label: 'Quizzes Taken', value: quizCount, total: null, color: '#c49a44' },
    { label: 'Avg Quiz Score', value: `${avgScore}%`, total: null, color: '#6d9476' },
    { label: 'Current Streak', value: `${currentStreak} day${currentStreak !== 1 ? 's' : ''}`, total: null, color: '#b85454' },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-10">
        {stats.map((stat, i) => (
          <GlassCard key={i} className="px-5 py-4">
            <p className="text-[10px] font-mono uppercase tracking-wider text-text-muted mb-1">{stat.label}</p>
            <p className="text-[24px] font-bold" style={{ color: stat.color, fontFamily: "'Space Grotesk', sans-serif" }}>
              {stat.value}
              {stat.total && <span className="text-[14px] text-text-muted font-normal">/{stat.total}</span>}
            </p>
          </GlassCard>
        ))}
      </div>

      {/* Achievements grid */}
      <h2
        className="uppercase tracking-[0.15em] mb-4"
        style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '13px', fontWeight: 500, color: 'var(--color-text-muted)' }}
      >
        All Achievements ({unlockedAchievements.length}/{ACHIEVEMENTS.length})
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pb-12">
        {ACHIEVEMENTS.map((ach) => {
          const unlocked = unlockedAchievements.includes(ach.id);
          return (
            <GlassCard
              key={ach.id}
              className={cn(
                'flex items-center gap-4 px-5 py-4',
                !unlocked && 'opacity-40',
              )}
              style={{
                border: unlocked
                  ? '1px solid rgba(196, 154, 68, 0.25)'
                  : '1px solid var(--color-border-subtle)',
              }}
            >
              <div
                className="flex items-center justify-center rounded-full shrink-0"
                style={{
                  width: 48,
                  height: 48,
                  background: unlocked ? 'rgba(196, 154, 68, 0.15)' : 'rgba(255,255,255,0.04)',
                  border: unlocked ? '1px solid rgba(196, 154, 68, 0.3)' : '1px solid var(--color-border-subtle)',
                  fontSize: 22,
                }}
              >
                {unlocked ? ach.icon : <Lock size={16} className="text-text-muted" />}
              </div>
              <div className="min-w-0">
                <h3 className="text-[14px] font-semibold text-text-primary" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  {ach.title}
                </h3>
                <p className="text-[11px] text-text-secondary mt-0.5">{ach.desc}</p>
                {unlocked && (
                  <span className="inline-block text-[9px] font-mono mt-1 px-2 py-0.5 rounded-full" style={{ background: 'rgba(196, 154, 68, 0.12)', color: '#c49a44' }}>
                    Unlocked
                  </span>
                )}
              </div>
            </GlassCard>
          );
        })}
      </div>
    </motion.div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <h2
      className="uppercase tracking-[0.15em] mb-4"
      style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '13px', fontWeight: 500, color: 'var(--color-text-muted)' }}
    >
      {children}
    </h2>
  );
}

function ActionButton({
  icon: Icon,
  label,
  desc,
  onClick,
  disabled,
}: {
  icon: React.ComponentType<{ size?: number; strokeWidth?: number; style?: React.CSSProperties }>;
  label: string;
  desc: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'flex items-center gap-4 w-full rounded-[12px] px-5 py-4 text-left cursor-pointer transition-all duration-200',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-gold/50 focus-visible:ring-offset-2 focus-visible:ring-offset-void',
        disabled && 'opacity-40 cursor-not-allowed',
      )}
      style={{
        background: 'var(--glass-bg)',
        backdropFilter: 'blur(24px)',
        border: '1px solid var(--color-border-subtle)',
      }}
      whileHover={disabled ? undefined : { scale: 1.02, borderColor: 'rgba(196, 154, 68, 0.3)' }}
      whileTap={disabled ? undefined : { scale: 0.97 }}
    >
      <div
        className="flex items-center justify-center rounded-[10px]"
        style={{ width: '44px', height: '44px', background: 'rgba(196, 154, 68, 0.1)' }}
      >
        <Icon size={20} strokeWidth={1.8} style={{ color: '#c49a44' }} />
      </div>
      <div>
        <span className="block text-text-primary" style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '15px', fontWeight: 500 }}>
          {label}
        </span>
        <span className="block" style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '12px', color: 'var(--color-text-muted)' }}>
          {desc}
        </span>
      </div>
      <ArrowRight size={16} className="ml-auto" style={{ color: 'var(--color-text-muted)' }} />
    </motion.button>
  );
}
