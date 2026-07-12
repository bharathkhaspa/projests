import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { fetchDashboard } from "../../lib/catalogApi";

const BRAND = "#FF6B00";

const STATUS_COLORS: Record<string, { bg: string; color: string }> = {
  pending: { bg: "#fff3e0", color: "#e65100" },
  confirmed: { bg: "#e3f2fd", color: "#1565c0" },
  processing: { bg: "#f3e5f5", color: "#6a1b9a" },
  shipped: { bg: "#e0f2f1", color: "#00695c" },
  delivered: { bg: "#e8f5e9", color: "#2e7d32" },
  cancelled: { bg: "#ffebee", color: "#c62828" },
};

const statCards = [
  { key: "total_products", label: "Total Products", icon: "📦", color: "#3b82f6" },
  { key: "total_orders", label: "Total Orders", icon: "🛒", color: BRAND },
  { key: "pending_orders", label: "Pending Orders", icon: "⏳", color: "#f59e0b" },
  { key: "low_stock_variants", label: "Low Stock Variants", icon: "⚠️", color: "#ef4444" },
];

function Spinner() {
  return (
    <div style={{ display: "flex", justifyContent: "center", padding: 60 }}>
      <div
        style={{
          width: 40,
          height: 40,
          border: `4px solid #eee`,
          borderTop: `4px solid ${BRAND}`,
          borderRadius: "50%",
          animation: "spin 0.8s linear infinite",
        }}
      />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { data, isLoading, isError } = useQuery({
    queryKey: ["admin", "dashboard"],
    queryFn: fetchDashboard,
  });

  if (isLoading) return <Spinner />;

  if (isError || !data) {
    return (
      <div style={{ padding: 40, color: "#ef4444", fontFamily: "system-ui" }}>
        Failed to load dashboard data.
      </div>
    );
  }

  return (
    <div style={{ padding: 32, fontFamily: "system-ui", maxWidth: 1200 }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 26, fontWeight: 700, color: "#0f1115", margin: 0 }}>Dashboard</h1>
        <p style={{ color: "#888", margin: "4px 0 0", fontSize: 14 }}>Welcome back. Here's what's happening.</p>
      </div>

      {/* Stat Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 20,
          marginBottom: 36,
        }}
      >
        {statCards.map((card) => (
          <div
            key={card.key}
            style={{
              background: "#fff",
              borderRadius: 12,
              padding: "22px 24px",
              boxShadow: "0 1px 4px rgba(0,0,0,0.07)",
              display: "flex",
              alignItems: "center",
              gap: 16,
              border: "1px solid #eee",
            }}
          >
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 12,
                background: card.color + "18",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 22,
                flexShrink: 0,
              }}
            >
              {card.icon}
            </div>
            <div>
              <div style={{ fontSize: 28, fontWeight: 700, color: "#0f1115", lineHeight: 1 }}>
                {(data as any)[card.key] ?? 0}
              </div>
              <div style={{ fontSize: 13, color: "#888", marginTop: 4 }}>{card.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Orders */}
      <div
        style={{
          background: "#fff",
          borderRadius: 12,
          border: "1px solid #eee",
          boxShadow: "0 1px 4px rgba(0,0,0,0.07)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            padding: "18px 24px",
            borderBottom: "1px solid #f0f0f0",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <h2 style={{ margin: 0, fontSize: 17, fontWeight: 600, color: "#0f1115" }}>Recent Orders</h2>
          <button
            onClick={() => navigate("/admin-panel/orders")}
            style={{
              background: "transparent",
              border: `1px solid ${BRAND}`,
              color: BRAND,
              borderRadius: 6,
              padding: "6px 14px",
              fontSize: 13,
              fontWeight: 500,
              cursor: "pointer",
            }}
          >
            View All
          </button>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
            <thead>
              <tr style={{ background: "#fafafa" }}>
                {["Order #", "Customer", "Status", "Total", "Date"].map((h) => (
                  <th
                    key={h}
                    style={{
                      textAlign: "left",
                      padding: "12px 20px",
                      fontWeight: 600,
                      color: "#888",
                      fontSize: 12,
                      textTransform: "uppercase",
                      letterSpacing: 0.5,
                      borderBottom: "1px solid #f0f0f0",
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(data.recent_orders || []).length === 0 && (
                <tr>
                  <td colSpan={5} style={{ textAlign: "center", padding: 32, color: "#aaa" }}>
                    No recent orders
                  </td>
                </tr>
              )}
              {(data.recent_orders || []).map((order: any, i: number) => {
                const sc = STATUS_COLORS[order.status] || { bg: "#f0f0f0", color: "#666" };
                return (
                  <tr
                    key={order.id || i}
                    style={{ borderBottom: "1px solid #f5f5f5" }}
                    onMouseEnter={(e) => ((e.currentTarget as HTMLTableRowElement).style.background = "#fafafa")}
                    onMouseLeave={(e) => ((e.currentTarget as HTMLTableRowElement).style.background = "transparent")}
                  >
                    <td style={{ padding: "14px 20px" }}>
                      <span
                        onClick={() => navigate("/admin-panel/orders")}
                        style={{ color: BRAND, fontWeight: 600, cursor: "pointer", textDecoration: "underline" }}
                      >
                        #{order.order_number || order.id}
                      </span>
                    </td>
                    <td style={{ padding: "14px 20px", color: "#444" }}>
                      {order.customer_email || order.user?.email || "—"}
                    </td>
                    <td style={{ padding: "14px 20px" }}>
                      <span
                        style={{
                          background: sc.bg,
                          color: sc.color,
                          borderRadius: 20,
                          padding: "3px 10px",
                          fontSize: 12,
                          fontWeight: 600,
                          textTransform: "capitalize",
                        }}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td style={{ padding: "14px 20px", fontWeight: 500 }}>
                      ₹{Number(order.total_amount || order.total || 0).toFixed(2)}
                    </td>
                    <td style={{ padding: "14px 20px", color: "#888" }}>
                      {order.created_at ? new Date(order.created_at).toLocaleDateString() : "—"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
