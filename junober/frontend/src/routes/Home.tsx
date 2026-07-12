import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { fetchBanners, fetchCategories, fetchFeaturedProducts, fetchProducts } from "../lib/catalogApi";
import Navbar from "../components/Navbar";
import { imgUrl, fmtPriceShort } from "../lib/utils";
import type { Banner, ProductListItem } from "../lib/catalogTypes";

function StarRating({ rating, count }: { rating: number | null; count: number }) {
  if (!rating) return null;
  return (
    <span style={{ fontSize: 12, color: "#FF6B00" }}>
      {"★".repeat(Math.round(rating))}{"☆".repeat(5 - Math.round(rating))}
      <span style={{ color: "#666", marginLeft: 4 }}>({count})</span>
    </span>
  );
}

function BannerCarousel({ banners }: { banners: Banner[] }) {
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    if (banners.length < 2) return;
    const t = setInterval(() => setIdx(i => (i + 1) % banners.length), 4000);
    return () => clearInterval(t);
  }, [banners.length]);

  if (!banners.length) {
    return (
      <div style={{
        height: 400, background: "linear-gradient(135deg, #0f1115 0%, #1a1f2e 50%, #FF6B00 100%)",
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        color: "#fff", textAlign: "center", padding: 32,
      }}>
        <h1 style={{ fontSize: 48, fontWeight: 900, margin: 0, letterSpacing: -2 }}>
          Custom Apparel.<br />Your Style.
        </h1>
        <p style={{ fontSize: 18, color: "rgba(255,255,255,0.7)", margin: "16px 0 32px" }}>
          Design & order premium T-Shirts, Polos, Hoodies in 3D
        </p>
        <div style={{ display: "flex", gap: 12 }}>
          <Link to="/shop" style={{
            padding: "14px 32px", background: "#FF6B00", color: "#fff",
            textDecoration: "none", borderRadius: 4, fontWeight: 700, fontSize: 16,
          }}>Shop Now</Link>
          <Link to="/customize" style={{
            padding: "14px 32px", background: "rgba(255,255,255,0.15)", color: "#fff",
            textDecoration: "none", borderRadius: 4, fontWeight: 600, fontSize: 16,
            border: "1px solid rgba(255,255,255,0.3)",
          }}>Customize →</Link>
        </div>
      </div>
    );
  }

  const b = banners[idx];
  return (
    <div style={{ position: "relative", height: 400, overflow: "hidden", background: "#111" }}>
      <img src={imgUrl(b.image) || ""} alt={b.title}
        style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.8 }} />
      <div style={{
        position: "absolute", inset: 0, background: "linear-gradient(to right, rgba(0,0,0,0.6) 0%, transparent 70%)",
        display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 80px",
      }}>
        <h2 style={{ color: "#fff", fontSize: 42, fontWeight: 900, margin: 0, maxWidth: 500 }}>{b.title}</h2>
        {b.subtitle && <p style={{ color: "rgba(255,255,255,0.8)", fontSize: 18, margin: "12px 0 24px" }}>{b.subtitle}</p>}
        {b.link_url && (
          <Link to={b.link_url} style={{
            display: "inline-block", padding: "12px 28px", background: "#FF6B00",
            color: "#fff", textDecoration: "none", borderRadius: 4, fontWeight: 700, fontSize: 15, width: "fit-content",
          }}>{b.link_label || "Shop Now"}</Link>
        )}
      </div>
      <div style={{ position: "absolute", bottom: 16, left: "50%", transform: "translateX(-50%)", display: "flex", gap: 8 }}>
        {banners.map((_, i) => (
          <button key={i} onClick={() => setIdx(i)} style={{
            width: i === idx ? 24 : 8, height: 8, borderRadius: 4,
            background: i === idx ? "#FF6B00" : "rgba(255,255,255,0.5)",
            border: "none", cursor: "pointer", transition: "all 0.3s", padding: 0,
          }} />
        ))}
      </div>
      {banners.length > 1 && <>
        <button onClick={() => setIdx(i => (i - 1 + banners.length) % banners.length)} style={{
          position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)",
          background: "rgba(0,0,0,0.5)", color: "#fff", border: "none",
          borderRadius: "50%", width: 40, height: 40, cursor: "pointer", fontSize: 18,
        }}>‹</button>
        <button onClick={() => setIdx(i => (i + 1) % banners.length)} style={{
          position: "absolute", right: 16, top: "50%", transform: "translateY(-50%)",
          background: "rgba(0,0,0,0.5)", color: "#fff", border: "none",
          borderRadius: "50%", width: 40, height: 40, cursor: "pointer", fontSize: 18,
        }}>›</button>
      </>}
    </div>
  );
}

