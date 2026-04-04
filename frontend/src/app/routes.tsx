import { createBrowserRouter } from 'react-router';
import { lazy, Suspense } from 'react';
import { AppLayout } from './AppLayout';

const LandingPage = lazy(() => import('@/features/onboarding/LandingPage'));
const Dashboard = lazy(() => import('@/features/dashboard/Dashboard'));
const GlobeExplorer = lazy(() => import('@/features/globe/GlobeExplorer'));
const TimelineView = lazy(() => import('@/features/timeline/TimelineView'));
const JourneyBrowser = lazy(() => import('@/features/journeys/JourneyBrowser'));
const JourneyPlayer = lazy(() => import('@/features/journeys/JourneyPlayer'));

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
    // Shared layout with sidebar for all app pages
    element: <AppLayout />,
    children: [
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
      {
        path: '/journeys',
        element: (
          <Suspense fallback={<Loading />}>
            <JourneyBrowser />
          </Suspense>
        ),
      },
      {
        path: '/journeys/:journeyId',
        element: (
          <Suspense fallback={<Loading />}>
            <JourneyPlayer />
          </Suspense>
        ),
      },
    ],
  },
]);
