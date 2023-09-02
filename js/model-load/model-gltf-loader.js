import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

export default {
    setupModelLoader(args, loadingManager) {
        return new Promise((resolve, reject) => {
            const loader = new GLTFLoader(loadingManager);
            loader.load(args.url,
                (gltf) => {
                    console.log(gltf);
                    const model = gltf.scene
    
                    // 그림자 처리
                    model.traverse( function ( object ) {
                        if ( object.isMesh ) {
                            object.castShadow = true;
                        }
                    } );
    
                    // 애니메이션 처리
                    const mixer = new THREE.AnimationMixer(model);
                    const animations = gltf.animations;
                    if(animations && animations.length > 0) {
                        const action = mixer.clipAction(animations[0]);
                        action.play();
                    }

                    resolve({model, mixer});
                }
            );
        });
    }
}