function ProductCard({ product }: { product: ProductListItem }) {
  const thumb = imgUrl(product.thumbnail);
  return (
    <Link to={`/products/${product.slug}`} style={{ textDecoration: "none", color: "inherit" }}>
      <div
        style={{ background: "#fff", borderRadius: 8, overflow: "hidden", border: "1px solid #e0e0e0", cursor: "pointer" }}
        onMouseEnter={e => (e.currentTarget.style.boxShadow = "0 4px 20px rgba(0,0,0,0.12)")}
        onMouseLeave={e => (e.currentTarget.style.boxShadow = "none")}
      >
        <div style={{
          height: 200, background: thumb ? "#f0f0f0" : "#1a1a2e",
          display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden",
        }}>
          {thumb
            ? <img src={thumb} alt={product.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            : <span style={{ fontSize: 48 }}>👕</span>}
        </div>
        <div style={{ padding: 12 }}>
          <div style={{ fontSize: 11, color: "#FF6B00", fontWeight: 600, textTransform: "uppercase", marginBottom: 4 }}>
            {product.garment_type}
          </div>
          <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 4, lineHeight: 1.3 }}>{product.name}</div>
          <StarRating rating={product.avg_rating} count={product.review_count} />
          <div style={{ fontWeight: 800, fontSize: 16, color: "#0f1115", marginTop: 6 }}>{fmtPriceShort(product.base_price)}</div>
        </div>
      </div>
    </Link>
  );
}

