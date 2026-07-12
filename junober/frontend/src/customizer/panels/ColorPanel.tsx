import { useState } from "react";
import { useCustomizer } from "../../store/customizer";
import { useColors } from "../../hooks/useCatalog";

type Tab = "stock" | "grid" | "spectrum" | "sliders";

function hslToHex(h: number, s: number, l: number): string {
  s /= 100;
  l /= 100;
  const k = (n: number) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => {
    const v =
      l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
    return Math.round(v * 255)
      .toString(16)
      .padStart(2, "0");
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

const GRID_COLORS = (() => {
  const out: string[] = [];
  const rows = 9;
  const cols = 14;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const h = (c / cols) * 360;
      const s = 88 - r * 4;
      const l = 88 - r * 8;
      out.push(hslToHex(h, Math.max(s, 10), Math.max(l, 14)));
    }
  }
  return out;
})();

function hexToRgb(hex: string): [number, number, number] {
  const c = hex.replace("#", "");
  return [
    parseInt(c.slice(0, 2), 16) || 0,
    parseInt(c.slice(2, 4), 16) || 0,
    parseInt(c.slice(4, 6), 16) || 0,
  ];
}

function rgbToHex(r: number, g: number, b: number): string {
  const to = (v: number) => Math.max(0, Math.min(255, v)).toString(16).padStart(2, "0");
  return `#${to(r)}${to(g)}${to(b)}`.toUpperCase();
}

