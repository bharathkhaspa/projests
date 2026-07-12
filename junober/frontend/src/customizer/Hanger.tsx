import { useMemo } from "react";
import * as THREE from "three";

export function Hanger() {
  const wireGeom = useMemo(() => {
    const pts = [
      new THREE.Vector3(-0.6, -0.05, 0),
      new THREE.Vector3(-0.38, 0.12, 0),
      new THREE.Vector3(0, 0.16, 0),
      new THREE.Vector3(0.38, 0.12, 0),
      new THREE.Vector3(0.6, -0.05, 0),
    ];
    const curve = new THREE.CatmullRomCurve3(pts, false, "catmullrom", 0.6);
    return new THREE.TubeGeometry(curve, 48, 0.02, 8, false);
  }, []);

  const stemGeom = useMemo(() => {
    return new THREE.CylinderGeometry(0.016, 0.016, 0.22, 12);
  }, []);

  const hookGeom = useMemo(() => {
    const curve = new THREE.EllipseCurve(
      0,
      0,
      0.1,
      0.1,
      Math.PI,
      Math.PI * 2.05,
      false,
      0,
    );
    const pts = curve.getPoints(40).map((p) => new THREE.Vector3(p.x, p.y, 0));
    const c = new THREE.CatmullRomCurve3(pts);
    return new THREE.TubeGeometry(c, 48, 0.02, 8, false);
  }, []);

  return (
    <group position={[0, 1.02, 0.12]}>
      <mesh geometry={wireGeom} castShadow>
        <meshStandardMaterial color="#9aa0a6" metalness={0.9} roughness={0.18} />
      </mesh>
      <mesh geometry={stemGeom} position={[0, 0.28, 0]} castShadow>
        <meshStandardMaterial color="#9aa0a6" metalness={0.9} roughness={0.18} />
      </mesh>
      <mesh geometry={hookGeom} position={[0, 0.46, 0]} castShadow>
        <meshStandardMaterial color="#9aa0a6" metalness={0.9} roughness={0.18} />
      </mesh>
    </group>
  );
}