export default function Home() {
  const { data: banners = [] } = useQuery({ queryKey: ["banners"], queryFn: fetchBanners });
  const { data: categories = [] } = useQuery({ queryKey: ["categories"], queryFn: fetchCategories });
  const { data: featured = [] } = useQuery({ queryKey: ["featured-products"], queryFn: fetchFeaturedProducts });
  const { data: allProducts = [] } = useQuery({ queryKey: ["products"], queryFn: () => fetchProducts() });

  const tshirts = allProducts.filter(p => p.garment_type === "tshirt").slice(0, 4);
  const hoodies = allProducts.filter(p => p.garment_type === "hoodie").slice(0, 4);

  return (
    <div style={{ minHeight: "100vh", background: "#f5f5f5", fontFamily: "system-ui,-apple-system,sans-serif" }}>
      <Navbar />
      <BannerCarousel banners={banners} />

      {/* Category strip */}
      {categories.length > 0 && (
        <div style={{ background: "#fff", borderBottom: "1px solid #e0e0e0" }}>
          <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 16px" }}>
            <div style={{ display: "flex", overflowX: "auto" }}>
              {categories.map(cat => (
                <Link key={cat.id} to={`/shop?category=${cat.slug}`} style={{
                  textDecoration: "none", padding: "14px 20px", color: "#333",
                  fontWeight: 500, fontSize: 14, whiteSpace: "nowrap",
                  borderBottom: "3px solid transparent", display: "flex", alignItems: "center", gap: 6,
                }}>
                  {cat.icon && <span>{cat.icon}</span>}{cat.name}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Scrolling ad banner */}
      <div style={{ background: "#0f1115", overflow: "hidden", height: 40, whiteSpace: "nowrap" }}>
        <div style={{
          display: "inline-flex",
          animation: "marquee 25s linear infinite",
          lineHeight: "40px",
        }}>
          {[
            "✨ Free Shipping on orders above ₹499",
            "🎨 Custom 3D Design Tool",
            "👕 Premium Quality Fabrics",
            "🚀 Ships from Hyderabad",
            "💳 COD Available",
            "🔄 Easy Returns",
            "✨ Free Shipping on orders above ₹499",
            "🎨 Custom 3D Design Tool",
            "👕 Premium Quality Fabrics",
            "🚀 Ships from Hyderabad",
            "💳 COD Available",
            "🔄 Easy Returns",
          ].map((text, i) => (
            <span key={i} style={{
              padding: "0 32px",
              fontSize: 13,
              fontWeight: 500,
              color: "#e0e0e0",
              borderRight: "1px solid rgba(255,255,255,0.1)",
              whiteSpace: "nowrap",
            }}>{text}</span>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "24px 16px" }}>

        {featured.length > 0 && (
          <section style={{ marginBottom: 40 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700 }}>⭐ Featured Products</h2>
              <Link to="/shop?is_featured=true" style={{ color: "#FF6B00", textDecoration: "none", fontSize: 14 }}>View all →</Link>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(220px,1fr))", gap: 16 }}>
              {featured.slice(0, 4).map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          </section>
        )}

        {/* Promo grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 40 }}>
          <div style={{
            background: "linear-gradient(135deg,#0f1115,#2d3748)", color: "#fff",
            borderRadius: 8, padding: 32, display: "flex", flexDirection: "column", gap: 12,
          }}>
            <h3 style={{ margin: 0, fontSize: 26, fontWeight: 800 }}>👕 T-Shirts</h3>
            <p style={{ margin: 0, color: "#aaa", fontSize: 14 }}>Premium oversized & classic fits</p>
            <Link to="/shop?garment_type=tshirt" style={{
              padding: "10px 20px", background: "#FF6B00", color: "#fff",
              textDecoration: "none", borderRadius: 4, fontWeight: 700, fontSize: 14, width: "fit-content",
            }}>Shop T-Shirts</Link>
          </div>
          <div style={{
            background: "linear-gradient(135deg,#1a0a00,#3d1a00)", color: "#fff",
            borderRadius: 8, padding: 32, display: "flex", flexDirection: "column", gap: 12,
          }}>
            <h3 style={{ margin: 0, fontSize: 26, fontWeight: 800 }}>🧥 Hoodies</h3>
            <p style={{ margin: 0, color: "#aaa", fontSize: 14 }}>Heavyweight fleece & zip-ups</p>
            <Link to="/shop?garment_type=hoodie" style={{
              padding: "10px 20px", background: "#FF6B00", color: "#fff",
              textDecoration: "none", borderRadius: 4, fontWeight: 700, fontSize: 14, width: "fit-content",
            }}>Shop Hoodies</Link>
          </div>
        </div>

        {tshirts.length > 0 && (
          <section style={{ marginBottom: 40 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>👕 T-Shirts</h2>
              <Link to="/shop?garment_type=tshirt" style={{ color: "#FF6B00", textDecoration: "none", fontSize: 14 }}>See all →</Link>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(220px,1fr))", gap: 16 }}>
              {tshirts.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          </section>
        )}

        {/* Mid CTA banner */}
        <div style={{
          background: "linear-gradient(135deg,#FF6B00,#ff8c42)", borderRadius: 8,
          padding: "32px 48px", marginBottom: 40, display: "flex", justifyContent: "space-between", alignItems: "center",
        }}>
          <div>
            <h3 style={{ margin: 0, color: "#fff", fontSize: 26, fontWeight: 800 }}>Design Your Own Garment in 3D</h3>
            <p style={{ margin: "8px 0 0", color: "rgba(255,255,255,0.85)", fontSize: 15 }}>Upload logo, add text, choose colors & print type</p>
          </div>
          <Link to="/customize" style={{
            padding: "14px 28px", background: "#fff", color: "#FF6B00",
            textDecoration: "none", borderRadius: 4, fontWeight: 800, fontSize: 16, flexShrink: 0,
          }}>Start Designing →</Link>
        </div>

        {hoodies.length > 0 && (
          <section style={{ marginBottom: 40 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>🧥 Hoodies</h2>
              <Link to="/shop?garment_type=hoodie" style={{ color: "#FF6B00", textDecoration: "none", fontSize: 14 }}>See all →</Link>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(220px,1fr))", gap: 16 }}>
              {hoodies.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          </section>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, marginBottom: 40 }}>
          {[
            { icon: "🚚", title: "Free Delivery", desc: "On orders above ₹499" },
            { icon: "🔄", title: "Easy Returns", desc: "7-day return policy" },
            { icon: "🔒", title: "Secure Payment", desc: "COD & online options" },
            { icon: "⭐", title: "Premium Quality", desc: "100% cotton fabrics" },
          ].map(({ icon, title, desc }) => (
            <div key={title} style={{ background: "#fff", borderRadius: 8, padding: 20, textAlign: "center", border: "1px solid #e0e0e0" }}>
              <div style={{ fontSize: 28 }}>{icon}</div>
              <div style={{ fontWeight: 700, fontSize: 14, marginTop: 8 }}>{title}</div>
              <div style={{ color: "#666", fontSize: 12, marginTop: 4 }}>{desc}</div>
            </div>
          ))}
        </div>
      </div>

      <footer style={{ background: "#0f1115", color: "#aaa", padding: "32px 16px", textAlign: "center" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          <div style={{ display: "flex", justifyContent: "center", gap: 32, marginBottom: 16, flexWrap: "wrap" }}>
            {[["Shop", "/shop"], ["Customize", "/customize"], ["Account", "/account"], ["Orders", "/orders"]].map(([label, href]) => (
              <Link key={href} to={href} style={{ color: "#aaa", textDecoration: "none", fontSize: 13 }}>{label}</Link>
            ))}
          </div>
          <p style={{ margin: 0, fontSize: 12 }}>© 2024 JunOber. Ships from Hyderabad, India.</p>
        </div>
      </footer>
    </div>
  );
}
