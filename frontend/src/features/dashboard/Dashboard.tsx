import { useMemo, useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router';
import { motion } from 'framer-motion';
import {
  Flame, Globe, Dices, Brain, Trophy, ArrowRight,
  Compass, Sparkles, Heart,
} from 'lucide-react';
import { useProgressStore, ACHIEVEMENTS } from '@/shared/stores/progressStore';
import { useEventsStore } from '@/shared/stores/eventsStore';
import { ERAS } from '@/shared/utils/constants';
import { EVENT_QUIZZES } from '@/shared/data/eventQuizzes';
import { cn } from '@/shared/utils/cn';

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

export default function Dashboard() {
  const navigate = useNavigate();

  const viewedEvents = useProgressStore(s => s.viewedEvents);
  const quizScores = useProgressStore(s => s.quizScores);
  const unlockedAchievements = useProgressStore(s => s.unlockedAchievements);
  const currentStreak = useProgressStore(s => s.currentStreak);
  const updateStreak = useProgressStore(s => s.updateStreak);
  const favoriteEvents = useProgressStore(s => s.favoriteEvents);

  const events = useEventsStore(s => s.events);

  useEffect(() => { updateStreak(); }, [updateStreak]);

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
    navigate(`/explore/${pick.year}/${pick.id}`);
  }, [unexplored, navigate]);

  const handleRandomQuiz = useCallback(() => {
    const withQuiz = events.filter(e => EVENT_QUIZZES[e.id]);
    if (withQuiz.length === 0) return;
    const pick = withQuiz[Math.floor(Math.random() * withQuiz.length)]!;
    navigate(`/explore/${pick.year}/${pick.id}`);
  }, [events, navigate]);

  return (
    <div
      className="min-h-screen w-full overflow-x-hidden overflow-y-auto lg:pl-[64px]"
      style={{
        background: 'radial-gradient(ellipse 80% 50% at 50% 20%, #14141e 0%, #0c0c12 30%, #08080c 60%, #050508 100%)',
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
            <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '13px', color: '#55556a', marginTop: '4px' }}>
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
              <span className="block mt-1" style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '12px', color: '#55556a' }}>
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
              <span className="block mt-1" style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '12px', color: '#55556a' }}>
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
              <span className="block mt-1" style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '12px', color: '#55556a' }}>
                of {ACHIEVEMENTS.length} achievements
              </span>
            </div>
          </GlassCard>
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
                      style={{ border: '1px solid rgba(255,255,255,0.06)' }}
                      onClick={() => navigate(`/explore/${event.year}/${event.id}`)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={e => e.key === 'Enter' && navigate(`/explore/${event.year}/${event.id}`)}
                    >
                      <div
                        className="w-full aspect-[16/10] relative overflow-hidden"
                        style={{
                          background: event.imageUrl
                            ? `url(${event.imageUrl}) center/cover`
                            : `linear-gradient(135deg, ${catColor}30, ${catColor}10)`,
                        }}
                      >
                        <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(14,14,20,0.9) 0%, transparent 60%)' }} />
                        <div
                          className="absolute top-3 left-3 w-2.5 h-2.5 rounded-full"
                          style={{ background: catColor, boxShadow: `0 0 8px ${catColor}60` }}
                        />
                      </div>
                      <div className="px-4 py-3">
                        <h3
                          className="text-text-primary group-hover:text-[#c49a44] transition-colors truncate"
                          style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '15px', fontWeight: 500 }}
                        >
                          {event.title}
                        </h3>
                        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '12px', color: '#55556a' }}>
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
                      style={{ border: '1px solid rgba(255,255,255,0.06)' }}
                      onClick={() => navigate(`/explore/${event.year}/${event.id}`)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={e => e.key === 'Enter' && navigate(`/explore/${event.year}/${event.id}`)}
                    >
                      <div
                        className="w-full aspect-[16/10] relative overflow-hidden"
                        style={{
                          background: event.imageUrl
                            ? `url(${event.imageUrl}) center/cover`
                            : `linear-gradient(135deg, ${catColor}30, ${catColor}10)`,
                        }}
                      >
                        <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(14,14,20,0.9) 0%, transparent 60%)' }} />
                        <div
                          className="absolute top-3 left-3 w-2.5 h-2.5 rounded-full"
                          style={{ background: catColor, boxShadow: `0 0 8px ${catColor}60` }}
                        />
                        <Heart size={14} fill="#c49a44" stroke="#c49a44" className="absolute top-3 right-3" />
                      </div>
                      <div className="px-4 py-3">
                        <h3
                          className="text-text-primary group-hover:text-[#c49a44] transition-colors truncate"
                          style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '15px', fontWeight: 500 }}
                        >
                          {event.title}
                        </h3>
                        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '12px', color: '#55556a' }}>
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
                    style={{ border: '1px solid rgba(255,255,255,0.06)' }}
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
                      <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '12px', color: '#8a8a9a', whiteSpace: 'nowrap' }}>
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
                    onClick={() => navigate(`/explore/${event.year}/${event.id}`)}
                    className="w-full flex items-center gap-3 px-5 py-3 text-left cursor-pointer hover:bg-white/[0.03] transition-colors active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-gold/50 focus-visible:ring-offset-2 focus-visible:ring-offset-void"
                  >
                    <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: catColor }} />
                    <span
                      className="flex-1 text-text-primary truncate"
                      style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '14px', fontWeight: 500 }}
                    >
                      {event.title}
                    </span>
                    <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '12px', color: '#55556a' }}>
                      {formatYear(event.year)}
                    </span>
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
                      color: unlocked ? '#8a8a9a' : '#55556a',
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
      </div>
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <h2
      className="uppercase tracking-[0.15em] mb-4"
      style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '13px', fontWeight: 500, color: '#55556a' }}
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
        background: 'rgba(14, 14, 20, 0.6)',
        backdropFilter: 'blur(24px)',
        border: '1px solid rgba(255, 255, 255, 0.06)',
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
        <span className="block" style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '12px', color: '#55556a' }}>
          {desc}
        </span>
      </div>
      <ArrowRight size={16} className="ml-auto" style={{ color: '#55556a' }} />
    </motion.button>
  );
}
