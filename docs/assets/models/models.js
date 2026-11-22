import * as THREE from './three.module.min.js';

const HALF_PI = Math.PI / 2;
const FULL_TURN = Math.PI * 2;
const FRONT = [0, 0, 0];
const BACK = [0, Math.PI, 0];
const RIGHT = [0, HALF_PI, 0];
const LEFT = [0, -HALF_PI, 0];
const TOP = [-HALF_PI, 0, 0];
const range = n => Array.from({ length: n }, (_, i) => i);
const evenly = (n, pitch) => range(n).map(i => (i - (n - 1) / 2) * pitch);

function canvasTexture(width, height, draw) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  draw(canvas.getContext('2d'), width, height);
  return new THREE.CanvasTexture(canvas);
}

function randomSource(seed) {
  return () => {
    seed = (Math.imul(1664525, seed) + 1013904223) >>> 0;
    return seed / 4294967296;
  };
}

function metalFoam() {
  const canvas = canvasTexture(768, 256, (ctx, w, h) => {
    const rand = randomSource(703);
    const image = ctx.createImageData(w, h);
    for (let i = 0; i < image.data.length; i += 4) {
      const shade = 113 + 43 * rand();
      image.data[i] = image.data[i + 1] = image.data[i + 2] = shade;
      image.data[i + 3] = 255;
    }
    ctx.putImageData(image, 0, 0);
    for (let i = 0; i < 22000; i++) {
      const x = rand() * w;
      const y = rand() * h;
      const r = 0.35 + rand() * 2;
      ctx.fillStyle = 'rgba(229,229,229,0.52)';
      ctx.beginPath();
      ctx.ellipse(x, y + 0.48, r * 1.45, r, 0.36, 0, FULL_TURN);
      ctx.fill();
      ctx.fillStyle = 'rgba(22,22,22,0.68)';
      ctx.beginPath();
      ctx.ellipse(x, y, r * 1.2, r * 0.72, 0.36, 0, FULL_TURN);
      ctx.fill();
    }
  });
  canvas.anisotropy = 4;
  return canvas;
}

function brushedMetal() {
  return canvasTexture(256, 256, (ctx, w, h) => {
    const rand = randomSource(2002);
    for (let y = 0; y < h; y++) {
      const shade = Math.round(110 + rand() * 34);
      ctx.fillStyle = `rgb(${shade},${shade},${shade})`;
      ctx.fillRect(0, y, w, 1);
    }
  });
}

function perforations(columns, rows, open) {
  const image = canvasTexture(128, 128, (ctx, w, h) => {
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = '#000';
    for (const center of [32, 96]) {
      for (const x of [-w, 0, w]) for (const y of [-h, 0, h]) {
        ctx.beginPath();
        ctx.arc(center + x, center + y, open, 0, FULL_TURN);
        ctx.fill();
      }
    }
  });
  image.wrapS = image.wrapT = THREE.RepeatWrapping;
  image.repeat.set(columns, rows);
  image.anisotropy = 4;
  return image;
}

// Extruded along +Z, with its significant surface and UVs on the XY plane.
function roundedPanel(w, h, d, r, bevel, cutouts) {
  function outline(shape, x, y, width, height, radius) {
    const x0 = x - width / 2;
    const x1 = x + width / 2;
    const y0 = y - height / 2;
    const y1 = y + height / 2;
    shape.moveTo(x0 + radius, y0);
    shape.lineTo(x1 - radius, y0);
    shape.quadraticCurveTo(x1, y0, x1, y0 + radius);
    shape.lineTo(x1, y1 - radius);
    shape.quadraticCurveTo(x1, y1, x1 - radius, y1);
    shape.lineTo(x0 + radius, y1);
    shape.quadraticCurveTo(x0, y1, x0, y1 - radius);
    shape.lineTo(x0, y0 + radius);
    shape.quadraticCurveTo(x0, y0, x0 + radius, y0);
  }

  const shape = new THREE.Shape();
  outline(shape, 0, 0, w - 2 * bevel, h - 2 * bevel, r - bevel);
  for (const [x, y, width, height, radius] of cutouts) {
    const hole = new THREE.Path();
    outline(hole, x, y, width + 2 * bevel, height + 2 * bevel, radius + bevel);
    shape.holes.push(hole);
  }
  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth: d - 2 * bevel, bevelEnabled: bevel > 0, bevelSize: bevel, bevelThickness: bevel,
    bevelSegments: 2, curveSegments: 4,
  });
  geometry.translate(0, 0, -d / 2 + bevel);
  const pos = geometry.attributes.position;
  const uv = geometry.attributes.uv;
  const normals = geometry.attributes.normal;
  for (let i = 0; i < pos.count; i++) {
    if (Math.abs(normals.getZ(i)) > 0.99) uv.setXY(i, pos.getX(i) / w + 0.5, pos.getY(i) / h + 0.5);
  }
  return geometry;
}

class Assembly {
  root = new THREE.Group();
  batches = new Map();
  geometries = new Map();
  materials = new Map();
  leds = [];
  transform = new THREE.Object3D();

  geometry(key, create) {
    if (!this.geometries.has(key)) this.geometries.set(key, create());
    return this.geometries.get(key);
  }

  metal(name, color, metalness = 0.65, roughness = 0.38, extra = {}) {
    if (!this.materials.has(name)) {
      this.materials.set(name, new THREE.MeshStandardMaterial({ color, metalness, roughness, ...extra }));
    }
    return this.materials.get(name);
  }

  frame(parent, x, y, z, rotation = FRONT) {
    const group = new THREE.Group();
    group.position.set(x, y, z);
    group.rotation.set(...rotation);
    parent.add(group);
    return group;
  }

  part(parent, geometry, material, position, scale = [1, 1, 1], rotation = FRONT) {
    const t = this.transform;
    t.position.set(...position);
    t.rotation.set(...rotation);
    t.scale.set(...scale);
    t.updateMatrix();
    const key = `${geometry.id}:${material.id}`;
    if (!this.batches.has(key)) this.batches.set(key, { geometry, material, parts: [] });
    this.batches.get(key).parts.push({ parent, matrix: t.matrix.clone() });
  }

  box(parent, material, x, y, z, w, h, d, rotation = FRONT) {
    this.part(parent, this.geometry('box', () => new THREE.BoxGeometry()), material, [x, y, z], [w, h, d], rotation);
  }

