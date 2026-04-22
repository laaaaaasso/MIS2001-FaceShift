import * as THREE from "../vendor/three.module.js";
import { OrbitControls } from "../vendor/OrbitControls.js";
import { OBJLoader } from "../vendor/OBJLoader.js";

function ensureMaterial(root) {
  root.traverse((child) => {
    if (!child.isMesh) return;
    child.material = new THREE.MeshStandardMaterial({
      color: 0xbabec4,
      roughness: 0.9,
      metalness: 0.02,
      flatShading: false,
    });
  });
}

function fitCamera(object3d, camera, orbit) {
  const box = new THREE.Box3().setFromObject(object3d);
  if (box.isEmpty()) return;

  const size = box.getSize(new THREE.Vector3());
  const center = box.getCenter(new THREE.Vector3());
  const maxSize = Math.max(size.x, size.y, size.z);

  object3d.position.sub(center);
  orbit.target.set(0, 0, 0);

  const fov = THREE.MathUtils.degToRad(camera.fov);
  const dist = (maxSize * 0.8) / Math.tan(fov / 2);
  camera.position.set(0, 0, Math.max(dist, 0.8));
  camera.near = Math.max(0.001, maxSize / 1000);
  camera.far = Math.max(1000, maxSize * 20);
  camera.updateProjectionMatrix();
  orbit.update();
}

export function createViewer({ canvas, statusEl }) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0xeef2f4);

  const camera = new THREE.PerspectiveCamera(45, 1, 0.01, 1000);
  camera.position.set(0, 0, 2);

  const orbit = new OrbitControls(camera, renderer.domElement);
  orbit.enableDamping = true;
  orbit.target.set(0, 0, 0);

  const ambient = new THREE.AmbientLight(0xffffff, 0.8);
  scene.add(ambient);
  const directional = new THREE.DirectionalLight(0xffffff, 1.0);
  directional.position.set(2, 2, 3);
  scene.add(directional);

  const loader = new OBJLoader();
  let positionAttr = null;
  let editableMesh = null;
  let fittedDistance = 1.2;

  function resizeToCanvas() {
    const width = Math.max(1, canvas.clientWidth);
    const height = Math.max(1, canvas.clientHeight);
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  }

  function updatePositions(newPositions) {
    if (!positionAttr) return;
    positionAttr.array.set(newPositions);
    positionAttr.needsUpdate = true;
    editableMesh.geometry.computeVertexNormals();
    editableMesh.geometry.computeBoundingSphere();
  }

  function setViewPreset(key) {
    const yawMap = {
      front: 0,
      left30: -30,
      left60: -60,
      right30: 30,
      right60: 60,
    };
    const yaw = (yawMap[key] ?? 0) * (Math.PI / 180);
    camera.position.set(Math.sin(yaw) * fittedDistance, fittedDistance * 0.05, Math.cos(yaw) * fittedDistance);
    orbit.target.set(0, 0, 0);
    orbit.update();
  }

  function setLightMode(mode) {
    const presets = {
      studio: { ambient: 0.86, dir: 1.0, dirPos: [2, 2, 3] },
      natural: { ambient: 0.74, dir: 0.8, dirPos: [1.8, 1.6, 2.6] },
      dramatic: { ambient: 0.45, dir: 1.25, dirPos: [3, 1.5, 1.2] },
      soft: { ambient: 0.95, dir: 0.68, dirPos: [1.2, 2.3, 2.8] },
    };
    const p = presets[mode] ?? presets.studio;
    ambient.intensity = p.ambient;
    directional.intensity = p.dir;
    directional.position.set(...p.dirPos);
  }

  function animate() {
    orbit.update();
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }
  resizeToCanvas();
  animate();

  window.addEventListener("resize", () => {
    resizeToCanvas();
  });

  function loadFace(url) {
    statusEl.textContent = `Loading ${url} ...`;
    return new Promise((resolve, reject) => {
      loader.load(
        url,
        (obj) => {
          ensureMaterial(obj);
          scene.add(obj);
          fitCamera(obj, camera, orbit);
          fittedDistance = camera.position.length();

          obj.traverse((child) => {
            if (editableMesh || !child.isMesh) return;
            editableMesh = child;
          });

          if (!editableMesh) {
            statusEl.textContent = "OBJ loaded, but no mesh found.";
            reject(new Error("No mesh found in OBJ"));
            return;
          }

          positionAttr = editableMesh.geometry.getAttribute("position");
          statusEl.textContent = "Loaded: face.obj (edit with sliders, drag to rotate)";
          resolve({
            mesh: editableMesh,
            positionArray: positionAttr.array,
          });
        },
        undefined,
        (err) => {
          statusEl.textContent = `Failed to load ${url}`;
          reject(err);
        }
      );
    });
  }

  return {
    loadFace,
    updatePositions,
    setViewPreset,
    setLightMode,
  };
}
