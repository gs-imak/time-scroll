// Map helper utilities for Cesium

export interface Location {
  id: string;
  name: string;
  longitude: number;
  latitude: number;
  height: number;
  emoji: string;
  category: string;
}

export function buildCssStyledPin(emoji: string): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = 32;
  canvas.height = 48;
  const context = canvas.getContext('2d');
  if (context) {
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.save();
    context.translate(16, 12);
    context.beginPath();
    context.arc(0, 0, 8, 0, Math.PI, true);
    context.lineTo(-8, 8);
    context.lineTo(0, 22);
    context.lineTo(8, 8);
    context.closePath();
    context.fillStyle = '#38bdf8';
    context.fill();
    context.beginPath();
    context.arc(0, 0, 4, 0, 2 * Math.PI, false);
    context.fillStyle = '#FFFFFF';
    context.fill();
    context.restore();
  }
  return canvas;
}

export function addLocationPins(cesiumViewer: any, locations: Location[], currentGlobalPeriod?: { id: string }) {
  if (!cesiumViewer) return;
  if (currentGlobalPeriod && currentGlobalPeriod.id === 'prehistory') return;
  locations.forEach(location => {
    const pinCanvas = buildCssStyledPin(location.emoji);
    const entity = cesiumViewer.entities.add({
      id: `location_pin_${location.id}`,
      name: location.name,
      position: window.Cesium.Cartesian3.fromDegrees(location.longitude, location.latitude, 0),
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
        text: location.name,
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
      }
    });
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
  });
}

export function removeLocationPins(cesiumViewer: any) {
  if (!cesiumViewer) return;
  const entities = cesiumViewer.entities.values;
  for (let i = entities.length - 1; i >= 0; i--) {
    const entity = entities[i];
    if (entity && entity.id && entity.id.toString().startsWith('location_pin_')) {
      cesiumViewer.entities.remove(entity);
    }
  }
}

export function flyToLocation(cesiumViewer: any, longitude: number, latitude: number, height: number, name: string) {
  if (!cesiumViewer) return;
  try {
    cesiumViewer.scene.requestRender();
    const destination = window.Cesium.Cartesian3.fromDegrees(longitude, latitude, height);
    cesiumViewer.camera.flyTo({
      destination,
      orientation: {
        heading: window.Cesium.Math.toRadians(0.0),
        pitch: window.Cesium.Math.toRadians(-85.0),
        roll: 0.0,
      },
      duration: 2,
      maximumHeight: 5000000,
      pitchAdjustHeight: 0,
      complete: function() {
        cesiumViewer.scene.requestRender();
      }
    });
  } catch (error) {
    console.error(`Error flying to ${name}:`, error);
  }
} 