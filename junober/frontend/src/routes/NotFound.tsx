import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";

export default function NotFound() {
  return (
    <div style={{ minHeight: "100vh", background: "#f5f5f5", fontFamily: "system-ui, sans-serif" }}>
      <Navbar />
      <div style={{ maxWidth: 560, margin: "0 auto", padding: "100px 24px", textAlign: "center" }}>
        <div style={{ fontSize: 80, marginBottom: 16 }}>404</div>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: "#0f1115", margin: "0 0 12px" }}>
          Page Not Found
        </h1>
        <p style={{ color: "#666", fontSize: 16, margin: "0 0 32px" }}>
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <Link to="/" style={{
            padding: "12px 28px", background: "#0f1115", color: "#fff",
            textDecoration: "none", borderRadius: 8, fontWeight: 700, fontSize: 15,
          }}>Go Home</Link>
          <Link to="/shop" style={{
            padding: "12px 28px", background: "#FF6B00", color: "#fff",
            textDecoration: "none", borderRadius: 8, fontWeight: 700, fontSize: 15,
          }}>Browse Shop</Link>
        </div>
      </div>
    </div>
  );
}
