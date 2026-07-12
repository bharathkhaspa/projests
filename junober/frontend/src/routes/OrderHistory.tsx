import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import Navbar from "../components/Navbar";
import { fetchOrders } from "../lib/orderApi";
import { fmtPrice } from "../lib/utils";
import { useAuth } from "../store/auth";
import type { Order } from "../lib/orderTypes";

const BRAND = "#FF6B00";

function statusStyle(status: string): React.CSSProperties {
  const map: Record<string, { background: string; color: string }> = {
    pending: { background: "#fff7ed", color: "#c2410c" },
    confirmed: { background: "#eff6ff", color: "#1d4ed8" },
    processing: { background: "#eff6ff", color: "#1d4ed8" },
    shipped: { background: "#eff6ff", color: "#1d4ed8" },
    delivered: { background: "#f0fdf4", color: "#15803d" },
    cancelled: { background: "#fef2f2", color: "#dc2626" },
  };
  const s = map[status.toLowerCase()] ?? { background: "#f3f4f6", color: "#6b7280" };
  return {
    ...s,
    padding: "3px 10px",
    borderRadius: 20,
    fontSize: 12,
    fontWeight: 600,
    display: "inline-block",
  };
}

function paymentStatusStyle(status: string): React.CSSProperties {
  const map: Record<string, { background: string; color: string }> = {
    paid: { background: "#f0fdf4", color: "#15803d" },
    pending: { background: "#fff7ed", color: "#c2410c" },
    failed: { background: "#fef2f2", color: "#dc2626" },
    refunded: { background: "#f3f4f6", color: "#6b7280" },
  };
  const s = map[status.toLowerCase()] ?? { background: "#f3f4f6", color: "#6b7280" };
  return {
    ...s,
    padding: "3px 10px",
    borderRadius: 20,
    fontSize: 11,
    fontWeight: 600,
    display: "inline-block",
  };
}

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

