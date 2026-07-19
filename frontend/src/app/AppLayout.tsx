import { Outlet } from 'react-router';
import { Sidebar } from '@/features/navigation/Sidebar';
import { SearchOverlay } from '@/features/search/SearchOverlay';
import { KeyboardHelp } from '@/features/help/KeyboardHelp';

/**
 * Shared layout with sidebar for Dashboard, Timeline, and Globe pages.
 * The sidebar persists across navigation between these routes.
 * No overflow-hidden here — child pages manage their own scrolling.
 *
 * SearchOverlay and KeyboardHelp mount here so Ctrl+K and ? work on every
 * protected route (Dashboard, Timeline, Journeys, Civilizations, Quiz, etc.).
 */
export function AppLayout() {
  return (
    <div className="relative h-full w-full bg-void">
      <Sidebar />
      <main className="h-full w-full">
        <Outlet />
      </main>
      <SearchOverlay />
      <KeyboardHelp />
    </div>
  );
}
