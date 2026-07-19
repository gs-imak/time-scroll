import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router';
import { User, Flame, Compass, Trophy, Brain, Heart, Target, LogOut, Settings as SettingsIcon } from 'lucide-react';
import { useProgressStore } from '@/shared/stores/progressStore';
import { useEventsStore } from '@/shared/stores/eventsStore';

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

const section = (delay: number) => ({
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.5, delay, ease: EASE } },
});

function StatCard({
  icon: Icon,
  label,
  value,
  accent,
}: {
  icon: typeof User;
  label: string;
  value: string | number;
  accent: string;
}) {
  return (
    <div
      className="flex items-center gap-4 rounded-xl px-5 py-4"
      style={{
        background: 'var(--glass-bg)',
        border: '1px solid var(--color-border-subtle)',
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.03)',
      }}
    >
      <div
        className="w-11 h-11 rounded-[10px] flex items-center justify-center shrink-0"
        style={{ background: `${accent}14`, border: `1px solid ${accent}26` }}
      >
        <Icon size={18} style={{ color: accent }} />
      </div>
      <div className="min-w-0">
        <p
          className="text-[24px] font-bold leading-none"
          style={{ fontFamily: 'var(--font-display)', color: 'var(--color-text-primary)' }}
        >
          {value}
        </p>
        <p
          className="mt-1 text-[11px] uppercase tracking-wider text-text-muted"
          style={{ fontFamily: 'var(--font-mono)' }}
        >
          {label}
        </p>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const navigate = useNavigate();
  const viewedEvents = useProgressStore((s) => s.viewedEvents);
  const quizScores = useProgressStore((s) => s.quizScores);
  const unlockedAchievements = useProgressStore((s) => s.unlockedAchievements);
  const currentStreak = useProgressStore((s) => s.currentStreak);
  const favoriteEvents = useProgressStore((s) => s.favoriteEvents);
  const events = useEventsStore((s) => s.events);

  const totalEvents = events.length;
  const explored = viewedEvents.length;
  const quizCount = Object.keys(quizScores).length;
  const avgScore = useMemo(() => {
    const vals = Object.values(quizScores);
    if (vals.length === 0) return 0;
    return Math.round(vals.reduce((a, b) => a + b, 0) / vals.length);
  }, [quizScores]);

  const progressPct = totalEvents > 0 ? Math.round((explored / totalEvents) * 100) : 0;

  const handleSignOut = () => {
    localStorage.removeItem('ts-has-signed-in');
    navigate('/login');
  };

  return (
    <div
      className="min-h-screen w-full overflow-x-hidden overflow-y-auto lg:pl-[64px]"
      style={{
        background:
          'radial-gradient(ellipse 80% 50% at 50% 20%, var(--color-elevated) 0%, var(--color-surface) 30%, var(--color-void) 60%, var(--color-void) 100%)',
      }}
    >
      {/* pt-20 below lg clears the fixed mobile nav button: 12px offset + 44px
          button + 24px (xl) gap = 80px. Desktop sidebar appears at lg. */}
      <div className="w-full max-w-[900px] mx-auto px-6 md:px-10 pt-20 lg:pt-16 pb-12 md:pb-16">
        {/* ── Header ── */}
        <motion.header className="mb-12" {...section(0.1)}>
          <h1
            className="text-text-primary leading-tight"
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(24px, 4vw, 32px)',
              fontWeight: 700,
            }}
          >
            Profile
          </h1>
          <p
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '13px',
              color: 'var(--color-text-muted)',
              marginTop: '4px',
            }}
          >
            Your journey through time
          </p>
        </motion.header>

        {/* ── Identity card ── */}
        <motion.section
          className="relative overflow-hidden rounded-2xl mb-10"
          {...section(0.15)}
          style={{
            background: 'var(--glass-bg)',
            backdropFilter: 'blur(24px)',
            border: '1px solid rgba(196, 154, 68, 0.25)',
            boxShadow:
              '0 0 32px rgba(196, 154, 68, 0.08), 0 8px 32px rgba(0, 0, 0, 0.3)',
          }}
        >
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                'radial-gradient(ellipse 80% 50% at 0% 0%, rgba(196, 154, 68, 0.12), transparent 60%)',
            }}
          />
          <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-6 p-7">
            {/* Avatar */}
            <div
              className="w-24 h-24 rounded-2xl flex items-center justify-center shrink-0"
              style={{
                background:
                  'linear-gradient(135deg, rgba(196, 154, 68, 0.25), rgba(196, 154, 68, 0.08))',
                border: '1.5px solid rgba(196, 154, 68, 0.4)',
                boxShadow: '0 0 24px rgba(196, 154, 68, 0.15)',
              }}
            >
              <User size={42} style={{ color: 'var(--color-accent-gold)' }} />
            </div>

            {/* Identity */}
            <div className="flex-1 min-w-0">
              <h2
                className="text-text-primary leading-tight"
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '24px',
                  fontWeight: 700,
                }}
              >
                Explorer
              </h2>
              <p
                className="mt-1"
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '12px',
                  color: 'var(--color-text-muted)',
                }}
              >
                Member since today
              </p>

              {/* Progress bar */}
              <div className="mt-4">
                <div className="flex items-center justify-between mb-1.5">
                  <span
                    className="text-[11px] uppercase tracking-wider text-text-muted"
                    style={{ fontFamily: 'var(--font-mono)' }}
                  >
                    Collection progress
                  </span>
                  <span
                    className="text-[12px] font-semibold"
                    style={{
                      color: 'var(--color-accent-gold)',
                      fontFamily: 'var(--font-display)',
                    }}
                  >
                    {progressPct}%
                  </span>
                </div>
                <div
                  className="h-2 rounded-full overflow-hidden"
                  style={{ background: 'rgba(255,255,255,0.06)' }}
                >
                  <motion.div
                    className="h-full rounded-full"
                    style={{
                      background:
                        'linear-gradient(to right, #c49a44, rgba(196, 154, 68, 0.6))',
                    }}
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPct}%` }}
                    transition={{ duration: 1.2, ease: EASE, delay: 0.4 }}
                  />
                </div>
              </div>
            </div>
          </div>
        </motion.section>

        {/* ── Stats grid — 6 cards: even 2-col (mobile) and 3-col (sm+) rows,
            no orphaned last row. Quizzes and average score are separate
            stats; the % lives in the value, formatted once. ── */}
        <motion.section
          className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-10"
          {...section(0.2)}
        >
          <StatCard
            icon={Compass}
            label={`of ${totalEvents} events`}
            value={explored}
            accent="#c49a44"
          />
          <StatCard
            icon={Flame}
            label="day streak"
            value={currentStreak}
            accent="#b85454"
          />
          <StatCard
            icon={Trophy}
            label="achievements"
            value={unlockedAchievements.length}
            accent="#5a8fa5"
          />
          <StatCard
            icon={Brain}
            label="quizzes taken"
            value={quizCount}
            accent="#6d9476"
          />
          <StatCard
            icon={Target}
            label="Average score"
            value={`${avgScore}%`}
            accent="#8b80b0"
          />
          <StatCard
            icon={Heart}
            label="favorites"
            value={favoriteEvents.length}
            accent="#c8766e"
          />
        </motion.section>

        {/* ── Actions ── */}
        <motion.section className="flex flex-wrap gap-3" {...section(0.25)}>
          <motion.button
            onClick={() => navigate('/settings')}
            className="flex items-center gap-2 h-11 px-5 rounded-[10px] cursor-pointer"
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '14px',
              fontWeight: 600,
              background: 'var(--glass-bg)',
              border: '1px solid var(--color-border-subtle)',
              color: 'var(--color-text-primary)',
            }}
            whileHover={{ scale: 1.02, borderColor: 'rgba(196, 154, 68, 0.4)' }}
            whileTap={{ scale: 0.98 }}
          >
            <SettingsIcon size={16} />
            Settings
          </motion.button>

          <motion.button
            onClick={handleSignOut}
            className="flex items-center gap-2 h-11 px-5 rounded-[10px] cursor-pointer"
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '14px',
              fontWeight: 600,
              background: 'rgba(184, 84, 84, 0.10)',
              border: '1px solid rgba(184, 84, 84, 0.30)',
              color: '#d98080',
            }}
            whileHover={{ scale: 1.02, background: 'rgba(184, 84, 84, 0.16)' }}
            whileTap={{ scale: 0.98 }}
          >
            <LogOut size={16} />
            Sign out
          </motion.button>
        </motion.section>
      </div>
    </div>
  );
}
