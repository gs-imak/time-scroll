import { buildCssStyledPin } from './map-helpers';

// Add Cesium to the Window type for TypeScript
// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare global {
  interface Window {
    Cesium: any;
  }
}

const Cesium = window.Cesium;

export interface HistoricalEvent {
  id: string;
  title: string;
  name?: string;
  label?: string;
  year: number;
  period: string;
  description?: string;
  locationId?: string;
  latitude?: number;
  longitude?: number;
  emoji?: string;
  constructionPeriod?: {
    start: number;
    end: number;
  };
}

// Helper to generate a teardrop SVG data URL for event pins
export function getTeardropPinSVG(color: string = '#38bdf8', border: string = '#fff'): string {
  const svg = `<svg width='28' height='40' viewBox='0 0 28 40' fill='none' xmlns='http://www.w3.org/2000/svg'>
    <defs>
      <filter id='shadow' x='-7' y='0' width='42' height='50'>
        <feDropShadow dx='0' dy='2' stdDeviation='2' flood-color='#000' flood-opacity='0.25'/>
      </filter>
    </defs>
    <path d='M14 3C7.7 3 2 9 2 15.5C2 24 14 39 14 39C14 39 26 24 26 15.5C26 9 20.3 3 14 3Z' fill='${color}' stroke='${border}' stroke-width='2' filter='url(#shadow)'/>
    <circle cx='14' cy='16' r='5' fill='#fff' />
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export function addEventMarker(
  cesiumViewer: any,
  event: HistoricalEvent,
  currentGlobalYear: number
) {
  if (!event.latitude || !event.longitude || !cesiumViewer) return;

  const name = event.name || event.title;
  const description = event.description || '';

  // Determine the appropriate label for the Pyramids of Giza based on timeline
  let displayLabel = name;
  if (event.id === 'great-pyramid-construction') {
    if (event.constructionPeriod) {
      const currentYear = currentGlobalYear || event.year;
      if (currentYear >= event.constructionPeriod.start && currentYear <= event.constructionPeriod.end) {
        displayLabel = event.label || 'Construction of the Pyramids of Giza';
      } else if (currentYear > event.constructionPeriod.end) {
        displayLabel = 'Pyramids of Giza';
      }
    }
  }

  // Add a small offset to event markers to prevent overlap with location pins
  const offsetLatitude = event.latitude + 0.02;
  // Use teardrop SVG for event pins
  const pinImage = getTeardropPinSVG();

  const entity = cesiumViewer.entities.add({
    id: `event_${event.id}`,
    name: displayLabel,
    position: Cesium.Cartesian3.fromDegrees(event.longitude, offsetLatitude, 0),
    billboard: {
      image: pinImage,
      scale: 0,
      horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
      verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
      heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
      disableDepthTestDistance: 0,
      color: Cesium.Color.WHITE.withAlpha(0)
    },
    label: {
      text: displayLabel,
      font: '16px Helvetica, Arial, sans-serif',
      fillColor: Cesium.Color.fromCssColorString('#60efff'),
      outlineColor: Cesium.Color.BLACK,
      outlineWidth: 4,
      style: Cesium.LabelStyle.FILL_AND_OUTLINE,
      verticalOrigin: Cesium.VerticalOrigin.TOP,
      pixelOffset: new Cesium.Cartesian2(0, 0),
      showBackground: true,
      backgroundColor: Cesium.Color.fromCssColorString('rgba(0, 30, 60, 0.85)'),
      backgroundPadding: new Cesium.Cartesian2(8, 4),
      horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
      show: false // Hide label by default; will be shown on hover/click
    },
    description: description,
    properties: {
      id: event.id,
      title: displayLabel,
      type: 'event'
    }
  });
  // Animate scale and opacity (same as location pins)
  let start: number | null = null;
  const duration = 400;
  function animatePin(ts: number) {
    if (!start) start = ts;
    const elapsed = ts - start;
    const t = Math.min(elapsed / duration, 1);
    const ease = 1 - Math.pow(1 - t, 3);
    entity.billboard.scale = ease;
    entity.billboard.color = Cesium.Color.WHITE.withAlpha(ease);
    if (entity.label && entity.label.fillColor) {
      entity.label.fillColor = Cesium.Color.fromCssColorString('#60efff').withAlpha(ease);
    }
    if (t < 1) {
      requestAnimationFrame(animatePin);
    } else {
      entity.billboard.scale = 1;
      entity.billboard.color = Cesium.Color.WHITE.withAlpha(1);
      if (entity.label && entity.label.fillColor) {
        entity.label.fillColor = Cesium.Color.fromCssColorString('#60efff').withAlpha(1);
      }
    }
  }
  requestAnimationFrame(animatePin);
} 