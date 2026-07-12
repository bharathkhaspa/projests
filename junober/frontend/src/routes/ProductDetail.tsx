import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchProduct } from "../lib/catalogApi";
import { addCartItem } from "../lib/orderApi";
import Navbar from "../components/Navbar";
import { imgUrl } from "../lib/utils";
import type { ProductVariant } from "../lib/catalogTypes";

const GARMENT_EMOJI: Record<string, string> = {
  tshirt: "👕",
  polo: "👔",
  hoodie: "🧥",
  tank: "🩱",
};

function StarRating({ rating }: { rating: number }) {
  const full = Math.round(rating);
  return (
    <span style={{ color: "#FF6B00", fontSize: 16 }}>
      {"★".repeat(full)}
      {"☆".repeat(5 - full)}
    </span>
  );
}

function Toast({ message, onClose }: { message: string; onClose: () => void }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3000);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <div style={{
      position: "fixed", bottom: 28, right: 28, zIndex: 9999,
      background: "#111", color: "#fff", padding: "14px 22px",
      borderRadius: 8, fontSize: 14, fontWeight: 600,
      boxShadow: "0 4px 20px rgba(0,0,0,0.25)",
      display: "flex", alignItems: "center", gap: 10,
      animation: "slideUp 0.25s ease-out",
    }}>
      <span style={{ color: "#4caf50", fontSize: 18 }}>✓</span>
      {message}
      <button
        onClick={onClose}
        style={{
          background: "none", border: "none", color: "#aaa",
          cursor: "pointer", marginLeft: 8, fontSize: 16, lineHeight: 1,
        }}
      >×</button>
    </div>
  );
}

function LoadingSpinner() {
  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "center",
      minHeight: "60vh",
    }}>
      <div style={{
        width: 44, height: 44, border: "4px solid #eee",
        borderTop: "4px solid #FF6B00", borderRadius: "50%",
        animation: "spin 0.8s linear infinite",
      }} />
    </div>
  );
}

