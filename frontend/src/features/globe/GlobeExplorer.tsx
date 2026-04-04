import { useEffect } from 'react';
import { useParams } from 'react-router';
import { GlobeView } from './GlobeView';
import { TimelineScrubber } from '@/features/timeline/TimelineScrubber';
import { EraIndicator } from '@/features/timeline/EraIndicator';
import { EventStory } from '@/features/events/EventStory';
import { LandmarkOverlay } from '@/features/landmarks/LandmarkOverlay';
import { ExplorationPanel } from '@/features/exploration/ExplorationPanel';
import { Toolbar } from '@/features/exploration/Toolbar';
import { CategoryFilters } from '@/features/exploration/CategoryFilters';
import { SearchOverlay } from '@/features/search/SearchOverlay';
import { LoadingScreen } from '@/features/onboarding/LoadingScreen';
import { useTimeStore } from '@/shared/stores/timeStore';

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

      {/* Top cinematic gradient */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 z-10 h-[140px]"
        style={{
          background:
            'linear-gradient(180deg, rgba(5,10,24,0.7) 0%, rgba(5,10,24,0.3) 50%, transparent 100%)',
        }}
        aria-hidden="true"
      />

      {/* Bottom cinematic gradient */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-[200px]"
        style={{
          background:
            'linear-gradient(0deg, rgba(5,10,24,0.85) 0%, rgba(5,10,24,0.4) 40%, transparent 100%)',
        }}
        aria-hidden="true"
      />

      {/* UI Overlays */}
      <EraIndicator />
      <Toolbar />
      <CategoryFilters />
      <ExplorationPanel />
      <EventStory />
      <SearchOverlay />
      <TimelineScrubber />
      <LoadingScreen />
    </div>
  );
}
