import {
  useCustomizer,
  STUDIO_BACKDROPS,
} from "../../store/customizer";
import { useProducts, useSizes } from "../../hooks/useCatalog";
import type { GarmentType } from "../../lib/catalogTypes";

const sectionHead: React.CSSProperties = {
  fontSize: 11,
  color: "#6b7280",
  fontWeight: 600,
  textTransform: "uppercase",
  letterSpacing: 1,
  margin: "0 0 10px",
};

const GARMENT_DESC: Record<GarmentType, string> = {
  tshirt: "Cotton, round neck",
  polo: "Pique, collared",
  hoodie: "Fleece, kangaroo",
  tank: "Sleeveless",
};

export function ProductPanel() {
  const productsQuery = useProducts();
  const sizesQuery = useSizes();

  const selectedProductSlug = useCustomizer((s) => s.selectedProductSlug);
  const setSelectedProduct = useCustomizer((s) => s.setSelectedProduct);
  const selectedSizeCode = useCustomizer((s) => s.selectedSizeCode);
  const setSelectedSize = useCustomizer((s) => s.setSelectedSize);
  const studioBg = useCustomizer((s) => s.studioBg);
  const setStudioBg = useCustomizer((s) => s.setStudioBg);

  const products = productsQuery.data ?? [];
  const sizes = sizesQuery.data ?? [];

  return (
    <div>
      <h4 style={sectionHead}>Garment</h4>
      {productsQuery.isLoading && (
        <p style={{ fontSize: 13, color: "#9ca3af", margin: 0 }}>Loading garments…</p>
      )}
      {productsQuery.isError && (
        <p style={{ fontSize: 13, color: "#ef4444", margin: 0 }}>
          Couldn't load garments. Is the backend running on http://localhost:8000?
        </p>
      )}
      {!productsQuery.isLoading && !productsQuery.isError && products.length === 0 && (
        <p style={{ fontSize: 13, color: "#9ca3af", margin: 0 }}>
          No products yet. Run <code>manage.py seed_catalog</code> on the backend.
        </p>
      )}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        {products.map((p) => {
          const active = selectedProductSlug === p.slug;
          return (
            <button
              key={p.slug}
              onClick={() => setSelectedProduct(p.slug, p.garment_type)}
              style={{
                padding: "14px 12px",
                background: active ? "#0f1115" : "#f3f4f6",
                color: active ? "#fff" : "#0f1115",
                border: "none",
                borderRadius: 14,
                cursor: "pointer",
                textAlign: "left",
              }}
            >
              <div style={{ fontWeight: 700, fontSize: 14 }}>{p.name}</div>
              <div style={{ fontSize: 11, opacity: 0.7, marginTop: 2 }}>
                {GARMENT_DESC[p.garment_type] ?? p.garment_type}
              </div>
              <div style={{ fontSize: 12, opacity: 0.85, marginTop: 4, fontWeight: 600 }}>
                ₹{Math.round(Number(p.base_price))}
              </div>
            </button>
          );
        })}
      </div>

      <h4 style={{ ...sectionHead, marginTop: 22 }}>Size</h4>
      <div style={{ display: "grid", gridTemplateColumns: `repeat(${Math.max(sizes.length, 1)}, 1fr)`, gap: 8 }}>
        {sizes.map((s) => {
          const active = selectedSizeCode === s.code;
          return (
            <button
              key={s.code}
              onClick={() => setSelectedSize(s.code)}
              title={
                s.chest_inches && s.length_inches
                  ? `Chest ${s.chest_inches}" · Length ${s.length_inches}"`
                  : undefined
              }
              style={{
                padding: "12px 0",
                background: active ? "#0f1115" : "#f3f4f6",
                color: active ? "#fff" : "#0f1115",
                border: "none",
                borderRadius: 12,
                cursor: "pointer",
                fontWeight: 700,
                fontSize: 13,
              }}
            >
              {s.code}
            </button>
          );
        })}
      </div>

      <h4 style={{ ...sectionHead, marginTop: 22 }}>Studio Backdrop</h4>
      <div style={{ display: "flex", gap: 10 }}>
        {STUDIO_BACKDROPS.map((c) => (
          <button
            key={c}
            onClick={() => setStudioBg(c)}
            aria-label={`Backdrop ${c}`}
            style={{
              width: 40,
              height: 40,
              borderRadius: "50%",
              background: c,
              border:
                studioBg === c
                  ? "3px solid #0f1115"
                  : "1px solid rgba(0,0,0,0.12)",
              cursor: "pointer",
              padding: 0,
            }}
          />
        ))}
      </div>
    </div>
  );
}
