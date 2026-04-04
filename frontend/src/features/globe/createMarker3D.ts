import * as THREE from 'three';
import type { EventCategory } from '@/shared/types/events';

const CATEGORY_COLORS: Record<string, number> = {
  war: 0xff4444,
  discovery: 0x00e5ff,
  cultural: 0xffca28,
  political: 0xb388ff,
  construction: 0x69f0ae,
  natural: 0xff8a65,
};

function getColor(category: string): number {
  return CATEGORY_COLORS[category] ?? 0x8b9dc3;
}

function makePillar(hex: number): THREE.Group {
  const group = new THREE.Group();

  // Base ring — glowing disc on the ground
  const ringGeo = new THREE.RingGeometry(0.3, 0.55, 32);
  const ringMat = new THREE.MeshBasicMaterial({
    color: hex,
    transparent: true,
    opacity: 0.35,
    side: THREE.DoubleSide,
  });
  const ring = new THREE.Mesh(ringGeo, ringMat);
  ring.rotation.x = -Math.PI / 2;
  group.add(ring);

  // Pillar shaft
  const shaftGeo = new THREE.CylinderGeometry(0.08, 0.12, 1.2, 8);
  const shaftMat = new THREE.MeshPhongMaterial({
    color: hex,
    emissive: hex,
    emissiveIntensity: 0.3,
    transparent: true,
    opacity: 0.85,
  });
  const shaft = new THREE.Mesh(shaftGeo, shaftMat);
  shaft.position.y = 0.6;
  group.add(shaft);

  // Top orb
  const orbGeo = new THREE.SphereGeometry(0.2, 16, 12);
  const orbMat = new THREE.MeshPhongMaterial({
    color: 0xffffff,
    emissive: hex,
    emissiveIntensity: 0.6,
    transparent: true,
    opacity: 0.95,
  });
  const orb = new THREE.Mesh(orbGeo, orbMat);
  orb.position.y = 1.35;
  group.add(orb);

  // Glow halo around orb
  const glowGeo = new THREE.SphereGeometry(0.35, 16, 12);
  const glowMat = new THREE.MeshBasicMaterial({
    color: hex,
    transparent: true,
    opacity: 0.15,
  });
  const glow = new THREE.Mesh(glowGeo, glowMat);
  glow.position.y = 1.35;
  group.add(glow);

  return group;
}

function makeWarMarker(hex: number): THREE.Group {
  const group = makePillar(hex);

  // Replace orb with crossed swords (two flat triangular blades)
  // Remove the orb and glow (last two children)
  group.remove(group.children[group.children.length - 1]!);
  group.remove(group.children[group.children.length - 1]!);

  const bladeGeo = new THREE.ConeGeometry(0.08, 0.7, 4);
  const bladeMat = new THREE.MeshPhongMaterial({
    color: 0xcccccc,
    emissive: hex,
    emissiveIntensity: 0.4,
    shininess: 100,
  });

  const blade1 = new THREE.Mesh(bladeGeo, bladeMat);
  blade1.position.set(0, 1.4, 0);
  blade1.rotation.z = 0.3;
  group.add(blade1);

  const blade2 = new THREE.Mesh(bladeGeo, bladeMat);
  blade2.position.set(0, 1.4, 0);
  blade2.rotation.z = -0.3;
  group.add(blade2);

  return group;
}

function makeConstructionMarker(hex: number): THREE.Group {
  const group = new THREE.Group();

  // Base ring
  const ringGeo = new THREE.RingGeometry(0.3, 0.55, 32);
  const ringMat = new THREE.MeshBasicMaterial({
    color: hex,
    transparent: true,
    opacity: 0.35,
    side: THREE.DoubleSide,
  });
  const ring = new THREE.Mesh(ringGeo, ringMat);
  ring.rotation.x = -Math.PI / 2;
  group.add(ring);

  // Column with fluted look
  const colGeo = new THREE.CylinderGeometry(0.15, 0.18, 1.4, 8);
  const colMat = new THREE.MeshPhongMaterial({
    color: 0xd4c5a9,
    emissive: hex,
    emissiveIntensity: 0.2,
  });
  const col = new THREE.Mesh(colGeo, colMat);
  col.position.y = 0.7;
  group.add(col);

  // Capital (top block)
  const capGeo = new THREE.BoxGeometry(0.35, 0.12, 0.35);
  const cap = new THREE.Mesh(capGeo, colMat);
  cap.position.y = 1.46;
  group.add(cap);

  // Glow
  const glowGeo = new THREE.SphereGeometry(0.4, 12, 8);
  const glowMat = new THREE.MeshBasicMaterial({
    color: hex,
    transparent: true,
    opacity: 0.12,
  });
  const glow = new THREE.Mesh(glowGeo, glowMat);
  glow.position.y = 1.0;
  group.add(glow);

  return group;
}

