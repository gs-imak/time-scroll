import { useEffect, useRef } from 'react';
import { useRive } from '@rive-app/react-webgl2';
import { useGlobe } from '@/features/globe/GlobeView';
import { useTimeStore } from '@/shared/stores/timeStore';
import { useLandmarkStore } from '@/shared/stores/landmarkStore';
import { useMapStore } from '@/shared/stores/mapStore';
import type { LandmarkTimePeriod } from '@/shared/types/landmarks';

interface LandmarkInstanceProps {
  latitude: number;
  longitude: number;
  period: LandmarkTimePeriod;
}

function LandmarkInstance({ latitude, longitude, period }: LandmarkInstanceProps) {
  const { getScreenCoords } = useGlobe();
  const containerRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>(0);

  const { RiveComponent } = useRive({
    src: period.riveFile,
    autoplay: true,
  });

  // Position tracking via rAF using globe's getScreenCoords
  useEffect(() => {
    if (!containerRef.current) return;
    let active = true;

    const update = () => {
      if (!active || !containerRef.current) return;

      const coords = getScreenCoords(latitude, longitude);
      if (!coords) {
        containerRef.current.style.opacity = '0';
        rafRef.current = requestAnimationFrame(update);
        return;
      }

      const { x, y } = coords;
      const w = window.innerWidth;
      const h = window.innerHeight;

      if (x < -200 || y < -200 || x > w + 200 || y > h + 200) {
        containerRef.current.style.opacity = '0';
      } else {
        containerRef.current.style.transform = `translate(${x - 160}px, ${y - 200}px)`;
        containerRef.current.style.opacity = '1';
      }

      rafRef.current = requestAnimationFrame(update);
    };

    rafRef.current = requestAnimationFrame(update);
    return () => {
      active = false;
      cancelAnimationFrame(rafRef.current);
    };
  }, [getScreenCoords, latitude, longitude]);

  return (
    <div
      ref={containerRef}
      className="absolute top-0 left-0 pointer-events-auto cursor-pointer"
      style={{ width: 320, height: 360, opacity: 0, transition: 'opacity 0.3s', zIndex: 30 }}
    >
      <RiveComponent style={{ width: '100%', height: '100%' }} />
      <div className="text-center -mt-2">
        <span className="text-xs font-medium text-text-primary px-2 py-0.5 rounded-full glass">
          {period.label}
        </span>
      </div>
    </div>
  );
}

export function LandmarkOverlay() {
  const currentYear = useTimeStore(s => s.currentYear);
  const viewport = useMapStore(s => s.viewport);
  const getLandmarkVisibility = useLandmarkStore(s => s.getLandmarkVisibility);

  const landmarks = getLandmarkVisibility(
    currentYear,
    viewport.zoom,
    viewport.center[1],
    viewport.center[0]
  );

  const visible = landmarks.filter(l => l.visible && l.currentPeriod);

  return (
    <>
      {visible.map(({ landmark, currentPeriod }) => (
        <LandmarkInstance
          key={`${landmark.id}-${currentPeriod!.name}`}
          latitude={landmark.latitude}
          longitude={landmark.longitude}
          period={currentPeriod!}
        />
      ))}
    </>
  );
}
