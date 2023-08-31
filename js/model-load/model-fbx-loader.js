import * as THREE from "three";
import { FBXLoader } from "three/addons/loaders/FBXLoader.js";

export default {
  setupModelLoader(args) {
    return new Promise((resolve, reject) => {
      // fbx 로더
      const fbxLoader = new FBXLoader();
      fbxLoader.load(args.url, 
        (obj) => {
          console.log(obj);

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
          const mixer = new THREE.AnimationMixer(obj);
          const animationClips = obj.animations;
          animationClips.forEach(clip => {
              mixer.clipAction(clip).play();
          });

          resolve({model: obj, mixer});
        }, function ( xhr ) {
          const loaded = ( xhr.loaded / xhr.total * 100 ) + '% loaded';
          document.querySelector('#loding').textContent = loaded;
        }, function ( error ) {
          console.log( error );
          // console.log( 'An error happened' );
        }
      );
    });
  }
}