import { create } from 'zustand';

export type Theme = 'dark' | 'light';

interface ThemeState {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

function applyTheme(theme: Theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('time-scroll-theme', theme);
}

function getStoredTheme(): Theme {
  const stored = localStorage.getItem('time-scroll-theme');
  if (stored === 'light' || stored === 'dark') return stored;
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
