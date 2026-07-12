import { useNavigate, Link } from "react-router-dom";
import { fmtPrice } from "../lib/utils";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Navbar from "../components/Navbar";
import { fetchCart, removeCartItem, updateCartItem, clearCart } from "../lib/orderApi";
import { useAuth } from "../store/auth";
import type { Cart, CartItem } from "../lib/orderTypes";

const BRAND = "#FF6B00";

export default function CartPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const user = useAuth((s) => s.user);

  const { data: cart, isLoading } = useQuery<Cart>({
    queryKey: ["cart"],
    queryFn: fetchCart,
    enabled: !!user,
  });

  const removeMutation = useMutation({
    mutationFn: (itemId: number) => removeCartItem(itemId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["cart"] }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ itemId, quantity }: { itemId: number; quantity: number }) =>
      updateCartItem(itemId, quantity),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["cart"] }),
  });

  const clearMutation = useMutation({
    mutationFn: clearCart,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["cart"] }),
  });

  const subtotal = cart ? parseFloat(cart.subtotal) : 0;
  const shipping = subtotal > 499 ? 0 : 49;
  const total = subtotal + shipping;
  const isEmpty = !cart || cart.items.length === 0;

  if (!user) {
    return (
      <div style={{ minHeight: "100vh", background: "#f9f9f9", fontFamily: "system-ui, sans-serif" }}>
        <Navbar />
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "80px 16px", textAlign: "center" }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🛒</div>
          <div style={{ fontSize: 22, fontWeight: 700, marginBottom: 8, color: "#111" }}>
            Sign in to view your cart
          </div>
          <div style={{ color: "#888", marginBottom: 24, fontSize: 15 }}>
            Your saved items are waiting for you
          </div>
          <Link
            to="/login"
            style={{
              display: "inline-block",
              padding: "12px 32px",
              background: BRAND,
              color: "#fff",
              textDecoration: "none",
              borderRadius: 10,
              fontWeight: 700,
              fontSize: 15,
            }}
          >
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div style={{ minHeight: "100vh", background: "#f9f9f9", fontFamily: "system-ui, sans-serif" }}>
        <Navbar />
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 16px" }}>
          <div style={{ fontSize: 28, fontWeight: 700, marginBottom: 24, color: "#111" }}>Your Cart</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 24, alignItems: "start" }}>
            <div style={{ background: "#fff", borderRadius: 12, boxShadow: "0 1px 4px rgba(0,0,0,0.08)", padding: 24 }}>
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  style={{
                    height: 80,
                    background: "#e8e8e8",
                    borderRadius: 8,
                    marginBottom: 16,
                    opacity: 0.6,
                  }}
                />
              ))}
            </div>
            <div style={{ background: "#fff", borderRadius: 12, boxShadow: "0 1px 4px rgba(0,0,0,0.08)", padding: 24 }}>
              <div style={{ height: 20, background: "#e8e8e8", borderRadius: 4, marginBottom: 16, opacity: 0.6 }} />
              <div style={{ height: 20, background: "#e8e8e8", borderRadius: 4, marginBottom: 16, width: "60%", opacity: 0.6 }} />
              <div style={{ height: 44, background: "#e8e8e8", borderRadius: 8, marginTop: 24, opacity: 0.6 }} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isEmpty) {
    return (
      <div style={{ minHeight: "100vh", background: "#f9f9f9", fontFamily: "system-ui, sans-serif" }}>
        <Navbar />
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "80px 16px", textAlign: "center" }}>
          <div style={{ fontSize: 56, marginBottom: 16 }}>👜</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: "#111", marginBottom: 8 }}>
            Your cart is empty
          </div>
          <div style={{ color: "#888", fontSize: 15, marginBottom: 24 }}>
            Looks like you haven't added anything yet
          </div>
          <Link
            to="/"
            style={{
              display: "inline-block",
              padding: "12px 28px",
              background: BRAND,
              color: "#fff",
              textDecoration: "none",
              borderRadius: 10,
              fontWeight: 700,
              fontSize: 15,
            }}
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#f9f9f9", fontFamily: "system-ui, sans-serif" }}>
      <Navbar />
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 16px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <h1 style={{ margin: 0, fontSize: 28, fontWeight: 700, color: "#111" }}>
            Your Cart ({cart.item_count} {cart.item_count === 1 ? "item" : "items"})
          </h1>
          <button
            style={{
              background: "none",
              border: "1px solid #ddd",
              borderRadius: 8,
              padding: "6px 14px",
              cursor: "pointer",
              fontSize: 13,
              color: "#888",
            }}
            onClick={() => clearMutation.mutate()}
            disabled={clearMutation.isPending}
          >
            Clear Cart
          </button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 24, alignItems: "start" }}>
          {/* Items List */}
          <div style={{ background: "#fff", borderRadius: 12, boxShadow: "0 1px 4px rgba(0,0,0,0.08)", padding: 24 }}>
            {cart.items.map((item: CartItem, idx: number) => (
              <div
                key={item.id}
                style={{
                  display: "flex",
                  gap: 16,
                  alignItems: "flex-start",
                  paddingBottom: idx < cart.items.length - 1 ? 20 : 0,
                  marginBottom: idx < cart.items.length - 1 ? 20 : 0,
                  borderBottom: idx < cart.items.length - 1 ? "1px solid #f0f0f0" : "none",
                }}
              >
                {/* Thumbnail */}
                {item.variant.product_thumbnail ? (
                  <img
                    src={item.variant.product_thumbnail}
                    alt={item.variant.product_name}
                    style={{
                      width: 60,
                      height: 60,
                      borderRadius: 8,
                      objectFit: "cover",
                      flexShrink: 0,
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: 60,
                      height: 60,
                      borderRadius: 8,
                      background: item.variant.color.hex_code || "#e0e0e0",
                      flexShrink: 0,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 11,
                      fontWeight: 700,
                      color: "#fff",
                      textShadow: "0 1px 2px rgba(0,0,0,0.4)",
                    }}
                  >
                    {item.variant.size.code}
                  </div>
                )}

                {/* Info */}
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 15, color: "#111", marginBottom: 4 }}>
                    {item.variant.product_name}
                  </div>
                  <div style={{ fontSize: 13, color: "#666", marginBottom: 2, display: "flex", alignItems: "center", gap: 6 }}>
                    <span
                      style={{
                        display: "inline-block",
                        width: 10,
                        height: 10,
                        borderRadius: "50%",
                        background: item.variant.color.hex_code,
                        border: "1px solid rgba(0,0,0,0.1)",
                        flexShrink: 0,
                      }}
                    />
                    {item.variant.color.name} &nbsp;|&nbsp; Size: {item.variant.size.code}
                  </div>
                  <div style={{ fontSize: 13, color: "#666", marginBottom: 2 }}>
                    Print: {item.print_type.name}
                  </div>
                  {item.design_text && (
                    <div style={{ fontSize: 13, color: "#888", fontStyle: "italic", marginBottom: 2 }}>
                      "{item.design_text}"
                    </div>
                  )}

                  {/* Quantity Stepper */}
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 10 }}>
                    <button
                      style={{
                        width: 28,
                        height: 28,
                        border: "1px solid #ddd",
                        borderRadius: 6,
                        background: "#fff",
                        cursor: item.quantity <= 1 ? "not-allowed" : "pointer",
                        fontSize: 16,
                        fontWeight: 700,
                        color: item.quantity <= 1 ? "#ccc" : "#333",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        lineHeight: 1,
                      }}
                      onClick={() => {
                        if (item.quantity > 1) {
                          updateMutation.mutate({ itemId: item.id, quantity: item.quantity - 1 });
                        }
                      }}
                      disabled={item.quantity <= 1 || updateMutation.isPending}
                    >
                      −
                    </button>
                    <span style={{ fontWeight: 600, fontSize: 15, minWidth: 24, textAlign: "center" }}>
                      {item.quantity}
                    </span>
                    <button
                      style={{
                        width: 28,
                        height: 28,
                        border: "1px solid #ddd",
                        borderRadius: 6,
                        background: "#fff",
                        cursor: "pointer",
                        fontSize: 16,
                        fontWeight: 700,
                        color: "#333",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        lineHeight: 1,
                      }}
                      onClick={() =>
                        updateMutation.mutate({ itemId: item.id, quantity: item.quantity + 1 })
                      }
                      disabled={updateMutation.isPending}
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Price + Remove */}
                <div style={{ textAlign: "right", minWidth: 80, display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
                  <div style={{ fontSize: 13, color: "#888" }}>{fmtPrice(item.unit_price)} each</div>
                  <div style={{ fontWeight: 700, fontSize: 16, color: "#111" }}>
                    ₹{Number(item.line_total).toFixed(2)}
                  </div>
                  <button
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      fontSize: 18,
                      color: "#ccc",
                      padding: "4px",
                      marginTop: 4,
                    }}
                    onClick={() => removeMutation.mutate(item.id)}
                    disabled={removeMutation.isPending}
                    title="Remove item"
                  >
                    🗑
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary Sidebar */}
          <div style={{ background: "#fff", borderRadius: 12, boxShadow: "0 1px 4px rgba(0,0,0,0.08)", padding: 24 }}>
            <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 20, color: "#111" }}>
              Order Summary
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12, fontSize: 15, color: "#444" }}>
              <span>Subtotal ({cart.item_count} {cart.item_count === 1 ? "item" : "items"})</span>
              <span>{fmtPrice(cart.subtotal)}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12, fontSize: 15, color: "#444" }}>
              <span>Shipping</span>
              {shipping === 0 ? (
                <span style={{ color: "#22a06b", fontWeight: 600 }}>Free</span>
              ) : (
                <span>₹{shipping}</span>
              )}
            </div>
            {shipping > 0 && (
              <div
                style={{
                  fontSize: 12,
                  color: "#b45309",
                  background: "#fff8f0",
                  borderRadius: 6,
                  padding: "6px 10px",
                  marginBottom: 12,
                }}
              >
                Add ₹{(499 - subtotal).toFixed(0)} more for free shipping
              </div>
            )}

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                paddingTop: 16,
                marginTop: 4,
                borderTop: "1px solid #f0f0f0",
                fontWeight: 700,
                fontSize: 18,
                color: "#111",
              }}
            >
              <span>Total</span>
              <span style={{ color: BRAND }}>₹{total.toFixed(2)}</span>
            </div>

            <button
              style={{
                width: "100%",
                padding: "14px",
                background: isEmpty ? "#ccc" : BRAND,
                color: "#fff",
                border: "none",
                borderRadius: 10,
                fontSize: 16,
                fontWeight: 700,
                cursor: isEmpty ? "not-allowed" : "pointer",
                marginTop: 20,
              }}
              disabled={isEmpty}
              onClick={() => navigate("/checkout")}
            >
              Proceed to Checkout
            </button>

            <Link
              to="/"
              style={{
                display: "block",
                textAlign: "center",
                marginTop: 12,
                color: "#888",
                fontSize: 13,
                textDecoration: "none",
              }}
            >
              ← Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
