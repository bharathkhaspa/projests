import { Link, useNavigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../../store/auth";
import { useEffect } from "react";

const BRAND = "#FF6B00";

const navLinks = [
  { to: "/admin-panel", label: "Dashboard", icon: "📊", exact: true },
  { to: "/admin-panel/products", label: "Products", icon: "📦", exact: false },
  { to: "/admin-panel/orders", label: "Orders", icon: "🛒", exact: false },
  { to: "/admin-panel/banners", label: "Banners", icon: "🖼️", exact: false },
];

export default function AdminPanel() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);

  if (!user) return null;

  const isAdmin = user.is_staff || ["super_admin", "admin"].includes(user.role);

  if (!isAdmin) {
    return (
      <div
        style={{
          fontFamily: "system-ui",
          minHeight: "100vh",
          background: "#f8f9fa",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          gap: 16,
        }}
      >
        <div style={{ background: "#fff", borderRadius: 16, padding: 40, maxWidth: 480, width: "100%", textAlign: "center", boxShadow: "0 4px 24px rgba(0,0,0,0.08)", border: "1px solid #eee" }}>
          <div style={{ fontSize: 56, marginBottom: 16 }}>🔐</div>
          <h1 style={{ fontSize: 24, color: "#0f1115", margin: "0 0 8px", fontWeight: 800 }}>Admin Access Required</h1>
          <p style={{ color: "#666", margin: "0 0 24px", fontSize: 15 }}>
            Your account <strong>{user.email}</strong> doesn't have admin permissions yet.
          </p>
          <div style={{ background: "#f8f9fa", borderRadius: 10, padding: 20, textAlign: "left", marginBottom: 24 }}>
            <p style={{ margin: "0 0 10px", fontSize: 13, fontWeight: 700, color: "#444" }}>To get admin access, run in terminal:</p>
            <code style={{ display: "block", background: "#0f1115", color: "#FF6B00", padding: "12px 16px", borderRadius: 8, fontSize: 13, whiteSpace: "pre-wrap", lineHeight: 1.8 }}>
              {`cd backend\nvenv\\Scripts\\python.exe manage.py shell -c "from apps.accounts.models import User; u = User.objects.get(email='${user.email}'); u.is_staff = True; u.save()"`}
            </code>
            <p style={{ margin: "10px 0 0", fontSize: 12, color: "#999" }}>Then refresh this page.</p>
          </div>
          <Link to="/" style={{ display: "inline-block", padding: "10px 28px", background: BRAND, color: "#fff", borderRadius: 8, textDecoration: "none", fontWeight: 700, fontSize: 14 }}>
            ← Go Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh", fontFamily: "system-ui", background: "#f8f9fa" }}>
      {/* Sidebar */}
      <aside
        style={{
          width: 220,
          minWidth: 220,
          background: "#0f1115",
          display: "flex",
          flexDirection: "column",
          position: "fixed",
          top: 0,
          left: 0,
          bottom: 0,
          zIndex: 100,
          overflowY: "auto",
        }}
      >
        {/* Logo */}
        <div
          style={{
            padding: "24px 20px 20px",
            borderBottom: "1px solid #1e2229",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                width: 36,
                height: 36,
                background: BRAND,
                borderRadius: 8,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 18,
              }}
            >
              ⚡
            </div>
            <div>
              <div style={{ color: "#fff", fontWeight: 700, fontSize: 15, lineHeight: 1.2 }}>Admin</div>
              <div style={{ color: "#888", fontSize: 11 }}>Control Panel</div>
            </div>
          </div>
        </div>

        {/* Nav Links */}
        <nav style={{ padding: "12px 10px", flex: 1 }}>
          <div style={{ fontSize: 10, color: "#555", fontWeight: 700, letterSpacing: 1, padding: "8px 10px 4px", textTransform: "uppercase" }}>
            Navigation
          </div>
          {navLinks.map((link) => {
            const active = link.exact
              ? location.pathname === link.to
              : location.pathname === link.to || location.pathname.startsWith(link.to + "/");
            return (
              <Link
                key={link.to}
                to={link.to}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "10px 12px",
                  borderRadius: 8,
                  margin: "2px 0",
                  textDecoration: "none",
                  color: active ? "#fff" : "#aaa",
                  background: active ? BRAND : "transparent",
                  fontWeight: active ? 600 : 400,
                  fontSize: 14,
                  transition: "all 0.15s",
                }}
              >
                <span style={{ fontSize: 16 }}>{link.icon}</span>
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div style={{ padding: "16px 20px", borderTop: "1px solid #1e2229" }}>
          <div style={{ color: "#555", fontSize: 12 }}>Signed in as</div>
          <div style={{ color: "#ccc", fontSize: 13, fontWeight: 500, marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {user.email || "Admin"}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main style={{ marginLeft: 220, flex: 1, minHeight: "100vh", background: "#f8f9fa" }}>
        <Outlet />
      </main>
    </div>
  );
}
