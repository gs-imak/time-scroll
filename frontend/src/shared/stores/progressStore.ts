import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { SEED_EVENTS } from '@/shared/utils/constants';

export interface Achievement {
  id: string;
  title: string;
  desc: string;
  icon: string;
  check: (s: ProgressState) => boolean;
}

interface ProgressState {
  viewedEvents: string[];
  quizScores: Record<string, number>;
  unlockedAchievements: string[];
  currentStreak: number;
  lastVisitDate: string | null;
  favoriteEvents: string[];
  eventNotes: Record<string, string>;
  dailyChallengeEventId: string | null;
  dailyChallengeDate: string | null;
  dailyChallengeCompleted: boolean;
  compareEvents: [string, string] | null;
}

interface ProgressActions {
  markEventViewed: (id: string) => void;
  recordQuizScore: (eventId: string, score: number) => void;
  checkAndUnlockAchievements: () => string[];
  updateStreak: () => void;
  totalEventsExplored: () => number;
  toggleFavorite: (id: string) => void;
  setEventNote: (id: string, note: string) => void;
  getDailyChallenge: () => string;
  completeDailyChallenge: () => void;
  setCompareEvent: (id: string) => void;
  clearCompareEvents: () => void;
}

type ProgressStore = ProgressState & ProgressActions;

const ANCIENT_EVENT_IDS = SEED_EVENTS
  .filter(e => e.eraId === 'ancient' || e.eraId === 'classical')
  .map(e => e.id);

const MODERN_EVENT_IDS = SEED_EVENTS
  .filter(e => e.eraId === 'modern' || e.eraId === 'industrial')
  .map(e => e.id);

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first-discovery',
    title: 'First Discovery',
    desc: 'Open your first event',
    icon: '\u{1F50D}',
    check: (s) => s.viewedEvents.length >= 1,
  },
  {
    id: 'curious-mind',
    title: 'Curious Mind',
    desc: 'Explore 5 events',
    icon: '\u{1F9E0}',
    check: (s) => s.viewedEvents.length >= 5,
  },
  {
    id: 'well-traveled',
    title: 'Well Traveled',
    desc: 'Explore 10 events',
    icon: '\u{1F5FA}\u{FE0F}',
    check: (s) => s.viewedEvents.length >= 10,
  },
  {
    id: 'historian',
    title: 'Historian',
    desc: 'Explore 20 events',
    icon: '\u{1F4DA}',
    check: (s) => s.viewedEvents.length >= 20,
  },
  {
    id: 'scholar',
    title: 'Scholar',
    desc: 'Explore 30 events',
    icon: '\u{1F9D0}',
    check: (s) => s.viewedEvents.length >= 30,
  },
  {
    id: 'master',
    title: 'Master Historian',
    desc: 'Explore all 45 events',
    icon: '\u{1F3C6}',
    check: (s) => s.viewedEvents.length >= 45,
  },
  {
    id: 'quiz-ace',
    title: 'Quiz Ace',
    desc: 'Score 100% on any quiz',
    icon: '\u{2B50}',
    check: (s) => Object.values(s.quizScores).some(v => v === 100),
  },
  {
    id: 'quiz-veteran',
    title: 'Quiz Veteran',
    desc: 'Complete 10 quizzes',
    icon: '\u{1F3AF}',
    check: (s) => Object.keys(s.quizScores).length >= 10,
  },
  {
    id: 'streak-3',
    title: '3-Day Streak',
    desc: 'Visit 3 days in a row',
    icon: '\u{1F525}',
    check: (s) => s.currentStreak >= 3,
  },
  {
    id: 'streak-7',
    title: 'Week Warrior',
    desc: 'Visit 7 days in a row',
    icon: '\u{1F4AA}',
    check: (s) => s.currentStreak >= 7,
  },
  {
    id: 'ancient-expert',
    title: 'Ancient Expert',
    desc: 'Explore all ancient era events',
    icon: '\u{1F3DB}\u{FE0F}',
    check: (s) => ANCIENT_EVENT_IDS.every(id => s.viewedEvents.includes(id)),
  },
  {
    id: 'modern-expert',
    title: 'Modern Expert',
    desc: 'Explore all modern era events',
    icon: '\u{1F680}',
    check: (s) => MODERN_EVENT_IDS.every(id => s.viewedEvents.includes(id)),
  },
];

function getToday(): string {
  return new Date().toISOString().slice(0, 10);
}

function getYesterday(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().slice(0, 10);
}

