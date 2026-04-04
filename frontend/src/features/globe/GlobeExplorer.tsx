import { useEffect, useRef } from 'react';
import { useParams, useSearchParams } from 'react-router';
import { GlobeView, useGlobe } from './GlobeView';
import { TimelineScrubber } from '@/features/timeline/TimelineScrubber';
import { EraIndicator } from '@/features/timeline/EraIndicator';
import { EventStory } from '@/features/events/EventStory';
import { LandmarkOverlay } from '@/features/landmarks/LandmarkOverlay';
import { ExplorationPanel } from '@/features/exploration/ExplorationPanel';
import { ProgressPanel } from '@/features/exploration/ProgressPanel';
import { Sidebar } from '@/features/navigation/Sidebar';
import { CategoryFilters } from '@/features/exploration/CategoryFilters';
import { SearchOverlay } from '@/features/search/SearchOverlay';
import { LoadingScreen } from '@/features/onboarding/LoadingScreen';
import { OnboardingTour } from '@/features/onboarding/OnboardingTour';
import { AchievementToast } from '@/shared/components/AchievementToast';
import { KeyboardHelp } from '@/features/help/KeyboardHelp';
import { useTimeStore } from '@/shared/stores/timeStore';
import { useEventsStore } from '@/shared/stores/eventsStore';

/** Reads ?event= search param on mount and opens + flies to that event */
function EventUrlHandler() {
  const [searchParams] = useSearchParams();
  const events = useEventsStore(s => s.events);
  const selectEvent = useEventsStore(s => s.selectEvent);
  const { globeRef } = useGlobe();
  const hasHandled = useRef(false);

  useEffect(() => {
    if (hasHandled.current) return;
    const eventParam = searchParams.get('event');
    if (!eventParam) return;

    const target = events.find(e => e.id === eventParam);
    if (!target) return;

    hasHandled.current = true;
    // Delay to let the globe finish initializing
    const timer = setTimeout(() => {
      selectEvent(target.id);
      if (globeRef?.current) {
        globeRef.current.pointOfView(
          { lat: target.latitude, lng: target.longitude, altitude: 0.4 },
          1200,
        );
      }
    }, 800);
    return () => clearTimeout(timer);
  }, [searchParams, events, selectEvent, globeRef]);

  return null;
}

export default function GlobeExplorer() {
  const { year } = useParams();
  const setYear = useTimeStore(s => s.setYear);

  useEffect(() => {
    if (year) setYear(parseInt(year, 10));
  }, [year, setYear]);

  return (
    <div className="relative h-full w-full overflow-hidden bg-void">
      {/* 3D Globe — react-globe.gl with Three.js rendering */}
      <GlobeView>
        <LandmarkOverlay />
        <EventUrlHandler />
      </GlobeView>

      {/* Top cinematic gradient */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 z-10 h-[140px]"
        style={{
          background:
            'linear-gradient(180deg, rgba(8,8,12,0.7) 0%, rgba(8,8,12,0.3) 50%, transparent 100%)',
        }}
        aria-hidden="true"
      />

      {/* Bottom cinematic gradient */}
      <div
        className="pointer-events-none absolute bottom-0 right-0 left-0 lg:left-[64px] z-10 h-[200px]"
        style={{
          background:
            'linear-gradient(0deg, rgba(8,8,12,0.85) 0%, rgba(8,8,12,0.4) 40%, transparent 100%)',
        }}
        aria-hidden="true"
      />

      {/* UI Overlays */}
      <EraIndicator />
      <Sidebar />
      <CategoryFilters />
      <ExplorationPanel />
      <ProgressPanel />
      <EventStory />
      <AchievementToast />
      <SearchOverlay />
      <TimelineScrubber />
      <KeyboardHelp />
      <LoadingScreen />
      <OnboardingTour />
    </div>
  );
}
