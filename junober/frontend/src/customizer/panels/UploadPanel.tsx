import { useEffect, useState } from "react";
import { useCustomizer } from "../../store/customizer";

const TEXT_COLORS = ["#0f1115", "#ffffff", "#ef4444", "#1d4ed8", "#10b981", "#facc15"];

export function UploadPanel() {
  const imageUrl = useCustomizer((s) => s.imageUrl);
  const setImageUrl = useCustomizer((s) => s.setImageUrl);
  const text = useCustomizer((s) => s.text);
  const setText = useCustomizer((s) => s.setText);
  const textColor = useCustomizer((s) => s.textColor);
  const setTextColor = useCustomizer((s) => s.setTextColor);
  const clearDesign = useCustomizer((s) => s.clearDesign);

  const [fileName, setFileName] = useState<string | null>(null);

  // Revoke the object URL when it changes or on unmount to avoid memory leaks
  useEffect(() => {
    return () => {
      if (imageUrl && imageUrl.startsWith("blob:")) {
        URL.revokeObjectURL(imageUrl);
      }
    };
  }, [imageUrl]);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    // Revoke prior blob URL if any
    if (imageUrl && imageUrl.startsWith("blob:")) {
      URL.revokeObjectURL(imageUrl);
    }
    const url = URL.createObjectURL(file);
    setImageUrl(url);
    setFileName(file.name);
  }

  function removeImage() {
    if (imageUrl && imageUrl.startsWith("blob:")) {
      URL.revokeObjectURL(imageUrl);
    }
    setImageUrl(null);
    setFileName(null);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <section>
        <h4 style={sectionHead}>Image / Logo</h4>
        {imageUrl ? (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: 12,
              background: "#f9fafb",
              borderRadius: 14,
              border: "1px solid #e5e7eb",
            }}
          >
            <img
              src={imageUrl}
              alt="design"
              style={{ width: 56, height: 56, objectFit: "contain", borderRadius: 8, background: "#fff" }}
            />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 600, fontSize: 13, color: "#0f1115", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {fileName ?? "Uploaded design"}
              </div>
              <div style={{ fontSize: 11, color: "#6b7280", marginTop: 2 }}>Showing on chest</div>
            </div>
            <button
              onClick={removeImage}
              style={{
                padding: "8px 12px",
                background: "transparent",
                border: "1px solid #e5e7eb",
                borderRadius: 10,
                color: "#0f1115",
                fontWeight: 600,
                fontSize: 12,
                cursor: "pointer",
              }}
            >
              Remove
            </button>
          </div>
        ) : (
          <label
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              padding: "28px 16px",
              border: "2px dashed #d1d5db",
              borderRadius: 16,
              background: "#fafafa",
              cursor: "pointer",
              color: "#374151",
              textAlign: "center",
            }}
          >
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 16V4M7 9l5-5 5 5M5 20h14" />
            </svg>
            <p style={{ margin: "8px 0 2px", fontWeight: 700, fontSize: 14, color: "#0f1115" }}>
              Upload Design
            </p>
            <p style={{ margin: 0, fontSize: 12, color: "#6b7280" }}>
              PNG, JPG, or SVG · up to 8 MB
            </p>
            <input
              type="file"
              accept="image/png,image/jpeg,image/svg+xml"
              onChange={handleFile}
              style={{ display: "none" }}
            />
          </label>
        )}
      </section>

      <section>
        <h4 style={sectionHead}>Text</h4>
        <input
          type="text"
          value={text}
          maxLength={40}
          placeholder="Type something..."
          onChange={(e) => setText(e.target.value)}
          style={{
            width: "100%",
            padding: "12px 14px",
            border: "1px solid #e5e7eb",
            borderRadius: 12,
            fontSize: 15,
            color: "#0f1115",
            background: "#fff",
            outline: "none",
          }}
        />
        <div style={{ display: "flex", gap: 8, marginTop: 10, alignItems: "center" }}>
          <span style={{ fontSize: 11, color: "#6b7280", fontWeight: 600, textTransform: "uppercase", letterSpacing: 1 }}>
            Color
          </span>
          {TEXT_COLORS.map((c) => (
            <button
              key={c}
              onClick={() => setTextColor(c)}
              aria-label={c}
              style={{
                width: 26,
                height: 26,
                borderRadius: "50%",
                background: c,
                border:
                  textColor.toUpperCase() === c.toUpperCase()
                    ? "2.5px solid #0f1115"
                    : "1px solid rgba(0,0,0,0.12)",
                cursor: "pointer",
                padding: 0,
              }}
            />
          ))}
        </div>
      </section>

      {(imageUrl || text) && (
        <button
          onClick={clearDesign}
          style={{
            padding: 12,
            background: "#f3f4f6",
            border: "none",
            borderRadius: 12,
            color: "#0f1115",
            fontWeight: 600,
            fontSize: 13,
            cursor: "pointer",
          }}
        >
          Clear all design
        </button>
      )}

      <p style={{ fontSize: 11, color: "#9ca3af", textAlign: "center", margin: 0 }}>
        Drag-to-reposition + decal projection onto curved UVs ship in Phase 2.2.
      </p>
    </div>
  );
}

const sectionHead: React.CSSProperties = {
  fontSize: 11,
  color: "#6b7280",
  fontWeight: 600,
  textTransform: "uppercase",
  letterSpacing: 1,
  margin: "0 0 10px",
};
