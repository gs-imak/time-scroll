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
      <GlobeView>
        <BoundaryLayer />
        <EventMarkers />
        <LandmarkOverlay />
      </GlobeView>

      <EraIndicator />
      <Toolbar />
      <ExplorationPanel />
      <EventDetailSheet />
      <TimelineScrubber />
    </div>
  );
}
