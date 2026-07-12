import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCustomizer } from "../store/customizer";
import { useAuth } from "../store/auth";
import {
  useCart,
  useRemoveCartItem,
  useUpdateCartItem,
} from "../hooks/useCart";
import type { CartItem } from "../lib/orderTypes";

function Line({ item }: { item: CartItem }) {
  const updateItem = useUpdateCartItem();
  const removeItem = useRemoveCartItem();

  return (
    <div
      style={{
        display: "flex",
        gap: 12,
        padding: "14px 0",
        borderBottom: "1px solid rgba(0,0,0,0.06)",
      }}
    >
      <div
        style={{
          width: 56,
          height: 56,
          borderRadius: 10,
          background: item.variant.color.hex_code,
          border: "1px solid rgba(0,0,0,0.1)",
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
        }}
      >
        {item.design_image_url ? (
          <img
            src={item.design_image_url}
            alt=""
            style={{ width: "100%", height: "100%", objectFit: "contain" }}
          />
        ) : item.design_text ? (
          <span style={{ fontSize: 9, color: item.design_text_color || "#000", fontWeight: 700, textAlign: "center" }}>
            {item.design_text}
          </span>
        ) : null}
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 700, fontSize: 14, color: "#0f1115" }}>
          {item.variant.product_name}
        </div>
        <div style={{ fontSize: 12, color: "#6b7280", marginTop: 2 }}>
          {item.variant.color.name} · {item.variant.size.code} · {item.print_type.name}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 8 }}>
          <div style={{ display: "flex", alignItems: "center", border: "1px solid #e5e7eb", borderRadius: 8 }}>
            <button
              aria-label="Decrease"
              onClick={() =>
                item.quantity > 1 &&
                updateItem.mutate({ id: item.id, quantity: item.quantity - 1 })
              }
              style={qtyBtn}
            >
              −
            </button>
            <span style={{ minWidth: 22, textAlign: "center", fontSize: 13, fontWeight: 600 }}>
              {item.quantity}
            </span>
            <button
              aria-label="Increase"
              onClick={() => updateItem.mutate({ id: item.id, quantity: item.quantity + 1 })}
              style={qtyBtn}
            >
              +
            </button>
          </div>
          <button
            onClick={() => removeItem.mutate(item.id)}
            style={{
              fontSize: 12,
              color: "#ef4444",
              background: "transparent",
              border: "none",
              cursor: "pointer",
              padding: 0,
            }}
          >
            Remove
          </button>
        </div>
      </div>

      <div style={{ fontWeight: 700, fontSize: 14, color: "#0f1115", whiteSpace: "nowrap" }}>
        ₹{Math.round(Number(item.line_total))}
      </div>
    </div>
  );
}

const qtyBtn: React.CSSProperties = {
  width: 28,
  height: 28,
  border: "none",
  background: "transparent",
  cursor: "pointer",
  fontSize: 16,
  color: "#0f1115",
};

export function CartDrawer() {
  const open = useCustomizer((s) => s.cartOpen);
  const setCartOpen = useCustomizer((s) => s.setCartOpen);
  const user = useAuth((s) => s.user);
  const navigate = useNavigate();
  const { data: cart, isLoading } = useCart();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setCartOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, setCartOpen]);

  const items = cart?.items ?? [];

  return (
    <>
      <div
        onClick={() => setCartOpen(false)}
        style={{
          position: "fixed",
          inset: 0,
          background: open ? "rgba(0,0,0,0.32)" : "transparent",
          pointerEvents: open ? "auto" : "none",
          transition: "background 0.22s",
          zIndex: 30,
        }}
      />
      <aside
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          bottom: 0,
          width: "min(420px, 92vw)",
          background: "#fff",
          boxShadow: "-8px 0 32px rgba(0,0,0,0.14)",
          transform: open ? "translateX(0)" : "translateX(105%)",
          transition: "transform 0.3s cubic-bezier(0.32,0.72,0,1)",
          zIndex: 31,
          display: "flex",
          flexDirection: "column",
          fontFamily: "system-ui, -apple-system, sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "18px 20px",
            borderBottom: "1px solid rgba(0,0,0,0.06)",
          }}
        >
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "#0f1115" }}>
            Your Cart {cart ? `(${cart.item_count})` : ""}
          </h2>
          <button
            onClick={() => setCartOpen(false)}
            aria-label="Close cart"
            style={{ border: "none", background: "transparent", fontSize: 24, color: "#6b7280", cursor: "pointer" }}
          >
            ×
          </button>
        </div>

        <div style={{ flex: 1, overflow: "auto", padding: "0 20px" }}>
          {!user && (
            <p style={{ color: "#6b7280", fontSize: 14, marginTop: 24 }}>
              Log in to use your cart.
            </p>
          )}
          {user && isLoading && (
            <p style={{ color: "#9ca3af", fontSize: 14, marginTop: 24 }}>Loading cart…</p>
          )}
          {user && !isLoading && items.length === 0 && (
            <div style={{ textAlign: "center", marginTop: 48, color: "#6b7280" }}>
              <p style={{ fontWeight: 600, color: "#0f1115", margin: "0 0 4px" }}>Cart is empty</p>
              <p style={{ fontSize: 13, margin: 0 }}>Design something and add it here.</p>
            </div>
          )}
          {items.map((item) => (
            <Line key={item.id} item={item} />
          ))}
        </div>

        {user && items.length > 0 && (
          <div style={{ padding: 20, borderTop: "1px solid rgba(0,0,0,0.06)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14 }}>
              <span style={{ fontSize: 15, color: "#6b7280" }}>Subtotal</span>
              <span style={{ fontSize: 18, fontWeight: 800, color: "#0f1115" }}>
                ₹{Math.round(Number(cart?.subtotal ?? 0))}
              </span>
            </div>
            <button
              onClick={() => {
                setCartOpen(false);
                navigate("/checkout");
              }}
              style={{
                width: "100%",
                padding: 15,
                background: "#0f1115",
                color: "#fff",
                border: "none",
                borderRadius: 12,
                fontWeight: 700,
                fontSize: 15,
                cursor: "pointer",
              }}
            >
              Checkout →
            </button>
            <p style={{ fontSize: 11, color: "#9ca3af", textAlign: "center", margin: "10px 0 0" }}>
              Shipping + taxes calculated at checkout (Phase 2b).
            </p>
          </div>
        )}
      </aside>
    </>
  );
}
