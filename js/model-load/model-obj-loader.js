import * as THREE from "three";
import { OBJLoader } from "three/addons/loaders/OBJLoader.js";
import { MTLLoader } from "three/addons/loaders/MTLLoader.js";

export default {
  async setupModelLoader(args, loadingManager) {
    const mtlUrl = args.mtlUrl;
    const objUrl = args.objUrl;

    let mtl;
    if (mtlUrl) {
      const mtlLoaderPromise = new Promise((resolve, reject) => {
        // mtl 로더
        const mtlLoader = new MTLLoader(loadingManager);
        mtlLoader.load(
          mtlUrl,
          (mtl) => {
            // console.log(mtl);

            mtl.preload();
            resolve(mtl);
          },
          function (xhr) {
            // console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
          },
          function (error) {
            console.log("An error happened");
            reject(error);
          }
        );
      });
      mtl = await mtlLoaderPromise;
    }

    return new Promise((resolve, reject) => {
      // obj 로더
      const objLoader = new OBJLoader(loadingManager);
      if (mtl) {
        objLoader.setMaterials(mtl); // MTLLoader에서 로드한 materials 파일을 설정합니다.
      }

      objLoader.load(objUrl, (obj) => {
        console.log(obj);

        if (obj.skeleton) {
          console.log("모델은 Rigged 되었습니다.");
        }

        let vertexCount = 0;
        let textureCount = 0;
        let uvCount = 0;
        obj.traverse(function (child) {
          if (child.isMesh) {
            console.log(child);

            child.material.clipIntersection = true;
            child.material.clipShadows = true;
            // child.material.colorWrite = false;
            child.material.dithering = true;

            const geometry = child.geometry;
            if (geometry) {
              if (geometry.isBufferGeometry) {
                vertexCount += geometry.attributes.position.count;
              } else {
                vertexCount += geometry.vertices.length;
              }

              if (geometry.attributes.uv) {
                uvCount++;
              }
            }

            child.castShadow = true; // 그림자 처리

            const material = child.material;
            if (material.map) {
              textureCount++;
            }
            if (material.isMeshPhongMaterial) {
              // material.shininess = 50;
            }
          }
        });
        console.log(vertexCount);
        console.log(textureCount);
        console.log(uvCount);

        // 애니메이션 처리
        const mixer = new THREE.AnimationMixer(obj);
        const animationClips = obj.animations;
        animationClips.forEach((clip) => {
          mixer.clipAction(clip).play();
        });

        resolve({ model: obj, mixer });
      });
    });
  },
};
