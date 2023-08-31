// 필요한 Three.js 요소를 가져옵니다.
import * as THREE from 'three';

// Scene, Camera, Renderer를 생성합니다.
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({
    canvas: document.querySelector('#canvas'),
    antialias: true
});
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// 배경 그라디언트 색상을 지정합니다.
const gradientColors = ['#3399FF', '#66CCFF']; // 원하는 색상을 추가하거나 변경합니다.

// 그라디언트 배경을 만듭니다.
const gradientTexture = new THREE.Texture(generateGradientTexture(gradientColors));
scene.background = gradientTexture;

// 그라디언트 텍스처를 생성하는 함수
function generateGradientTexture(colors) {
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  canvas.width = 256; // 원하는 너비로 조정
  canvas.height = 256; // 원하는 높이로 조정

  // 그라디언트를 그립니다.
  const gradient = context.createLinearGradient(0, 0, canvas.width, canvas.height);
  gradientColors.forEach((color, index) => {
    gradient.addColorStop(index / (colors.length - 1), color);
  });

  context.fillStyle = gradient;
  context.fillRect(0, 0, canvas.width, canvas.height);

  return canvas;
}

// 카메라 위치 설정
camera.position.z = 5;

// 애니메이션 루프
function animate() {
  requestAnimationFrame(animate);

  // 물체를 회전시키거나 다른 애니메이션을 추가할 수 있습니다.

  renderer.render(scene, camera);
}

animate();