export const useProgressStore = create<ProgressStore>()(
  persist(
    (set, get) => ({
      viewedEvents: [],
      quizScores: {},
      unlockedAchievements: [],
      currentStreak: 0,
      lastVisitDate: null,
      favoriteEvents: [],
      eventNotes: {},
      dailyChallengeEventId: null,
      dailyChallengeDate: null,
      dailyChallengeCompleted: false,
      compareEvents: null,

      totalEventsExplored: () => get().viewedEvents.length,

      markEventViewed: (id: string) => {
        const state = get();
        if (state.viewedEvents.includes(id)) return;
        set({ viewedEvents: [...state.viewedEvents, id] });
        get().checkAndUnlockAchievements();
      },

      recordQuizScore: (eventId: string, score: number) => {
        const state = get();
        const existing = state.quizScores[eventId];
        if (existing !== undefined && existing >= score) return;
        set({ quizScores: { ...state.quizScores, [eventId]: score } });
        get().checkAndUnlockAchievements();
      },

      checkAndUnlockAchievements: () => {
        const state = get();
        const newlyUnlocked: string[] = [];

        for (const achievement of ACHIEVEMENTS) {
          if (state.unlockedAchievements.includes(achievement.id)) continue;
          if (achievement.check(state)) {
            newlyUnlocked.push(achievement.id);
          }
        }

        if (newlyUnlocked.length > 0) {
          set({
            unlockedAchievements: [
              ...state.unlockedAchievements,
              ...newlyUnlocked,
            ],
          });
        }

        return newlyUnlocked;
      },

      updateStreak: () => {
        const state = get();
        const today = getToday();
        const yesterday = getYesterday();

        if (state.lastVisitDate === today) return;

        if (state.lastVisitDate === yesterday) {
          set({ currentStreak: state.currentStreak + 1, lastVisitDate: today });
        } else {
          set({ currentStreak: 1, lastVisitDate: today });
        }

        get().checkAndUnlockAchievements();
      },

      toggleFavorite: (id: string) => {
        const state = get();
        const isFav = state.favoriteEvents.includes(id);
        set({
          favoriteEvents: isFav
            ? state.favoriteEvents.filter(fid => fid !== id)
            : [...state.favoriteEvents, id],
        });
      },

      setEventNote: (id: string, note: string) => {
        const state = get();
        if (note.trim() === '') {
          const { [id]: _, ...rest } = state.eventNotes;
          set({ eventNotes: rest });
        } else {
          set({ eventNotes: { ...state.eventNotes, [id]: note } });
        }
      },

      getDailyChallenge: () => {
        const state = get();
        const today = getToday();

        // If date hasn't changed and we already have an event, return it
        if (state.dailyChallengeDate === today && state.dailyChallengeEventId) {
          return state.dailyChallengeEventId;
        }

        // Date changed — reset completion and pick a new event deterministically
        // Simple hash from date string: sum of char codes
        const seed = today.split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
        const eventIds = SEED_EVENTS.map(e => e.id);
        const index = seed % eventIds.length;
        const eventId = eventIds[index]!;

        set({
          dailyChallengeEventId: eventId,
          dailyChallengeDate: today,
          dailyChallengeCompleted: false,
        });

        return eventId;
      },

      completeDailyChallenge: () => {
        set({ dailyChallengeCompleted: true });
      },

      setCompareEvent: (id: string) => {
        const state = get();
        if (!state.compareEvents) {
          set({ compareEvents: [id, ''] as [string, string] });
        } else if (state.compareEvents[1] === '') {
          if (state.compareEvents[0] === id) return;
          set({ compareEvents: [state.compareEvents[0], id] });
        } else {
          // Both slots full — start fresh with this event
          set({ compareEvents: [id, ''] as [string, string] });
        }
      },

      clearCompareEvents: () => {
        set({ compareEvents: null });
      },
    }),
    {
      name: 'time-scroll-progress',
      partialize: (state) => ({
        viewedEvents: state.viewedEvents,
        quizScores: state.quizScores,
        unlockedAchievements: state.unlockedAchievements,
        currentStreak: state.currentStreak,
        lastVisitDate: state.lastVisitDate,
        favoriteEvents: state.favoriteEvents,
        eventNotes: state.eventNotes,
        dailyChallengeEventId: state.dailyChallengeEventId,
        dailyChallengeDate: state.dailyChallengeDate,
        dailyChallengeCompleted: state.dailyChallengeCompleted,
      }),
      version: 1,
      // Coerce every rehydrated field to its expected type. Corrupt or
      // schema-drifted localStorage would otherwise reach achievement checks
      // (.includes / Object.values) at boot and crash the whole app with no
      // recovery path, since this runs above any error boundary.
      merge: (persisted, current) => {
        const p = (persisted ?? {}) as Partial<ProgressState>;
        const arr = (v: unknown): string[] => (Array.isArray(v) ? v.filter((x) => typeof x === 'string') : []);
        const numRec = (v: unknown): Record<string, number> =>
          v && typeof v === 'object' && !Array.isArray(v) ? (v as Record<string, number>) : {};
        const strRec = (v: unknown): Record<string, string> =>
          v && typeof v === 'object' && !Array.isArray(v) ? (v as Record<string, string>) : {};
        return {
          ...current,
          ...p,
          viewedEvents: arr(p.viewedEvents),
          quizScores: numRec(p.quizScores),
          unlockedAchievements: arr(p.unlockedAchievements),
          favoriteEvents: arr(p.favoriteEvents),
          eventNotes: strRec(p.eventNotes),
          currentStreak: typeof p.currentStreak === 'number' ? p.currentStreak : current.currentStreak,
        };
      },
    },
  ),
);
