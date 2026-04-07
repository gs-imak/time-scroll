import { createBrowserRouter } from 'react-router';
import { lazy, Suspense } from 'react';
import { AppLayout } from './AppLayout';

/**
 * Lazy import with auto-retry on chunk load failure.
 * After a new deploy, old chunk filenames no longer exist on the CDN.
 * If the dynamic import fails, we reload the page once to get the
 * fresh HTML that points to the new chunk filenames.
 */
function lazyRetry(factory: () => Promise<any>) {
  return lazy(() =>
    factory().catch(() => {
      // Only reload once — use sessionStorage flag to prevent infinite loop
      const key = 'chunk-retry';
      if (!sessionStorage.getItem(key)) {
        sessionStorage.setItem(key, '1');
        window.location.reload();
        // Return a never-resolving promise to prevent React error during reload
        return new Promise(() => {});
      }
      sessionStorage.removeItem(key);
      // If we already retried, surface the error
      return factory();
    }),
  );
}

const LandingPage = lazyRetry(() => import('@/features/onboarding/LandingPage'));
const Dashboard = lazyRetry(() => import('@/features/dashboard/Dashboard'));
const GlobeExplorer = lazyRetry(() => import('@/features/globe/GlobeExplorer'));
const TimelineView = lazyRetry(() => import('@/features/timeline/TimelineView'));
const JourneyBrowser = lazyRetry(() => import('@/features/journeys/JourneyBrowser'));
const JourneyPlayer = lazyRetry(() => import('@/features/journeys/JourneyPlayer'));
const QuizHub = lazyRetry(() => import('@/features/quiz/QuizHub'));

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
      {
        path: '/quiz',
        element: (
          <Suspense fallback={<Loading />}>
            <QuizHub />
          </Suspense>
        ),
      },
    ],
  },
]);
