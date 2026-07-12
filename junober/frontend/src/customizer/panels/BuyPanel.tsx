import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCustomizer } from "../../store/customizer";
import { useColors, usePrintTypes, useProduct } from "../../hooks/useCatalog";
import { useAddToCart } from "../../hooks/useCart";
import { useAuth } from "../../store/auth";
import { uploadDesign } from "../../lib/orderApi";

function Row({
  label,
  value,
}: {
  label: React.ReactNode;
  value: React.ReactNode;
}) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        fontSize: 14,
        color: "#0f1115",
      }}
    >
      <span style={{ opacity: 0.7 }}>{label}</span>
      <span>{value}</span>
    </div>
  );
}

export function BuyPanel() {
  const selectedProductSlug = useCustomizer((s) => s.selectedProductSlug);
  const selectedColorSlug = useCustomizer((s) => s.selectedColorSlug);
  const selectedSizeCode = useCustomizer((s) => s.selectedSizeCode);
  const selectedPrintTypeSlug = useCustomizer((s) => s.selectedPrintTypeSlug);
  const color = useCustomizer((s) => s.color);
  const imageUrl = useCustomizer((s) => s.imageUrl);
  const text = useCustomizer((s) => s.text);
  const textColor = useCustomizer((s) => s.textColor);
  const setCartOpen = useCustomizer((s) => s.setCartOpen);
  const closePanel = useCustomizer((s) => s.closePanel);

  const user = useAuth((s) => s.user);
  const navigate = useNavigate();
  const addToCart = useAddToCart();
  const [submitting, setSubmitting] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);

  const productQuery = useProduct(selectedProductSlug);
  const printTypesQuery = usePrintTypes();
  const colorsQuery = useColors();

  const product = productQuery.data;
  const printType = printTypesQuery.data?.find(
    (p) => p.slug === selectedPrintTypeSlug,
  );
  const colorRecord = colorsQuery.data?.find(
    (c) => c.slug === selectedColorSlug,
  );

  // Pricing is product.base_price + variant.additional_price + printType.surcharge.
  // Phase 3 will replace this with the server-side pricing engine.
  const variant = product?.variants.find(
    (v) =>
      (selectedColorSlug ? v.color.slug === selectedColorSlug : true) &&
      v.size.code === selectedSizeCode,
  );
  const basePrice = Number(product?.base_price ?? 0);
  const variantSurcharge = Number(variant?.additional_price ?? 0);
  const printSurcharge = Number(printType?.surcharge ?? 0);
  const total = basePrice + variantSurcharge + printSurcharge;

  const isLoading = productQuery.isLoading || printTypesQuery.isLoading;
  const stockShown = colorRecord?.name ?? (selectedColorSlug ? "—" : "Custom color");

  async function handleAddToCart() {
    setAddError(null);
    if (!user) {
      navigate("/login");
      return;
    }
    if (!variant || !printType) {
      setAddError("Pick a stock color to lock the SKU.");
      return;
    }
    setSubmitting(true);
    try {
      // If the user uploaded an image it's a local blob URL — upload it to the
      // server first so the design persists with the cart item.
      let persistedImageUrl = "";
      if (imageUrl && imageUrl.startsWith("blob:")) {
        const blob = await fetch(imageUrl).then((r) => r.blob());
        const result = await uploadDesign(blob);
        persistedImageUrl = result.url;
      } else if (imageUrl) {
        persistedImageUrl = imageUrl;
      }

      await addToCart.mutateAsync({
        variant_id: variant.id,
        print_type_id: printType.id,
        quantity: 1,
        design_text: text,
        design_text_color: textColor,
        design_image_url: persistedImageUrl,
      });
      closePanel();
      setCartOpen(true);
    } catch {
      setAddError("Couldn't add to cart. Try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <h4
        style={{
          fontSize: 11,
          color: "#6b7280",
          fontWeight: 600,
          textTransform: "uppercase",
          letterSpacing: 1,
          margin: "0 0 10px",
        }}
      >
        Your Design
      </h4>
      <div
        style={{
          background: "#f9fafb",
          borderRadius: 14,
          padding: "14px 16px",
          display: "flex",
          flexDirection: "column",
          gap: 8,
          marginBottom: 18,
        }}
      >
        <Row label="Garment" value={`${product?.name ?? "—"} · ${selectedSizeCode}`} />
        <Row
          label="Color"
          value={
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
              <span
                style={{
                  width: 14,
                  height: 14,
                  background: color,
                  borderRadius: 4,
                  border: "1px solid rgba(0,0,0,0.12)",
                  display: "inline-block",
                }}
              />
              <span>{stockShown}</span>
            </span>
          }
        />
        <Row label="Print" value={printType?.name ?? "—"} />
        {variant && (
          <Row
            label="SKU"
            value={
              <span style={{ fontFamily: "ui-monospace, monospace", fontSize: 12 }}>
                {variant.sku}
              </span>
            }
          />
        )}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 18 }}>
        {isLoading ? (
          <p style={{ fontSize: 13, color: "#9ca3af", margin: 0 }}>
            Pricing loading…
          </p>
        ) : (
          <>
            <Row label="Garment" value={`₹${basePrice.toFixed(0)}`} />
            {variantSurcharge > 0 && (
              <Row label={`${selectedSizeCode} surcharge`} value={`+₹${variantSurcharge.toFixed(0)}`} />
            )}
            <Row label={`${printType?.name ?? "Print"}`} value={`+₹${printSurcharge.toFixed(0)}`} />
            <div style={{ height: 1, background: "rgba(0,0,0,0.08)", margin: "6px 0" }} />
            <Row label={<strong>Total</strong>} value={<strong>₹{total.toFixed(0)}</strong>} />
          </>
        )}
      </div>

      <button
        onClick={handleAddToCart}
        disabled={isLoading || !product || !variant || submitting}
        style={{
          width: "100%",
          padding: 16,
          background: isLoading || !variant || submitting ? "#9ca3af" : "#0f1115",
          color: "#fff",
          border: "none",
          borderRadius: 14,
          fontWeight: 700,
          fontSize: 15,
          cursor: isLoading || !variant || submitting ? "not-allowed" : "pointer",
        }}
      >
        {submitting
          ? "Adding…"
          : user
            ? `Add to cart · ₹${total.toFixed(0)}`
            : "Log in to add to cart"}
      </button>

      {addError && (
        <p style={{ fontSize: 11, color: "#ef4444", textAlign: "center", margin: "10px 0 0" }}>
          {addError}
        </p>
      )}
      {!variant && !isLoading && (
        <p
          style={{
            fontSize: 11,
            color: "#ef4444",
            textAlign: "center",
            margin: "10px 0 0",
          }}
        >
          Pick a stock color in the Color panel to lock the SKU.
        </p>
      )}
      <p
        style={{
          fontSize: 11,
          color: "#9ca3af",
          textAlign: "center",
          margin: "12px 0 0",
        }}
      >
        Coupons + Razorpay / Stripe checkout wire up in Phase 2b.
      </p>
    </div>
  );
}
