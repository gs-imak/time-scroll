import { createBrowserRouter } from 'react-router';
import { lazy, Suspense, Component, type ReactNode } from 'react';
import { AppLayout } from './AppLayout';

/**
 * Lazy import with auto-retry on chunk load failure.
 * Uses a per-module key so each route gets its own retry chance,
 * and clears the flag after 10 seconds so future failures also retry.
 */
function lazyRetry(factory: () => Promise<any>, name: string) {
  return lazy(() =>
    factory().catch(() => {
      const key = `chunk-retry-${name}`;
      if (!sessionStorage.getItem(key)) {
        sessionStorage.setItem(key, '1');
        // Clear flag after 10s so future deploy failures also auto-retry
        setTimeout(() => sessionStorage.removeItem(key), 10000);
        window.location.reload();
        return new Promise(() => {});
      }
      sessionStorage.removeItem(key);
      return factory();
    }),
  );
}

/**
 * Error boundary that catches chunk load failures and shows a
 * friendly reload button instead of the ugly default error.
 */
class ChunkErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    if (
      error.message?.includes('Failed to fetch dynamically imported module') ||
      error.message?.includes('Loading chunk') ||
      error.message?.includes('Loading CSS chunk')
    ) {
      return { hasError: true };
    }
    throw error;
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center h-screen bg-void text-text-primary gap-4">
          <p className="text-text-secondary text-[14px]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            A new version is available
          </p>
          <button
            onClick={() => {
              // Clear all retry flags and reload
              for (let i = 0; i < sessionStorage.length; i++) {
                const key = sessionStorage.key(i);
                if (key?.startsWith('chunk-retry-')) sessionStorage.removeItem(key);
              }
              window.location.reload();
            }}
            className="px-6 py-3 rounded-xl text-[14px] font-semibold cursor-pointer"
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              background: 'linear-gradient(135deg, #c49a44 0%, #a07830 100%)',
              color: '#08080c',
            }}
          >
            Refresh to update
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

const LandingPage = lazyRetry(() => import('@/features/onboarding/LandingPage'), 'landing');
const LoginPage = lazyRetry(() => import('@/features/auth/LoginPage'), 'login');
const Dashboard = lazyRetry(() => import('@/features/dashboard/Dashboard'), 'dashboard');
const GlobeExplorer = lazyRetry(() => import('@/features/globe/GlobeExplorer'), 'globe');
const TimelineView = lazyRetry(() => import('@/features/timeline/TimelineView'), 'timeline');
const JourneyBrowser = lazyRetry(() => import('@/features/journeys/JourneyBrowser'), 'journeys');
const JourneyPlayer = lazyRetry(() => import('@/features/journeys/JourneyPlayer'), 'journey-player');
const QuizHub = lazyRetry(() => import('@/features/quiz/QuizHub'), 'quiz');

function Loading() {
  return (
    <div className="flex items-center justify-center h-full bg-void">
      <div className="w-8 h-8 border-2 border-accent-cyan/30 border-t-accent-cyan rounded-full animate-spin" />
    </div>
  );
}

function withBoundary(element: ReactNode) {
  return (
    <ChunkErrorBoundary>
      <Suspense fallback={<Loading />}>
        {element}
      </Suspense>
    </ChunkErrorBoundary>
  );
}

export const router = createBrowserRouter([
  {
    path: '/',
    element: withBoundary(<LandingPage />),
  },
  {
    path: '/login',
    element: withBoundary(<LoginPage />),
  },
  {
    element: <AppLayout />,
    children: [
      { path: '/dashboard', element: withBoundary(<Dashboard />) },
      { path: '/timeline', element: withBoundary(<TimelineView />) },
      { path: '/explore/:year?/:locationId?', element: withBoundary(<GlobeExplorer />) },
      { path: '/journeys', element: withBoundary(<JourneyBrowser />) },
      { path: '/journeys/:journeyId', element: withBoundary(<JourneyPlayer />) },
      { path: '/quiz', element: withBoundary(<QuizHub />) },
    ],
  },
]);
