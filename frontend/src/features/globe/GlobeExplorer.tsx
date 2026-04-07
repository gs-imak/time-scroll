import { useEffect, useRef } from 'react';
import { useParams } from 'react-router';
import { GlobeView } from './GlobeView';
import { TimelineScrubber } from '@/features/timeline/TimelineScrubber';
import { EraIndicator } from '@/features/timeline/EraIndicator';
import { EventStory } from '@/features/events/EventStory';
import { LandmarkOverlay } from '@/features/landmarks/LandmarkOverlay';
import { ExplorationPanel } from '@/features/exploration/ExplorationPanel';
import { ProgressPanel } from '@/features/exploration/ProgressPanel';
import { CategoryFilters } from '@/features/exploration/CategoryFilters';
import { SearchOverlay } from '@/features/search/SearchOverlay';
import { LoadingScreen } from '@/features/onboarding/LoadingScreen';
import { OnboardingTour } from '@/features/onboarding/OnboardingTour';
import { AchievementToast } from '@/shared/components/AchievementToast';
import { KeyboardHelp } from '@/features/help/KeyboardHelp';
import { ComparisonTool } from '@/features/comparison/ComparisonTool';
import { MonumentViewer } from '@/features/monuments/MonumentViewer';
import { CivLegend } from './CivLegend';
import { SpotlightOverlay } from './SpotlightOverlay';
import { useTimeStore } from '@/shared/stores/timeStore';
import { useEventsStore } from '@/shared/stores/eventsStore';

/** Reads ?event= search param on mount and opens that event.
 *  Lives outside GlobeView so it isn't gated by globe readiness.
 *  Camera fly-to is handled by GlobeView watching selectedEventId.
 *  IMPORTANT: Captures the param in a ref immediately at render time,
 *  because EventStory's URL sync effect strips ?event= when no event is selected. */
function EventUrlHandler() {
  const events = useEventsStore(s => s.events);
  const selectEvent = useEventsStore(s => s.selectEvent);
  // Capture the event param at first render before any effect can strip it
  const initialEventParam = useRef(new URLSearchParams(window.location.search).get('event'));
  const hasHandled = useRef(false);

  useEffect(() => {
    if (hasHandled.current || !initialEventParam.current) return;

    const target = events.find(e => e.id === initialEventParam.current);
    if (!target) return;

    hasHandled.current = true;
    selectEvent(target.id);
  }, [events, selectEvent]);

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
      </GlobeView>
      {/* Must be outside GlobeView so it mounts immediately, not gated by globe readiness */}
      <EventUrlHandler />

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
      <CategoryFilters />
      <ExplorationPanel />
      <ProgressPanel />
      <EventStory />
      <AchievementToast />
      <SearchOverlay />
      <TimelineScrubber />
      <KeyboardHelp />
      <ComparisonTool />
      <LoadingScreen />
      <OnboardingTour />
      <MonumentViewer />
      <CivLegend />
      <SpotlightOverlay />
    </div>
  );
}
