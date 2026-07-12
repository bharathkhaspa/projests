import { Navigate, useLocation } from 'react-router-dom'
import type { ReactNode } from 'react'
import { useStore } from '@/store/useStore'
import type { Role } from '@/lib/types'
import { dashboardPath } from '@/lib/nav'

/**
 * Gates a route behind authentication and (optionally) a specific role.
 * Unauthenticated users are bounced to /login; wrong-role users are sent to
 * their own dashboard.
 */
export function ProtectedRoute({ role, children }: { role: Role; children: ReactNode }) {
  const user = useStore((s) => s.currentUser())
  const location = useLocation()

  if (!user) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />
  }
  if (user.role !== role) {
    return <Navigate to={dashboardPath(user.role)} replace />
  }
  return <>{children}</>
}