function SkeletonCard() {
  return (
    <div
      style={{
        background: "#fff",
        borderRadius: 12,
        boxShadow: "0 1px 4px rgba(0,0,0,0.07)",
        padding: 24,
        marginBottom: 16,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
        <div style={{ width: 120, height: 18, background: "#e8e8e8", borderRadius: 4 }} />
        <div style={{ width: 70, height: 18, background: "#e8e8e8", borderRadius: 4 }} />
      </div>
      <div style={{ width: "60%", height: 14, background: "#e8e8e8", borderRadius: 4, marginBottom: 8 }} />
      <div style={{ width: "40%", height: 14, background: "#e8e8e8", borderRadius: 4 }} />
    </div>
  );
}

interface OrderCardProps {
  order: Order;
}

function OrderCard({ order }: OrderCardProps) {
  const [expanded, setExpanded] = useState(false);

  const itemSummary = order.items
    .slice(0, 3)
    .map((i) => i.product_name)
    .join(", ");
  const moreCount = order.items.length > 3 ? order.items.length - 3 : 0;

  const addr = order.shipping_address;
  const addressLine = addr
    ? `${addr.line1}${addr.line2 ? ", " + addr.line2 : ""}, ${addr.city}, ${addr.state} – ${addr.pincode}`
    : "";

  return (
    <div
      style={{
        background: "#fff",
        borderRadius: 12,
        boxShadow: "0 1px 4px rgba(0,0,0,0.07)",
        padding: 24,
        marginBottom: 16,
        border: "1px solid #f0f0f0",
      }}
    >
      {/* Header row */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: 12,
          flexWrap: "wrap",
          gap: 8,
        }}
      >
        <div>
          <span style={{ fontWeight: 700, fontSize: 16, color: "#111" }}>
            #{order.order_number}
          </span>
          <span style={{ fontSize: 13, color: "#888", marginLeft: 12 }}>
            {formatDate(order.created_at)}
          </span>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
          <span style={statusStyle(order.status)}>{order.status.charAt(0).toUpperCase() + order.status.slice(1)}</span>
          <span style={paymentStatusStyle(order.payment_status)}>
            {order.payment_status.charAt(0).toUpperCase() + order.payment_status.slice(1)}
          </span>
          <span style={{ fontWeight: 700, fontSize: 16, color: BRAND }}>₹{order.total}</span>
        </div>
      </div>

      {/* Items summary */}
      <div style={{ fontSize: 14, color: "#555", marginBottom: 6 }}>
        <span style={{ fontWeight: 600, color: "#333" }}>
          {order.items.length} {order.items.length === 1 ? "item" : "items"}
        </span>
        {" — "}
        {itemSummary}
        {moreCount > 0 && <span style={{ color: "#888" }}> +{moreCount} more</span>}
      </div>

      {/* Address */}
      {addressLine && (
        <div style={{ fontSize: 13, color: "#888", marginBottom: 6 }}>
          Shipping to: {addressLine}
        </div>
      )}

      {/* Tracking */}
      {order.tracking_number && (
        <div style={{ fontSize: 13, marginBottom: 6 }}>
          <span style={{ color: "#666" }}>Tracking: </span>
          <span style={{ fontWeight: 600, color: "#111", letterSpacing: 0.5 }}>
            {order.tracking_number}
          </span>
        </div>
      )}

      {/* View Details toggle */}
      <button
        onClick={() => setExpanded((v) => !v)}
        style={{
          background: "none",
          border: "none",
          color: BRAND,
          fontWeight: 600,
          fontSize: 13,
          cursor: "pointer",
          padding: 0,
          marginTop: 8,
          fontFamily: "system-ui, sans-serif",
        }}
      >
        {expanded ? "▲ Hide Details" : "▼ View Details"}
      </button>

      {/* Expanded item list */}
      {expanded && (
        <div
          style={{
            marginTop: 14,
            paddingTop: 14,
            borderTop: "1px solid #f0f0f0",
          }}
        >
          <div style={{ fontSize: 13, fontWeight: 700, color: "#555", marginBottom: 10, textTransform: "uppercase", letterSpacing: 0.5 }}>
            Items
          </div>
          {order.items.map((item) => (
            <div
              key={item.id}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "10px 0",
                borderBottom: "1px solid #f7f7f7",
                gap: 8,
              }}
            >
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: "#111" }}>
                  {item.product_name}
                </div>
                <div style={{ fontSize: 12, color: "#888", marginTop: 2 }}>
                  {item.color_name} · {item.size_code}
                  {item.print_type_name ? ` · ${item.print_type_name}` : ""}
                  {" "}× {item.quantity}
                </div>
                {item.design_text && (
                  <div style={{ fontSize: 12, color: "#aaa", fontStyle: "italic" }}>
                    "{item.design_text}"
                  </div>
                )}
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 13, color: "#888" }}>{fmtPrice(item.unit_price)} each</div>
                <div style={{ fontSize: 15, fontWeight: 700, color: "#111" }}>
                  ₹{Number(item.line_total).toFixed(2)}
                </div>
              </div>
            </div>
          ))}

          {/* Order totals */}
          <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid #f0f0f0" }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "#666", marginBottom: 6 }}>
              <span>Subtotal</span>
              <span>₹{order.subtotal}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "#666", marginBottom: 6 }}>
              <span>Shipping</span>
              {parseFloat(order.shipping_charge) === 0 ? (
                <span style={{ color: "#22a06b", fontWeight: 600 }}>Free</span>
              ) : (
                <span>₹{order.shipping_charge}</span>
              )}
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: 16,
                fontWeight: 700,
                color: "#111",
                paddingTop: 8,
                borderTop: "1px solid #f0f0f0",
              }}
            >
              <span>Total</span>
              <span style={{ color: BRAND }}>₹{order.total}</span>
            </div>
          </div>

          {/* Shipping address full */}
          {addr && (
            <div style={{ marginTop: 14, padding: 12, background: "#f9f9f9", borderRadius: 8 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#888", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 6 }}>
                Shipping Address
              </div>
              <div style={{ fontSize: 13, color: "#444", lineHeight: 1.7 }}>
                <strong>{addr.full_name}</strong>
                <br />
                {addr.line1}
                {addr.line2 ? `, ${addr.line2}` : ""}
                <br />
                {addr.city}, {addr.state} – {addr.pincode}
                <br />
                {addr.phone}
              </div>
            </div>
          )}

          {order.notes && (
            <div style={{ marginTop: 10, fontSize: 13, color: "#777", fontStyle: "italic" }}>
              Note: {order.notes}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function OrderHistory() {
  const user = useAuth((s) => s.user);
  const location = useLocation();
  const successFromCheckout = (location.state as { success?: boolean } | null)?.success;

  const { data: orders, isLoading } = useQuery<Order[]>({
    queryKey: ["orders"],
    queryFn: fetchOrders,
    enabled: !!user,
  });

  if (!user) {
    return (
      <div style={{ minHeight: "100vh", background: "#f9f9f9", fontFamily: "system-ui, sans-serif" }}>
        <Navbar />
        <div style={{ maxWidth: 700, margin: "0 auto", padding: "80px 16px", textAlign: "center" }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>📦</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: "#111", marginBottom: 8 }}>
            Sign in to view orders
          </div>
          <div style={{ color: "#888", marginBottom: 24 }}>
            Track your orders and view your purchase history
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

  return (
    <div style={{ minHeight: "100vh", background: "#f9f9f9", fontFamily: "system-ui, sans-serif" }}>
      <Navbar />
      <div style={{ maxWidth: 780, margin: "0 auto", padding: "32px 16px" }}>
        {successFromCheckout && (
          <div
            style={{
              marginBottom: 20,
              padding: "14px 18px",
              background: "#f0fdf4",
              border: "1px solid #bbf7d0",
              borderRadius: 10,
              color: "#15803d",
              fontWeight: 600,
              fontSize: 15,
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <span>✓</span> Order placed successfully! We'll notify you once it's confirmed.
          </div>
        )}

        <h1 style={{ fontSize: 28, fontWeight: 700, color: "#111", marginBottom: 24, margin: "0 0 24px" }}>
          My Orders
        </h1>

        {isLoading && (
          <>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </>
        )}

        {!isLoading && orders && orders.length === 0 && (
          <div
            style={{
              textAlign: "center",
              padding: "80px 20px",
            }}
          >
            <div style={{ fontSize: 52, marginBottom: 16 }}>🛍️</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: "#111", marginBottom: 8 }}>
              No orders yet
            </div>
            <div style={{ color: "#888", fontSize: 15, marginBottom: 24 }}>
              Your completed orders will appear here
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
              Start Shopping
            </Link>
          </div>
        )}

        {!isLoading &&
          orders &&
          orders.length > 0 &&
          orders.map((order) => <OrderCard key={order.id} order={order} />)}
      </div>
    </div>
  );
}
