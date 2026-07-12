import { useCustomizer, type PrintType as PrintTypeLabel } from "../../store/customizer";
import { usePrintTypes } from "../../hooks/useCatalog";

// Map a print type's display name to the legacy enum label used elsewhere in the store.
function toLabel(name: string): PrintTypeLabel {
  const n = name.toLowerCase();
  if (n.includes("emb")) return "Embroidery";
  if (n.includes("puf")) return "PUF";
  return "DTF";
}

export function PrintPanel() {
  const selectedPrintTypeSlug = useCustomizer((s) => s.selectedPrintTypeSlug);
  const setSelectedPrintType = useCustomizer((s) => s.setSelectedPrintType);

  const query = usePrintTypes();
  const printTypes = query.data ?? [];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {query.isLoading && (
        <p style={{ fontSize: 13, color: "#9ca3af", margin: 0 }}>Loading print types…</p>
      )}
      {query.isError && (
        <p style={{ fontSize: 13, color: "#ef4444", margin: 0 }}>
          Couldn't load print types. Is the backend running?
        </p>
      )}
      {printTypes.map((t) => {
        const active = selectedPrintTypeSlug === t.slug;
        return (
          <button
            key={t.slug}
            onClick={() => setSelectedPrintType(t.slug, toLabel(t.name))}
            style={{
              textAlign: "left",
              padding: "14px 16px",
              background: active ? "#0f1115" : "#f9fafb",
              color: active ? "#fff" : "#0f1115",
              border: active ? "1px solid #0f1115" : "1px solid #e5e7eb",
              borderRadius: 14,
              cursor: "pointer",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
              <strong style={{ fontSize: 15 }}>{t.name}</strong>
              <span style={{ fontSize: 13, opacity: 0.85 }}>
                From ₹{Math.round(Number(t.surcharge))}
              </span>
            </div>
            <p style={{ margin: 0, fontSize: 12, opacity: 0.78, lineHeight: 1.4 }}>
              {t.description}
            </p>
          </button>
        );
      })}
    </div>
  );
}
