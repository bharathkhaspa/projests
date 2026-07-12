import { useEffect, useState } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { MeshoptDecoder } from "three/examples/jsm/libs/meshopt_decoder.module.js";

export function useOptionalGLTF(url: string | null | undefined): THREE.Group | null {
  const [scene, setScene] = useState<THREE.Group | null>(null);

  useEffect(() => {
    if (!url) {
      setScene(null);
      return;
    }
    let cancelled = false;
    const loader = new GLTFLoader();
    loader.setMeshoptDecoder(MeshoptDecoder);
    loader.load(
      url,
      (gltf) => {
        if (!cancelled) setScene(gltf.scene);
      },
      undefined,
      () => {
        if (!cancelled) setScene(null);
      },
    );
    return () => {
      cancelled = true;
    };
  }, [url]);

  return scene;
}
