import { Link } from "react-router-dom";
import { useAuth } from "../store/auth";
import { useCustomizer } from "../store/customizer";
import { useCart } from "../hooks/useCart";

export function TopBar() {
  const user = useAuth((s) => s.user);
  const setCartOpen = useCustomizer((s) => s.setCartOpen);
  const { data: cart } = useCart();
  const itemCount = cart?.item_count ?? 0;

  return (
    <header
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        height: 56,
        padding: "0 16px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        background: "rgba(255,255,255,0.94)",
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)",
        borderBottom: "1px solid rgba(0,0,0,0.06)",
        zIndex: 10,
      }}
    >
      <Link to="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 10 }}>
        <div
          style={{
            width: 26,
            height: 26,
            background: "#FF6B00",
            clipPath: "polygon(50% 10%, 96% 92%, 4% 92%)",
          }}
        />
        <span style={{ fontWeight: 700, color: "#0f1115", letterSpacing: -0.3 }}>
          JunOber
        </span>
      </Link>

      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <button
          onClick={() => setCartOpen(true)}
          aria-label="Open cart"
          style={{
            position: "relative",
            width: 40,
            height: 40,
            border: "none",
            background: "transparent",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#0f1115" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 7h14l-1.4 9.2a2 2 0 01-2 1.8h-7.2a2 2 0 01-2-1.8z" />
            <path d="M9 7V5a3 3 0 016 0v2" />
          </svg>
          {itemCount > 0 && (
            <span
              style={{
                position: "absolute",
                top: 2,
                right: 2,
                minWidth: 16,
                height: 16,
                padding: "0 4px",
                borderRadius: 999,
                background: "#ef4444",
                color: "#fff",
                fontSize: 10,
                fontWeight: 700,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {itemCount}
            </span>
          )}
        </button>

        {user ? (
          <Link
            to="/account"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              textDecoration: "none",
              padding: "6px 10px",
              borderRadius: 999,
              background: "rgba(15,17,21,0.05)",
            }}
          >
            <span
              style={{
                width: 26,
                height: 26,
                borderRadius: "50%",
                background: "#0f1115",
                color: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 11,
                fontWeight: 700,
                textTransform: "uppercase",
              }}
            >
              {(user.first_name || user.email)[0]}
            </span>
            <span style={{ fontSize: 13, color: "#0f1115", fontWeight: 600, maxWidth: 120, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {user.first_name || user.email}
            </span>
          </Link>
        ) : (
          <Link
            to="/login"
            style={{
              fontSize: 13,
              fontWeight: 700,
              color: "#0f1115",
              textDecoration: "none",
              padding: "8px 14px",
              border: "1px solid rgba(0,0,0,0.12)",
              borderRadius: 999,
            }}
          >
            Log in
          </Link>
        )}
      </div>
    </header>
  );
}