  panel(parent, material, x, y, z, w, h, d, r, rotation = FRONT, cutouts = [], bevel = Math.min(d * 0.3, r * 0.3)) {
    const key = JSON.stringify([w, h, d, r, bevel, cutouts]);
    const geometry = this.geometry(key, () => roundedPanel(w, h, d, r, bevel, cutouts));
    this.part(parent, geometry, material, [x, y, z], undefined, rotation);
  }

  disc(parent, material, x, y, z, radius, depth, rotation = TOP, segments = 16) {
    const geometry = this.geometry(`disc:${segments}`, () => new THREE.CylinderGeometry(1, 1, 1, segments));
    this.part(parent, geometry, material, [x, y, z], [radius, depth, radius], rotation);
  }

  ring(parent, material, x, y, z, radius, thickness) {
    const ratio = Math.round(thickness / radius * 1000) / 1000;
    const geometry = this.geometry(`ring:${ratio}`, () => new THREE.TorusGeometry(1, ratio, 5, 24));
    this.part(parent, geometry, material, [x, y, z], [radius, radius, radius]);
  }

  cable(parent, material, radius, points, segments = 14) {
    const curve = new THREE.CatmullRomCurve3(points.map(point => new THREE.Vector3(...point)));
    const geometry = new THREE.TubeGeometry(curve, segments, radius, 5, false);
    this.part(parent, geometry, material, [0, 0, 0]);
  }

  mesh(name, color, columns, rows, openness = 26) {
    if (this.materials.has(name)) return this.materials.get(name);
    const texture = perforations(columns, rows, openness);
    return this.metal(name, color, 0.48, 0.51, {
      alphaMap: texture, alphaTest: 0.46, side: THREE.DoubleSide,
      bumpMap: texture, bumpScale: 0.003,
    });
  }

  grille(parent, material, x, y, z, width, height, rotation = FRONT) {
    const plane = this.geometry('plane', () => new THREE.PlaneGeometry());
    this.part(parent, plane, material, [x, y, z], [width, height, 1], rotation);
  }

  led(parent, x, y, z, width = 0.035, height = 0.012, color = 0x93ded3, circuit = 0) {
    const name = `led:${color}:${circuit}`;
    if (!this.materials.has(name)) {
      const material = this.metal(name, color, 0.04, 0.35, { emissive: color, emissiveIntensity: 0.52 });
      this.leds.push({ material, phase: circuit * 1.83 });
    }
    this.box(parent, this.materials.get(name), x, y, z, width, height, 0.008);
  }

  finish(name) {
    this.root.updateMatrixWorld(true);
    const model = new THREE.Group();
    model.name = name;
    const matrix = new THREE.Matrix4();
    // Batching across the entire enclosure also covers details on angled subassemblies.
    for (const { geometry, material, parts } of this.batches.values()) {
      if (parts.length === 1) {
        const [{ parent, matrix: local }] = parts;
        const mesh = new THREE.Mesh(geometry, material);
        matrix.multiplyMatrices(parent.matrixWorld, local);
        matrix.decompose(mesh.position, mesh.quaternion, mesh.scale);
        model.add(mesh);
      } else {
        const mesh = new THREE.InstancedMesh(geometry, material, parts.length);
        parts.forEach(({ parent, matrix: local }, index) => {
          mesh.setMatrixAt(index, matrix.multiplyMatrices(parent.matrixWorld, local));
        });
        model.add(mesh);
      }
    }
    const bounds = new THREE.Box3().setFromObject(model);
    const center = bounds.getCenter(new THREE.Vector3());
    const normalize = 1 / (bounds.max.y - bounds.min.y);
    const group = new THREE.Group();
    group.name = name;
    model.position.set(-center.x * normalize, -bounds.min.y * normalize, -center.z * normalize);
    model.scale.setScalar(normalize);
    group.add(model);
    group.userData.leds = this.leds;
    return group;
  }
}

function hardware(a) {
  return {
    black: a.metal('black', 0x181d24, 0.44, 0.55),
    skin: a.metal('skin', 0x353c46, 0.62, 0.43),
    frame: a.metal('frame', 0x48535d, 0.67, 0.37),
    gasket: a.metal('gasket', 0x090e13, 0.08, 0.87),
    steel: a.metal('steel', 0x818c91, 0.74, 0.34),
    edge: a.metal('edge', 0xabb4b8, 0.78, 0.32),
    gold: a.metal('gold', 0xd3a765, 0.73, 0.31),
    bronze: a.metal('bronze', 0x9b6340, 0.67, 0.38),
    board: a.metal('board', 0x254e4a, 0.33, 0.64),
    blade: a.metal('blade', 0x4c5662, 0.48, 0.4, { side: THREE.DoubleSide }),
  };
}

function screw(a, p, m, x, y, z, radius = 0.021) {
  a.disc(p, m.steel, x, y, z, radius, 0.008, TOP, 10);
  a.box(p, m.gasket, x, y, z + 0.0043, radius * 1.05, radius * 0.21, 0.001, [0, 0, 0.6]);
}

function port(a, p, m, x, y, z, width, height, insert = m.gasket) {
  a.box(p, m.steel, x, y, z, width, height, 0.014);
  a.box(p, m.gasket, x, y, z + 0.009, width * 0.82, height * 0.73, 0.01);
  if (insert !== m.gasket) a.box(p, insert, x, y - height * 0.16, z + 0.015, width * 0.64, height * 0.17, 0.003);
}

function pull(a, p, m, x, y, z, gap = 0.25, stand = 0.13, width = 0.045) {
  for (const end of [-1, 1]) {
    a.box(p, m.black, x, y + end * gap / 2, z + stand / 2, width, width, stand);
  }
  a.panel(p, m.frame, x, y, z + stand, width, gap + width, width * 0.7, width * 0.28);
}

