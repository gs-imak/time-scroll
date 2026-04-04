import { create } from 'zustand';

type Panel = 'none' | 'events' | 'exploration' | 'settings' | 'progress';

interface UIStore {
  activePanel: Panel;
  isMobile: boolean;

  setActivePanel: (panel: Panel) => void;
  togglePanel: (panel: Panel) => void;
  setMobile: (isMobile: boolean) => void;
}

export const useUIStore = create<UIStore>((set, get) => ({
  activePanel: 'none',
  isMobile: typeof window !== 'undefined' ? window.innerWidth <= 768 : false,

  setActivePanel: (panel) => set({ activePanel: panel }),
  togglePanel: (panel) => {
    const current = get().activePanel;
    set({ activePanel: current === panel ? 'none' : panel });
  },
  setMobile: (isMobile) => set({ isMobile }),
}));
