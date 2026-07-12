import type { Role } from '@/lib/types'

export interface NavItem {
  to: string
  label: string
  icon: string // lucide icon name
  /** Show in the mobile bottom tab bar. */
  tab?: boolean
}

export const SHIPPER_NAV: NavItem[] = [
  { to: '/app/dashboard', label: 'Dashboard', icon: 'LayoutDashboard', tab: true },
  { to: '/app/book', label: 'Book a Truck', icon: 'PackagePlus', tab: true },
  { to: '/app/bookings', label: 'My Bookings', icon: 'ClipboardList', tab: true },
  { to: '/app/tracking', label: 'Live Tracking', icon: 'MapPin', tab: true },
  { to: '/app/payments', label: 'Payments', icon: 'Receipt' },
  { to: '/app/profile', label: 'Profile & KYC', icon: 'UserCog' },
]

export const TRANSPORTER_NAV: NavItem[] = [
  { to: '/transporter/dashboard', label: 'Dashboard', icon: 'LayoutDashboard', tab: true },
  { to: '/transporter/loads', label: 'Available Loads', icon: 'Boxes', tab: true },
  { to: '/transporter/trips', label: 'Active Trips', icon: 'Route', tab: true },
  { to: '/transporter/trucks', label: 'My Trucks', icon: 'Truck', tab: true },
  { to: '/transporter/earnings', label: 'Earnings', icon: 'Wallet' },
  { to: '/transporter/profile', label: 'Profile & KYC', icon: 'UserCog' },
]

export const ADMIN_NAV: NavItem[] = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: 'LayoutDashboard', tab: true },
  { to: '/admin/verification', label: 'Verification', icon: 'ShieldCheck', tab: true },
  { to: '/admin/bookings', label: 'Bookings', icon: 'ClipboardList', tab: true },
  { to: '/admin/users', label: 'Users', icon: 'Users', tab: true },
]

export function navForRole(role: Role): NavItem[] {
  if (role === 'shipper') return SHIPPER_NAV
  if (role === 'transporter') return TRANSPORTER_NAV
  return ADMIN_NAV
}
