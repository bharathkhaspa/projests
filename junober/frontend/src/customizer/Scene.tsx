import { Canvas } from "@react-three/fiber";
import { OrbitControls, Environment, ContactShadows } from "@react-three/drei";
import { Garment } from "./Garment";
import { Hanger } from "./Hanger";
import { DecalOverlay } from "./Decal";
import { useCustomizer } from "../store/customizer";

export function Scene() {
  const bg = useCustomizer((s) => s.studioBg);

  return (
    <Canvas
      camera={{ position: [0, 0.1, 5.6], fov: 36 }}
      shadows
      style={{ width: "100%", height: "100%" }}
      gl={{ antialias: true, preserveDrawingBuffer: true, alpha: false }}
    >
      <color attach="background" args={[bg]} />
      <ambientLight intensity={0.6} />
      <directionalLight
        position={[3, 5, 4]}
        intensity={1.0}
        castShadow
        shadow-mapSize={[2048, 2048]}
      />
      <directionalLight position={[-3, 2, 2]} intensity={0.35} />
      <Hanger />
      <Garment />
      <DecalOverlay />
      <ContactShadows
        position={[0, -1.18, 0]}
        opacity={0.28}
        scale={5}
        blur={2.6}
        far={2.5}
      />
      <OrbitControls
        enableZoom={false}
        enablePan={false}
        minPolarAngle={Math.PI / 2.6}
        maxPolarAngle={Math.PI / 1.75}
        minAzimuthAngle={-Math.PI / 4}
        maxAzimuthAngle={Math.PI / 4}
        rotateSpeed={0.6}
      />
      <Environment preset="apartment" />
    </Canvas>
  );
}
