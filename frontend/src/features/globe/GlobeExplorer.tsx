import { useEffect } from 'react';
import { useParams } from 'react-router';
import { GlobeView } from './GlobeView';
import { BoundaryLayer } from './BoundaryLayer';
import { TimelineScrubber } from '@/features/timeline/TimelineScrubber';
import { EraIndicator } from '@/features/timeline/EraIndicator';
import { EventMarkers } from '@/features/events/EventMarkers';
import { EventDetailSheet } from '@/features/events/EventDetailSheet';
import { LandmarkOverlay } from '@/features/landmarks/LandmarkOverlay';
import { ExplorationPanel } from '@/features/exploration/ExplorationPanel';
import { Toolbar } from '@/features/exploration/Toolbar';
import { useTimeStore } from '@/shared/stores/timeStore';

export default function GlobeExplorer() {
  const { year } = useParams();
  const setYear = useTimeStore(s => s.setYear);

  useEffect(() => {
    if (year) setYear(parseInt(year, 10));
  }, [year, setYear]);

  return (
    <div className="relative h-full w-full overflow-hidden bg-void">
      {/* 3D Globe — fills entire viewport */}
      <GlobeView>
        <BoundaryLayer />
        <EventMarkers />
        <LandmarkOverlay />
      </GlobeView>

      {/* Top cinematic gradient — gives toolbar and top UI contrast against the globe */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 z-10 h-[140px]"
        style={{
          background:
            'linear-gradient(180deg, rgba(5,10,24,0.7) 0%, rgba(5,10,24,0.3) 50%, transparent 100%)',
        }}
        aria-hidden="true"
      />

      {/* Bottom cinematic gradient — cushion above the timeline scrubber */}
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
      <ExplorationPanel />
      <EventDetailSheet />
      <TimelineScrubber />
    </div>
  );
}