function fan(a, p, m, x, y, z, radius, rotation = FRONT, guard = false) {
  const face = a.frame(p, x, y, z, rotation);
  const r = radius;
  const blade = a.geometry('impeller blade', () => {
    const shape = new THREE.Shape();
    shape.moveTo(0.22, -0.07);
    shape.bezierCurveTo(0.49, -0.24, 0.79, -0.24, 0.88, -0.05);
    shape.quadraticCurveTo(0.9, 0.08, 0.82, 0.26);
    shape.quadraticCurveTo(0.54, 0.09, 0.21, 0.12);
    return new THREE.ShapeGeometry(shape, 4);
  });
  a.disc(face, m.gasket, 0, 0, -r * 0.15, r, r * 0.21);
  a.ring(face, m.frame, 0, 0, 0, r * 0.97, r * 0.057);
  for (const i of range(7)) {
    a.part(face, blade, m.blade, [0, 0, 0], [r, r, r], [0.08, 0.16, i * FULL_TURN / 7]);
  }
  a.disc(face, m.black, 0, 0, r * 0.035, r * 0.24, r * 0.15);
  a.disc(face, m.steel, 0, 0, r * 0.117, r * 0.125, r * 0.016);
  if (guard) {
    for (const fraction of [0.44, 0.69, 0.91]) a.ring(face, m.frame, 0, 0, r * 0.19, r * fraction, r * 0.018);
    for (const angle of [Math.PI / 4, -Math.PI / 4]) {
      a.box(face, m.frame, 0, 0, r * 0.195, r * 1.92, r * 0.028, r * 0.024, [0, 0, angle]);
    }
  }
}

function heatsink(a, p, m, x, y, z, width, length, fins = 18, height = 0.13) {
  a.box(p, m.bronze, x, y, z, width, 0.04, length);
  a.box(p, m.frame, x, y + 0.035, z, width, 0.04, length);
  for (const index of range(fins)) {
    const offset = (index + 0.5) / fins - 0.5;
    a.box(p, index % 5 === 0 ? m.edge : m.steel, x, y + height / 2 + 0.05, z + offset * length,
      width * 0.91, height, length / fins * 0.37);
  }
  for (const sign of [-1, 1]) {
    a.box(p, m.gold, x + sign * width * 0.48, y + height + 0.041, z, width * 0.055, 0.026, length);
    a.box(p, m.bronze, x, y + 0.053, z + sign * length * 0.48, width, 0.045, length * 0.043);
  }
}

function spark(a, m) {
  const p = a.root;
  const brushing = brushedMetal();
  const finish = a.metal('champagne', 0xd1af81, 0.82, 0.36, { bumpMap: brushing, bumpScale: 0.006 });
  const trim = a.metal('champagne edge', 0xe3c298, 0.83, 0.26);
  const foam = metalFoam();
  const face = a.metal('sintered aluminium', 0xcbb28b, 0.78, 0.59, {
    map: foam, bumpMap: foam, bumpScale: 0.016,
  });
  a.panel(p, finish, 0, 0.54, -0.038, 2.96, 2.87, 0.88, 0.13, TOP, [], 0.08);
  a.panel(p, trim, 0, 0.957, -0.038, 2.98, 2.89, 0.086, 0.13, TOP, [], 0.025);
  a.panel(p, finish, 0, 0.991, -0.038, 2.89, 2.80, 0.031, 0.115, TOP);
  a.panel(p, m.black, 0, 0.108, -0.019, 2.88, 2.79, 0.074, 0.12, TOP);
  const slots = [-0.99, 0.99].map(x => [x, 0.025, 0.155, 0.55, 0.071]);
  a.panel(p, m.gasket, 0, 0.545, 1.405, 2.91, 0.824, 0.022, 0.10);
  a.panel(p, trim, 0, 0.545, 1.426, 2.86, 0.795, 0.04, 0.09, FRONT, slots);
  a.panel(p, face, 0, 0.545, 1.467, 2.79, 0.73, 0.045, 0.076, FRONT, slots);
  for (const x of [-0.99, 0.99]) {
    a.panel(p, m.black, x, 0.57, 1.44, 0.121, 0.51, 0.015, 0.054);
    a.panel(p, m.frame, x - 0.023, 0.57, 1.447, 0.031, 0.421, 0.014, 0.012);
  }
  a.panel(p, m.black, 1.241, 0.685, 1.494, 0.069, 0.039, 0.014, 0.015);
  a.led(p, 1.24, 0.685, 1.506, 0.028, 0.011, 0xc4ffd2);
  for (const x of [-1.13, 1.13]) for (const z of [-1.04, 1.04]) {
    a.disc(p, m.gasket, x, 0.056, z, 0.203, 0.112, FRONT);
    a.disc(p, m.black, x, 0.094, z, 0.213, 0.042, FRONT);
  }
  for (const side of [-1, 1]) {
    const flank = a.frame(p, side * 1.488, 0.48, -0.045, side > 0 ? RIGHT : LEFT);
    for (const height of evenly(3, 0.083)) {
      a.panel(flank, m.black, 0, height, 0.009, 2.39, 0.036, 0.023, 0.017);
      a.box(flank, trim, 0, height - 0.022, 0.009, 2.34, 0.006, 0.009);
    }
  }
  const rear = a.frame(p, 0, 0.52, -1.478, BACK);
  a.panel(rear, m.black, 0, 0, 0, 2.76, 0.71, 0.07, 0.081);
  a.grille(rear, a.mesh('spark exhaust', 0x6d726f, 30, 4, 27), 0, 0.185, 0.04, 2.35, 0.21);
  a.box(rear, m.gasket, 0, -0.112, 0.041, 2.38, 0.255, 0.02);
  a.disc(rear, m.steel, -0.96, -0.105, 0.063, 0.092, 0.031);
  a.disc(rear, m.gasket, -0.96, -0.105, 0.081, 0.065, 0.015);
  for (const x of [-0.65, -0.41, -0.17]) port(a, rear, m, x, -0.107, 0.063, 0.155, 0.078, m.steel);
  port(a, rear, m, 0.127, -0.107, 0.063, 0.235, 0.10, m.black);
  port(a, rear, m, 0.454, -0.106, 0.063, 0.228, 0.18, m.gold);
  port(a, rear, m, 0.82, -0.106, 0.063, 0.242, 0.155, m.frame);
  for (const x of [-1.29, 1.29]) for (const y of [-0.212, 0.223]) screw(a, rear, m, x, y, 0.045, 0.025);
  a.led(rear, 0.405, 0.01, 0.062, 0.029, 0.015, 0xe4af6e, 1);
  a.led(rear, 0.502, 0.01, 0.062, 0.029, 0.015, 0x9fe0a4, 2);
}

