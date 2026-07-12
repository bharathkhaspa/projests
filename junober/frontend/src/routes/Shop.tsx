import { useState, useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { fetchProducts, fetchCategories } from "../lib/catalogApi";
import Navbar from "../components/Navbar";
import { imgUrl, fmtPriceShort } from "../lib/utils";
import type { ProductListItem } from "../lib/catalogTypes";

const GARMENT_OPTIONS = [
  { value: "tshirt", label: "T-Shirt" },
  { value: "polo", label: "Polo" },
  { value: "hoodie", label: "Hoodie" },
  { value: "tank", label: "Tank" },
];

function StarRating({ rating, count }: { rating: number | null; count: number }) {
  if (!rating) return null;
  const full = Math.round(rating);
  return (
    <span style={{ fontSize: 12, color: "#FF6B00" }}>
      {"★".repeat(full)}
      {"☆".repeat(5 - full)}
      <span style={{ color: "#888", marginLeft: 4 }}>({count})</span>
    </span>
  );
}

function SkeletonCard() {
  return (
    <div style={{
      background: "#fff", borderRadius: 8, overflow: "hidden",
      border: "1px solid #eee", animation: "pulse 1.4s ease-in-out infinite",
    }}>
      <div style={{ height: 200, background: "#f0f0f0" }} />
      <div style={{ padding: "12px 14px" }}>
        <div style={{ height: 10, background: "#f0f0f0", borderRadius: 4, marginBottom: 8, width: "40%" }} />
        <div style={{ height: 14, background: "#f0f0f0", borderRadius: 4, marginBottom: 6 }} />
        <div style={{ height: 12, background: "#f0f0f0", borderRadius: 4, marginBottom: 10, width: "60%" }} />
        <div style={{ height: 16, background: "#f0f0f0", borderRadius: 4, width: "35%" }} />
      </div>
    </div>
  );
}

const GARMENT_EMOJI: Record<string, string> = {
  tshirt: "👕",
  polo: "👔",
  hoodie: "🧥",
  tank: "🩱",
};

function ProductCard({ product }: { product: ProductListItem }) {
  const thumb = imgUrl(product.thumbnail);
  return (
    <Link
      to={`/products/${product.slug}`}
      style={{ textDecoration: "none", color: "inherit" }}
    >
      <div style={{
        background: "#fff", borderRadius: 8, overflow: "hidden",
        border: "1px solid #eee", transition: "box-shadow 0.2s, transform 0.2s",
        cursor: "pointer",
      }}
        onMouseEnter={e => {
          (e.currentTarget as HTMLDivElement).style.boxShadow = "0 4px 20px rgba(0,0,0,0.12)";
          (e.currentTarget as HTMLDivElement).style.transform = "translateY(-2px)";
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLDivElement).style.boxShadow = "none";
          (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)";
        }}
      >
        <div style={{
          height: 200, background: "#f8f8f8", display: "flex",
          alignItems: "center", justifyContent: "center", overflow: "hidden",
          position: "relative",
        }}>
          {thumb ? (
            <img
              src={thumb}
              alt={product.name}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
              onError={e => {
                (e.currentTarget as HTMLImageElement).style.display = "none";
                const parent = (e.currentTarget as HTMLImageElement).parentElement;
                if (parent) {
                  const span = document.createElement("span");
                  span.textContent = GARMENT_EMOJI[product.garment_type] ?? "👕";
                  span.style.fontSize = "64px";
                  parent.appendChild(span);
                }
              }}
            />
          ) : (
            <span style={{ fontSize: 64 }}>
              {GARMENT_EMOJI[product.garment_type] ?? "👕"}
            </span>
          )}
          {product.is_featured && (
            <span style={{
              position: "absolute", top: 8, left: 8,
              background: "#FF6B00", color: "#fff", fontSize: 10,
              fontWeight: 700, padding: "3px 7px", borderRadius: 3,
              textTransform: "uppercase", letterSpacing: 0.5,
            }}>
              Featured
            </span>
          )}
        </div>
        <div style={{ padding: "12px 14px 14px" }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#FF6B00", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 5 }}>
            {GARMENT_OPTIONS.find(g => g.value === product.garment_type)?.label ?? product.garment_type}
          </div>
          <div style={{ fontSize: 14, fontWeight: 600, color: "#111", marginBottom: 5, lineHeight: 1.3 }}>
            {product.name}
          </div>
          {product.avg_rating != null && (
            <div style={{ marginBottom: 6 }}>
              <StarRating rating={product.avg_rating} count={product.review_count} />
            </div>
          )}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 8 }}>
            <span style={{ fontSize: 16, fontWeight: 800, color: "#111" }}>
              {fmtPriceShort(product.base_price)}
            </span>
            <span style={{
              fontSize: 12, color: "#888", background: "#f0f0f0",
              padding: "3px 8px", borderRadius: 3,
            }}>
              View →
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default function Shop() {
  const [searchParams, setSearchParams] = useSearchParams();

  const qParam = searchParams.get("q") ?? "";
  const garmentParam = searchParams.get("garment_type") ?? "";
  const categoryParam = searchParams.get("category") ?? "";
  const featuredParam = searchParams.get("is_featured") ?? "";

  const [search, setSearch] = useState(qParam);
  const [selectedGarments, setSelectedGarments] = useState<string[]>(
    garmentParam ? garmentParam.split(",").filter(Boolean) : []
  );
  const [selectedCategory, setSelectedCategory] = useState(categoryParam);
  const [sortBy, setSortBy] = useState("newest");

  const { data: products = [], isLoading: productsLoading } = useQuery({
    queryKey: ["products"],
    queryFn: () => fetchProducts(),
  });

  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: fetchCategories,
  });

  const filtered = useMemo(() => {
    let list = [...products];

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(p => p.name.toLowerCase().includes(q));
    }

    if (selectedGarments.length > 0) {
      list = list.filter(p => selectedGarments.includes(p.garment_type));
    }

    if (selectedCategory) {
      list = list.filter(p => p.category?.slug === selectedCategory);
    }

    if (featuredParam === "true") {
      list = list.filter(p => p.is_featured);
    }

    if (sortBy === "price_asc") {
      list.sort((a, b) => parseFloat(a.base_price) - parseFloat(b.base_price));
    } else if (sortBy === "price_desc") {
      list.sort((a, b) => parseFloat(b.base_price) - parseFloat(a.base_price));
    } else {
      list.sort((a, b) => b.id - a.id);
    }

    return list;
  }, [products, search, selectedGarments, selectedCategory, featuredParam, sortBy]);

  function clearFilters() {
    setSearch("");
    setSelectedGarments([]);
    setSelectedCategory("");
    setSortBy("newest");
    setSearchParams({});
  }

  function toggleGarment(value: string) {
    setSelectedGarments(prev =>
      prev.includes(value) ? prev.filter(g => g !== value) : [...prev, value]
    );
  }

  const hasActiveFilters = search || selectedGarments.length > 0 || selectedCategory;

  return (
    <div style={{ fontFamily: "system-ui, sans-serif", minHeight: "100vh", background: "#f9f9f9" }}>
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
      <Navbar />

      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "24px 20px", display: "flex", gap: 28 }}>
        {/* Sidebar */}
        <aside style={{
          width: 250, flexShrink: 0, alignSelf: "flex-start",
          background: "#fff", borderRadius: 8, border: "1px solid #eee",
          padding: "20px", position: "sticky", top: 20,
        }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: "#111", marginBottom: 20 }}>Filters</div>

          {/* Search */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#555", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 10 }}>
              Search
            </div>
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search products..."
              style={{
                width: "100%", padding: "8px 10px", borderRadius: 4,
                border: "1px solid #ddd", fontSize: 13, outline: "none",
                boxSizing: "border-box",
              }}
            />
          </div>

          {/* Garment Type */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#555", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 10 }}>
              Garment Type
            </div>
            {GARMENT_OPTIONS.map(opt => (
              <label key={opt.value} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8, cursor: "pointer", fontSize: 14 }}>
                <input
                  type="checkbox"
                  checked={selectedGarments.includes(opt.value)}
                  onChange={() => toggleGarment(opt.value)}
                  style={{ accentColor: "#FF6B00", width: 15, height: 15 }}
                />
                <span style={{ color: "#333" }}>{opt.label}</span>
              </label>
            ))}
          </div>

          {/* Category */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#555", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 10 }}>
              Category
            </div>
            <label style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8, cursor: "pointer", fontSize: 14 }}>
              <input
                type="radio"
                name="category"
                checked={selectedCategory === ""}
                onChange={() => setSelectedCategory("")}
                style={{ accentColor: "#FF6B00" }}
              />
              <span style={{ color: "#333" }}>All Categories</span>
            </label>
            {categories.map(cat => (
              <label key={cat.id} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8, cursor: "pointer", fontSize: 14 }}>
                <input
                  type="radio"
                  name="category"
                  checked={selectedCategory === cat.slug}
                  onChange={() => setSelectedCategory(cat.slug)}
                  style={{ accentColor: "#FF6B00" }}
                />
                <span style={{ color: "#333" }}>
                  {cat.icon && <span style={{ marginRight: 4 }}>{cat.icon}</span>}
                  {cat.name}
                </span>
              </label>
            ))}
          </div>

          {/* Sort (sidebar copy) */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#555", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 10 }}>
              Sort By
            </div>
            {[
              { value: "newest", label: "Newest" },
              { value: "price_asc", label: "Price: Low to High" },
              { value: "price_desc", label: "Price: High to Low" },
            ].map(opt => (
              <label key={opt.value} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8, cursor: "pointer", fontSize: 14 }}>
                <input
                  type="radio"
                  name="sort"
                  checked={sortBy === opt.value}
                  onChange={() => setSortBy(opt.value)}
                  style={{ accentColor: "#FF6B00" }}
                />
                <span style={{ color: "#333" }}>{opt.label}</span>
              </label>
            ))}
          </div>

          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              style={{
                width: "100%", padding: "9px 0", background: "#fff",
                border: "1.5px solid #FF6B00", color: "#FF6B00", borderRadius: 4,
                fontSize: 13, fontWeight: 600, cursor: "pointer",
              }}
            >
              Clear All Filters
            </button>
          )}
        </aside>

        {/* Main Content */}
        <main style={{ flex: 1, minWidth: 0 }}>
          {/* Header row */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
            <div style={{ fontSize: 15, color: "#444" }}>
              {productsLoading ? (
                <span>Loading products...</span>
              ) : (
                <span><strong>{filtered.length}</strong> product{filtered.length !== 1 ? "s" : ""} found</span>
              )}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 13, color: "#666" }}>Sort:</span>
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
                style={{
                  padding: "6px 10px", borderRadius: 4, border: "1px solid #ddd",
                  fontSize: 13, outline: "none", cursor: "pointer", background: "#fff",
                }}
              >
                <option value="newest">Newest</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
              </select>
            </div>
          </div>

          {/* Grid */}
          {productsLoading ? (
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: 16,
            }}>
              {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : filtered.length === 0 ? (
            <div style={{
              display: "flex", flexDirection: "column", alignItems: "center",
              justifyContent: "center", padding: "80px 20px", textAlign: "center",
            }}>
              <div style={{ fontSize: 56, marginBottom: 16 }}>🔍</div>
              <div style={{ fontSize: 20, fontWeight: 700, color: "#111", marginBottom: 8 }}>
                No products found
              </div>
              <div style={{ fontSize: 14, color: "#888", marginBottom: 24 }}>
                Try adjusting your filters or search term.
              </div>
              <button
                onClick={clearFilters}
                style={{
                  padding: "10px 24px", background: "#FF6B00", color: "#fff",
                  border: "none", borderRadius: 4, fontSize: 14, fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
              gap: 16,
            }}>
              {filtered.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
