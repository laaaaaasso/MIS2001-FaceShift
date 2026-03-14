import * as THREE from "./vendor/three.module.js";
import { OrbitControls } from "./vendor/OrbitControls.js";
import { OBJLoader } from "./vendor/OBJLoader.js";

const canvas = document.getElementById("scene");
const status = document.getElementById("status");

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xeef2f4);

const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.01, 1000);
camera.position.set(0, 0, 2);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.target.set(0, 0, 0);

scene.add(new THREE.AmbientLight(0xffffff, 0.8));
const directional = new THREE.DirectionalLight(0xffffff, 1.0);
directional.position.set(2, 2, 3);
scene.add(directional);

function setDefaultMaterial(root) {
  root.traverse((child) => {
    if (!child.isMesh) return;
    if (!child.material) {
      child.material = new THREE.MeshStandardMaterial({
        color: 0xb8b8b8,
        roughness: 0.85,
        metalness: 0.05,
      });
    }
  });
}

function fitCameraToObject(object3d) {
  const box = new THREE.Box3().setFromObject(object3d);
  if (box.isEmpty()) return;

  const size = box.getSize(new THREE.Vector3());
  const center = box.getCenter(new THREE.Vector3());
  const maxSize = Math.max(size.x, size.y, size.z);

  object3d.position.sub(center);
  controls.target.set(0, 0, 0);

  const fov = THREE.MathUtils.degToRad(camera.fov);
  const dist = (maxSize * 0.8) / Math.tan(fov / 2);
  camera.position.set(0, 0, Math.max(dist, 0.8));
  camera.near = Math.max(0.001, maxSize / 1000);
  camera.far = Math.max(1000, maxSize * 20);
  camera.updateProjectionMatrix();
  controls.update();
}

const loader = new OBJLoader();
status.textContent = "Loading ./public/face.obj ...";
loader.load(
  "./public/face.obj",
  (obj) => {
    setDefaultMaterial(obj);
    scene.add(obj);
    fitCameraToObject(obj);
    status.textContent = "Loaded: face.obj (drag to rotate, wheel to zoom, right-drag to pan)";
  },
  undefined,
  (error) => {
    console.error(error);
    status.textContent = "Failed to load ./public/face.obj";
  }
);

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

function animate() {
  controls.update();
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

animate();
