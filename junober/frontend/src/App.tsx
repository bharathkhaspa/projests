import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useBootstrapAuth } from "./hooks/useAuth";

// Public routes
import Home from "./routes/Home";
import Shop from "./routes/Shop";
import ProductDetail from "./routes/ProductDetail";
import Customize from "./routes/Customize";

// Auth routes
import Login from "./routes/Login";
import Register from "./routes/Register";
import ForgotPassword from "./routes/ForgotPassword";
import ResetPassword from "./routes/ResetPassword";

// Account routes
import Account from "./routes/Account";
import Cart from "./routes/Cart";
import Checkout from "./routes/Checkout";
import OrderHistory from "./routes/OrderHistory";

// Admin routes
import AdminPanel from "./routes/admin/AdminPanel";
import AdminDashboard from "./routes/admin/AdminDashboard";
import AdminProducts from "./routes/admin/AdminProducts";
import AdminOrders from "./routes/admin/AdminOrders";
import AdminBanners from "./routes/admin/AdminBanners";
import NotFound from "./routes/NotFound";

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 30_000, retry: 1 } },
});

function AppRoutes() {
  useBootstrapAuth();
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<Home />} />
      <Route path="/shop" element={<Shop />} />
      <Route path="/products/:slug" element={<ProductDetail />} />
      <Route path="/customize" element={<Customize />} />

      {/* Auth */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      {/* Customer account */}
      <Route path="/account" element={<Account />} />
      <Route path="/cart" element={<Cart />} />
      <Route path="/checkout" element={<Checkout />} />
      <Route path="/orders" element={<OrderHistory />} />

      {/* Admin panel */}
      <Route path="/admin-panel" element={<AdminPanel />}>
        <Route index element={<AdminDashboard />} />
        <Route path="products" element={<AdminProducts />} />
        <Route path="orders" element={<AdminOrders />} />
        <Route path="banners" element={<AdminBanners />} />
      </Route>

      {/* Catch-all → 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </QueryClientProvider>
  );
}
