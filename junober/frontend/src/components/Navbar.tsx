import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../store/auth";
import { useQuery } from "@tanstack/react-query";
import { fetchCart } from "../lib/orderApi";

export default function Navbar() {
  const user = useAuth((s) => s.user);
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);

  const { data: cart } = useQuery({
    queryKey: ["cart"],
    queryFn: fetchCart,
    enabled: !!user,
    staleTime: 30_000,
  });

  const cartCount = cart?.item_count ?? 0;

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (search.trim()) {
      navigate(`/shop?q=${encodeURIComponent(search.trim())}`);
      setMobileOpen(false);
    }
  }

  const linkStyle: React.CSSProperties = {
    color: "#fff", textDecoration: "none", padding: "8px 12px",
    borderRadius: 4, fontSize: 14, fontWeight: 500, whiteSpace: "nowrap",
  };
  const dimStyle: React.CSSProperties = { ...linkStyle, color: "#ccc", fontSize: 13 };

  return (
    <nav style={{ background: "#0f1115", color: "#fff", position: "sticky", top: 0, zIndex: 200, boxShadow: "0 2px 8px rgba(0,0,0,0.3)" }}>
      {/* Main bar */}
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 16px", display: "flex", alignItems: "center", gap: 12, height: 64 }}>

        {/* Logo */}
        <Link to="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
          <div style={{ width: 32, height: 32, background: "#FF6B00", clipPath: "polygon(50% 5%, 95% 90%, 5% 90%)" }} />
          <span style={{ fontWeight: 800, fontSize: 18, color: "#fff", letterSpacing: -0.5 }}>JunOber</span>
        </Link>

        {/* Search bar — hidden on small screens */}
        <form onSubmit={handleSearch} style={{ flex: 1, maxWidth: 600, display: "flex" }}>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search products..."
            style={{
              flex: 1, padding: "9px 16px", borderRadius: "4px 0 0 4px",
              border: "2px solid #FF6B00", borderRight: "none",
              fontSize: 14, outline: "none", background: "#fff", color: "#000",
            }}
          />
          <button type="submit" style={{
            padding: "9px 14px", background: "#FF6B00", color: "#fff",
            border: "none", borderRadius: "0 4px 4px 0", cursor: "pointer", fontWeight: 700, fontSize: 14,
          }}>🔍</button>
        </form>

        {/* Desktop nav links */}
        <div style={{ display: "flex", alignItems: "center", gap: 2, flexShrink: 0 }}>
          <Link to="/shop" style={linkStyle}>Shop</Link>
          <Link to="/customize" style={linkStyle}>Customize</Link>

          {user ? (
            <>
              <Link to="/orders" style={dimStyle}>Orders</Link>
              <Link to="/account" style={dimStyle}>{user.first_name || "Account"}</Link>
              {(user.is_staff || ["super_admin", "admin"].includes(user.role)) && (
                <Link to="/admin-panel" style={{
                  ...dimStyle, color: "#FF6B00",
                  border: "1px solid #FF6B00", borderRadius: 4, padding: "5px 10px",
                }}>Admin ⚡</Link>
              )}
            </>
          ) : (
            <Link to="/login" style={dimStyle}>Sign In</Link>
          )}

          {/* Cart icon */}
          <Link to="/cart" style={{ position: "relative", color: "#fff", textDecoration: "none", padding: "8px 10px", fontSize: 20 }}>
            🛒
            {cartCount > 0 && (
              <span style={{
                position: "absolute", top: 2, right: 2,
                background: "#FF6B00", color: "#fff", borderRadius: "50%",
                width: 18, height: 18, fontSize: 10, fontWeight: 700,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>{cartCount}</span>
            )}
          </Link>

          {/* Hamburger — shown on mobile via CSS trick using max-width */}
          <button
            onClick={() => setMobileOpen(o => !o)}
            style={{
              display: "none", background: "none", border: "none",
              color: "#fff", fontSize: 22, cursor: "pointer", padding: "4px 8px",
            }}
            aria-label="Menu"
            className="hamburger"
          >
            {mobileOpen ? "✕" : "☰"}
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {mobileOpen && (
        <div style={{ background: "#1a1f2e", borderTop: "1px solid #2a2f3e", padding: "12px 16px", display: "flex", flexDirection: "column", gap: 4 }}>
          <form onSubmit={handleSearch} style={{ display: "flex", marginBottom: 8 }}>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..." style={{ flex: 1, padding: "8px 12px", borderRadius: "4px 0 0 4px", border: "none", fontSize: 14, outline: "none" }} />
            <button type="submit" style={{ padding: "8px 12px", background: "#FF6B00", color: "#fff", border: "none", borderRadius: "0 4px 4px 0", cursor: "pointer" }}>🔍</button>
          </form>
          {[["Shop", "/shop"], ["Customize", "/customize"]].map(([l, h]) => (
            <Link key={h} to={h} onClick={() => setMobileOpen(false)} style={{ color: "#fff", textDecoration: "none", padding: "10px 4px", fontSize: 15, borderBottom: "1px solid #2a2f3e" }}>{l}</Link>
          ))}
          {user ? (
            <>
              <Link to="/orders" onClick={() => setMobileOpen(false)} style={{ color: "#ccc", textDecoration: "none", padding: "10px 4px", fontSize: 14, borderBottom: "1px solid #2a2f3e" }}>My Orders</Link>
              <Link to="/account" onClick={() => setMobileOpen(false)} style={{ color: "#ccc", textDecoration: "none", padding: "10px 4px", fontSize: 14, borderBottom: "1px solid #2a2f3e" }}>Account</Link>
              <Link to="/cart" onClick={() => setMobileOpen(false)} style={{ color: "#fff", textDecoration: "none", padding: "10px 4px", fontSize: 14 }}>🛒 Cart {cartCount > 0 ? `(${cartCount})` : ""}</Link>
            </>
          ) : (
            <Link to="/login" onClick={() => setMobileOpen(false)} style={{ color: "#FF6B00", textDecoration: "none", padding: "10px 4px", fontSize: 14, fontWeight: 700 }}>Sign In</Link>
          )}
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .hamburger { display: block !important; }
        }
      `}</style>
    </nav>
  );
}