function workstation(a, m) {
  const p = a.root;
  const front = a.frame(p, 0, 1.84, 1.19);
  const rear = a.frame(p, 0, 1.82, -1.19, BACK);
  const glassSide = a.frame(p, 0.788, 1.87, 0, RIGHT);
  const serviceSide = a.frame(p, -0.783, 1.87, 0, LEFT);
  const coated = a.metal('powder coated aluminium', 0x333b43, 0.63, 0.47, {
    bumpMap: brushedMetal(), bumpScale: 0.004,
  });
  a.panel(p, coated, 0, 3.48, 0, 1.571, 2.39, 0.12, 0.077, TOP);
  a.panel(p, m.skin, 0, 0.23, 0, 1.56, 2.39, 0.12, 0.075, TOP);
  for (const x of [-0.52, 0.52]) for (const z of [-0.85, 0.85]) {
    a.panel(p, m.gasket, x, 0.096, z, 0.34, 0.37, 0.192, 0.061, TOP);
  }
  for (const x of [-0.72, 0.72]) for (const z of [-1.12, 1.12]) {
    a.box(p, m.black, x, 1.85, z, 0.095, 3.15, 0.11);
  }
  a.panel(glassSide, m.black, 0, 0, 0, 2.37, 3.20, 0.083, 0.086, FRONT, [[0, 0.08, 2.16, 2.86, 0.068]]);
  const glass = new THREE.MeshPhysicalMaterial({
    color: 0x93b0c1, metalness: 0.25, roughness: 0.19, clearcoat: 0.6, clearcoatRoughness: 0.23,
    transparent: true, opacity: 0.105, depthWrite: false,
  });
  a.grille(glassSide, glass, 0, 0.08, 0.035, 2.173, 2.87);
  for (const x of [-1.108, 1.108]) for (const y of [-1.5, 1.53]) screw(a, glassSide, m, x, y, 0.045, 0.026);
  a.box(glassSide, m.gold, 0, -1.46, 0.045, 2.12, 0.017, 0.013);
  a.panel(serviceSide, coated, 0, 0, 0, 2.37, 3.20, 0.087, 0.086);
  for (const x of [-1.075, 1.075]) for (const y of [-1.48, 1.48]) screw(a, serviceSide, m, x, y, 0.047);
  for (const [y, span, offset] of [[-0.88, 0.78, -0.49], [0.95, 1.53, 0.16]]) {
    for (const row of evenly(y < 0 ? 12 : 6, 0.065)) {
      a.box(serviceSide, m.black, offset, row + y, 0.047, span, 0.019, 0.013);
      a.box(serviceSide, m.frame, offset, row + y - 0.015, 0.05, span, 0.006, 0.012);
    }
  }

  const frontHole = [[0, -0.16, 1.11, 2.77, 0.08]];
  a.panel(front, m.black, 0, 0, 0.046, 1.57, 3.29, 0.14, 0.088, FRONT, frontHole);
  a.grille(front, a.mesh('workstation front', 0x48525c, 20, 46, 34), 0, -0.16, 0.11, 1.12, 2.77);
  a.box(front, m.gasket, 0, -0.19, -0.24, 1.12, 2.85, 0.04);
  for (const y of [-1.07, -0.18, 0.71]) fan(a, front, m, 0, y, -0.044, 0.398);
  for (const x of [-0.62, 0.62]) a.box(front, m.skin, x, -0.16, 0.117, 0.039, 2.78, 0.023);
  a.panel(front, m.frame, 0, 1.39, 0.123, 1.25, 0.26, 0.064, 0.053);
  a.disc(front, m.steel, 0.42, 1.39, 0.169, 0.077, 0.032);
  a.disc(front, m.black, 0.42, 1.39, 0.19, 0.054, 0.015);
  a.led(front, 0.42, 1.39, 0.199, 0.035, 0.014, 0xa4e9df);
  port(a, front, m, -0.38, 1.39, 0.166, 0.16, 0.074, m.gold);
  port(a, front, m, -0.16, 1.39, 0.166, 0.16, 0.074, m.gold);
  a.led(front, 0.13, 1.39, 0.169, 0.032, 0.012, 0xffba75, 1);
  const top = a.frame(p, 0, 3.551, -0.11, TOP);
  for (const y of evenly(15, 0.093)) a.box(top, m.black, 0, y, 0.002, 1.04, 0.025, 0.009);

  a.box(p, m.black, -0.60, 1.88, 0, 0.21, 2.42, 2.05);
  const inside = a.frame(p, -0.45, 1.79, -0.075, RIGHT);
  a.panel(inside, m.board, 0.105, 0.33, 0, 1.83, 2.13, 0.048, 0.049);
  const traces = a.metal('printed traces', 0x66826e, 0.42, 0.57);
  for (const x of evenly(11, 0.106)) {
    a.box(inside, traces, x + 0.12, 0.075, 0.024, 0.008, 0.43, 0.002);
    a.box(inside, traces, x + 0.17, -0.17, 0.024, 0.008, 0.133, 0.002, [0, 0, -0.72]);
  }
  for (const x of [0.74, 0.83, 0.92]) for (const y of [0.19, 0.31, 0.43, 1.03]) {
    a.box(inside, m.gasket, x, y, 0.048, 0.056, 0.068, 0.044);
    a.box(inside, m.steel, x, y - 0.018, 0.07, 0.039, 0.011, 0.002);
  }
  for (const x of [-0.72, 0.93]) for (const y of [-0.62, 1.28]) screw(a, inside, m, x, y, 0.031, 0.021);
  for (const x of evenly(13, 0.105)) {
    a.box(inside, m.gold, x + 0.09, 1.20, 0.026, 0.018, 0.13, 0.006);
    a.box(inside, m.frame, x + 0.09, -0.58, 0.027, 0.039, 0.077, 0.013);
  }
  for (const y of evenly(4, 0.13)) {
    a.box(inside, m.black, -0.30, y - 0.3, 0.045, 0.95, 0.043, 0.058);
    a.box(inside, m.steel, -0.30, y - 0.29, 0.080, 0.88, 0.008, 0.009);
  }
  a.box(inside, m.frame, 0.35, 0.66, 0.087, 0.64, 0.65, 0.18);
  for (const x of evenly(11, 0.053)) a.box(inside, m.steel, x + 0.35, 0.66, 0.240, 0.018, 0.58, 0.16);
  fan(a, inside, m, 0.35, 0.66, 0.34, 0.266);
  for (const x of [-0.60, -0.49, -0.38, -0.27]) {
    a.box(inside, m.gasket, x, 0.65, 0.071, 0.071, 0.73, 0.097);
    a.box(inside, m.steel, x, 0.66, 0.13, 0.063, 0.67, 0.055);
    a.box(inside, m.gold, x, 0.66, 0.167, 0.048, 0.59, 0.028);
  }
  for (const y of [0.16, 0.30, 0.43, 1.04]) for (const x of [-0.72, 0.74]) {
    a.disc(inside, m.steel, x, y, 0.057, 0.033, 0.06, TOP, 12);
  }

  a.box(p, m.black, 0, 0.53, -0.35, 1.38, 0.54, 1.54);
  a.box(p, m.frame, 0, 0.81, -0.35, 1.38, 0.04, 1.54);
  const gpu = a.frame(p, 0.33, 1.31, -0.02, RIGHT);
  a.panel(gpu, m.board, 0, 0, -0.18, 1.92, 0.71, 0.051, 0.081);
  a.panel(gpu, m.black, 0, 0, -0.021, 1.89, 0.69, 0.30, 0.105);
  for (const x of evenly(26, 0.067)) {
    a.box(gpu, m.steel, x, 0.345, -0.027, 0.019, 0.050, 0.21);
    a.box(gpu, m.steel, x, -0.345, -0.027, 0.019, 0.050, 0.21);
  }
  for (const x of [-0.59, 0, 0.59]) fan(a, gpu, m, x, 0, 0.132, 0.267);
  for (const y of [-0.313, 0.313]) a.box(gpu, m.gold, 0, y, 0.141, 1.57, 0.024, 0.027);
  for (const x of [-0.88, 0.88]) a.box(gpu, m.frame, x, 0, 0.15, 0.075, 0.43, 0.045, [0, 0, x > 0 ? 0.17 : -0.17]);
  const cableSheath = a.metal('braided cable', 0x303742, 0.14, 0.87);
  const warmSheath = a.metal('individually sleeved cable', 0x926b51, 0.12, 0.76);
  for (const index of range(8)) {
    const offset = (index - 3.5) * 0.036;
    a.cable(p, index % 3 ? cableSheath : warmSheath, 0.015, [
      [0.15 + offset, 0.81, 0.45], [0.25 + offset, 0.95, 0.68],
      [0.31 + offset, 1.29, 0.953], [0.25 + offset, 1.63, 0.97],
      [0.22 + offset, 1.81, 0.77], [0.22 + offset, 1.665, 0.61],
    ]);
  }
  for (const height of [1.19, 1.52]) a.box(p, m.frame, 0.255, height, 0.935, 0.31, 0.044, 0.075);

  a.panel(rear, m.skin, 0, 0, 0.01, 1.52, 3.19, 0.12, 0.073);
  a.box(rear, m.gasket, -0.44, 0.75, 0.075, 0.39, 1.33, 0.019);
  for (const y of [1.21, 1.03, 0.83, 0.65, 0.45, 0.23]) {
    port(a, rear, m, -0.44, y, 0.10, 0.22, y === 0.23 ? 0.14 : 0.085, y === 0.65 ? m.gold : m.frame);
  }
  fan(a, rear, m, 0.246, 0.93, 0.095, 0.365, FRONT, true);
  for (const y of evenly(7, 0.134)) {
    a.box(rear, m.frame, 0.06, y - 0.419, 0.089, 1.18, 0.095, 0.036);
    for (const x of evenly(13, 0.066)) a.box(rear, m.gasket, x + 0.06, y - 0.419, 0.109, 0.035, 0.029, 0.007);
  }
  a.box(rear, m.black, 0.04, -1.26, 0.091, 1.23, 0.37, 0.077);
  port(a, rear, m, -0.38, -1.26, 0.137, 0.33, 0.23);
  a.grille(rear, a.mesh('workstation PSU', 0x687278, 10, 4), 0.29, -1.26, 0.137, 0.69, 0.268);
  for (const x of [-0.67, 0.67]) for (const y of [-1.49, 1.49]) screw(a, rear, m, x, y, 0.082);
}

