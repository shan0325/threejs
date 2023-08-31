import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { OBJLoader } from "three/addons/loaders/OBJLoader.js";
import { MTLLoader } from "three/addons/loaders/MTLLoader.js";

let camera, scene, renderer;
let object;
init();

function init() {
    camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 0.1, 20 );
	camera.position.z = 2.5;

    // scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xc4d0db);

    const ambientLight = new THREE.AmbientLight( 0xffffff );
    scene.add( ambientLight );

    const pointLight = new THREE.PointLight( 0xffffff, 15 );
    camera.add( pointLight );
    scene.add( camera );

    // manager
    function loadModel() {
        console.log(object);
        object.traverse( function ( child ) {
            // if ( child.isMesh ) child.material.map = texture;
        } );

        object.position.y = - 0.95;
        object.scale.setScalar( 0.01 );
        scene.add( object );
        render();
    }

    const manager = new THREE.LoadingManager( loadModel );

    // texture
    const textureLoader = new THREE.TextureLoader( manager );
    const texture = textureLoader.load( '/resources/models/obj/male02/orig_02_-_Defaul1noCulling.JPG', render );
    texture.colorSpace = THREE.SRGBColorSpace;

    // model
    function onProgress( xhr ) {
        if ( xhr.lengthComputable ) {
            const percentComplete = xhr.loaded / xhr.total * 100;
            console.log( 'model ' + Math.round( percentComplete, 2 ) + '% downloaded' );
        }
    }

    function onError() {}

    const mtlLoader = new MTLLoader(manager);
    mtlLoader.load('/resources/models/obj/male02/male02.mtl', 
        (mtl) => {
            mtl.preload();
            const loader = new OBJLoader( manager );
            loader.setMaterials(mtl);
            loader.load( '/resources/models/obj/male02/male02.obj', function ( obj ) {
                object = obj;
            }, onProgress, onError );
        }
    );

    //
    renderer = new THREE.WebGLRenderer( { antialias: true } );
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );
    document.body.appendChild( renderer.domElement );

    //
    const controls = new  OrbitControls( camera, renderer.domElement );
    controls.minDistance = 2;
    controls.maxDistance = 5;
    controls.addEventListener( 'change', render );

    //
    window.addEventListener( 'resize', onWindowResize );
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );
}

function render() {
    renderer.render( scene, camera );
}