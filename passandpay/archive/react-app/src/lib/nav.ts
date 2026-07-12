import type { Role } from './types'

/** Home route for each role's authenticated app. */
export function dashboardPath(role: Role): string {
  switch (role) {
    case 'shipper':
      return '/app/dashboard'
    case 'transporter':
      return '/transporter/dashboard'
    case 'admin':
      return '/admin/dashboard'
    default:
      return '/'
  }
}
