import { useEffect, useMemo, useState } from "react";
import * as THREE from "three";
import { DecalGeometry } from "three/examples/jsm/geometries/DecalGeometry.js";
import { useCustomizer } from "../store/customizer";

// Auto-remove uniform background (white/black/single-color borders).
// Samples the 4 corners; if they're nearly identical, makes that color transparent
// with a soft alpha falloff for smoother edges.
function autoRemoveBackground(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
) {
  const corners = [
    ctx.getImageData(0, 0, 1, 1).data,
    ctx.getImageData(w - 1, 0, 1, 1).data,
    ctx.getImageData(0, h - 1, 1, 1).data,
    ctx.getImageData(w - 1, h - 1, 1, 1).data,
  ];
  const avgR = Math.round(corners.reduce((s, c) => s + c[0], 0) / 4);
  const avgG = Math.round(corners.reduce((s, c) => s + c[1], 0) / 4);
  const avgB = Math.round(corners.reduce((s, c) => s + c[2], 0) / 4);

  const maxSpread = corners.reduce((max, c) => {
    return Math.max(
      max,
      Math.abs(c[0] - avgR),
      Math.abs(c[1] - avgG),
      Math.abs(c[2] - avgB),
    );
  }, 0);
  if (maxSpread > 25) return;

  const img = ctx.getImageData(0, 0, w, h);
  const d = img.data;
  const tolerance = 40;
  for (let i = 0; i < d.length; i += 4) {
    const dr = Math.abs(d[i] - avgR);
    const dg = Math.abs(d[i + 1] - avgG);
    const db = Math.abs(d[i + 2] - avgB);
    if (dr < tolerance && dg < tolerance && db < tolerance) {
      const dist = dr + dg + db;
      d[i + 3] = Math.min(255, Math.max(0, (dist - tolerance / 2) * 8));
    }
  }
  ctx.putImageData(img, 0, 0);
}

function useDesignTexture(): THREE.CanvasTexture | null {
  const imageUrl = useCustomizer((s) => s.imageUrl);
  const text = useCustomizer((s) => s.text);
  const textColor = useCustomizer((s) => s.textColor);

  const [tex, setTex] = useState<THREE.CanvasTexture | null>(null);

  useEffect(() => {
    if (!imageUrl && !text) {
      setTex((prev) => {
        prev?.dispose();
        return null;
      });
      return;
    }

    const canvas = document.createElement("canvas");
    const SIZE = 1024;
    canvas.width = SIZE;
    canvas.height = SIZE;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, SIZE, SIZE);

    let cancelled = false;

    const finalizeTexture = () => {
      if (cancelled) return;
      if (text) {
        ctx.fillStyle = textColor;
        ctx.font = "bold 110px system-ui, -apple-system, sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(text, SIZE / 2, imageUrl ? 880 : 512, SIZE - 80);
      }
      const t = new THREE.CanvasTexture(canvas);
      t.colorSpace = THREE.SRGBColorSpace;
      t.anisotropy = 8;
      t.needsUpdate = true;
      setTex((prev) => {
        prev?.dispose();
        return t;
      });
    };

    if (imageUrl) {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        if (cancelled) return;
        const maxSize = 720;
        const aspect = img.width / img.height;
        const w = aspect >= 1 ? maxSize : maxSize * aspect;
        const h = aspect >= 1 ? maxSize / aspect : maxSize;
        const cx = (SIZE - w) / 2;
        const cy = text ? 180 : 280;

        // Composite via a temp canvas so we can auto-remove the source background
        const tmp = document.createElement("canvas");
        tmp.width = img.width;
        tmp.height = img.height;
        const tctx = tmp.getContext("2d");
        if (tctx) {
          tctx.drawImage(img, 0, 0);
          autoRemoveBackground(tctx, img.width, img.height);
          ctx.drawImage(tmp, cx, cy, w, h);
        } else {
          ctx.drawImage(img, cx, cy, w, h);
        }
        finalizeTexture();
      };
      img.onerror = finalizeTexture;
      img.src = imageUrl;
    } else {
      finalizeTexture();
    }

    return () => {
      cancelled = true;
    };
  }, [imageUrl, text, textColor]);

  return tex;
}

