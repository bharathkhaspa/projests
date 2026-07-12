import { Routes, Route, Navigate } from 'react-router-dom'
import { ScrollToTop } from '@/components/ScrollToTop'
import { PublicLayout } from '@/components/public/PublicLayout'
import { AppLayout } from '@/components/app/AppLayout'
import { ProtectedRoute } from '@/components/app/ProtectedRoute'

// Public pages
import { HomePage } from '@/pages/public/HomePage'
import { HowItWorksPage } from '@/pages/public/HowItWorksPage'
import { ServicesPage } from '@/pages/public/ServicesPage'
import { AboutPage } from '@/pages/public/AboutPage'
import { ContactPage } from '@/pages/public/ContactPage'
import { LoginPage } from '@/pages/auth/LoginPage'
import { SignupPage } from '@/pages/auth/SignupPage'
import { NotFoundPage } from '@/pages/public/NotFoundPage'

// Shipper
import { ShipperDashboard } from '@/pages/shipper/ShipperDashboard'
import { BookTruckPage } from '@/pages/shipper/BookTruckPage'
import { MyBookingsPage } from '@/pages/shipper/MyBookingsPage'
import { TrackingPage } from '@/pages/shipper/TrackingPage'
import { PaymentsPage } from '@/pages/shipper/PaymentsPage'
import { ShipperProfilePage } from '@/pages/shipper/ShipperProfilePage'

// Transporter
import { TransporterDashboard } from '@/pages/transporter/TransporterDashboard'
import { AvailableLoadsPage } from '@/pages/transporter/AvailableLoadsPage'
import { ActiveTripsPage } from '@/pages/transporter/ActiveTripsPage'
import { MyTrucksPage } from '@/pages/transporter/MyTrucksPage'
import { EarningsPage } from '@/pages/transporter/EarningsPage'
import { TransporterProfilePage } from '@/pages/transporter/TransporterProfilePage'

// Admin
import { AdminDashboard } from '@/pages/admin/AdminDashboard'
import { VerificationPage } from '@/pages/admin/VerificationPage'
import { AdminBookingsPage } from '@/pages/admin/AdminBookingsPage'
import { AdminUsersPage } from '@/pages/admin/AdminUsersPage'

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        {/* Public marketing site */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/how-it-works" element={<HowItWorksPage />} />
          <Route path="/services" element={<ServicesPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
        </Route>

        {/* Auth */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />

        {/* Shipper app */}
        <Route
          path="/app"
          element={
            <ProtectedRoute role="shipper">
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/app/dashboard" replace />} />
          <Route path="dashboard" element={<ShipperDashboard />} />
          <Route path="book" element={<BookTruckPage />} />
          <Route path="bookings" element={<MyBookingsPage />} />
          <Route path="tracking" element={<TrackingPage />} />
          <Route path="tracking/:bookingId" element={<TrackingPage />} />
          <Route path="payments" element={<PaymentsPage />} />
          <Route path="profile" element={<ShipperProfilePage />} />
        </Route>

        {/* Transporter app */}
        <Route
          path="/transporter"
          element={
            <ProtectedRoute role="transporter">
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/transporter/dashboard" replace />} />
          <Route path="dashboard" element={<TransporterDashboard />} />
          <Route path="loads" element={<AvailableLoadsPage />} />
          <Route path="trips" element={<ActiveTripsPage />} />
          <Route path="trucks" element={<MyTrucksPage />} />
          <Route path="earnings" element={<EarningsPage />} />
          <Route path="profile" element={<TransporterProfilePage />} />
        </Route>

        {/* Admin app */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute role="admin">
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="verification" element={<VerificationPage />} />
          <Route path="bookings" element={<AdminBookingsPage />} />
          <Route path="users" element={<AdminUsersPage />} />
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </>
  )
}
