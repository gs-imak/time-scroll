import { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import { useMap } from '@/features/globe/GlobeView';
import { useTimeStore } from '@/shared/stores/timeStore';
import { useEventsStore } from '@/shared/stores/eventsStore';

const CATEGORY_COLORS: Record<string, string> = {
  war: '#ef4444',
  discovery: '#06b6d4',
  cultural: '#a855f7',
  political: '#f59e0b',
  construction: '#65a30d',
  natural: '#78716c',
};

export function EventMarkers() {
  const { map } = useMap();
  const currentYear = useTimeStore(s => s.currentYear);
  const getVisibleEvents = useEventsStore(s => s.getVisibleEvents);
  const selectEvent = useEventsStore(s => s.selectEvent);
  const markersRef = useRef<mapboxgl.Marker[]>([]);

  useEffect(() => {
    if (!map) return;

    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];

    const events = getVisibleEvents(currentYear);

    events.forEach(event => {
      const el = document.createElement('div');
      el.className = 'event-marker';
      const color = CATEGORY_COLORS[event.category] ?? '#94a3b8';

      el.innerHTML = `
        <div style="
          width: 12px; height: 12px;
          background: ${color};
          border: 2px solid rgba(255,255,255,0.8);
          border-radius: 50%;
          cursor: pointer;
          box-shadow: 0 0 8px ${color}80;
          transition: transform 0.2s, box-shadow 0.2s;
        "></div>
      `;

      el.addEventListener('mouseenter', () => {
        const dot = el.firstElementChild as HTMLElement;
        if (dot) {
          dot.style.transform = 'scale(1.5)';
          dot.style.boxShadow = `0 0 16px ${color}`;
        }
      });
      el.addEventListener('mouseleave', () => {
        const dot = el.firstElementChild as HTMLElement;
        if (dot) {
          dot.style.transform = 'scale(1)';
          dot.style.boxShadow = `0 0 8px ${color}80`;
        }
      });
      el.addEventListener('click', () => selectEvent(event.id));

      const marker = new mapboxgl.Marker({ element: el, anchor: 'center' })
        .setLngLat([event.longitude, event.latitude])
        .addTo(map);

      markersRef.current.push(marker);
    });

    return () => {
      markersRef.current.forEach(m => m.remove());
      markersRef.current = [];
    };
  }, [map, currentYear, getVisibleEvents, selectEvent]);

  return null;
}
