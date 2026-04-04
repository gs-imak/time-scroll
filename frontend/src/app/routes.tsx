import { createBrowserRouter } from 'react-router';
import { lazy, Suspense } from 'react';

const LandingPage = lazy(() => import('@/features/onboarding/LandingPage'));
const Dashboard = lazy(() => import('@/features/dashboard/Dashboard'));
const GlobeExplorer = lazy(() => import('@/features/globe/GlobeExplorer'));
const TimelineView = lazy(() => import('@/features/timeline/TimelineView'));

function Loading() {
  return (
    <div className="flex items-center justify-center h-full bg-void">
      <div className="w-8 h-8 border-2 border-accent-cyan/30 border-t-accent-cyan rounded-full animate-spin" />
    </div>
  );
}

export const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <Suspense fallback={<Loading />}>
        <LandingPage />
      </Suspense>
    ),
  },
  {
    path: '/dashboard',
    element: (
      <Suspense fallback={<Loading />}>
        <Dashboard />
      </Suspense>
    ),
  },
  {
    path: '/timeline',
    element: (
      <Suspense fallback={<Loading />}>
        <TimelineView />
      </Suspense>
    ),
  },
  {
    path: '/explore/:year?/:locationId?',
    element: (
      <Suspense fallback={<Loading />}>
        <GlobeExplorer />
      </Suspense>
    ),
  },
]);
