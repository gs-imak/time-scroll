import { buildCssStyledPin } from './map-helpers';

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

export function addEventMarker(
  cesiumViewer: any,
  event: HistoricalEvent,
  currentGlobalYear: number
) {
  if (!event.latitude || !event.longitude || !cesiumViewer) return;

  const name = event.name || event.title;
  const description = event.description || '';
  const emoji = event.emoji || '📍';

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
  const pinCanvas = buildCssStyledPin(emoji);

  const entity = cesiumViewer.entities.add({
    id: `event_${event.id}`,
    name: displayLabel,
    position: window.Cesium.Cartesian3.fromDegrees(event.longitude, offsetLatitude, 0),
    billboard: {
      image: pinCanvas.toDataURL(),
      scale: 0,
      horizontalOrigin: window.Cesium.HorizontalOrigin.CENTER,
      verticalOrigin: window.Cesium.VerticalOrigin.BOTTOM,
      heightReference: window.Cesium.HeightReference.CLAMP_TO_GROUND,
      disableDepthTestDistance: 0,
      color: window.Cesium.Color.WHITE.withAlpha(0)
    },
    label: {
      text: displayLabel,
      font: '16px Helvetica, Arial, sans-serif',
      fillColor: window.Cesium.Color.fromCssColorString('#60efff'),
      outlineColor: window.Cesium.Color.BLACK,
      outlineWidth: 4,
      style: window.Cesium.LabelStyle.FILL_AND_OUTLINE,
      verticalOrigin: window.Cesium.VerticalOrigin.TOP,
      pixelOffset: new window.Cesium.Cartesian2(0, 0),
      showBackground: true,
      backgroundColor: window.Cesium.Color.fromCssColorString('rgba(0, 30, 60, 0.7)'),
      backgroundPadding: new window.Cesium.Cartesian2(8, 4),
      horizontalOrigin: window.Cesium.HorizontalOrigin.CENTER
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
    entity.billboard.color = window.Cesium.Color.WHITE.withAlpha(ease);
    if (entity.label && entity.label.fillColor) {
      entity.label.fillColor = window.Cesium.Color.fromCssColorString('#60efff').withAlpha(ease);
    }
    if (t < 1) {
      requestAnimationFrame(animatePin);
    } else {
      entity.billboard.scale = 1;
      entity.billboard.color = window.Cesium.Color.WHITE.withAlpha(1);
      if (entity.label && entity.label.fillColor) {
        entity.label.fillColor = window.Cesium.Color.fromCssColorString('#60efff').withAlpha(1);
      }
    }
  }
  requestAnimationFrame(animatePin);
} 