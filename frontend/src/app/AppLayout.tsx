import { Outlet } from 'react-router';
import { Sidebar } from '@/features/navigation/Sidebar';

/**
 * Shared layout with sidebar for Dashboard, Timeline, and Globe pages.
 * The sidebar persists across navigation between these routes.
 */
export function AppLayout() {
  return (
    <div className="relative h-full w-full overflow-hidden bg-void">
      <Sidebar />
      <Outlet />
    </div>
  );
}