function server(a, m, hgx) {
  const p = a.root;
  const width = hgx ? 3.48 : 3.18;
  const length = hgx ? 3.72 : 3.44;
  const height = hgx ? 0.92 : 0.66;
  const xEdge = width / 2;
  const zEdge = length / 2;
  const front = a.frame(p, 0, 0, zEdge);
  const rear = a.frame(p, 0, 0, -zEdge, BACK);
  const brushed = a.metal('server skin', hgx ? 0x424e58 : 0x4a5258, 0.68, 0.39, {
    bumpMap: brushedMetal(), bumpScale: 0.004,
  });
  a.panel(p, brushed, 0, 0.086, 0, width, length, 0.132, 0.056, TOP);
  a.box(p, m.black, 0, 0.159, 0, width - 0.12, 0.034, length - 0.11);
  for (const x of [-xEdge, xEdge]) {
    const sign = Math.sign(x);
    const side = a.frame(p, x, 0, 0, sign > 0 ? RIGHT : LEFT);
    a.panel(side, brushed, 0, height * 0.48, 0, length, height * 0.79, 0.095, 0.044);
    a.box(side, m.black, 0, 0.249, 0.055, length * 0.98, 0.102, 0.036);
    a.box(side, m.steel, 0, 0.248, 0.075, length * 0.86, 0.036, 0.021);
    a.box(side, m.frame, 0, height * 0.89, 0.003, length - 0.13, 0.057, 0.148);
    a.box(side, m.gold, hgx ? 0 : 0.02, height * 0.845, 0.055, length * 0.87, 0.016, 0.012);
    for (const z of [-zEdge + 0.14, -0.51, 0.51, zEdge - 0.14]) screw(a, side, m, z, height * 0.72, 0.052, 0.022);
    for (const z of [-zEdge * 0.65, zEdge * 0.65]) {
      a.panel(p, m.gasket, x - sign * 0.15, 0.026, z, 0.24, 0.24, 0.052, 0.035, TOP);
    }
  }
  a.box(front, m.black, 0, height * 0.48, -0.061, width, height * 0.9, 0.095);
  a.box(front, m.frame, 0, height * 0.105, 0.087, width + 0.13, 0.086, 0.14);
  a.box(front, m.skin, 0, height * 0.88, 0.068, width + 0.13, 0.067, 0.132);
  a.box(front, m.gold, 0, height * 0.917, 0.136, width - 0.06, 0.021, 0.026);
  const fanCount = hgx ? 6 : 5;
  const fanPitch = (width - 0.53) / fanCount;
  const fanY = height * 0.519;
  const fanRadius = hgx ? 0.211 : 0.195;
  for (const x of evenly(fanCount, fanPitch)) {
    a.panel(front, m.frame, x, fanY, 0.036, fanPitch - 0.014, height * 0.65, 0.041, 0.025);
    fan(a, front, m, x, fanY, hgx ? 0.099 : 0.085, fanRadius);
    a.led(front, x + fanPitch * 0.29, height * 0.195, 0.079, 0.038, 0.013, 0xa1e4cf, Math.round(Math.abs(x) * 3));
  }
  if (hgx) {
    a.grille(front, a.mesh('fan wall grille', 0x43515a, 32, 6, 35), 0, fanY, 0.147, width - 0.54, height * 0.63);
    for (const x of evenly(5, fanPitch)) a.box(front, m.frame, x, fanY, 0.15, 0.021, height * 0.66, 0.023);
  } else {
    for (const x of evenly(4, fanPitch)) a.box(front, m.steel, x, fanY, 0.106, 0.023, height * 0.64, 0.049);
    for (const y of [-0.07, 0.07]) a.box(front, m.skin, 0, fanY + y, 0.126, width - 0.56, 0.012, 0.022);
  }
  for (const x of [-xEdge, xEdge]) {
    a.panel(front, m.skin, x, height * 0.49, 0.082, 0.21, height * 0.91, 0.161, 0.039);
    pull(a, front, m, x, height * 0.50, 0.165, height * 0.55, 0.125, 0.063);
    for (const y of [height * 0.12, height * 0.84]) screw(a, front, m, x, y, 0.172, 0.021);
  }

  a.box(p, m.board, 0, 0.188, 0.01, width - 0.36, 0.048, length - 0.48);
  for (const x of evenly(5, width * 0.157)) {
    a.box(p, m.frame, x, 0.277, 0.02, 0.032, 0.197, length * 0.86);
  }
  const columns = evenly(4, (width - 0.39) / 4);
  for (const [index, x] of columns.entries()) for (const z of (hgx ? [-0.73, 0.73] : [-0.04])) {
    const sledLength = hgx ? 1.235 : 2.28;
    const zFront = z + sledLength / 2;
    const zBack = z - sledLength / 2;
    const y = hgx ? 0.501 : 0.363;
    const sledWidth = hgx ? 0.696 : 0.593;
    a.box(p, m.black, x, y - 0.14, z, sledWidth + 0.04, 0.131, sledLength + 0.13);
    a.box(p, m.board, x, y - 0.056, z, sledWidth + 0.026, 0.042, sledLength + 0.033);
    heatsink(a, p, m, x, y, z, sledWidth, sledLength, hgx ? 16 : 28, hgx ? 0.216 : 0.149);
    for (const side of [-1, 1]) {
      a.box(p, m.skin, x + side * sledWidth * 0.48, y + 0.061, z, 0.035, 0.084, sledLength);
      a.box(p, m.steel, x + side * sledWidth * 0.39, y + 0.01, zFront + 0.052, 0.053, 0.047, 0.111);
    }
    a.box(p, m.black, x, y + 0.02, zFront + 0.079, sledWidth * 0.58, 0.10, 0.059);
    a.box(p, m.gold, x, y + 0.067, zFront + 0.082, sledWidth * 0.41, 0.025, 0.066);
    a.box(p, m.frame, x, y + 0.006, zBack - 0.039, sledWidth * 0.78, 0.061, 0.08);
    for (const offset of evenly(4, 0.092)) {
      a.box(p, m.gold, x + offset, y + 0.006, zBack - 0.083, 0.04, 0.026, 0.020);
    }
    if (hgx) {
      const indicator = a.frame(p, x, y + 0.083, zFront + 0.05, TOP);
      a.led(indicator, 0, 0, 0, 0.076, 0.025, 0x97dfc9, index % 3);
    }
  }
  if (hgx) {
    a.box(p, m.frame, 0, 0.425, 0, width - 0.17, 0.32, 0.132);
    a.box(p, m.bronze, 0, 0.594, 0, width - 0.21, 0.022, 0.104);
    for (const x of evenly(12, 0.23)) a.box(p, m.black, x, 0.604, 0, 0.112, 0.014, 0.078);
  }
  for (const x of evenly(8, 0.193)) {
    a.cable(p, x > 0 ? m.bronze : m.black, 0.022, [
      [x, 0.253, -zEdge + 0.27], [x, 0.308, -zEdge + 0.43], [x * 1.64, 0.26, -zEdge + 0.55],
    ], 8);
  }

  a.panel(rear, brushed, 0, height * 0.49, 0.017, width, height * 0.89, 0.091, 0.043);
  const bays = hgx ? [-1.26, -0.71, 0.71, 1.26] : [-1.05, -0.52];
  for (const [index, x] of bays.entries()) {
    const centerY = height * 0.49;
    const bayH = height * 0.697;
    a.panel(rear, m.black, x, centerY, 0.075, 0.49, bayH, 0.053, 0.033);
    a.grille(rear, a.mesh('PSU grille', 0x737b81, 5, 7, 25), x + 0.075, centerY, 0.116, 0.29, bayH * 0.87);
    port(a, rear, m, x + 0.053, centerY - bayH * 0.21, 0.121, 0.19, 0.099);
    a.box(rear, m.gold, x - 0.161, centerY, 0.116, 0.041, bayH * 0.75, 0.047);
    a.led(rear, x + 0.108, centerY + bayH * 0.22, 0.122, 0.041, 0.016, 0xc1ed9f, index % 3);
  }
  const ioX = hgx ? 0 : 0.59;
  const ioWidth = hgx ? 0.80 : 1.35;
  a.box(rear, m.black, ioX, height * 0.511, 0.075, ioWidth, height * 0.67, 0.035);
  a.grille(rear, a.mesh('rear intake', 0x737f85, 14, 3, 28), ioX, height * 0.73, 0.097, ioWidth - 0.059, 0.13);
  for (const x of evenly(hgx ? 3 : 5, 0.206)) port(a, rear, m, x + ioX, height * 0.46, 0.104, 0.157, 0.089, m.frame);
  for (const x of evenly(hgx ? 4 : 6, 0.174)) a.led(rear, x + ioX, height * 0.293, 0.107, 0.038, 0.013, 0x8ad9e0, Math.round(Math.abs(x) * 6));
  for (const x of [-xEdge + 0.11, xEdge - 0.11]) for (const y of [height * 0.15, height * 0.84]) screw(a, rear, m, x, y, 0.065);

  if (!hgx) {
    const lid = a.frame(p, 0, height * 0.92, -zEdge + 0.09, [-0.89, 0, 0]);
    const lidLength = length * 0.79;
    a.panel(lid, brushed, 0, 0, lidLength * 0.5, width - 0.087, lidLength, 0.064, 0.065, TOP);
    for (const x of [-xEdge + 0.078, xEdge - 0.078]) {
      a.box(lid, m.frame, x, -0.047, lidLength * 0.5, 0.059, 0.079, lidLength - 0.06);
      a.box(lid, m.gold, x * 0.92, -0.067, lidLength * 0.5, 0.018, 0.031, lidLength - 0.19);
    }
    for (const z of [0.22, lidLength - 0.24]) a.box(lid, m.frame, 0, -0.042, z, width - 0.20, 0.044, 0.11);
    for (const x of [-0.94, 0.94]) {
      a.box(lid, m.black, x, 0.06, lidLength - 0.38, 0.45, 0.041, 0.21);
      a.box(lid, m.steel, x, 0.075, lidLength - 0.38, 0.27, 0.034, 0.12);
      a.disc(p, m.steel, x, height * 0.915, -zEdge + 0.09, 0.079, 0.29, RIGHT);
    }
    for (const z of evenly(10, 0.094)) {
      a.box(lid, m.black, 0, 0.036, lidLength * 0.42 + z, width * 0.54, 0.008, 0.027);
      a.box(lid, m.skin, 0, -0.039, lidLength * 0.42 + z, width * 0.54, 0.017, 0.028);
    }
  }
}

