import { useEffect } from "react";

interface Props {
  open: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}

export function BottomSheet({ open, title, onClose, children }: Props) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <>
      <div
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          background: open ? "rgba(0,0,0,0.32)" : "transparent",
          pointerEvents: open ? "auto" : "none",
          transition: "background 0.22s ease",
          zIndex: 20,
        }}
      />
      <div
        role="dialog"
        aria-hidden={!open}
        style={{
          position: "fixed",
          left: 0,
          right: 0,
          bottom: 0,
          background: "#ffffff",
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          boxShadow: "0 -8px 32px rgba(0,0,0,0.16)",
          transform: open ? "translateY(0)" : "translateY(110%)",
          transition: "transform 0.32s cubic-bezier(0.32,0.72,0,1)",
          zIndex: 21,
          maxHeight: "78vh",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            paddingTop: 10,
            paddingBottom: 6,
          }}
        >
          <span
            style={{
              width: 38,
              height: 4,
              background: "rgba(0,0,0,0.16)",
              borderRadius: 999,
            }}
          />
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "8px 18px 14px",
            borderBottom: "1px solid rgba(0,0,0,0.06)",
          }}
        >
          <span style={{ width: 24 }} />
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: "#0f1115" }}>
            {title}
          </h3>
          <button
            onClick={onClose}
            aria-label="Close"
            style={{
              border: "none",
              background: "transparent",
              fontSize: 24,
              lineHeight: 1,
              color: "#6b7280",
              cursor: "pointer",
              padding: 0,
              width: 24,
            }}
          >
            ×
          </button>
        </div>
        <div style={{ padding: "16px 18px 32px", overflow: "auto" }}>{children}</div>
      </div>
    </>
  );
}
