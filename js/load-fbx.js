import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { FBXLoader } from "three/addons/loaders/FBXLoader.js";
import Stats from 'three/addons/libs/stats.module.js'

export class LoadFbx {
    constructor(url) {
        this.animatePlaySpeed = 1;
        this.canvas = document.querySelector('#canvas');
        this.clock = new THREE.Clock();

        this.setupScene();
        this.setupCamera();
        this.setupRenderer(this.canvas);
        // this.setupFloorMesh();
        this.setupAmbientLight();
        // this.setupDirectionalLight(-5, 5, 0);
        // this.setupDirectionalLight(5, 5, 0);
        // this.setupDirectionalLight(0, 5, -5);
        // this.setupDirectionalLight(0, -5, 5);
        this.setupObitControls();
        this.setupStats();
        this.setupModel(url);
        this.animate();

        window.onresize = this.onWindowResize.bind(this);
    }
    setupScene() {
        // 장면
        this.scene = new THREE.Scene();
        // this.scene.background = new THREE.Color(0xffffff);

        // 백그라운드 이미지 설정
        const textureLoader = new THREE.TextureLoader();
        this.bgTexture = textureLoader.load('resources/textures/basic_background/Light-Blue-blur-background1.jpg');
        this.scene.background = this.bgTexture;
    }
    setupCamera() {
        // 카메라
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.set(0, 1, 7);
        this.camera.lookAt(new THREE.Vector3(0, 0, 0));
        this.scene.add(this.camera);
    }
    setupRenderer(canvas) {
        // 렌더러
        this.renderer = new THREE.WebGLRenderer({
            canvas: canvas,
            antialias: true
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        document.body.appendChild(this.renderer.domElement);
        this.renderer.shadowMap.enabled = true; // 그림자 사용 시 설정
    }
    setupFloorMesh() {
        // 바닥 추가
        const planeGeometry = new THREE.PlaneGeometry(20, 20, 1, 1);
        const planeMaterial = new THREE.MeshStandardMaterial({ color: 0x888888 });
        const plane = new THREE.Mesh(planeGeometry, planeMaterial);
        plane.rotation.x = -0.5 * Math.PI;
        plane.receiveShadow = true // 그림자를 받겠다는 설정
        this.scene.add(plane);
    }
    setupAmbientLight() {
        // 빛(ambient)
        const aLight = new THREE.AmbientLight(0xffffff, 1);
        this.scene.add(aLight);
        this.camera.add(aLight);
    }
    setupDirectionalLight(x, y, z, intensity) {
        // 빛(directional)
        const dLight = new THREE.DirectionalLight(0xffffff, intensity); // 특정 방향으로 빛을 방출합니다. 태양을 생각하면 쉬울거 같습니다. 그리고 이 조명은 그림자를 생기게 합니다.
        dLight.position.set(x, y, z);
        dLight.castShadow = true; // 그림자 사용 시 사용
        dLight.shadow.mapSize.width = 1024; // 그림자 해상도 width
        dLight.shadow.mapSize.height = 1024; // 그림자 해상도 height
        dLight.shadow.radius = 2; // 그림자 블러 처리

        // 빛(directional) 헬퍼
        const lightHelper = new THREE.DirectionalLightHelper(dLight, 1); // DirectionalLight의 효과를 시각화하는데 도움되는 개체
        this.scene.add(lightHelper);
        this.scene.add(dLight);
        this.scene.add(dLight.target);
    }
    setupPointLight(x, y, z, intensity, distance) {
        const light = new THREE.PointLight( 0xffffff, intensity, distance );
        light.position.set(x, y, z);

        // 빛(directional) 헬퍼
        const lightHelper = new THREE.PointLightHelper(light, 1); // DirectionalLight의 효과를 시각화하는데 도움되는 개체
        this.scene.add(lightHelper);
        this.scene.add(light);
    }
    setupObitControls() {
        // 마우스 컨트롤
        this.controls = new OrbitControls( this.camera, this.renderer.domElement );
        this.controls.rotateSpeed = 1.0; // 마우스로 카메라를 회전시킬 속도입니다. 기본값(Float)은 1입니다.
        this.controls.zoomSpeed = 1.2; // 마우스 휠로 카메라를 줌 시키는 속도 입니다. 기본값(Float)은 1입니다.
        this.controls.panSpeed = 0.8; // 패닝 속도 입니다. 기본값(Float)은 1입니다.
        //this.controls.minDistance = 5; // 마우스 휠로 카메라 거리 조작시 최소 값. 기본값(Float)은 0 입니다.
        //this.controls.maxDistance = 100; // 마우스 휠로 카메라 거리 조작시 최대 값. 기본값(Float)은 무제한 입니다.
    }
    setupStats() {
        // fps 상태값 노출
        this.stats = new Stats()
        document.body.appendChild(this.stats.dom);
    }
    setupModel(url) {
        // fbx 로더
        const fbxLoader = new FBXLoader();
        fbxLoader.load(url, 
            (obj) => {
                console.log(obj);

                this.model = obj;
                this.scene.add(obj);

                obj.traverse( function ( child ) {
                    if ( child.isMesh ) {
                        child.castShadow = true; // 그림자 처리
                        const material = child.material;
                        if(material.isMeshPhongMaterial) {
                            // material.shininess = 100;
                        }
                    }
                });

                // 애니메이션 처리
                this.mixer = new THREE.AnimationMixer(obj);
                const animationClips = obj.animations;
                animationClips.forEach(clip => {
                    this.mixer.clipAction(clip).play();
                });

                this.setCameraPositionRatio(this.model, this.camera, this.controls, 'Z', true);
                this.setupLightPositionRatio(this.model);
            }, function ( xhr ) {
                const loaded = ( xhr.loaded / xhr.total * 100 ) + '% loaded';
                document.querySelector('#loding').textContent = loaded;
            }, function ( error ) {
                console.log( 'An error happened' );
            }
        );
    }
    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight
        this.camera.updateProjectionMatrix()
        
        this.renderer.setSize(window.innerWidth, window.innerHeight)
    
        this.setBgTextureSizeRatio(this.canvas, this.bgTexture);
        this.render()
    }
    animate() {
        if(this.mixer) {
            this.mixer.update(this.clock.getDelta() * this.animatePlaySpeed);
        }
    
        this.controls.update();
        this.stats.update();
        this.render();
    
        requestAnimationFrame(this.animate.bind(this));
    }
    render() {
        this.renderer.render(this.scene, this.camera);
    }
    setBgTextureSizeRatio(canvas, bgTexture) {
        const canvasAspect = canvas.clientWidth / canvas.clientHeight;
        const imageAspect = bgTexture.image ? bgTexture.image.width / bgTexture.image.height : 1;
        const aspect = imageAspect / canvasAspect;
    
        bgTexture.offset.x = aspect > 1 ? (1 - 1 / aspect) / 2 : 0;
        bgTexture.repeat.x = aspect > 1 ? 1 / aspect : 1;

        bgTexture.offset.y = aspect > 1 ? 0 : (1 - aspect) / 2;
        bgTexture.repeat.y = aspect > 1 ? 1 : aspect;
    }
    setCameraPositionRatio(model, camera, controls, viewMode, bFront) {
        const zPositionRatio = 2;

        const box = new THREE.Box3().setFromObject(model);
        console.log(box);
        
        const sizeBox = box.getSize(new THREE.Vector3()).length();
        console.log(sizeBox);

        const centerBox = box.getCenter(new THREE.Vector3());
        console.log(centerBox);

        let offsetX = 0, offsetY = 0, offsetZ = 0;
        viewMode === "X" ? offsetX = 1 : (viewMode === "Y") ? offsetY = 1 : offsetZ = 1;
        if(!bFront) {
            offsetX *= -1;
            offsetY *= -1;
            offsetZ *= -1;
        }
        camera.position.set(centerBox.x + offsetX, centerBox.y + offsetY, centerBox.z + offsetZ);

        const halfSizeModel = sizeBox * 0.5;
        const halfFov = THREE.MathUtils.degToRad(camera.fov * .5);
        const distance = halfSizeModel / Math.tan(halfFov);
        const direction = (new THREE.Vector3()).subVectors(camera.position, centerBox).normalize();
        const position = direction.multiplyScalar(distance).add(centerBox);
        position.z *= zPositionRatio;

        camera.position.copy(position);
        camera.near = sizeBox / 100; // 가까운곳
        camera.far = sizeBox * 100; // 먼곳
        camera.updateProjectionMatrix();
        camera.lookAt(centerBox.x, centerBox.y, centerBox.z);

        controls.maxDistance = sizeBox * 10;
        controls.target.copy(centerBox);
        controls.update();

        console.log(camera.position);
    }
    setupLightPositionRatio(model) {
        const box = new THREE.Box3().setFromObject(model);
        const sizeBox = box.getSize(new THREE.Vector3()).length();
        const centerBox = box.getCenter(new THREE.Vector3());

        this.setupDirectionalLight(box.min.x * 2, sizeBox + box.max.y, box.max.z * 2, 1);
        this.setupDirectionalLight(box.max.x * 2, sizeBox * -1, box.max.z * 2, 1);
        // this.setupPointLight(centerBox.x, centerBox.y, box.max.z * 7, 20, sizeBox);
    }
}