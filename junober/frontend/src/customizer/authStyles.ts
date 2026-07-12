import type { CSSProperties } from "react";

export const page: CSSProperties = {
  position: "absolute",
  inset: 0,
  background: "#FAF7F2",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: 24,
  fontFamily:
    'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
};

export const card: CSSProperties = {
  width: "100%",
  maxWidth: 380,
  background: "#fff",
  borderRadius: 18,
  padding: 28,
  boxShadow: "0 6px 24px rgba(0,0,0,0.06)",
};

export const heading: CSSProperties = {
  margin: "0 0 6px",
  fontSize: 24,
  fontWeight: 800,
  letterSpacing: -0.5,
  color: "#0f1115",
};

export const sub: CSSProperties = {
  margin: "0 0 22px",
  fontSize: 14,
  color: "#6b7280",
};

export const label: CSSProperties = {
  display: "block",
  fontSize: 12,
  fontWeight: 600,
  color: "#374151",
  textTransform: "uppercase",
  letterSpacing: 0.5,
  marginBottom: 6,
};

export const input: CSSProperties = {
  width: "100%",
  padding: "11px 13px",
  border: "1px solid #e5e7eb",
  borderRadius: 10,
  fontSize: 14,
  color: "#0f1115",
  background: "#fff",
  outline: "none",
};

export const fieldGroup: CSSProperties = {
  marginBottom: 14,
};

export const primaryButton: CSSProperties = {
  width: "100%",
  padding: 13,
  background: "#0f1115",
  color: "#fff",
  border: "none",
  borderRadius: 12,
  fontWeight: 700,
  fontSize: 15,
  cursor: "pointer",
  marginTop: 4,
};

export const secondaryLink: CSSProperties = {
  fontSize: 13,
  color: "#0f1115",
  textDecoration: "underline",
  textUnderlineOffset: 3,
};

export const errorMsg: CSSProperties = {
  fontSize: 13,
  color: "#ef4444",
  marginTop: 6,
  marginBottom: 0,
};

export const successMsg: CSSProperties = {
  fontSize: 13,
  color: "#10b981",
  marginTop: 6,
  marginBottom: 0,
};