function rack(a, m) {
  const p = a.root;
  const chassis = a.metal('rack powder coat', 0x333b43, 0.58, 0.49, {
    bumpMap: brushedMetal(), bumpScale: 0.004,
  });
  const chrome = a.metal('rack mounting rails', 0x68737c, 0.77, 0.35);
  const doorMesh = a.mesh('door perforations', 0x4b545e, 20, 64, 35);
  const sideMesh = a.mesh('side perforations', 0x5b656b, 19, 8, 29);
  const trayMesh = a.mesh('tray perforations', 0x6a747a, 16, 3, 26);
  const rearMesh = a.mesh('rear perforations', 0x525d67, 13, 2, 26);
  const crown = 6.52;
  const base = 0.52;
  const faceZ = 1.243;
  a.panel(p, chassis, 0, crown, 0, 2.312, 2.62, 0.186, 0.082, TOP);
  a.panel(p, m.skin, 0, base, 0, 2.31, 2.59, 0.225, 0.079, TOP);
  a.box(p, m.black, 0, 0.318, 0, 2.125, 0.183, 2.34);
  for (const z of [-1.01, 1.01]) for (const x of [-0.91, 0.91]) {
    const caster = a.frame(p, x, 0.145, z, [0, (x + z) * 0.49, 0]);
    a.disc(caster, m.steel, 0, 0.121, 0, 0.087, 0.139, FRONT);
    a.box(caster, m.skin, 0, 0.078, 0, 0.17, 0.093, 0.23);
    for (const k of [-1, 1]) {
      a.disc(caster, m.gasket, k * 0.081, 0, 0.026, 0.145, 0.063, [0, 0, HALF_PI]);
      a.disc(caster, m.frame, k * 0.112, 0, 0.026, 0.077, 0.013, [0, 0, HALF_PI]);
    }
  }
  for (const side of [-1, 1]) {
    const x = side * 1.105;
    const flank = a.frame(p, x, 3.52, 0, side > 0 ? RIGHT : LEFT);
    a.panel(flank, chassis, 0, 0, 0, 2.43, 5.89, 0.089, 0.068);
    for (const z of [-1.209, 1.209]) {
      a.box(p, m.black, x, 3.52, z, 0.119, 5.91, 0.118);
      a.box(p, m.frame, x * 0.941, 3.52, z * 0.94, 0.052, 5.85, 0.082);
    }
    for (const y of [-2.48, 2.48]) {
      a.box(flank, m.gasket, 0, y, 0.049, 1.83, 0.52, 0.018);
      a.grille(flank, sideMesh, 0, y, 0.061, 1.77, 0.48);
      for (const x of [-1.04, 1.04]) screw(a, flank, m, x, y, 0.051);
    }
    a.box(flank, m.black, 0, 0, 0.048, 2.34, 0.038, 0.014);
    a.box(flank, m.frame, 0, -0.035, 0.048, 2.34, 0.012, 0.011);
    for (const y of [-1.84, 1.6]) {
      a.panel(flank, m.black, -0.82, y, 0.064, 0.19, 0.37, 0.038, 0.039);
      a.box(flank, m.steel, -0.82, y, 0.085, 0.039, 0.23, 0.018);
    }
  }
  const front = a.frame(p, 0, 0, faceZ);
  const rear = a.frame(p, 0, 0, -1.245, BACK);
  for (const end of [front, rear]) {
    a.box(end, m.black, 0, 6.335, 0.019, 2.17, 0.25, 0.151);
    a.box(end, m.black, 0, 0.69, 0.02, 2.17, 0.195, 0.151);
    a.box(end, m.gold, 0, 6.278, 0.099, 1.99, 0.024, 0.018);
    for (const x of [-0.98, 0.98]) {
      a.box(end, chrome, x, 3.518, -0.121, 0.078, 5.46, 0.087);
      for (const y of range(42)) a.box(end, m.gasket, x, 0.827 + y * 0.13, -0.072, 0.032, 0.045, 0.012);
    }
  }
  a.box(front, m.gold, -1.049, 3.53, 0.097, 0.023, 5.51, 0.026);
  a.box(front, m.gold, 1.049, 3.53, 0.097, 0.023, 5.51, 0.026);

  const trayHeights = [2, 2, 2, 1, 1, 2, 2, 2, 2, 1, 1, 2, 2, 2, 2, 2, 1, 1, 2, 2, 2, 2, 2, 2];
  let occupied = 0;
  for (const [i, units] of trayHeights.entries()) {
    const pitch = 0.13;
    const y = 0.79 + (occupied + units / 2) * pitch;
    const h = units * pitch - 0.021;
    occupied += units;
    a.box(p, m.black, 0, y, -0.08, 1.76, h, 2.04);
    a.box(front, i % 4 === 0 ? m.frame : m.skin, 0, y, -0.119, 1.87, h, 0.072);
    a.box(front, m.gasket, -0.139, y, -0.075, 1.43, h * 0.72, 0.019);
    if (units === 2) {
      for (const slot of evenly(6, 0.22)) {
        a.box(front, i % 4 === 1 ? m.steel : m.frame, slot - 0.13, y, -0.053, 0.204, 0.121, 0.033);
        a.box(front, m.gasket, slot - 0.147, y, -0.035, 0.123, 0.026, 0.009);
        a.led(front, slot - 0.059, y + 0.029, -0.032, 0.013, 0.016, i % 5 === 0 ? 0xeac37d : 0x9cddd0, i % 3);
      }
    } else {
      a.grille(front, trayMesh, -0.14, y, -0.060, 1.38, h * 0.64);
      for (const x of [-0.39, 0.27]) a.box(front, m.frame, x, y, -0.048, 0.032, h * 0.76, 0.015);
    }
    for (const x of [-0.904, 0.883]) {
      a.box(front, m.frame, x, y, -0.041, 0.05, h * 0.73, 0.037);
    }
    a.led(front, 0.728, y, -0.070, 0.057, 0.015, 0x98ddd2, i % 4);
    if (i % 4 === 0) a.box(front, m.gold, 0.233, y - h * 0.42, -0.035, 1.19, 0.016, 0.021);
    a.box(rear, m.skin, 0, y, -0.114, 1.58, h, 0.065);
    a.grille(rear, rearMesh, 0.132, y, -0.077, 1.16, h * 0.77);
    a.box(rear, m.gasket, -0.531, y, -0.071, 0.31, h * 0.67, 0.021);
    a.box(rear, m.frame, -0.562, y, -0.035, 0.108, h * 0.37, 0.057);
    if (units === 2) {
      for (const x of [0.38, 0.58]) a.box(rear, m.gold, x, y, -0.067, 0.061, h * 0.57, 0.033);
    }
    a.led(rear, -0.364, y, -0.057, 0.025, 0.017, 0x9addaf, i % 4);
  }

  for (const x of [-0.865, 0.842]) {
    a.box(rear, m.black, x, 3.49, 0.006, 0.182, 5.25, 0.17);
    a.box(rear, m.gold, x - 0.069, 3.49, 0.1, 0.019, 5.15, 0.027);
    for (const y of range(22)) {
      a.box(rear, m.frame, x + 0.022, 1.02 + y * 0.23, 0.103, 0.091, 0.133, 0.039);
      a.box(rear, m.gasket, x + 0.022, 1.02 + y * 0.23, 0.124, 0.059, 0.079, 0.018);
    }
    a.led(rear, x + 0.022, 6.04, 0.108, 0.069, 0.022, 0xe6bd83, x > 0 ? 1 : 2);
  }
  const sleeve = a.metal('rack cable sleeve', 0x444e58, 0.13, 0.76);
  for (const index of range(15)) {
    const y = 1.03 + index * 0.313;
    const right = index % 4 === 0;
    const x = right ? 0.84 : -0.84;
    const connection = right ? 0.55 : -0.56;
    a.cable(rear, index % 5 === 0 ? m.bronze : sleeve, 0.019, [
      [connection, y, -0.008], [connection, y, 0.175], [x * 0.91, y - 0.193, 0.211],
      [x, y - 0.182, 0.156], [x, y - 0.11, 0.114],
    ], 12);
  }
  for (const x of [-0.98, 0.986]) for (const y of [1.21, 2.31, 3.41, 4.51, 5.61]) {
    a.box(rear, m.frame, x, y, 0.119, 0.086, 0.049, 0.15);
  }

  const openDoor = a.frame(p, -1.086, 3.49, faceZ + 0.126, [0, -0.59, 0]);
  const center = 1.083;
  a.panel(openDoor, m.black, center, 0, 0, 2.164, 5.78, 0.112, 0.063, FRONT, [[0, -0.021, 1.838, 5.454, 0.048]]);
  a.grille(openDoor, doorMesh, center, -0.021, 0.031, 1.87, 5.47);
  for (const y of [-2.78, -1.38, 0.06, 1.5, 2.78]) {
    a.box(openDoor, m.skin, center, y, -0.03, 1.89, 0.045, 0.036);
  }
  a.box(openDoor, m.gold, center, 2.806, 0.064, 1.936, 0.026, 0.023);
  a.box(openDoor, m.gold, center, -2.791, 0.064, 1.936, 0.028, 0.023);
  a.box(openDoor, m.frame, 2.096, 0, 0.055, 0.046, 5.48, 0.042);
  a.panel(openDoor, m.skin, 2.091, -0.28, 0.083, 0.137, 0.57, 0.091, 0.046);
  pull(a, openDoor, m, 2.108, -0.28, 0.116, 0.34, 0.115, 0.049);
  a.disc(openDoor, m.steel, 2.091, -0.498, 0.132, 0.035, 0.016);
  for (const y of [-2.39, -0.79, 0.79, 2.39]) {
    a.disc(openDoor, m.frame, -0.018, y, -0.02, 0.046, 0.211, FRONT, 12);
    a.box(p, m.black, -1.101, y + 3.49, 1.307, 0.11, 0.17, 0.15);
  }
  for (const x of [-0.688, 0.688]) {
    const top = a.frame(p, x, crown + 0.096, 0, TOP);
    for (const y of evenly(11, 0.11)) {
      a.box(top, m.black, 0, y, 0.004, 0.37, 0.054, 0.01);
      a.box(top, m.frame, 0, y + 0.036, 0.006, 0.37, 0.011, 0.012);
    }
  }
}

const builders = new Map([
  ['spark', spark],
  ['workstation', workstation],
  ['gpu-server', (a, m) => server(a, m, false)],
  ['rack', rack],
  ['hgx', (a, m) => server(a, m, true)],
]);

/** Build a floor-centered product with independently disposable geometry and materials. */
export function buildModel(name) {
  const builder = builders.get(name);
  if (!builder) throw new RangeError(`Unknown model: ${name}`);
  const assembly = new Assembly();
  builder(assembly, hardware(assembly));
  return assembly.finish(name);
}
