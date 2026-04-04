import { create } from 'zustand';
import type { HistoricalEvent } from '@/shared/types/events';

interface MonumentViewerState {
  isOpen: boolean;
  event: HistoricalEvent | null;
  open: (event: HistoricalEvent) => void;
  close: () => void;
}

export const useMonumentViewer = create<MonumentViewerState>((set) => ({
  isOpen: false,
  event: null,
  open: (event) => set({ isOpen: true, event }),
  close: () => set({ isOpen: false, event: null }),
}));
