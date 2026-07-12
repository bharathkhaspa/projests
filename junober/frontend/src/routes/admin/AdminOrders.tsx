import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminFetchOrders, adminUpdateOrder } from "../../lib/orderApi";
import { fmtPrice } from "../../lib/utils";

const BRAND = "#FF6B00";

const STATUS_OPTIONS = ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"];

const STATUS_COLORS: Record<string, { bg: string; color: string }> = {
  pending: { bg: "#fff3e0", color: "#e65100" },
  confirmed: { bg: "#e3f2fd", color: "#1565c0" },
  processing: { bg: "#f3e5f5", color: "#6a1b9a" },
  shipped: { bg: "#e0f2f1", color: "#00695c" },
  delivered: { bg: "#e8f5e9", color: "#2e7d32" },
  cancelled: { bg: "#ffebee", color: "#c62828" },
};

const PAYMENT_COLORS: Record<string, { bg: string; color: string }> = {
  paid: { bg: "#e8f5e9", color: "#2e7d32" },
  pending: { bg: "#fff3e0", color: "#e65100" },
  failed: { bg: "#ffebee", color: "#c62828" },
  refunded: { bg: "#f3e5f5", color: "#6a1b9a" },
};

const FILTER_TABS = ["All", "Pending", "Processing", "Shipped", "Delivered"];

