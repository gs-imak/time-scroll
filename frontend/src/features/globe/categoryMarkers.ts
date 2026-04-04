import * as THREE from 'three';

/**
 * Category-specific 3D marker factories.
 * Each returns a THREE.Group positioned with local Y = up (away from globe).
 * POC: war, construction, political have unique models.
 * Others get a fallback glowing orb.
 */

// ── War: Crossed Swords ────────────────────────────────────────────
function createWarModel(color: THREE.Color): THREE.Group {
  const group = new THREE.Group();

  const bladeMat = new THREE.MeshPhongMaterial({
    color: 0xc8ccd0,
    emissive: color,
    emissiveIntensity: 0.25,
    shininess: 120,
    specular: new THREE.Color(0x888888),
  });
  const handleMat = new THREE.MeshPhongMaterial({
    color: 0x7c3f15,
    shininess: 20,
  });

  function makeSword(): THREE.Group {
    const sword = new THREE.Group();

    // Blade
    const blade = new THREE.Mesh(new THREE.BoxGeometry(0.35, 5, 0.08), bladeMat);
    blade.position.y = 2.5;
    sword.add(blade);

    // Tip
    const tip = new THREE.Mesh(new THREE.ConeGeometry(0.18, 0.9, 4), bladeMat);
    tip.position.y = 5.45;
    sword.add(tip);

    // Guard crosspiece
    const guard = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.25, 0.2), bladeMat);
    sword.add(guard);

    // Handle
    const handle = new THREE.Mesh(
      new THREE.CylinderGeometry(0.12, 0.14, 1.3, 6),
      handleMat,
    );
    handle.position.y = -0.75;
    sword.add(handle);

    // Pommel
    const pommel = new THREE.Mesh(new THREE.SphereGeometry(0.22, 8, 6), bladeMat);
    pommel.position.y = -1.5;
    sword.add(pommel);

    return sword;
  }

  const sword1 = makeSword();
  sword1.rotation.z = Math.PI / 5;
  group.add(sword1);

  const sword2 = makeSword();
  sword2.rotation.z = -Math.PI / 5;
  group.add(sword2);

  return group;
}

// ── Construction: Mini Temple ──────────────────────────────────────
function createConstructionModel(color: THREE.Color): THREE.Group {
  const group = new THREE.Group();

  const stoneMat = new THREE.MeshPhongMaterial({
    color: 0xe8e0d0,
    emissive: color,
    emissiveIntensity: 0.15,
    shininess: 15,
  });
  const roofMat = new THREE.MeshPhongMaterial({
    color: 0xd4c4a8,
    emissive: color,
    emissiveIntensity: 0.2,
    shininess: 10,
  });

  // Base step
  const base = new THREE.Mesh(new THREE.BoxGeometry(4.2, 0.35, 2.8), stoneMat);
  base.position.y = 0.175;
  group.add(base);

  // 4 columns
  const colGeo = new THREE.CylinderGeometry(0.22, 0.28, 3.8, 8);
  const colPositions: [number, number][] = [
    [-1.4, -1],
    [1.4, -1],
    [-1.4, 1],
    [1.4, 1],
  ];
  for (const [x, z] of colPositions) {
    const col = new THREE.Mesh(colGeo, stoneMat);
    col.position.set(x, 2.25, z);
    group.add(col);
  }

  // Architrave (lintel beam)
  const lintel = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.3, 2.6), stoneMat);
  lintel.position.y = 4.3;
  group.add(lintel);

  // Triangular pediment (roof)
  const roofShape = new THREE.Shape();
  roofShape.moveTo(-2.1, 0);
  roofShape.lineTo(2.1, 0);
  roofShape.lineTo(0, 1.4);
  roofShape.closePath();

  const roofGeo = new THREE.ExtrudeGeometry(roofShape, {
    depth: 2.8,
    bevelEnabled: false,
  });
  const roof = new THREE.Mesh(roofGeo, roofMat);
  roof.position.set(0, 4.45, -1.4);
  group.add(roof);

  return group;
}

