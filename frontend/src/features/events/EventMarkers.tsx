import { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import { useMap } from '@/features/globe/GlobeView';
import { useTimeStore } from '@/shared/stores/timeStore';
import { useEventsStore } from '@/shared/stores/eventsStore';
import { formatYear } from '@/shared/utils/format';

const CATEGORY_CONFIG: Record<string, { color: string; icon: string; label: string }> = {
  war:          { color: '#ff4444', icon: '⚔',  label: 'War' },
  discovery:    { color: '#00e5ff', icon: '🔭', label: 'Discovery' },
  cultural:     { color: '#ffca28', icon: '🎭', label: 'Cultural' },
  political:    { color: '#b388ff', icon: '👑', label: 'Political' },
  construction: { color: '#69f0ae', icon: '🏛', label: 'Construction' },
  natural:      { color: '#ff8a65', icon: '🌋', label: 'Natural' },
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

    events.forEach((event, i) => {
      const cat = CATEGORY_CONFIG[event.category] ?? { color: '#8b9dc3', icon: '●', label: 'Event' };

      const el = document.createElement('div');
      el.className = 'event-marker-dot';
      el.style.cssText = `
        color: ${cat.color};
        animation: marker-enter 0.5s var(--ease-spring) ${i * 30}ms both;
      `;

      // Inner ring + icon
      el.innerHTML = `
        <div style="
          position: relative;
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
        ">
          <div style="
            position: absolute;
            inset: 0;
            border-radius: 50%;
            background: radial-gradient(circle, ${cat.color}30 0%, ${cat.color}08 60%, transparent 70%);
            box-shadow: 0 0 12px ${cat.color}40;
          "></div>
          <div style="
            position: relative;
            width: 24px;
            height: 24px;
            border-radius: 50%;
            background: ${cat.color}20;
            border: 2px solid ${cat.color};
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 11px;
            line-height: 1;
            box-shadow: 0 0 8px ${cat.color}60, inset 0 0 6px ${cat.color}15;
          ">${cat.icon}</div>
        </div>

        <div class="event-marker-tooltip">
          <div style="
            background: rgba(12, 20, 37, 0.92);
            backdrop-filter: blur(16px);
            border: 1px solid ${cat.color}40;
            border-radius: 10px;
            padding: 8px 12px;
            box-shadow: 0 8px 24px rgba(0,0,0,0.5), 0 0 12px ${cat.color}20;
            max-width: 220px;
          ">
            <div style="
              display: flex;
              align-items: center;
              gap: 6px;
              margin-bottom: 3px;
            ">
              <span style="
                font-size: 9px;
                font-weight: 600;
                text-transform: uppercase;
                letter-spacing: 0.05em;
                color: ${cat.color};
              ">${cat.label}</span>
              <span style="
                font-size: 9px;
                color: #5a6d8a;
              ">${formatYear(event.year)}</span>
            </div>
            <div style="
              font-size: 12px;
              font-weight: 600;
              color: #eef2f7;
              line-height: 1.3;
              font-family: 'Inter', system-ui, sans-serif;
            ">${event.title}</div>
          </div>
          <div style="
            width: 8px;
            height: 8px;
            background: rgba(12, 20, 37, 0.92);
            border-right: 1px solid ${cat.color}40;
            border-bottom: 1px solid ${cat.color}40;
            transform: rotate(45deg);
            margin: -5px auto 0;
          "></div>
        </div>
      `;

      el.addEventListener('click', (e) => {
        e.stopPropagation();
        selectEvent(event.id);
      });

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
