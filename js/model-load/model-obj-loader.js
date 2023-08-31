import * as THREE from "three";
import { OBJLoader } from "three/addons/loaders/OBJLoader.js";
import { MTLLoader } from "three/addons/loaders/MTLLoader.js";

export default {
    setupModelLoader(args) {
        return new Promise((resolve, reject) => {
            // mtl 로더
            const mtlLoader = new MTLLoader();
            mtlLoader.load(args.mtlUrl, 
                (mtl) => {
                    console.log(mtl);
                    mtl.preload();

                    // obj 로더
                    const objLoader = new OBJLoader();
                    objLoader.setMaterials(mtl); // MTLLoader에서 로드한 materials 파일을 설정합니다.
                    objLoader.load(args.objUrl,
                        (obj) => {
                            console.log(obj);

                            // 그림자 처리 
                            obj.traverse( function ( child ) {
                                if ( child.isMesh ) {
                                    child.castShadow = true;
                                    const material = child.material;
                                    // material.map = texture;
                                    if(material.isMeshPhongMaterial) {
                                        // material.shininess = 50;
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
                            console.log( 'An error happened' );
                        }
                    );
                }, function ( xhr ) {
                    console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
                }, function ( error ) {
                    console.log( 'An error happened' );
                }
            );
        });
    }
}