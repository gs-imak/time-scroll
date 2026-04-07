import { useRef, useState, useEffect, useCallback } from 'react';
import Globe, { type GlobeMethods } from 'react-globe.gl';

/**
 * Lightweight interactive globe — just the Earth with atmosphere.
 * No polygons, no markers, no overlays. Users can spin it around.
 */
export function MiniGlobe() {
  const globeRef = useRef<GlobeMethods | undefined>(undefined);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight,
        });
      }
    };
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  const onReady = useCallback(() => {
    if (!globeRef.current) return;
    globeRef.current.pointOfView({ lat: 20, lng: 30, altitude: 2.2 }, 0);

    const controls = globeRef.current.controls();
    if (controls) {
      controls.autoRotate = true;
      controls.autoRotateSpeed = 0.6;
      controls.enableDamping = true;
      controls.dampingFactor = 0.1;
      controls.enableZoom = false;
    }
  }, []);

  return (
    <div ref={containerRef} className="absolute inset-0">
      {dimensions.width > 0 && (
        <Globe
          ref={globeRef}
          width={dimensions.width}
          height={dimensions.height}
          onGlobeReady={onReady}
          globeImageUrl="/assets/images/earth-8k.jpg"
          bumpImageUrl="/assets/images/earth-bump-8k.png"
          backgroundImageUrl="//unpkg.com/three-globe/example/img/night-sky.png"
          atmosphereColor="#6db3f2"
          atmosphereAltitude={0.18}
          showAtmosphere={true}
        />
      )}
    </div>
  );
}
