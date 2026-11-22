import * as THREE from './three.module.min.js';
import { OrbitControls } from './OrbitControls.js';
import { RoomEnvironment } from './RoomEnvironment.js';
import { buildModel } from './models.js';

const DEFAULT_ACCENT = '#e8ac8c';
const VIEWS = new Map([
  ['workstation', [56, 20]],
  ['hgx', [34, 29]],
]);
const LED_INTERVAL = 125;

function directional(scene, color, intensity, position) {
  const light = new THREE.DirectionalLight(color, intensity);
  light.position.set(...position);
  scene.add(light);
  return light;
}

function floorFootprint(model, bounds) {
  const footprint = new THREE.Box3();
  const part = new THREE.Box3();
  const matrix = new THREE.Matrix4();
  const instance = new THREE.Matrix4();
  model.traverse(object => {
    if (!object.isMesh) return;
    const { geometry } = object;
    if (!geometry.boundingBox) geometry.computeBoundingBox();
    for (let index = 0; index < (object.isInstancedMesh ? object.count : 1); index++) {
      matrix.copy(object.matrixWorld);
      if (object.isInstancedMesh) {
        object.getMatrixAt(index, instance);
        matrix.multiply(instance);
      }
      part.copy(geometry.boundingBox).applyMatrix4(matrix);
      if (part.min.y < 0.027) footprint.union(part);
    }
  });
  return footprint.isEmpty() ? bounds : footprint;
}

function contactShadow(footprint) {
  const size = footprint.getSize(new THREE.Vector3());
  const center = footprint.getCenter(new THREE.Vector3());
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 128;
  const ctx = canvas.getContext('2d');
  const gradient = ctx.createRadialGradient(64, 64, 5, 64, 64, 63);
  for (const [position, opacity] of [[0, 0.64], [0.45, 0.48], [0.72, 0.20], [1, 0]]) {
    gradient.addColorStop(position, `rgba(12, 16, 22, ${opacity})`);
  }
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 128, 128);
  const mesh = new THREE.Mesh(
    new THREE.PlaneGeometry(size.x * 1.62, size.z * 1.62),
    new THREE.MeshBasicMaterial({
      map: new THREE.CanvasTexture(canvas), transparent: true, depthWrite: false, toneMapped: false,
    }),
  );
  mesh.rotation.x = -Math.PI / 2;
  mesh.position.set(center.x, -0.003, center.z);
  return mesh;
}

function disposeMeshes(scene) {
  const resources = new Set();
  scene.traverse(object => {
    if (!object.isMesh) return;
    if (object.isInstancedMesh) object.dispose();
    resources.add(object.geometry);
    const materials = Array.isArray(object.material) ? object.material : [object.material];
    for (const material of materials) {
      resources.add(material);
      for (const key of ['map', 'alphaMap', 'bumpMap', 'normalMap']) {
        if (material[key]) resources.add(material[key]);
      }
    }
  });
  for (const resource of resources) resource.dispose();
}

function fitDistance(camera, size, elevation) {
  const height = size.y / 2;
  const radius = Math.hypot(size.x, size.z) / 2;
  const tangent = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
  const sin = Math.sin(elevation);
  const cos = Math.cos(elevation);
  const widthDistance = Math.hypot(radius * cos, radius / (tangent * camera.aspect)) + height * sin;
  let heightDistance = 0;
  for (const z of [-radius, radius]) for (const y of [-height, height]) {
    heightDistance = Math.max(heightDistance, z * cos + y * sin + Math.abs(y * cos - z * sin) / tangent);
  }
  return Math.max(widthDistance, heightDistance) * 1.14;
}

/**
 * Mount a product viewer in an element with a CSS-defined size. Front faces +Z.
 * Returns null when WebGL 2 is unavailable. onReady fires after the first visible frame.
 */
