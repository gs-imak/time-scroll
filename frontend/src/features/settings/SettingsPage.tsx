import { motion } from 'framer-motion';
import { Settings, Sun, Moon, Volume2, VolumeX, Globe, Trash2, RotateCcw, Info } from 'lucide-react';
import { useThemeStore } from '@/shared/stores/themeStore';
import { useProgressStore } from '@/shared/stores/progressStore';
import { useState, useCallback } from 'react';

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

const section = (delay: number) => ({
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.5, delay, ease: EASE } },
});

function SettingRow({ icon: Icon, label, description, children }: {
  icon: typeof Settings;
  label: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className="flex items-center justify-between gap-4 px-5 py-4 rounded-xl"
      style={{ background: 'var(--glass-bg)', border: '1px solid var(--color-border-subtle)' }}
    >
      <div className="flex items-center gap-3 min-w-0">
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
          style={{ background: 'rgba(196, 154, 68, 0.08)' }}
        >
          <Icon size={16} style={{ color: 'var(--color-accent-gold)' }} />
        </div>
        <div className="min-w-0">
          <p className="text-[14px] font-medium text-text-primary" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            {label}
          </p>
          <p className="text-[11px] text-text-muted">{description}</p>
        </div>
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button
      onClick={onChange}
      className="relative w-11 h-6 rounded-full cursor-pointer transition-colors duration-200"
      style={{
        background: checked ? 'var(--color-accent-gold)' : 'rgba(255,255,255,0.1)',
        border: '1px solid ' + (checked ? 'var(--color-accent-gold)' : 'var(--color-border-active)'),
      }}
    >
      <motion.div
        className="absolute top-0.5 w-5 h-5 rounded-full"
        style={{ background: checked ? 'var(--color-void)' : 'var(--color-text-muted)' }}
        animate={{ left: checked ? 20 : 2 }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      />
    </button>
  );
}

export default function SettingsPage() {
  const theme = useThemeStore(s => s.theme);
  const toggleTheme = useThemeStore(s => s.toggleTheme);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [autoPlay, setAutoPlay] = useState(true);

  const viewedEvents = useProgressStore(s => s.viewedEvents);
  const quizScores = useProgressStore(s => s.quizScores);

  const handleResetProgress = useCallback(() => {
    if (window.confirm('Are you sure you want to reset all progress? This cannot be undone.')) {
      localStorage.removeItem('time-scroll-progress');
      window.location.reload();
    }
  }, []);

  const handleClearCache = useCallback(() => {
    if (window.confirm('Clear cached data? The app will reload.')) {
      caches.keys().then(names => names.forEach(n => caches.delete(n)));
      localStorage.removeItem('time-scroll-theme');
      window.location.reload();
    }
  }, []);

  return (
    <div
      className="min-h-screen w-full overflow-x-hidden overflow-y-auto lg:pl-[64px]"
      style={{
        background: 'radial-gradient(ellipse 80% 50% at 50% 20%, var(--color-elevated) 0%, var(--color-surface) 30%, var(--color-void) 60%, var(--color-void) 100%)',
      }}
    >
      <div className="w-full max-w-[700px] mx-auto px-6 md:px-10 py-12 md:py-16">
        {/* Header */}
        <motion.header className="mb-10" {...section(0.1)}>
          <div className="flex items-center gap-3 mb-2">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: 'rgba(196,154,68,0.1)', border: '1px solid rgba(196,154,68,0.2)' }}
            >
              <Settings size={20} style={{ color: 'var(--color-accent-gold)' }} />
            </div>
            <h1
              className="text-text-primary"
              style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '28px', fontWeight: 700 }}
            >
              Settings
            </h1>
          </div>
          <p className="text-text-secondary text-[14px]">Customize your Time Scroll experience</p>
        </motion.header>

        {/* Appearance */}
        <motion.section className="mb-8" {...section(0.15)}>
          <h2
            className="uppercase tracking-[0.15em] mb-4"
            style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '11px', fontWeight: 600, color: 'var(--color-text-muted)' }}
          >
            Appearance
          </h2>
          <div className="flex flex-col gap-3">
            <SettingRow
              icon={theme === 'dark' ? Moon : Sun}
              label="Dark Mode"
              description="Switch between dark and light themes"
            >
              <Toggle checked={theme === 'dark'} onChange={toggleTheme} />
            </SettingRow>
          </div>
        </motion.section>

        {/* Globe */}
        <motion.section className="mb-8" {...section(0.2)}>
          <h2
            className="uppercase tracking-[0.15em] mb-4"
            style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '11px', fontWeight: 600, color: 'var(--color-text-muted)' }}
          >
            Globe
          </h2>
          <div className="flex flex-col gap-3">
            <SettingRow
              icon={Globe}
              label="Auto-play Spotlight"
              description="Automatically play territory evolution in Spotlight mode"
            >
              <Toggle checked={autoPlay} onChange={() => setAutoPlay(!autoPlay)} />
            </SettingRow>
            <SettingRow
              icon={soundEnabled ? Volume2 : VolumeX}
              label="Sound Effects"
              description="Play sounds on interactions (coming soon)"
            >
              <Toggle checked={soundEnabled} onChange={() => setSoundEnabled(!soundEnabled)} />
            </SettingRow>
          </div>
        </motion.section>

        {/* Data */}
        <motion.section className="mb-8" {...section(0.25)}>
          <h2
            className="uppercase tracking-[0.15em] mb-4"
            style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '11px', fontWeight: 600, color: 'var(--color-text-muted)' }}
          >
            Data & Storage
          </h2>
          <div className="flex flex-col gap-3">
            <SettingRow
              icon={Info}
              label="Progress Stats"
              description={`${viewedEvents.length} events explored · ${Object.keys(quizScores).length} quizzes completed`}
            >
              <span className="text-[12px] font-mono text-text-muted">
                {(JSON.stringify(localStorage).length / 1024).toFixed(1)} KB
              </span>
            </SettingRow>
            <SettingRow
              icon={RotateCcw}
              label="Reset Progress"
              description="Clear all explored events, quiz scores, and achievements"
            >
              <motion.button
                onClick={handleResetProgress}
                className="px-3 py-1.5 rounded-lg text-[12px] font-medium cursor-pointer"
                style={{
                  background: 'rgba(184, 84, 84, 0.1)',
                  border: '1px solid rgba(184, 84, 84, 0.25)',
                  color: '#b85454',
                }}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                Reset
              </motion.button>
            </SettingRow>
            <SettingRow
              icon={Trash2}
              label="Clear Cache"
              description="Remove cached GeoJSON files and reload the app"
            >
              <motion.button
                onClick={handleClearCache}
                className="px-3 py-1.5 rounded-lg text-[12px] font-medium cursor-pointer"
                style={{
                  background: 'rgba(184, 84, 84, 0.1)',
                  border: '1px solid rgba(184, 84, 84, 0.25)',
                  color: '#b85454',
                }}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                Clear
              </motion.button>
            </SettingRow>
          </div>
        </motion.section>

        {/* About */}
        <motion.section className="mb-12" {...section(0.3)}>
          <h2
            className="uppercase tracking-[0.15em] mb-4"
            style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '11px', fontWeight: 600, color: 'var(--color-text-muted)' }}
          >
            About
          </h2>
          <div
            className="px-5 py-4 rounded-xl"
            style={{ background: 'var(--glass-bg)', border: '1px solid var(--color-border-subtle)' }}
          >
            <p className="text-[14px] font-semibold text-text-primary mb-1" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              Time Scroll
            </p>
            <p className="text-[12px] text-text-secondary leading-relaxed mb-3">
              An interactive journey through 12,000 years of human civilization. Explore historical events on a 3D globe, watch civilizations rise and fall, and test your knowledge with quizzes.
            </p>
            <div className="flex items-center gap-4 text-[10px] font-mono text-text-muted">
              <span>v1.0.0</span>
              <span>·</span>
              <span>Built with React + Three.js</span>
            </div>
          </div>
        </motion.section>
      </div>
    </div>
  );
}
