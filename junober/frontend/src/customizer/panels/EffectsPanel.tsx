const EFFECTS = ["Motion", "Sparkle", "Bloom", "Shimmer"];

export function EffectsPanel() {
  return (
    <div>
      <p
        style={{
          margin: "0 0 14px",
          fontSize: 13,
          color: "#6b7280",
          lineHeight: 1.5,
        }}
      >
        Visual effects and the wind-blown fabric animation ship in Phase 2.5 —
        the shareable social-video moments you saw in the virtualthreads.io reel.
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {EFFECTS.map((e) => (
          <button
            key={e}
            disabled
            style={{
              padding: 14,
              background: "#f9fafb",
              border: "1px solid #e5e7eb",
              borderRadius: 12,
              color: "#9ca3af",
              fontWeight: 600,
              cursor: "not-allowed",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span>{e}</span>
            <span
              style={{
                fontSize: 10,
                background: "#e5e7eb",
                padding: "2px 8px",
                borderRadius: 999,
                fontWeight: 700,
                letterSpacing: 0.5,
              }}
            >
              SOON
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