export async function mountViewer(container, modelName, {
  accent = DEFAULT_ACCENT,
  background = null,
  autoRotate = true,
  onReady,
} = {}) {
  const canvas = document.createElement('canvas');
  let renderer;
  try {
    const context = canvas.getContext('webgl2', { alpha: true, antialias: true });
    if (!context) return null;
    renderer = new THREE.WebGLRenderer({ canvas, context, alpha: true, antialias: true });
  } catch {
    return null;
  }

  const scene = new THREE.Scene();
  scene.background = background == null ? null : new THREE.Color(background);
  scene.environmentIntensity = 0.92;
  renderer.setClearColor(0, 0);
  renderer.toneMapping = THREE.NeutralToneMapping;
  renderer.toneMappingExposure = 1.04;

  let model;
  try {
    model = buildModel(modelName);
  } catch (error) {
    renderer.dispose();
    renderer.forceContextLoss();
    throw error;
  }
  scene.add(model);
  const bounds = new THREE.Box3().setFromObject(model);
  const size = bounds.getSize(new THREE.Vector3());
  const target = bounds.getCenter(new THREE.Vector3());
  scene.add(contactShadow(floorFootprint(model, bounds)));

  const key = directional(scene, accent, 2.48, [3.6, 5.8, 5.5]);
  directional(scene, 0xc7dfff, 1.48, [-4.5, 2.3, 3.2]);
  directional(scene, 0xd5e8ff, 2.32, [2.0, 4.5, -4.8]);
  directional(scene, 0xffe4cf, 1.14, [-3, 1.8, -4.3]);
  scene.add(new THREE.HemisphereLight(0xd9e9ff, 0x817064, 1.13));

  const camera = new THREE.PerspectiveCamera(33, 1, 0.015, 100);
  const [yaw, elevation] = (VIEWS.get(modelName) ?? [34, 25]).map(THREE.MathUtils.degToRad);
  const viewDirection = new THREE.Vector3().setFromSphericalCoords(1, Math.PI / 2 - elevation, yaw);
  camera.position.copy(target).addScaledVector(viewDirection, 3);

  canvas.style.cssText = 'display:block;width:100%;height:100%;outline-offset:-4px';
  canvas.tabIndex = 0;
  canvas.setAttribute('aria-label', `${modelName} 3D viewer. Use the arrow keys to orbit and plus or minus to zoom.`);
  container.append(canvas);

  const controls = new OrbitControls(camera, canvas);
  controls.target.copy(target);
  controls.enablePan = false;
  controls.enableDamping = true;
  controls.dampingFactor = 0.115;
  controls.rotateSpeed = 0.74;
  controls.zoomSpeed = 0.75;
  controls.autoRotateSpeed = 0.46;
  controls.minPolarAngle = THREE.MathUtils.degToRad(18);
  controls.maxPolarAngle = THREE.MathUtils.degToRad(98);
  controls.touches.TWO = THREE.TOUCH.DOLLY_ROTATE;
  controls.cursorStyle = 'grab';
  controls.update();

  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const leds = model.userData.leds;
  let shouldRotate = Boolean(autoRotate);
  let onscreen = typeof IntersectionObserver === 'undefined';
  let hasSize = false;
  let contextLost = false;
  let disposed = false;
  let interacting = false;
  let dirty = true;
  let ready = false;
  let request = 0;
  let fittedDistance = 0;
  let viewportWidth = 0;
  let viewportHeight = 0;
  let pixelRatio = 0;
  let lastFrame = 0;
  let elapsed = 0;
  let lastLedFrame = -LED_INTERVAL;
  let resumeRotationAt = 0;
  let environmentAttempted = false;
  let environmentTarget;

  function active() {
    return !disposed && onscreen && hasSize && !document.hidden && !contextLost;
  }

  function schedule() {
    if (active()) {
      if (!request) request = requestAnimationFrame(frame);
    } else {
      if (request) cancelAnimationFrame(request);
      request = 0;
      lastFrame = 0;
    }
  }

  function frame(now) {
    request = 0;
    if (!active()) return;
    const delta = lastFrame ? Math.min((now - lastFrame) / 1000, 0.05) : 0;
    lastFrame = now;
    elapsed += delta * 1000;
    controls.autoRotate = shouldRotate && !motion.matches && !interacting && now >= resumeRotationAt;
    // Apply inertia only to user input, so stopping auto-rotate takes effect immediately.
    controls.enableDamping = !controls.autoRotate;
    controls.update(delta);
    controls.enableDamping = true;

    if (!environmentAttempted) {
      environmentAttempted = true;
      if (renderer.extensions.has('EXT_color_buffer_float')) {
        const room = new RoomEnvironment();
        const pmrem = new THREE.PMREMGenerator(renderer);
        try {
          environmentTarget = pmrem.fromScene(room, 0.03, 0.1, 100, { size: 128 });
          scene.environment = environmentTarget.texture;
        } finally {
          pmrem.dispose();
          room.dispose();
        }
      }
    }

    if (!motion.matches && elapsed - lastLedFrame >= LED_INTERVAL) {
      lastLedFrame = elapsed;
      for (const { material, phase } of leds) {
        const signal = 0.5 + 0.5 * Math.sin(elapsed * 0.0017 + phase);
        material.emissiveIntensity = 0.30 + 0.49 * signal ** 3;
      }
      dirty = true;
    }
    if (dirty) {
      dirty = false;
      renderer.render(scene, camera);
      if (!ready) {
        ready = true;
        onReady?.();
      }
    }
    schedule();
  }

  function resize() {
    if (disposed) return;
    const width = container.clientWidth;
    const height = container.clientHeight;
    const nextPixelRatio = Math.min(window.devicePixelRatio || 1, 2);
    hasSize = width > 0 && height > 0;
    if (hasSize && (width !== viewportWidth || height !== viewportHeight || nextPixelRatio !== pixelRatio)) {
      viewportWidth = width;
      viewportHeight = height;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      const distance = fitDistance(camera, size, elevation);
      const zoom = fittedDistance ? camera.position.distanceTo(target) / fittedDistance : 1;
      fittedDistance = distance;
      controls.minDistance = distance * 0.76;
      controls.maxDistance = distance * 1.50;
      camera.position.sub(target).setLength(distance * zoom).add(target);
      if (nextPixelRatio !== pixelRatio) {
        pixelRatio = nextPixelRatio;
        renderer.setPixelRatio(pixelRatio);
      }
      renderer.setSize(width, height, false);
      dirty = true;
    }
    schedule();
  }

  function invalidate() {
    dirty = true;
    schedule();
  }

  function startInteraction() {
    interacting = true;
    controls.autoRotate = false;
  }

  function endInteraction() {
    interacting = false;
    resumeRotationAt = performance.now() + 3600;
  }

  function syncMotion() {
    if (!shouldRotate || motion.matches) controls.autoRotate = false;
    if (motion.matches) {
      for (const { material } of leds) material.emissiveIntensity = 0.49;
    }
    invalidate();
  }

  function onKey(event) {
    const step = THREE.MathUtils.degToRad(12);
    const actions = {
      ArrowLeft: () => controls.rotateLeft(step),
      ArrowRight: () => controls.rotateLeft(-step),
      ArrowUp: () => controls.rotateUp(step),
      ArrowDown: () => controls.rotateUp(-step),
      '+': () => controls.dollyIn(0.9),
      '=': () => controls.dollyIn(0.9),
      '-': () => controls.dollyOut(0.9),
    };
    if (event.altKey || event.ctrlKey || event.metaKey || !Object.hasOwn(actions, event.key)) return;
    event.preventDefault();
    controls.autoRotate = false;
    actions[event.key]();
    endInteraction();
  }

  function onContextLost() {
    contextLost = true;
    schedule();
  }

  function onContextRestored() {
    contextLost = false;
    scene.environment = null;
    environmentTarget?.dispose();
    environmentTarget = undefined;
    environmentAttempted = false;
    invalidate();
  }

  const intersection = typeof IntersectionObserver === 'undefined' ? null : new IntersectionObserver(([entry]) => {
    onscreen = entry.isIntersecting;
    schedule();
  });
  const observer = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(resize);
  intersection?.observe(container);
  observer?.observe(container);
  controls.addEventListener('change', invalidate);
  controls.addEventListener('start', startInteraction);
  controls.addEventListener('end', endInteraction);
  canvas.addEventListener('keydown', onKey);
  canvas.addEventListener('webglcontextlost', onContextLost);
  canvas.addEventListener('webglcontextrestored', onContextRestored);
  document.addEventListener('visibilitychange', schedule);
  window.addEventListener('resize', resize);
  motion.addEventListener('change', syncMotion);
  resize();
  syncMotion();

  return {
    dispose() {
      if (disposed) return;
      disposed = true;
      schedule();
      intersection?.disconnect();
      observer?.disconnect();
      controls.dispose();
      window.removeEventListener('resize', resize);
      document.removeEventListener('visibilitychange', schedule);
      motion.removeEventListener('change', syncMotion);
      canvas.removeEventListener('keydown', onKey);
      canvas.removeEventListener('webglcontextlost', onContextLost);
      canvas.removeEventListener('webglcontextrestored', onContextRestored);
      environmentTarget?.dispose();
      disposeMeshes(scene);
      renderer.dispose();
      renderer.forceContextLoss();
      canvas.remove();
    },
    setAccent(hex) {
      if (disposed) return;
      key.color.set(hex);
      invalidate();
    },
    setAutoRotate(enabled) {
      if (disposed) return;
      shouldRotate = Boolean(enabled);
      resumeRotationAt = 0;
      syncMotion();
    },
  };
}