export function ColorPanel() {
  const color = useCustomizer((s) => s.color);
  const selectedColorSlug = useCustomizer((s) => s.selectedColorSlug);
  const setColor = useCustomizer((s) => s.setColor);
  const setSelectedColor = useCustomizer((s) => s.setSelectedColor);

  const colorsQuery = useColors();
  const stockColors = colorsQuery.data ?? [];

  const [tab, setTab] = useState<Tab>("stock");
  const [r, g, b] = hexToRgb(color);

  const tabs: { id: Tab; label: string }[] = [
    { id: "stock", label: "Stock" },
    { id: "grid", label: "Grid" },
    { id: "spectrum", label: "Picker" },
    { id: "sliders", label: "RGB" },
  ];

  return (
    <div>
      <div
        style={{
          display: "flex",
          background: "#f3f4f6",
          borderRadius: 12,
          padding: 4,
          marginBottom: 16,
        }}
      >
        {tabs.map(({ id, label }) => {
          const active = tab === id;
          return (
            <button
              key={id}
              onClick={() => setTab(id)}
              style={{
                flex: 1,
                padding: "9px 0",
                background: active ? "#fff" : "transparent",
                border: "none",
                borderRadius: 8,
                fontWeight: active ? 700 : 500,
                color: "#0f1115",
                cursor: "pointer",
                fontSize: 13,
                boxShadow: active ? "0 1px 2px rgba(0,0,0,0.08)" : "none",
              }}
            >
              {label}
            </button>
          );
        })}
      </div>

      {tab === "stock" && (
        <div>
          <p style={{ margin: "0 0 12px", fontSize: 12, color: "#6b7280" }}>
            Colors we stock and can print on. Pick one for the order.
          </p>
          {colorsQuery.isLoading && (
            <p style={{ fontSize: 13, color: "#9ca3af" }}>Loading…</p>
          )}
          {colorsQuery.isError && (
            <p style={{ fontSize: 13, color: "#ef4444" }}>
              Couldn't load stock colors. Is the backend running?
            </p>
          )}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 10 }}>
            {stockColors.map((c) => {
              const active = selectedColorSlug === c.slug;
              return (
                <button
                  key={c.slug}
                  onClick={() => setSelectedColor(c.slug, c.hex_code)}
                  title={c.name}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 4,
                    background: "transparent",
                    border: "none",
                    cursor: "pointer",
                    padding: 4,
                  }}
                >
                  <span
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: "50%",
                      background: c.hex_code,
                      border: active
                        ? "3px solid #0f1115"
                        : "1px solid rgba(0,0,0,0.12)",
                    }}
                  />
                  <span
                    style={{
                      fontSize: 10,
                      color: active ? "#0f1115" : "#6b7280",
                      fontWeight: active ? 700 : 500,
                      textAlign: "center",
                      lineHeight: 1.1,
                    }}
                  >
                    {c.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {tab === "grid" && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(14, 1fr)",
            gap: 3,
          }}
        >
          {GRID_COLORS.map((c, i) => {
            const selected = color.toLowerCase() === c.toLowerCase();
            return (
              <button
                key={i}
                onClick={() => setColor(c.toUpperCase())}
                aria-label={c}
                style={{
                  aspectRatio: "1",
                  background: c,
                  border: selected
                    ? "2px solid #0f1115"
                    : "1px solid rgba(0,0,0,0.08)",
                  borderRadius: 4,
                  cursor: "pointer",
                  padding: 0,
                }}
              />
            );
          })}
        </div>
      )}

      {tab === "spectrum" && (
        <input
          type="color"
          value={color}
          onChange={(e) => setColor(e.target.value.toUpperCase())}
          style={{
            width: "100%",
            height: 180,
            border: "1px solid rgba(0,0,0,0.08)",
            borderRadius: 14,
            cursor: "pointer",
            background: "#fff",
            padding: 4,
          }}
        />
      )}

      {tab === "sliders" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <Slider
            label="Red"
            value={r}
            accent="#ef4444"
            onChange={(v) => setColor(rgbToHex(v, g, b))}
          />
          <Slider
            label="Green"
            value={g}
            accent="#22c55e"
            onChange={(v) => setColor(rgbToHex(r, v, b))}
          />
          <Slider
            label="Blue"
            value={b}
            accent="#3b82f6"
            onChange={(v) => setColor(rgbToHex(r, g, v))}
          />
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 12, color: "#6b7280", fontWeight: 600 }}>HEX</span>
            <input
              type="text"
              value={color.toUpperCase()}
              onChange={(e) => {
                const v = e.target.value;
                if (/^#[0-9A-Fa-f]{6}$/.test(v)) setColor(v.toUpperCase());
              }}
              style={{
                flex: 1,
                padding: "9px 12px",
                border: "1px solid #e5e7eb",
                borderRadius: 10,
                fontFamily: "ui-monospace, monospace",
                fontSize: 14,
              }}
            />
          </div>
          {tab === "sliders" && selectedColorSlug && (
            <p style={{ margin: 0, fontSize: 11, color: "#9ca3af" }}>
              Picking a non-stock color clears your stock selection — order will
              fall back to the closest stock color or fail validation later.
            </p>
          )}
        </div>
      )}

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          marginTop: 20,
          paddingTop: 14,
          borderTop: "1px solid rgba(0,0,0,0.06)",
        }}
      >
        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: 14,
            background: color,
            border: "1px solid rgba(0,0,0,0.1)",
            flexShrink: 0,
          }}
        />
        <div style={{ fontSize: 13, color: "#6b7280" }}>
          <div style={{ color: "#0f1115", fontWeight: 600 }}>
            {selectedColorSlug
              ? stockColors.find((c) => c.slug === selectedColorSlug)?.name ?? "Stock color"
              : "Custom color"}
          </div>
          <div style={{ fontFamily: "ui-monospace, monospace", fontSize: 12 }}>
            {color.toUpperCase()}
          </div>
        </div>
      </div>
    </div>
  );
}

interface SliderProps {
  label: string;
  value: number;
  accent: string;
  onChange: (v: number) => void;
}

function Slider({ label, value, accent, onChange }: SliderProps) {
  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 6,
        }}
      >
        <span
          style={{
            fontSize: 11,
            color: "#6b7280",
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: 1,
          }}
        >
          {label}
        </span>
        <span style={{ fontSize: 13, color: "#0f1115", fontFamily: "ui-monospace, monospace" }}>
          {value}
        </span>
      </div>
      <input
        type="range"
        min={0}
        max={255}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{ width: "100%", accentColor: accent }}
      />
    </div>
  );
}
