import { create } from 'zustand';

export type Theme = 'dark' | 'light';

interface ThemeState {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

function applyTheme(theme: Theme) {
  document.documentElement.setAttribute('data-theme', theme);
  // localStorage can throw (private mode quota, storage partitioning, corrupted
  // storage). This runs at module-eval time, before any error boundary exists,
  // so an unguarded throw would block the whole app from booting.
  try {
    localStorage.setItem('time-scroll-theme', theme);
  } catch {
    /* storage unavailable — theme just won't persist */
  }
}

function getStoredTheme(): Theme {
  try {
    const stored = localStorage.getItem('time-scroll-theme');
    if (stored === 'light' || stored === 'dark') return stored;
  } catch {
    /* storage unavailable — fall back to default */
  }
  return 'dark';
}

// Apply immediately on load (before React mounts) to avoid flash
const initialTheme = getStoredTheme();
applyTheme(initialTheme);

export const useThemeStore = create<ThemeState>((set) => ({
  theme: initialTheme,
  toggleTheme: () => set(state => {
    const next = state.theme === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    return { theme: next };
  }),
  setTheme: (theme: Theme) => {
    applyTheme(theme);
    set({ theme });
  },
}));
