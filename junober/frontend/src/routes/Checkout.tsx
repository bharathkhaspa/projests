import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Navbar from "../components/Navbar";
import {
  fetchCart,
  fetchAddresses,
  createAddress,
  checkout,
} from "../lib/orderApi";
import { useAuth } from "../store/auth";
import type { Cart, Address } from "../lib/orderTypes";

const BRAND = "#FF6B00";

interface AddressForm {
  full_name: string;
  phone: string;
  line1: string;
  line2: string;
  city: string;
  state: string;
  pincode: string;
  label: string;
  country: string;
  is_default: boolean;
}

const emptyForm: AddressForm = {
  full_name: "",
  phone: "",
  line1: "",
  line2: "",
  city: "",
  state: "",
  pincode: "",
  label: "Home",
  country: "India",
  is_default: false,
};

export default function CheckoutPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const user = useAuth((s) => s.user);

  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [formData, setFormData] = useState<AddressForm>(emptyForm);
  const [notes, setNotes] = useState("");
  const [validationError, setValidationError] = useState("");
  const [_successMessage, setSuccessMessage] = useState("");

  const { data: cart } = useQuery<Cart>({
    queryKey: ["cart"],
    queryFn: fetchCart,
    enabled: !!user,
  });

  const { data: addresses } = useQuery<Address[]>({
    queryKey: ["addresses"],
    queryFn: fetchAddresses,
    enabled: !!user,
  });

  useEffect(() => {
    if (addresses && addresses.length > 0 && selectedAddressId === null) {
      const def = addresses.find((a) => a.is_default);
      setSelectedAddressId(def ? def.id : addresses[0].id);
    }
  }, [addresses, selectedAddressId]);

  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);

  const createAddressMutation = useMutation({
    mutationFn: createAddress,
    onSuccess: (newAddr) => {
      queryClient.invalidateQueries({ queryKey: ["addresses"] });
      setSelectedAddressId(newAddr.id);
      setShowAddressForm(false);
      setFormData(emptyForm);
    },
  });

  const checkoutMutation = useMutation({
    mutationFn: ({ address_id, notes }: { address_id: number; notes?: string }) =>
      checkout(address_id, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      setSuccessMessage("Order placed successfully!");
      navigate("/orders", { state: { success: true } });
    },
  });

  if (!user) return null;

  const items = cart?.items ?? [];
  const subtotal = cart ? parseFloat(cart.subtotal) : 0;
  const shipping = subtotal > 499 ? 0 : 49;
  const total = subtotal + shipping;

  function handleFormChange(field: keyof AddressForm, value: string | boolean) {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }

  function handleAddAddress(e: React.FormEvent) {
    e.preventDefault();
    createAddressMutation.mutate(formData);
  }

  function handlePlaceOrder() {
    setValidationError("");
    if (!selectedAddressId) {
      setValidationError("Please select a delivery address to continue.");
      return;
    }
    checkoutMutation.mutate({ address_id: selectedAddressId, notes });
  }

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "10px 12px",
    border: "1px solid #ddd",
    borderRadius: 8,
    fontSize: 14,
    fontFamily: "system-ui, sans-serif",
    outline: "none",
    boxSizing: "border-box",
  };

  const labelStyle: React.CSSProperties = {
    fontSize: 13,
    fontWeight: 600,
    color: "#444",
    marginBottom: 4,
    display: "block",
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f9f9f9", fontFamily: "system-ui, sans-serif" }}>
      <Navbar />
      <div style={{ maxWidth: 1060, margin: "0 auto", padding: "32px 16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 28 }}>
          <Link to="/cart" style={{ color: "#888", textDecoration: "none", fontSize: 14 }}>
            ← Back to Cart
          </Link>
          <h1 style={{ margin: 0, fontSize: 26, fontWeight: 700, color: "#111" }}>Checkout</h1>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: 24, alignItems: "start" }}>
          {/* Left Column */}
          <div>
            {/* Delivery Address */}
            <div
              style={{
                background: "#fff",
                borderRadius: 12,
                boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
                padding: 24,
                marginBottom: 20,
              }}
            >
              <div style={{ fontSize: 17, fontWeight: 700, color: "#111", marginBottom: 16 }}>
                Delivery Address
              </div>

              {addresses && addresses.length > 0 ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 16 }}>
                  {addresses.map((addr) => (
                    <label
                      key={addr.id}
                      style={{
                        display: "flex",
                        gap: 12,
                        padding: 14,
                        border: `2px solid ${selectedAddressId === addr.id ? BRAND : "#e5e7eb"}`,
                        borderRadius: 10,
                        cursor: "pointer",
                        background: selectedAddressId === addr.id ? "#fff8f3" : "#fafafa",
                        transition: "border-color 0.15s",
                      }}
                    >
                      <input
                        type="radio"
                        name="address"
                        value={addr.id}
                        checked={selectedAddressId === addr.id}
                        onChange={() => setSelectedAddressId(addr.id)}
                        style={{ marginTop: 2, accentColor: BRAND }}
                      />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, fontSize: 14, color: "#111", marginBottom: 2 }}>
                          {addr.full_name}
                          {addr.label && (
                            <span
                              style={{
                                marginLeft: 8,
                                fontSize: 11,
                                background: "#f3f4f6",
                                padding: "2px 8px",
                                borderRadius: 4,
                                color: "#666",
                                fontWeight: 500,
                              }}
                            >
                              {addr.label}
                            </span>
                          )}
                          {addr.is_default && (
                            <span
                              style={{
                                marginLeft: 6,
                                fontSize: 11,
                                background: "#fff0e6",
                                padding: "2px 8px",
                                borderRadius: 4,
                                color: BRAND,
                                fontWeight: 600,
                              }}
                            >
                              Default
                            </span>
                          )}
                        </div>
                        <div style={{ fontSize: 13, color: "#555", lineHeight: 1.6 }}>
                          {addr.line1}
                          {addr.line2 ? `, ${addr.line2}` : ""}, {addr.city},{" "}
                          {addr.state} – {addr.pincode}
                        </div>
                        <div style={{ fontSize: 13, color: "#777" }}>{addr.phone}</div>
                      </div>
                    </label>
                  ))}
                </div>
              ) : (
                <div style={{ fontSize: 14, color: "#888", marginBottom: 16 }}>
                  No saved addresses. Add one below.
                </div>
              )}

              <button
                style={{
                  background: "none",
                  border: `1px dashed ${BRAND}`,
                  borderRadius: 8,
                  padding: "8px 16px",
                  color: BRAND,
                  fontWeight: 600,
                  fontSize: 14,
                  cursor: "pointer",
                  fontFamily: "system-ui, sans-serif",
                }}
                onClick={() => setShowAddressForm((v) => !v)}
              >
                {showAddressForm ? "− Cancel" : "+ Add New Address"}
              </button>

              {showAddressForm && (
                <form
                  onSubmit={handleAddAddress}
                  style={{
                    marginTop: 16,
                    padding: 16,
                    background: "#f9f9f9",
                    borderRadius: 10,
                    border: "1px solid #f0f0f0",
                  }}
                >
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                    <div>
                      <label style={labelStyle}>Full Name *</label>
                      <input
                        style={inputStyle}
                        required
                        value={formData.full_name}
                        onChange={(e) => handleFormChange("full_name", e.target.value)}
                        placeholder="Your full name"
                      />
                    </div>
                    <div>
                      <label style={labelStyle}>Phone *</label>
                      <input
                        style={inputStyle}
                        required
                        value={formData.phone}
                        onChange={(e) => handleFormChange("phone", e.target.value)}
                        placeholder="10-digit mobile number"
                        type="tel"
                      />
                    </div>
                    <div style={{ gridColumn: "1 / -1" }}>
                      <label style={labelStyle}>Address Line 1 *</label>
                      <input
                        style={inputStyle}
                        required
                        value={formData.line1}
                        onChange={(e) => handleFormChange("line1", e.target.value)}
                        placeholder="House no., street, area"
                      />
                    </div>
                    <div style={{ gridColumn: "1 / -1" }}>
                      <label style={labelStyle}>Address Line 2</label>
                      <input
                        style={inputStyle}
                        value={formData.line2}
                        onChange={(e) => handleFormChange("line2", e.target.value)}
                        placeholder="Landmark, locality (optional)"
                      />
                    </div>
                    <div>
                      <label style={labelStyle}>City *</label>
                      <input
                        style={inputStyle}
                        required
                        value={formData.city}
                        onChange={(e) => handleFormChange("city", e.target.value)}
                        placeholder="City"
                      />
                    </div>
                    <div>
                      <label style={labelStyle}>State *</label>
                      <input
                        style={inputStyle}
                        required
                        value={formData.state}
                        onChange={(e) => handleFormChange("state", e.target.value)}
                        placeholder="State"
                      />
                    </div>
                    <div>
                      <label style={labelStyle}>Pincode *</label>
                      <input
                        style={inputStyle}
                        required
                        value={formData.pincode}
                        onChange={(e) => handleFormChange("pincode", e.target.value)}
                        placeholder="6-digit pincode"
                      />
                    </div>
                    <div>
                      <label style={labelStyle}>Label</label>
                      <input
                        style={inputStyle}
                        value={formData.label}
                        onChange={(e) => handleFormChange("label", e.target.value)}
                        placeholder="Home / Office / Other"
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={createAddressMutation.isPending}
                    style={{
                      marginTop: 16,
                      padding: "10px 24px",
                      background: BRAND,
                      color: "#fff",
                      border: "none",
                      borderRadius: 8,
                      fontWeight: 700,
                      fontSize: 14,
                      cursor: createAddressMutation.isPending ? "not-allowed" : "pointer",
                      fontFamily: "system-ui, sans-serif",
                    }}
                  >
                    {createAddressMutation.isPending ? "Saving…" : "Save Address"}
                  </button>
                  {createAddressMutation.isError && (
                    <div style={{ color: "#ef4444", fontSize: 13, marginTop: 8 }}>
                      Failed to save address. Please try again.
                    </div>
                  )}
                </form>
              )}
            </div>

            {/* Payment Method */}
            <div
              style={{
                background: "#fff",
                borderRadius: 12,
                boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
                padding: 24,
                marginBottom: 20,
              }}
            >
              <div style={{ fontSize: 17, fontWeight: 700, color: "#111", marginBottom: 16 }}>
                Payment Method
              </div>
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: 14,
                  border: `2px solid ${BRAND}`,
                  borderRadius: 10,
                  background: "#fff8f3",
                  cursor: "pointer",
                }}
              >
                <input
                  type="radio"
                  name="payment"
                  checked
                  readOnly
                  style={{ accentColor: BRAND }}
                />
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14, color: "#111" }}>
                    Cash on Delivery (COD)
                  </div>
                  <div style={{ fontSize: 12, color: "#888", marginTop: 2 }}>
                    Pay when your order arrives
                  </div>
                </div>
              </label>
            </div>

            {/* Notes */}
            <div
              style={{
                background: "#fff",
                borderRadius: 12,
                boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
                padding: 24,
              }}
            >
              <div style={{ fontSize: 17, fontWeight: 700, color: "#111", marginBottom: 12 }}>
                Order Notes
                <span style={{ fontWeight: 400, fontSize: 13, color: "#aaa", marginLeft: 8 }}>
                  (optional)
                </span>
              </div>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any special instructions for your order..."
                rows={3}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  border: "1px solid #ddd",
                  borderRadius: 8,
                  fontSize: 14,
                  fontFamily: "system-ui, sans-serif",
                  resize: "vertical",
                  outline: "none",
                  boxSizing: "border-box",
                }}
              />
            </div>
          </div>

          {/* Right Column — Order Summary */}
          <div style={{ background: "#fff", borderRadius: 12, boxShadow: "0 1px 4px rgba(0,0,0,0.08)", padding: 24 }}>
            <div style={{ fontSize: 17, fontWeight: 700, color: "#111", marginBottom: 16 }}>
              Order Summary
            </div>

            {items.length === 0 ? (
              <div style={{ fontSize: 14, color: "#888" }}>Your cart is empty.</div>
            ) : (
              <div style={{ marginBottom: 16 }}>
                {items.map((item) => (
                  <div
                    key={item.id}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      marginBottom: 10,
                      gap: 8,
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, fontWeight: 500, color: "#111" }}>
                        {item.variant.product_name}
                      </div>
                      <div style={{ fontSize: 12, color: "#888" }}>
                        {item.variant.size.code} · {item.variant.color.name} × {item.quantity}
                      </div>
                    </div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: "#111", whiteSpace: "nowrap" }}>
                      ₹{Number(item.line_total).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div style={{ borderTop: "1px solid #f0f0f0", paddingTop: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, color: "#555", marginBottom: 8 }}>
                <span>Subtotal</span>
                <span>₹{cart?.subtotal ?? "0.00"}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, color: "#555", marginBottom: 8 }}>
                <span>Shipping</span>
                {shipping === 0 ? (
                  <span style={{ color: "#22a06b", fontWeight: 600 }}>Free</span>
                ) : (
                  <span>₹{shipping}</span>
                )}
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: 17,
                  fontWeight: 700,
                  color: "#111",
                  paddingTop: 12,
                  marginTop: 4,
                  borderTop: "1px solid #f0f0f0",
                }}
              >
                <span>Total</span>
                <span style={{ color: BRAND }}>₹{total.toFixed(2)}</span>
              </div>
            </div>

            {validationError && (
              <div
                style={{
                  marginTop: 14,
                  padding: "10px 14px",
                  background: "#fef2f2",
                  border: "1px solid #fecaca",
                  borderRadius: 8,
                  color: "#dc2626",
                  fontSize: 13,
                }}
              >
                {validationError}
              </div>
            )}

            {checkoutMutation.isError && (
              <div
                style={{
                  marginTop: 14,
                  padding: "10px 14px",
                  background: "#fef2f2",
                  border: "1px solid #fecaca",
                  borderRadius: 8,
                  color: "#dc2626",
                  fontSize: 13,
                }}
              >
                Failed to place order. Please try again.
              </div>
            )}

            <button
              onClick={handlePlaceOrder}
              disabled={checkoutMutation.isPending || items.length === 0}
              style={{
                width: "100%",
                padding: "14px",
                background:
                  checkoutMutation.isPending || items.length === 0 ? "#ccc" : BRAND,
                color: "#fff",
                border: "none",
                borderRadius: 10,
                fontSize: 16,
                fontWeight: 700,
                cursor:
                  checkoutMutation.isPending || items.length === 0
                    ? "not-allowed"
                    : "pointer",
                marginTop: 20,
                fontFamily: "system-ui, sans-serif",
              }}
            >
              {checkoutMutation.isPending ? "Placing Order…" : "Place Order"}
            </button>

            <div style={{ fontSize: 12, color: "#aaa", textAlign: "center", marginTop: 10 }}>
              By placing an order you agree to our terms of service
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