interface Projection {
  geometry: THREE.BufferGeometry;
  position: THREE.Vector3;
  orientation: THREE.Euler;
}

export function DecalOverlay() {
  const view = useCustomizer((s) => s.view);
  const garmentRoot = useCustomizer((s) => s.garmentRoot);
  const texture = useDesignTexture();

  const projections = useMemo<Projection[]>(() => {
    if (!texture || !garmentRoot) return [];

    // Walk up to the topmost ancestor and force a full matrix update so the
    // world-space bounding boxes are accurate (R3F may not have flushed yet).
    let topmost: THREE.Object3D = garmentRoot;
    while (topmost.parent) topmost = topmost.parent;
    topmost.updateMatrixWorld(true);

    // Zero ancestor rotations so projection always lands on the FRONT face,
    // even if the user is currently viewing the back. Restored at the end.
    const ancestors: { obj: THREE.Object3D; quat: THREE.Quaternion }[] = [];
    let cur: THREE.Object3D | null = garmentRoot.parent;
    while (cur) {
      ancestors.push({ obj: cur, quat: cur.quaternion.clone() });
      cur.quaternion.identity();
      cur = cur.parent;
    }
    topmost.updateMatrixWorld(true);

    // Compute projection center+size from the FULL garment world bbox so it
    // correctly spans the whole shirt regardless of how many sub-meshes it has.
    const fullBox = new THREE.Box3().setFromObject(garmentRoot);
    const fullSize = fullBox.getSize(new THREE.Vector3());
    const fullCenter = fullBox.getCenter(new THREE.Vector3());

    const position = new THREE.Vector3(
      fullCenter.x,
      fullBox.min.y + fullSize.y * 0.62,
      fullBox.max.z + 0.05,
    );
    const orientation = new THREE.Euler(0, 0, 0);
    // Generous projection box. Width/height target ~40-50% of the garment so
    // the chest design is clearly visible. Depth must exceed garment thickness
    // so the projection pierces the front face fully.
    const projSize = new THREE.Vector3(
      Math.max(Math.min(fullSize.x * 0.5, 1.6), 0.7),
      Math.max(Math.min(fullSize.y * 0.5, 1.6), 0.7),
      Math.max(fullSize.z * 2.0, 1.0),
    );

    // Project onto EVERY mesh in the garment. Each sub-mesh contributes its
    // intersection with the projection box. Empty results are discarded.
    const results: Projection[] = [];
    garmentRoot.traverse((obj) => {
      const m = obj as THREE.Mesh;
      if (!m.isMesh || !m.geometry) return;
      try {
        const g = new DecalGeometry(m, position, orientation, projSize);
        const posAttr = g.getAttribute("position");
        if (posAttr && posAttr.count > 0) {
          results.push({ geometry: g, position, orientation });
        } else {
          g.dispose();
        }
      } catch (e) {
        console.warn("Decal projection failed on mesh:", e);
      }
    });

    // Restore ancestor rotations and force a final matrix update.
    for (const a of ancestors) {
      a.obj.quaternion.copy(a.quat);
    }
    topmost.updateMatrixWorld(true);

    return results;
  }, [texture, garmentRoot]);

  useEffect(() => {
    return () => {
      projections.forEach((p) => p.geometry.dispose());
    };
  }, [projections]);

  if (view !== "front" || projections.length === 0 || !texture) return null;

  return (
    <>
      {projections.map((p, i) => (
        <mesh
          key={i}
          geometry={p.geometry}
          position={p.position}
          rotation={p.orientation}
          renderOrder={10}
        >
          <meshStandardMaterial
            map={texture}
            transparent
            polygonOffset
            polygonOffsetFactor={-4}
            polygonOffsetUnits={-4}
            depthWrite={false}
            roughness={0.8}
            metalness={0.0}
          />
        </mesh>
      ))}
    </>
  );
}