function Spinner() {
  return (
    <div style={{ display: "flex", justifyContent: "center", padding: 80 }}>
      <div style={{ width: 40, height: 40, border: "4px solid #eee", borderTop: `4px solid ${BRAND}`, borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

export default function AdminOrders() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("All");
  const [rowEdits, setRowEdits] = useState<Record<number, { status?: string; tracking_number?: string }>>({});
  const [savedRows, setSavedRows] = useState<Record<number, boolean>>({});

  const { data: orders = [], isLoading, isError } = useQuery({
    queryKey: ["admin", "orders"],
    queryFn: adminFetchOrders,
  });

  const updateMutation = useMutation({
    mutationFn: ({ orderId, data }: { orderId: number; data: any }) => adminUpdateOrder(orderId, data),
    onSuccess: (_, { orderId }) => {
      queryClient.invalidateQueries({ queryKey: ["admin", "orders"] });
      setSavedRows((prev) => ({ ...prev, [orderId]: true }));
      setTimeout(() => setSavedRows((prev) => { const n = { ...prev }; delete n[orderId]; return n; }), 2000);
      setRowEdits((prev) => { const n = { ...prev }; delete n[orderId]; return n; });
    },
  });

  const handleRowEdit = (orderId: number, field: string, value: string) => {
    setRowEdits((prev) => ({ ...prev, [orderId]: { ...(prev[orderId] || {}), [field]: value } }));
  };

  const handleSave = (order: any) => {
    const edits = rowEdits[order.id] || {};
    updateMutation.mutate({ orderId: order.id, data: edits });
  };

  const isDirty = (orderId: number) => {
    const edits = rowEdits[orderId];
    return edits && Object.keys(edits).length > 0;
  };

  const filteredOrders = orders.filter((order: any) => {
    if (activeTab === "All") return true;
    return order.status?.toLowerCase() === activeTab.toLowerCase();
  });

  if (isLoading) return <Spinner />;
  if (isError) return <div style={{ padding: 40, color: "#ef4444", fontFamily: "system-ui" }}>Failed to load orders.</div>;

  return (
    <div style={{ padding: 32, fontFamily: "system-ui" }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 26, fontWeight: 700, color: "#0f1115", margin: 0 }}>Orders</h1>
        <p style={{ color: "#888", margin: "4px 0 0", fontSize: 14 }}>{orders.length} total orders</p>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: "flex", gap: 4, marginBottom: 24, background: "#fff", borderRadius: 10, padding: 4, border: "1px solid #eee", width: "fit-content" }}>
        {FILTER_TABS.map((tab) => {
          const count = tab === "All"
            ? orders.length
            : orders.filter((o: any) => o.status?.toLowerCase() === tab.toLowerCase()).length;
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                background: activeTab === tab ? BRAND : "transparent",
                color: activeTab === tab ? "#fff" : "#666",
                border: "none",
                borderRadius: 7,
                padding: "7px 16px",
                fontSize: 13,
                fontWeight: activeTab === tab ? 600 : 400,
                cursor: "pointer",
                transition: "all 0.15s",
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              {tab}
              <span style={{
                background: activeTab === tab ? "rgba(255,255,255,0.3)" : "#f0f0f0",
                color: activeTab === tab ? "#fff" : "#888",
                borderRadius: 20,
                padding: "1px 7px",
                fontSize: 11,
                fontWeight: 600,
              }}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Table */}
      <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #eee", overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.07)" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
            <thead>
              <tr style={{ background: "#fafafa" }}>
                {["Order #", "Customer", "Date", "Status", "Payment", "Total", "Tracking", "Actions"].map((h) => (
                  <th key={h} style={{ textAlign: "left", padding: "12px 16px", fontWeight: 600, color: "#888", fontSize: 12, textTransform: "uppercase", letterSpacing: 0.5, borderBottom: "1px solid #f0f0f0", whiteSpace: "nowrap" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredOrders.length === 0 && (
                <tr>
                  <td colSpan={8} style={{ textAlign: "center", padding: 48, color: "#aaa" }}>
                    No orders found
                  </td>
                </tr>
              )}
              {filteredOrders.map((order: any) => {
                const currentStatus = rowEdits[order.id]?.status ?? order.status ?? "pending";
                const currentTracking = rowEdits[order.id]?.tracking_number ?? order.tracking_number ?? "";
                const sc = STATUS_COLORS[currentStatus] || { bg: "#f0f0f0", color: "#666" };
                const pc = PAYMENT_COLORS[order.payment_status] || { bg: "#f0f0f0", color: "#666" };
                const dirty = isDirty(order.id);
                const saved = savedRows[order.id];

                return (
                  <tr
                    key={order.id}
                    style={{ borderBottom: "1px solid #f5f5f5", background: dirty ? "#fffbf5" : "transparent" }}
                    onMouseEnter={(e) => { if (!dirty) (e.currentTarget as HTMLTableRowElement).style.background = "#fafafa"; }}
                    onMouseLeave={(e) => { if (!dirty) (e.currentTarget as HTMLTableRowElement).style.background = "transparent"; }}
                  >
                    {/* Order # */}
                    <td style={{ padding: "14px 16px" }}>
                      <span style={{ fontWeight: 700, color: BRAND }}>#{order.order_number || order.id}</span>
                    </td>

                    {/* Customer */}
                    <td style={{ padding: "14px 16px" }}>
                      <div style={{ fontWeight: 500, color: "#0f1115", fontSize: 13 }}>
                        {order.user?.first_name && order.user?.last_name
                          ? `${order.user.first_name} ${order.user.last_name}`
                          : order.user?.username || "—"}
                      </div>
                      <div style={{ fontSize: 11, color: "#aaa", marginTop: 1 }}>
                        {order.user?.email || order.customer_email || "—"}
                      </div>
                    </td>

                    {/* Date */}
                    <td style={{ padding: "14px 16px", color: "#888", whiteSpace: "nowrap", fontSize: 13 }}>
                      {order.created_at ? new Date(order.created_at).toLocaleDateString() : "—"}
                    </td>

                    {/* Status Select */}
                    <td style={{ padding: "14px 16px" }}>
                      <select
                        value={currentStatus}
                        onChange={(e) => handleRowEdit(order.id, "status", e.target.value)}
                        style={{
                          background: sc.bg,
                          color: sc.color,
                          border: `1px solid ${sc.color}40`,
                          borderRadius: 8,
                          padding: "5px 8px",
                          fontSize: 12,
                          fontWeight: 600,
                          cursor: "pointer",
                          outline: "none",
                          textTransform: "capitalize",
                        }}
                      >
                        {STATUS_OPTIONS.map((s) => (
                          <option key={s} value={s} style={{ background: "#fff", color: "#333", textTransform: "capitalize" }}>
                            {s.charAt(0).toUpperCase() + s.slice(1)}
                          </option>
                        ))}
                      </select>
                    </td>

                    {/* Payment Status */}
                    <td style={{ padding: "14px 16px" }}>
                      <span style={{
                        background: pc.bg,
                        color: pc.color,
                        borderRadius: 20,
                        padding: "3px 10px",
                        fontSize: 12,
                        fontWeight: 600,
                        textTransform: "capitalize",
                      }}>
                        {order.payment_status || "—"}
                      </span>
                    </td>

                    {/* Total */}
                    <td style={{ padding: "14px 16px", fontWeight: 600, whiteSpace: "nowrap" }}>
                      {fmtPrice(order.total)}
                    </td>

                    {/* Tracking */}
                    <td style={{ padding: "14px 16px" }}>
                      <input
                        type="text"
                        value={currentTracking}
                        onChange={(e) => handleRowEdit(order.id, "tracking_number", e.target.value)}
                        placeholder="Add tracking #"
                        style={{
                          border: "1px solid #e0e0e0",
                          borderRadius: 6,
                          padding: "5px 10px",
                          fontSize: 12,
                          width: 130,
                          outline: "none",
                          background: "#fafafa",
                        }}
                        onFocus={(e) => (e.target.style.borderColor = BRAND)}
                        onBlur={(e) => (e.target.style.borderColor = "#e0e0e0")}
                      />
                    </td>

                    {/* Save */}
                    <td style={{ padding: "14px 16px" }}>
                      {saved ? (
                        <span style={{ color: "#2e7d32", fontSize: 13, fontWeight: 600 }}>✓ Saved</span>
                      ) : (
                        <button
                          onClick={() => handleSave(order)}
                          disabled={!dirty || updateMutation.isPending}
                          style={{
                            background: dirty ? BRAND : "#f0f0f0",
                            color: dirty ? "#fff" : "#bbb",
                            border: "none",
                            borderRadius: 6,
                            padding: "6px 14px",
                            fontSize: 13,
                            fontWeight: 600,
                            cursor: dirty ? "pointer" : "default",
                            whiteSpace: "nowrap",
                            transition: "all 0.15s",
                          }}
                        >
                          {updateMutation.isPending ? "Saving…" : "Save"}
                        </button>
                      )}
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