export default function ProductDetail() {
  const { slug } = useParams<{ slug: string }>();
  const queryClient = useQueryClient();

  const [selectedColorId, setSelectedColorId] = useState<number | null>(null);
  const [selectedSizeId, setSelectedSizeId] = useState<number | null>(null);
  const [selectedPrintTypeId, setSelectedPrintTypeId] = useState<number | null>(null);
  const [mainImageIdx, setMainImageIdx] = useState(0);
  const [hoveredSizeId, setHoveredSizeId] = useState<number | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);

  const { data: product, isLoading, isError } = useQuery({
    queryKey: ["product", slug],
    queryFn: () => fetchProduct(slug!),
    enabled: !!slug,
  });

  // Set defaults when product loads
  useEffect(() => {
    if (!product) return;
    if (product.available_colors.length > 0 && selectedColorId === null) {
      setSelectedColorId(product.available_colors[0].id);
    }
    if (product.available_sizes.length > 0 && selectedSizeId === null) {
      setSelectedSizeId(product.available_sizes[0].id);
    }
    // Auto-select first print type if available, otherwise use -1 as "no print"
    if (selectedPrintTypeId === null) {
      setSelectedPrintTypeId(
        product.available_print_types.length > 0 ? product.available_print_types[0].id : -1
      );
    }
  }, [product]);

  const addToCartMutation = useMutation({
    mutationFn: addCartItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      setToast("Added to cart!");
    },
  });

  if (isLoading) {
    return (
      <div style={{ fontFamily: "system-ui, sans-serif", minHeight: "100vh", background: "#f9f9f9" }}>
        <style>{`
          @keyframes spin { to { transform: rotate(360deg); } }
          @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        `}</style>
        <Navbar />
        <LoadingSpinner />
      </div>
    );
  }

  if (isError || !product) {
    return (
      <div style={{ fontFamily: "system-ui, sans-serif", minHeight: "100vh", background: "#f9f9f9" }}>
        <Navbar />
        <div style={{ maxWidth: 600, margin: "80px auto", textAlign: "center", padding: 20 }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>😞</div>
          <div style={{ fontSize: 20, fontWeight: 700, color: "#111", marginBottom: 8 }}>Product not found</div>
          <Link to="/shop" style={{ color: "#FF6B00", fontWeight: 600, textDecoration: "none" }}>← Back to Shop</Link>
        </div>
      </div>
    );
  }

  // Find matching variant
  const matchedVariant: ProductVariant | undefined = product.variants.find(
    v => v.color.id === selectedColorId && v.size.id === selectedSizeId
  );

  const selectedColor = product.available_colors.find(c => c.id === selectedColorId);
  const selectedSize = product.available_sizes.find(s => s.id === selectedSizeId);
  const selectedPrintType = product.available_print_types.find(pt => pt.id === selectedPrintTypeId);

  const inStock = matchedVariant ? matchedVariant.stock_count > 0 : false;

  const displayPrice = matchedVariant
    ? parseFloat(matchedVariant.final_price)
    : parseFloat(product.base_price);

  const printSurcharge = selectedPrintType ? parseFloat(selectedPrintType.surcharge) : 0;
  const finalPrice = displayPrice + printSurcharge;

  const effectivePrintTypeId = selectedPrintTypeId === -1
    ? (product.available_print_types[0]?.id ?? null)
    : selectedPrintTypeId;

  function handleAddToCart() {
    if (!matchedVariant || !effectivePrintTypeId) return;
    addToCartMutation.mutate({
      variant_id: matchedVariant.id,
      print_type_id: effectivePrintTypeId,
      quantity,
    });
  }

  const images = product.images ?? [];
  const mainImage = images.length > 0 ? imgUrl(images[mainImageIdx]?.image) : null;

  return (
    <div style={{ fontFamily: "system-ui, sans-serif", minHeight: "100vh", background: "#f9f9f9" }}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
      `}</style>
      <Navbar />

      {toast && <Toast message={toast} onClose={() => setToast(null)} />}

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "28px 20px" }}>
        {/* Breadcrumb */}
        <div style={{ fontSize: 13, color: "#888", marginBottom: 24 }}>
          <Link to="/shop" style={{ color: "#FF6B00", textDecoration: "none" }}>Shop</Link>
          <span style={{ margin: "0 8px" }}>›</span>
          <span style={{ color: "#444" }}>{product.name}</span>
        </div>

        {/* Main layout */}
        <div style={{ display: "flex", gap: 48, flexWrap: "wrap" }}>
          {/* Left: Image Gallery */}
          <div style={{ flex: "0 0 480px", maxWidth: "100%" }}>
            {/* Main image */}
            <div style={{
              borderRadius: 10, overflow: "hidden",
              background: selectedColor ? `${selectedColor.hex_code}18` : "#f0f0f0",
              border: "1px solid #e8e8e8", marginBottom: 12,
              display: "flex", alignItems: "center", justifyContent: "center",
              height: 420,
            }}>
              {mainImage ? (
                <img
                  src={mainImage}
                  alt={images[mainImageIdx]?.alt_text ?? product.name}
                  style={{ width: "100%", height: "100%", objectFit: "contain" }}
                />
              ) : (
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 96 }}>
                    {GARMENT_EMOJI[product.garment_type] ?? "👕"}
                  </div>
                  {selectedColor && (
                    <div style={{ fontSize: 13, color: "#555", marginTop: 8 }}>
                      Color: {selectedColor.name}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {images.map((img, idx) => {
                  const thumb = imgUrl(img.image);
                  return (
                    <button
                      key={img.id}
                      onClick={() => setMainImageIdx(idx)}
                      style={{
                        width: 70, height: 70, borderRadius: 6, overflow: "hidden",
                        border: mainImageIdx === idx ? "2px solid #FF6B00" : "2px solid #eee",
                        cursor: "pointer", background: "#f8f8f8", padding: 0,
                        transition: "border-color 0.15s",
                      }}
                    >
                      {thumb ? (
                        <img src={thumb} alt={img.alt_text} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      ) : (
                        <span style={{ fontSize: 28 }}>{GARMENT_EMOJI[product.garment_type] ?? "👕"}</span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right: Product Info */}
          <div style={{ flex: 1, minWidth: 280 }}>
            {/* Garment badge */}
            <div style={{
              display: "inline-block", fontSize: 11, fontWeight: 700,
              color: "#FF6B00", background: "#FF6B0012", border: "1px solid #FF6B0030",
              borderRadius: 3, padding: "3px 9px", textTransform: "uppercase",
              letterSpacing: 0.6, marginBottom: 10,
            }}>
              {product.garment_type}
            </div>

            <h1 style={{ fontSize: 26, fontWeight: 800, color: "#111", margin: "0 0 10px", lineHeight: 1.2 }}>
              {product.name}
            </h1>

            {/* Rating */}
            {product.avg_rating != null && (
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                <StarRating rating={product.avg_rating} />
                <span style={{ fontSize: 13, color: "#666" }}>
                  {product.avg_rating.toFixed(1)} · {product.review_count} review{product.review_count !== 1 ? "s" : ""}
                </span>
              </div>
            )}

            {/* Price */}
            <div style={{ marginBottom: 20 }}>
              <span style={{ fontSize: 30, fontWeight: 900, color: "#111" }}>
                ₹{finalPrice.toFixed(2)}
              </span>
              {printSurcharge > 0 && (
                <span style={{ fontSize: 13, color: "#888", marginLeft: 8 }}>
                  (includes ₹{printSurcharge.toFixed(2)} print surcharge)
                </span>
              )}
            </div>

            {/* Description */}
            {product.description && (
              <p style={{ fontSize: 14, color: "#555", lineHeight: 1.65, marginBottom: 24 }}>
                {product.description}
              </p>
            )}

            <div style={{ height: 1, background: "#eee", marginBottom: 22 }} />

            {/* Color Selector */}
            {product.available_colors.length > 0 && (
              <div style={{ marginBottom: 22 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#333", marginBottom: 10 }}>
                  Color{selectedColor ? `: ${selectedColor.name}` : ""}
                </div>
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  {product.available_colors.map(color => (
                    <button
                      key={color.id}
                      title={color.name}
                      onClick={() => setSelectedColorId(color.id)}
                      style={{
                        width: 32, height: 32, borderRadius: "50%",
                        background: color.hex_code,
                        border: selectedColorId === color.id
                          ? `3px solid #111`
                          : "3px solid transparent",
                        outline: selectedColorId === color.id
                          ? "2px solid #FF6B00"
                          : "2px solid transparent",
                        outlineOffset: 2,
                        cursor: "pointer",
                        transition: "outline 0.15s, border 0.15s",
                        padding: 0,
                        boxShadow: "0 1px 4px rgba(0,0,0,0.18)",
                      }}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Size Selector */}
            {product.available_sizes.length > 0 && (
              <div style={{ marginBottom: 22 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#333", marginBottom: 10 }}>
                  Size{selectedSize ? `: ${selectedSize.label}` : ""}
                </div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", position: "relative" }}>
                  {product.available_sizes.map(size => {
                    const isSelected = selectedSizeId === size.id;
                    const isHovered = hoveredSizeId === size.id;
                    return (
                      <div key={size.id} style={{ position: "relative" }}>
                        <button
                          onClick={() => setSelectedSizeId(size.id)}
                          onMouseEnter={() => setHoveredSizeId(size.id)}
                          onMouseLeave={() => setHoveredSizeId(null)}
                          style={{
                            minWidth: 44, padding: "7px 14px",
                            borderRadius: 5, fontSize: 13, fontWeight: 600,
                            border: isSelected ? "2px solid #111" : "2px solid #ddd",
                            background: isSelected ? "#111" : "#fff",
                            color: isSelected ? "#fff" : "#333",
                            cursor: "pointer", transition: "all 0.15s",
                          }}
                        >
                          {size.code}
                        </button>
                        {isHovered && (size.chest_inches != null || size.length_inches != null) && (
                          <div style={{
                            position: "absolute", bottom: "calc(100% + 6px)", left: "50%",
                            transform: "translateX(-50%)",
                            background: "#111", color: "#fff",
                            fontSize: 11, padding: "5px 8px", borderRadius: 4,
                            whiteSpace: "nowrap", zIndex: 10,
                            pointerEvents: "none",
                          }}>
                            {size.chest_inches != null && <div>Chest: {size.chest_inches}"</div>}
                            {size.length_inches != null && <div>Length: {size.length_inches}"</div>}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Print Type Selector */}
            {product.available_print_types.length > 0 && (
              <div style={{ marginBottom: 22 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#333", marginBottom: 10 }}>
                  Print Type
                </div>
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  {product.available_print_types.map(pt => {
                    const isSelected = selectedPrintTypeId === pt.id;
                    return (
                      <button
                        key={pt.id}
                        onClick={() => setSelectedPrintTypeId(pt.id)}
                        style={{
                          padding: "10px 14px", borderRadius: 6, textAlign: "left",
                          border: isSelected ? "2px solid #FF6B00" : "2px solid #eee",
                          background: isSelected ? "#FFF4EC" : "#fff",
                          cursor: "pointer", transition: "all 0.15s",
                          minWidth: 130, maxWidth: 180,
                        }}
                      >
                        <div style={{ fontSize: 13, fontWeight: 700, color: isSelected ? "#FF6B00" : "#111", marginBottom: 3 }}>
                          {pt.name}
                        </div>
                        {parseFloat(pt.surcharge) > 0 && (
                          <div style={{ fontSize: 11, color: "#888", marginBottom: 3 }}>
                            +₹{parseFloat(pt.surcharge).toFixed(2)}
                          </div>
                        )}
                        {pt.description && (
                          <div style={{ fontSize: 11, color: "#777", lineHeight: 1.4 }}>
                            {pt.description}
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div style={{ marginBottom: 22 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#333", marginBottom: 10 }}>
                Quantity
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 0, border: "1px solid #ddd", borderRadius: 5, width: "fit-content", overflow: "hidden" }}>
                <button
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  style={{ width: 36, height: 36, background: "#f5f5f5", border: "none", fontSize: 16, cursor: "pointer", fontWeight: 700 }}
                >
                  −
                </button>
                <span style={{ width: 40, textAlign: "center", fontSize: 14, fontWeight: 600, color: "#111" }}>
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(q => q + 1)}
                  style={{ width: 36, height: 36, background: "#f5f5f5", border: "none", fontSize: 16, cursor: "pointer", fontWeight: 700 }}
                >
                  +
                </button>
              </div>
            </div>

            {/* Stock status */}
            {matchedVariant && (
              <div style={{ marginBottom: 16, fontSize: 13 }}>
                {inStock ? (
                  <span style={{ color: "#4caf50", fontWeight: 600 }}>
                    ✓ In stock ({matchedVariant.stock_count} available)
                  </span>
                ) : (
                  <span style={{ color: "#e53935", fontWeight: 600 }}>
                    ✕ Out of stock
                  </span>
                )}
              </div>
            )}

            {!matchedVariant && selectedColorId && selectedSizeId && (
              <div style={{ marginBottom: 16, fontSize: 13, color: "#e53935", fontWeight: 600 }}>
                No variant available for this color + size combination.
              </div>
            )}

            {/* Action buttons */}
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <button
                onClick={handleAddToCart}
                disabled={!matchedVariant || !inStock || !effectivePrintTypeId || addToCartMutation.isPending}
                style={{
                  flex: 1, minWidth: 160, padding: "13px 0",
                  background: (!matchedVariant || !inStock || !effectivePrintTypeId) ? "#ccc" : "#FF6B00",
                  color: "#fff", border: "none", borderRadius: 5,
                  fontSize: 15, fontWeight: 700, cursor: (!matchedVariant || !inStock || !effectivePrintTypeId) ? "not-allowed" : "pointer",
                  transition: "background 0.15s",
                }}
              >
                {addToCartMutation.isPending ? "Adding..." : "Add to Cart"}
              </button>

              <Link
                to="/customize"
                style={{
                  flex: 1, minWidth: 160, padding: "13px 0",
                  background: "#111", color: "#fff", borderRadius: 5,
                  fontSize: 15, fontWeight: 700, textDecoration: "none",
                  textAlign: "center", display: "inline-block",
                  transition: "background 0.15s",
                }}
              >
                Customize in 3D
              </Link>
            </div>

            {addToCartMutation.isError && (
              <div style={{ marginTop: 12, fontSize: 13, color: "#e53935" }}>
                Failed to add to cart. Please try again.
              </div>
            )}
          </div>
        </div>

        {/* Reviews Section */}
        {product.reviews && product.reviews.length > 0 && (
          <div style={{ marginTop: 60 }}>
            <div style={{ height: 1, background: "#eee", marginBottom: 32 }} />
            <h2 style={{ fontSize: 20, fontWeight: 800, color: "#111", margin: "0 0 24px" }}>
              Customer Reviews ({product.review_count})
            </h2>

            {/* Average rating summary */}
            {product.avg_rating != null && (
              <div style={{
                display: "flex", alignItems: "center", gap: 16,
                background: "#fff", border: "1px solid #eee", borderRadius: 8,
                padding: "18px 24px", marginBottom: 28, width: "fit-content",
              }}>
                <div style={{ fontSize: 44, fontWeight: 900, color: "#111", lineHeight: 1 }}>
                  {product.avg_rating.toFixed(1)}
                </div>
                <div>
                  <StarRating rating={product.avg_rating} />
                  <div style={{ fontSize: 12, color: "#888", marginTop: 4 }}>
                    Based on {product.review_count} review{product.review_count !== 1 ? "s" : ""}
                  </div>
                </div>
              </div>
            )}

            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {product.reviews.map(review => (
                <div
                  key={review.id}
                  style={{
                    background: "#fff", border: "1px solid #eee", borderRadius: 8,
                    padding: "20px 24px",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 8 }}>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                        <StarRating rating={review.rating} />
                        {review.title && (
                          <span style={{ fontSize: 14, fontWeight: 700, color: "#111" }}>
                            {review.title}
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: 13, color: "#666" }}>
                        <strong style={{ color: "#333" }}>{review.user_name}</strong>
                        {" · "}
                        {new Date(review.created_at).toLocaleDateString("en-IN", {
                          day: "numeric", month: "short", year: "numeric",
                        })}
                      </div>
                    </div>
                  </div>
                  {review.body && (
                    <p style={{ fontSize: 14, color: "#444", lineHeight: 1.65, margin: 0 }}>
                      {review.body}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
