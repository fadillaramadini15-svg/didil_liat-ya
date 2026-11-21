import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// 1. Setup Scene, Camera, dan Renderer
const container = document.getElementById('canvas-container');
const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 6, 14);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
container.appendChild(renderer.domElement);

// Kontrol putar & zoom pakai mouse/touch
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;

// 2. Membuat Galaksi Spiral (Partikel Bintang Pink-Ungu)
const galaxyParams = {
  count: 15000,
  radius: 12,
  branches: 4,
  spin: 1.2,
  randomness: 0.4,
  insideColor: '#ff4da6',
  outsideColor: '#4d004d'
};

const galaxyGeo = new THREE.BufferGeometry();
const positions = new Float32Array(galaxyParams.count * 3);
const colors = new Float32Array(galaxyParams.count * 3);

const colorInside = new THREE.Color(galaxyParams.insideColor);
const colorOutside = new THREE.Color(galaxyParams.outsideColor);

for (let i = 0; i < galaxyParams.count; i++) {
  const i3 = i * 3;
  const radius = Math.random() * galaxyParams.radius;
  const spinAngle = radius * galaxyParams.spin;
  const branchAngle = ((i % galaxyParams.branches) / galaxyParams.branches) * Math.PI * 2;

  const randomX = Math.pow(Math.random(), 3) * (Math.random() < 0.5 ? 1 : -1) * galaxyParams.randomness * radius;
  const randomY = Math.pow(Math.random(), 3) * (Math.random() < 0.5 ? 1 : -1) * galaxyParams.randomness * radius * 0.4;
  const randomZ = Math.pow(Math.random(), 3) * (Math.random() < 0.5 ? 1 : -1) * galaxyParams.randomness * radius;

  positions[i3] = Math.cos(branchAngle + spinAngle) * radius + randomX;
  positions[i3 + 1] = randomY;
  positions[i3 + 2] = Math.sin(branchAngle + spinAngle) * radius + randomZ;

  const mixedColor = colorInside.clone();
  mixedColor.lerp(colorOutside, radius / galaxyParams.radius);

  colors[i3] = mixedColor.r;
  colors[i3 + 1] = mixedColor.g;
  colors[i3 + 2] = mixedColor.b;
}

galaxyGeo.setAttribute('position', new THREE.BufferAttribute(positions, 1).setUsage(THREE.StaticDrawUsage));
galaxyGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
galaxyGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

const galaxyMat = new THREE.PointsMaterial({
  size: 0.06,
  sizeAttenuation: true,
  depthWrite: false,
  blending: THREE.AdditiveBlending,
  vertexColors: true
});

const galaxyPoints = new THREE.Points(galaxyGeo, galaxyMat);
scene.add(galaxyPoints);

// 3. Membuat Partikel Bentuk Hati di Tengah Atas Galaksi
const heartCount = 2500;
const heartGeo = new THREE.BufferGeometry();
const heartPos = new Float32Array(heartCount * 3);

for (let i = 0; i < heartCount; i++) {
  const t = Math.random() * Math.PI * 2;
  // Rumus parametrik bentuk hati
  const x = 16 * Math.pow(Math.sin(t), 3);
  const y = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);
  const z = (Math.random() - 0.5) * 4;

  const scale = 0.14 + Math.random() * 0.02;
  heartPos[i * 3] = x * scale;
  heartPos[i * 3 + 1] = y * scale + 3.8; // Posisi melayang di atas pusat galaksi
  heartPos[i * 3 + 2] = z * scale;
}

heartGeo.setAttribute('position', new THREE.BufferAttribute(heartPos, 3));
const heartMat = new THREE.PointsMaterial({
  color: '#ff3385',
  size: 0.08,
  blending: THREE.AdditiveBlending,
  depthWrite: false
});
const heartPoints = new THREE.Points(heartGeo, heartMat);
scene.add(heartPoints);

// 4. Membuat Teks Melayang di Orbit Galaksi
function createTextSprite(message) {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  canvas.width = 512;
  canvas.height = 128;

  ctx.font = 'bold 42px Arial';
  ctx.fillStyle = '#ff99cc';
  ctx.textAlign = 'center';
  ctx.shadowColor = '#ff0066';
  ctx.shadowBlur = 15;
  ctx.fillText(message, canvas.width / 2, canvas.height / 2 + 15);

  const texture = new THREE.CanvasTexture(canvas);
  const material = new THREE.SpriteMaterial({ map: texture, transparent: true });
  const sprite = new THREE.Sprite(material);
  sprite.scale.set(4, 1, 1);
  return sprite;
}

const phrases = [
  'ILAA SAYANGG DIDILL ❤️',
  'AMOR DE MI VIDA',
  'TE AMO ✨',
  'ALWAYS WITH YOU',
  'MY UNIVERSE 🌸',
  'CELEBRAMOS HOY'
];

const textGroup = new THREE.Group();
phrases.forEach((text, index) => {
  const sprite = createTextSprite(text);
  const angle = (index / phrases.length) * Math.PI * 2;
  const orbitRadius = 6.5;
  sprite.position.set(Math.cos(angle) * orbitRadius, 0.5, Math.sin(angle) * orbitRadius);
  textGroup.add(sprite);
});
scene.add(textGroup);

// 5. Loop Animasi
const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);
  const elapsedTime = clock.getElapsedTime();

  // Putar galaksi, hati, dan teks perlahan
  galaxyPoints.rotation.y = elapsedTime * 0.12;
  textGroup.rotation.y = elapsedTime * 0.15;
  heartPoints.rotation.y = Math.sin(elapsedTime * 0.8) * 0.4;

  // Efek detak jantung ringan pada partikel hati
  const pulse = 1 + Math.sin(elapsedTime * 4) * 0.04;
  heartPoints.scale.set(pulse, pulse, pulse);

  controls.update();
  renderer.render(scene, camera);
}

animate();

// Responsif saat ukuran layar berubah
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});s