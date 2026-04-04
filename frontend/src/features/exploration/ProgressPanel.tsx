import { AnimatePresence, motion } from 'framer-motion';
import { X, Trophy, Flame, Lock } from 'lucide-react';
import { useUIStore } from '@/shared/stores/uiStore';
import { useProgressStore, ACHIEVEMENTS } from '@/shared/stores/progressStore';
import { IconButton } from '@/shared/components';

const TOTAL_EVENTS = 27;

export function ProgressPanel() {
  const activePanel = useUIStore(s => s.activePanel);
  const setActivePanel = useUIStore(s => s.setActivePanel);
  const isMobile = useUIStore(s => s.isMobile);

  const viewedEvents = useProgressStore(s => s.viewedEvents);
  const unlockedAchievements = useProgressStore(s => s.unlockedAchievements);
  const currentStreak = useProgressStore(s => s.currentStreak);

  const show = activePanel === 'progress';
  const explored = viewedEvents.length;
  const progressPercent = Math.round((explored / TOTAL_EVENTS) * 100);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className={
            isMobile
              ? 'fixed bottom-44 left-3 right-3 z-30 glass-strong rounded-2xl max-h-[60vh] overflow-y-auto shadow-xl'
              : 'fixed top-5 left-[80px] z-30 w-80 lg:w-[360px] glass-strong rounded-2xl max-h-[70vh] overflow-y-auto shadow-xl'
          }
          initial={isMobile ? { y: 60, opacity: 0 } : { x: -40, opacity: 0 }}
          animate={isMobile ? { y: 0, opacity: 1 } : { x: 0, opacity: 1 }}
          exit={isMobile ? { y: 60, opacity: 0 } : { x: -40, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        >
          <div className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Trophy size={16} style={{ color: '#c49a44' }} />
                <h3 className="font-semibold text-[14px] text-text-primary">
                  Your Journey
                </h3>
              </div>
              <IconButton
                icon={X}
                size={16}
                onClick={() => setActivePanel('none')}
              />
            </div>

            <div
              className="rounded-[var(--radius-md)] p-3 mb-3"
              style={{
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.07)',
              }}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] text-text-secondary">
                  {explored} of {TOTAL_EVENTS} events explored
                </span>
                <span
                  className="text-[11px] font-semibold"
                  style={{ color: '#c49a44' }}
                >
                  {progressPercent}%
                </span>
              </div>
              <div
                className="h-2 rounded-full overflow-hidden"
                style={{ background: 'rgba(255, 255, 255, 0.06)' }}
                role="progressbar"
                aria-valuenow={explored}
                aria-valuemin={0}
                aria-valuemax={TOTAL_EVENTS}
                aria-label={`${explored} of ${TOTAL_EVENTS} events explored`}
              >
                <motion.div
                  className="h-full rounded-full"
                  style={{
                    background:
                      'linear-gradient(90deg, #c49a44, #d4b06a)',
                  }}
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercent}%` }}
                  transition={{
                    duration: 0.6,
                    ease: [0.16, 1, 0.3, 1],
                    delay: 0.15,
                  }}
                />
              </div>
            </div>

            {currentStreak > 0 && (
              <div
                className="flex items-center gap-2 rounded-[var(--radius-md)] px-3 py-2 mb-3"
                style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.07)',
                }}
              >
                <Flame size={16} style={{ color: '#c49a44' }} />
                <span className="text-[14px] font-semibold text-text-primary">
                  {currentStreak}
                </span>
                <span className="text-[11px] text-text-muted">
                  day streak
                </span>
              </div>
            )}

            <div className="mb-2">
              <p className="text-[11px] text-text-muted uppercase tracking-[0.1em] font-medium">
                Achievements ({unlockedAchievements.length}/{ACHIEVEMENTS.length})
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {ACHIEVEMENTS.map((achievement, i) => {
                const unlocked = unlockedAchievements.includes(
                  achievement.id,
                );
                return (
                  <motion.div
                    key={achievement.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      delay: 0.05 * i,
                      duration: 0.3,
                      ease: [0.16, 1, 0.3, 1],
                    }}
                    className="rounded-[var(--radius-md)] p-3 transition-colors duration-200"
                    style={{
                      background: unlocked
                        ? 'rgba(196, 154, 68, 0.08)'
                        : 'rgba(255, 255, 255, 0.02)',
                      border: unlocked
                        ? '1px solid rgba(196, 154, 68, 0.2)'
                        : '1px solid rgba(255, 255, 255, 0.05)',
                      opacity: unlocked ? 1 : 0.5,
                    }}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      {unlocked ? (
                        <span
                          className="text-base leading-none"
                          role="img"
                          aria-hidden="true"
                        >
                          {achievement.icon}
                        </span>
                      ) : (
                        <Lock
                          size={14}
                          className="text-text-muted shrink-0"
                        />
                      )}
                      <p
                        className="text-[12px] font-semibold leading-tight truncate"
                        style={{
                          color: unlocked ? '#e0e0e6' : '#55556a',
                        }}
                      >
                        {unlocked ? achievement.title : '???'}
                      </p>
                    </div>
                    <p
                      className="text-[10px] leading-snug"
                      style={{
                        color: unlocked ? '#8a8a9a' : '#55556a',
                      }}
                    >
                      {achievement.desc}
                    </p>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
