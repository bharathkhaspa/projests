import { useCustomizer } from "../store/customizer";

export function ViewToggle() {
  const view = useCustomizer((s) => s.view);
  const toggleView = useCustomizer((s) => s.toggleView);

  return (
    <button
      onClick={toggleView}
      style={{
        position: "absolute",
        bottom: 108,
        left: "50%",
        transform: "translateX(-50%)",
        padding: "8px 16px",
        background: "rgba(15,17,21,0.85)",
        color: "#fff",
        border: "none",
        borderRadius: 999,
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: 1.2,
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
        cursor: "pointer",
        zIndex: 10,
        textTransform: "uppercase",
      }}
    >
      {view} · tap to flip
    </button>
  );
}