// ── Political: Crown ───────────────────────────────────────────────
function createPoliticalModel(color: THREE.Color): THREE.Group {
  const group = new THREE.Group();

  const goldMat = new THREE.MeshPhongMaterial({
    color: 0xffd700,
    emissive: new THREE.Color(0xcc8800),
    emissiveIntensity: 0.35,
    shininess: 100,
    specular: new THREE.Color(0xffcc00),
  });
  const gemMat = new THREE.MeshPhongMaterial({
    color,
    emissive: color,
    emissiveIntensity: 0.8,
    shininess: 150,
    transparent: true,
    opacity: 0.9,
  });

  // Crown band (open cylinder)
  const band = new THREE.Mesh(
    new THREE.CylinderGeometry(1.6, 1.5, 1.4, 24, 1, true),
    goldMat,
  );
  band.position.y = 0.7;
  group.add(band);

  // Bottom rim
  const rim = new THREE.Mesh(new THREE.TorusGeometry(1.5, 0.15, 8, 24), goldMat);
  rim.rotation.x = Math.PI / 2;
  rim.position.y = 0.05;
  group.add(rim);

  // 5 points + gems
  const pointCount = 5;
  for (let i = 0; i < pointCount; i++) {
    const angle = (i / pointCount) * Math.PI * 2;
    const px = Math.sin(angle) * 1.5;
    const pz = Math.cos(angle) * 1.5;

    // Point
    const point = new THREE.Mesh(new THREE.ConeGeometry(0.4, 1.8, 4), goldMat);
    point.position.set(px, 2.3, pz);
    group.add(point);

    // Gem on band face
    const gem = new THREE.Mesh(new THREE.OctahedronGeometry(0.28, 0), gemMat);
    gem.position.set(Math.sin(angle) * 1.55, 0.7, Math.cos(angle) * 1.55);
    group.add(gem);
  }

  return group;
}

// ── Fallback: Glowing Orb ──────────────────────────────────────────
function createFallbackModel(color: THREE.Color): THREE.Group {
  const group = new THREE.Group();

  // Core sphere
  const core = new THREE.Mesh(
    new THREE.SphereGeometry(1.5, 16, 12),
    new THREE.MeshPhongMaterial({
      color,
      emissive: color,
      emissiveIntensity: 0.6,
      transparent: true,
      opacity: 0.9,
      shininess: 80,
    }),
  );
  group.add(core);

  // Outer glow halo
  const halo = new THREE.Mesh(
    new THREE.SphereGeometry(2.5, 12, 8),
    new THREE.MeshBasicMaterial({
      color,
      transparent: true,
      opacity: 0.08,
      depthWrite: false,
    }),
  );
  group.add(halo);

  return group;
}

// ── Base Platform (shared by all markers) ──────────────────────────
function createBaseDisc(color: THREE.Color): THREE.Group {
  const base = new THREE.Group();

  // Inner glow disc
  const discGeo = new THREE.CircleGeometry(2.8, 32);
  const discMat = new THREE.MeshBasicMaterial({
    color,
    transparent: true,
    opacity: 0.15,
    side: THREE.DoubleSide,
    depthWrite: false,
  });
  const disc = new THREE.Mesh(discGeo, discMat);
  disc.rotation.x = -Math.PI / 2;
  base.add(disc);

  // Outer ring
  const ringGeo = new THREE.RingGeometry(2.6, 3.0, 32);
  const ringMat = new THREE.MeshBasicMaterial({
    color,
    transparent: true,
    opacity: 0.35,
    side: THREE.DoubleSide,
    depthWrite: false,
  });
  const ring = new THREE.Mesh(ringGeo, ringMat);
  ring.rotation.x = -Math.PI / 2;
  base.add(ring);

  return base;
}

// ── Public API ─────────────────────────────────────────────────────

/**
 * Creates a complete category-specific 3D marker:
 * glowing base disc + category model floating above.
 */
export function createCategoryMarker(category: string, color: THREE.Color): THREE.Group {
  const group = new THREE.Group();

  // Base disc (shared)
  const base = createBaseDisc(color);
  group.add(base);

  // Category model
  let model: THREE.Group;
  let yOffset: number;

  switch (category) {
    case 'war':
      model = createWarModel(color);
      yOffset = 4;
      break;
    case 'construction':
      model = createConstructionModel(color);
      yOffset = 1.5;
      break;
    case 'political':
      model = createPoliticalModel(color);
      yOffset = 3;
      break;
    default:
      model = createFallbackModel(color);
      yOffset = 4;
      break;
  }

  model.position.y = yOffset;
  group.add(model);

  return group;
}
