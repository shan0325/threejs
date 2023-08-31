import * as THREE from "three";
import WebGL from "three/addons/capabilities/WebGL.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import Stats from 'three/addons/libs/stats.module.js'


// 호환성 체크
if ( !WebGL.isWebGLAvailable() ) {
  const warning = WebGL.getWebGLErrorMessage();
  throw new Error(warning);
}

let animatePlaySpeed = 1;
let model, mixer;
const canvas = document.querySelector('#canvas');
const clock = new THREE.Clock();

// 장면
const scene = new THREE.Scene();

// 백그라운드 이미지 설정
const textureLoader = new THREE.TextureLoader();
const bgTexture = textureLoader.load('resources/textures/basic_background/best-blurred-background-wallpaper1.jpg');
scene.background = bgTexture;

// 카메라
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 1, 7);
camera.lookAt(new THREE.Vector3(0, 0, 0));

// 렌더러
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true
});
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
renderer.shadowMap.enabled = true; // 그림자 사용 시 설정

// 도형
const sphereGeometry = new THREE.SphereGeometry( 1, 32, 16 );
const sphereMaterial = new THREE.MeshStandardMaterial( { color: 0xff0000 } );
const sphere = new THREE.Mesh( sphereGeometry, sphereMaterial );
sphere.position.set(3, 1, 0);
sphere.castShadow = true; // 그림자 사용 시 사용
sphere.receiveShadow = true; // 그림자를 받겠다는 설정
// scene.add( sphere );

// 바닥 추가
const planeGeometry = new THREE.PlaneGeometry(5, 5, 1, 1);
const planeMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff });
const plane = new THREE.Mesh(planeGeometry, planeMaterial);
plane.rotation.x = -0.5 * Math.PI;
plane.receiveShadow = true // 그림자를 받겠다는 설정
// scene.add(plane);

// 빛(ambient)
const aLight = new THREE.AmbientLight(0xffffff, 1);
scene.add(aLight);

// 빛(directional)
const dLight = new THREE.DirectionalLight(0xffffff, 2); // 특정 방향으로 빛을 방출합니다. 태양을 생각하면 쉬울거 같습니다. 그리고 이 조명은 그림자를 생기게 합니다.
dLight.position.set(-5, 5, 2);
dLight.castShadow = true; // 그림자 사용 시 사용
dLight.shadow.mapSize.width = 1024; // 그림자 해상도 width
dLight.shadow.mapSize.height = 1024; // 그림자 해상도 height
dLight.shadow.radius = 2; // 그림자 블러 처리

// 빛(directional) 헬퍼
const lightHelper = new THREE.DirectionalLightHelper(dLight, 0.5); // DirectionalLight의 효과를 시각화하는데 도움되는 개체
scene.add(lightHelper);
scene.add(dLight);

// 카메라 헬퍼
// const helper = new THREE.CameraHelper( dLight.shadow.camera );
// scene.add( helper );

// 마우스 컨트롤
let controls = new OrbitControls( camera, renderer.domElement );
controls.rotateSpeed = 1.0; // 마우스로 카메라를 회전시킬 속도입니다. 기본값(Float)은 1입니다.
controls.zoomSpeed = 1.2; // 마우스 휠로 카메라를 줌 시키는 속도 입니다. 기본값(Float)은 1입니다.
controls.panSpeed = 0.8; // 패닝 속도 입니다. 기본값(Float)은 1입니다.
//controls.minDistance = 5; // 마우스 휠로 카메라 거리 조작시 최소 값. 기본값(Float)은 0 입니다.
//controls.maxDistance = 100; // 마우스 휠로 카메라 거리 조작시 최대 값. 기본값(Float)은 무제한 입니다.

// 로딩 매니저
const manager = new THREE.LoadingManager();
manager.onStart = function ( url, itemsLoaded, itemsTotal ) {
	console.log( 'Started loading file: ' + url + '.\nLoaded ' + itemsLoaded + ' of ' + itemsTotal + ' files.' );
};
manager.onLoad = function ( ) {
	console.log( 'Loading complete!');
};
manager.onProgress = function ( url, itemsLoaded, itemsTotal ) {
	console.log( 'Loading file: ' + url + '.\nLoaded ' + itemsLoaded + ' of ' + itemsTotal + ' files.' );
};
manager.onError = function ( url ) {
	console.log( 'There was an error loading ' + url );
};

// GLTF 로더
const loader = new GLTFLoader(manager);
loader.load('/resources/models/gltf/room1/Room1.gltf',
    (gltf) => {
        console.log(gltf);

        model = gltf.scene;
        scene.add( model );

        // 그림자 처리
        model.traverse( function ( object ) {
            if ( object.isMesh ) {
                object.castShadow = true;
            }
        } );

        const animations = gltf.animations;
        if(animations && animations.length > 0) {
            mixer = new THREE.AnimationMixer(model);
            const action = mixer.clipAction(animations[0]);
            action.play();
        }
    },
    function ( xhr ) {
      const loaded = ( xhr.loaded / xhr.total * 100 ) + '% loaded';
      document.querySelector('#loding').textContent = loaded;
    },
    function ( error ) {
        console.log( 'An error happened' );
    }
);

window.addEventListener('resize', onWindowResize, false)
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
    camera.lookAt( scene.position );
    
    renderer.setSize(window.innerWidth, window.innerHeight)

    setBgTextureSizeRatio();
    render()
}

const stats = new Stats()
document.body.appendChild(stats.dom);

function animate() {
    if(mixer) {
        mixer.update(clock.getDelta() * animatePlaySpeed);
    }

    controls.update();
    stats.update();
    render();

    requestAnimationFrame(animate);
}

function render() {
    renderer.render(scene, camera);
}
animate();

function setBgTextureSizeRatio() {
    const canvasAspect = canvas.clientWidth / canvas.clientHeight;
    const imageAspect = bgTexture.image ? bgTexture.image.width / bgTexture.image.height : 1;
    const aspect = imageAspect / canvasAspect;

    bgTexture.offset.x = aspect > 1 ? (1 - 1 / aspect) / 2 : 0;
    bgTexture.repeat.x = aspect > 1 ? 1 / aspect : 1;

    bgTexture.offset.y = aspect > 1 ? 0 : (1 - aspect) / 2;
    bgTexture.repeat.y = aspect > 1 ? 1 : aspect;
}