function makeDiscoveryMarker(hex: number): THREE.Group {
  const group = makePillar(hex);

  // Replace orb with a diamond/crystal shape
  group.remove(group.children[group.children.length - 1]!); // glow
  group.remove(group.children[group.children.length - 1]!); // orb

  const diamondGeo = new THREE.OctahedronGeometry(0.22, 0);
  const diamondMat = new THREE.MeshPhongMaterial({
    color: hex,
    emissive: hex,
    emissiveIntensity: 0.5,
    transparent: true,
    opacity: 0.9,
  });
  const diamond = new THREE.Mesh(diamondGeo, diamondMat);
  diamond.position.y = 1.4;
  diamond.rotation.y = Math.PI / 4;
  group.add(diamond);

  // Glow
  const glowGeo = new THREE.SphereGeometry(0.35, 12, 8);
  const glowMat = new THREE.MeshBasicMaterial({
    color: hex,
    transparent: true,
    opacity: 0.15,
  });
  const glow = new THREE.Mesh(glowGeo, glowMat);
  glow.position.y = 1.4;
  group.add(glow);

  return group;
}

function makeNaturalMarker(hex: number): THREE.Group {
  const group = new THREE.Group();

  // Base ring
  const ringGeo = new THREE.RingGeometry(0.3, 0.55, 32);
  const ringMat = new THREE.MeshBasicMaterial({
    color: hex,
    transparent: true,
    opacity: 0.35,
    side: THREE.DoubleSide,
  });
  const ring = new THREE.Mesh(ringGeo, ringMat);
  ring.rotation.x = -Math.PI / 2;
  group.add(ring);

  // Volcano cone
  const coneGeo = new THREE.ConeGeometry(0.3, 1.2, 6);
  const coneMat = new THREE.MeshPhongMaterial({
    color: 0x8b4513,
    emissive: hex,
    emissiveIntensity: 0.3,
  });
  const cone = new THREE.Mesh(coneGeo, coneMat);
  cone.position.y = 0.6;
  group.add(cone);

  // Lava glow at top
  const lavaGeo = new THREE.SphereGeometry(0.15, 12, 8);
  const lavaMat = new THREE.MeshBasicMaterial({
    color: hex,
    transparent: true,
    opacity: 0.7,
  });
  const lava = new THREE.Mesh(lavaGeo, lavaMat);
  lava.position.y = 1.25;
  group.add(lava);

  return group;
}

function makePoliticalMarker(hex: number): THREE.Group {
  const group = makePillar(hex);

  // Replace orb with a star/crown shape
  group.remove(group.children[group.children.length - 1]!); // glow
  group.remove(group.children[group.children.length - 1]!); // orb

  // Star shape using tetrahedron
  const starGeo = new THREE.TetrahedronGeometry(0.22, 0);
  const starMat = new THREE.MeshPhongMaterial({
    color: hex,
    emissive: hex,
    emissiveIntensity: 0.5,
    transparent: true,
    opacity: 0.9,
  });
  const star = new THREE.Mesh(starGeo, starMat);
  star.position.y = 1.4;
  group.add(star);

  // Glow
  const glowGeo = new THREE.SphereGeometry(0.35, 12, 8);
  const glowMat = new THREE.MeshBasicMaterial({
    color: hex,
    transparent: true,
    opacity: 0.15,
  });
  const glow = new THREE.Mesh(glowGeo, glowMat);
  glow.position.y = 1.4;
  group.add(glow);

  return group;
}

function makeCulturalMarker(hex: number): THREE.Group {
  const group = makePillar(hex);

  // Replace orb with a torus (ring/wreath shape)
  group.remove(group.children[group.children.length - 1]!); // glow
  group.remove(group.children[group.children.length - 1]!); // orb

  const torusGeo = new THREE.TorusGeometry(0.18, 0.06, 8, 16);
  const torusMat = new THREE.MeshPhongMaterial({
    color: hex,
    emissive: hex,
    emissiveIntensity: 0.5,
  });
  const torus = new THREE.Mesh(torusGeo, torusMat);
  torus.position.y = 1.4;
  torus.rotation.x = Math.PI / 6;
  group.add(torus);

  // Glow
  const glowGeo = new THREE.SphereGeometry(0.35, 12, 8);
  const glowMat = new THREE.MeshBasicMaterial({
    color: hex,
    transparent: true,
    opacity: 0.15,
  });
  const glow = new THREE.Mesh(glowGeo, glowMat);
  glow.position.y = 1.4;
  group.add(glow);

  return group;
}

/**
 * Create a 3D marker for an event based on its category.
 * Returns a Three.js Group that can be placed via objectsData.
 */
export function createMarker3D(category: EventCategory | string): THREE.Object3D {
  const hex = getColor(category);

  let marker: THREE.Group;

  switch (category) {
    case 'war':
      marker = makeWarMarker(hex);
      break;
    case 'construction':
      marker = makeConstructionMarker(hex);
      break;
    case 'discovery':
      marker = makeDiscoveryMarker(hex);
      break;
    case 'natural':
      marker = makeNaturalMarker(hex);
      break;
    case 'political':
      marker = makePoliticalMarker(hex);
      break;
    case 'cultural':
      marker = makeCulturalMarker(hex);
      break;
    default:
      marker = makePillar(hex);
  }

  // Scale to globe-appropriate size
  marker.scale.setScalar(0.6);

  return marker;
}
