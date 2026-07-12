import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { useCustomizer, type GarmentType } from "../store/customizer";
import { useOptionalGLTF } from "../lib/useOptionalGLTF";
import { useProduct } from "../hooks/useCatalog";

function tshirtShape(): THREE.Shape {
  const s = new THREE.Shape();
  s.moveTo(-0.42, 1);
  s.bezierCurveTo(-0.18, 0.92, 0.18, 0.92, 0.42, 1);
  s.lineTo(0.86, 0.84);
  s.lineTo(0.96, 0.5);
  s.lineTo(0.56, 0.4);
  s.lineTo(0.5, -1);
  s.lineTo(-0.5, -1);
  s.lineTo(-0.56, 0.4);
  s.lineTo(-0.96, 0.5);
  s.lineTo(-0.86, 0.84);
  s.closePath();
  return s;
}

function hoodieShape(): THREE.Shape {
  const s = new THREE.Shape();
  s.moveTo(-0.5, 1.0);
  s.bezierCurveTo(-0.3, 1.25, 0.3, 1.25, 0.5, 1.0);
  s.lineTo(0.92, 0.84);
  s.lineTo(1.02, 0.45);
  s.lineTo(0.6, 0.36);
  s.lineTo(0.56, -1.05);
  s.lineTo(-0.56, -1.05);
  s.lineTo(-0.6, 0.36);
  s.lineTo(-1.02, 0.45);
  s.lineTo(-0.92, 0.84);
  s.closePath();
  return s;
}

function tankShape(): THREE.Shape {
  const s = new THREE.Shape();
  s.moveTo(-0.32, 0.95);
  s.bezierCurveTo(-0.14, 0.88, 0.14, 0.88, 0.32, 0.95);
  s.lineTo(0.42, 0.9);
  s.lineTo(0.48, -1);
  s.lineTo(-0.48, -1);
  s.lineTo(-0.42, 0.9);
  s.closePath();
  return s;
}

function getShape(type: GarmentType): THREE.Shape {
  switch (type) {
    case "hoodie":
      return hoodieShape();
    case "tank":
      return tankShape();
    case "polo":
    case "tshirt":
    default:
      return tshirtShape();
  }
}

function buildGeometry(type: GarmentType): THREE.BufferGeometry {
  const shape = getShape(type);
  const geom = new THREE.ExtrudeGeometry(shape, {
    depth: 0.18,
    bevelEnabled: true,
    bevelSegments: 10,
    bevelSize: 0.05,
    bevelThickness: 0.05,
    curveSegments: 48,
  });
  geom.center();

  // Bulge front + slight bulge back so it stops looking like a flat cutout.
  // The center of the chest/back pushes outward most; edges (sleeves, hem) push less.
  const pos = geom.attributes.position as THREE.BufferAttribute;
  const v = new THREE.Vector3();
  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i);
    const isFront = v.z > 0.02;
    const isBack = v.z < -0.02;
    if (!isFront && !isBack) {
      pos.setXYZ(i, v.x, v.y, v.z);
      continue;
    }
    // Radial distance from the body centerline (chest)
    const ny = (v.y + 0.05) / 1.0;
    const nx = v.x / 0.5;
    const r = Math.sqrt(nx * nx + ny * ny * 0.6);
    const t = Math.max(0, 1 - r);
    const t2 = t * t;
    const bulge = isFront ? t2 * 0.28 : -t2 * 0.14;
    pos.setZ(i, v.z + bulge);
  }
  pos.needsUpdate = true;
  geom.computeVertexNormals();
  return geom;
}

function ProceduralGarment({
  type,
  color,
}: {
  type: GarmentType;
  color: string;
}) {
  const geometry = useMemo(() => buildGeometry(type), [type]);
  return (
    <mesh geometry={geometry} castShadow receiveShadow>
      <meshStandardMaterial color={color} roughness={0.88} metalness={0.0} />
    </mesh>
  );
}

function GLBGarment({
  scene,
  color,
}: {
  scene: THREE.Group;
  color: string;
}) {
  const setGarmentRoot = useCustomizer((s) => s.setGarmentRoot);

  // Clone once per scene so we can tint and resize without mutating the cached asset
  const cloned = useMemo(() => {
    const c = scene.clone(true);
    // Reset any baked transform so our bbox math operates in the asset's natural pose
    c.position.set(0, 0, 0);
    c.rotation.set(0, 0, 0);
    c.scale.setScalar(1);

    // Auto-fit: scale so the garment is ~2 world units tall, then recenter to origin.
    // Without this, models with native scale != ~1 render as a tiny dot or huge wall.
    const box = new THREE.Box3().setFromObject(c);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    const targetHeight = 2.0;
    const scale = targetHeight / Math.max(size.y, 0.001);
    c.scale.setScalar(scale);
    c.position.set(
      -center.x * scale,
      -center.y * scale,
      -center.z * scale,
    );
    return c;
  }, [scene]);

  useEffect(() => {
    cloned.traverse((obj) => {
      if ((obj as THREE.Mesh).isMesh) {
        const mesh = obj as THREE.Mesh;
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        const materials = Array.isArray(mesh.material)
          ? mesh.material
          : [mesh.material];
        materials.forEach((m) => {
          if (m && "color" in m) {
            (m as THREE.MeshStandardMaterial).color = new THREE.Color(color);
          }
        });
      }
    });
  }, [cloned, color]);

  // Publish the cloned scene so Decal can project onto every garment mesh.
  // Wait one frame so R3F has updated matrices.
  useEffect(() => {
    const id = requestAnimationFrame(() => {
      setGarmentRoot(cloned);
    });
    return () => {
      cancelAnimationFrame(id);
      setGarmentRoot(null);
    };
  }, [cloned, setGarmentRoot]);

  return <primitive object={cloned} />;
}

export function Garment() {
  const color = useCustomizer((s) => s.color);
  const view = useCustomizer((s) => s.view);
  const garment = useCustomizer((s) => s.garment);
  const selectedProductSlug = useCustomizer((s) => s.selectedProductSlug);

  const group = useRef<THREE.Group>(null);
  const targetY = view === "front" ? 0 : Math.PI;

  useFrame((_, dt) => {
    if (!group.current) return;
    const cur = group.current.rotation.y;
    const next = THREE.MathUtils.damp(cur, targetY, 5, dt);
    group.current.rotation.y = next;
  });

  // Prefer the selected product's glb_url from the catalog API. Falls back
  // to /models/<garment-type>.glb if the API hasn't loaded yet (or is offline).
  const productQuery = useProduct(selectedProductSlug);
  const apiUrl = productQuery.data?.glb_url;
  const modelUrl = apiUrl || `/models/${garment}.glb`;
  const gltfScene = useOptionalGLTF(modelUrl);

  return (
    <group ref={group} position={[0, -0.15, 0]}>
      {gltfScene ? (
        <GLBGarment scene={gltfScene} color={color} />
      ) : (
        <ProceduralGarment type={garment} color={color} />
      )}
    </group>
  );
}
