import { useState } from 'react'
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { LogOut, Menu, X, ChevronLeft } from 'lucide-react'
import { Logo } from '@/components/Logo'
import { Avatar } from '@/components/ui/Avatar'
import { Icon } from '@/components/ui/Icon'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { useStore } from '@/store/useStore'
import { navForRole, type NavItem } from './navConfig'
import { cn } from '@/lib/utils'
import type { Role } from '@/lib/types'
import toast from 'react-hot-toast'

const ROLE_LABEL: Record<Role, string> = {
  shipper: 'Shipper',
  transporter: 'Transporter',
  admin: 'Admin',
}

export function AppLayout() {
  const user = useStore((s) => s.currentUser())
  const logout = useStore((s) => s.logout)
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)

  if (!user) return null
  const items = navForRole(user.role)
  const tabItems = items.filter((i) => i.tab).slice(0, 5)

  const handleLogout = () => {
    logout()
    toast.success('Signed out')
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-mist lg:flex">
      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-slate-200 bg-white lg:flex">
        <div className="flex h-16 items-center border-b border-slate-100 px-5">
          <Logo />
        </div>
        <SidebarNav items={items} />
        <SidebarUser user={user} roleLabel={ROLE_LABEL[user.role]} onLogout={handleLogout} />
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-ink/40 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <aside className="absolute left-0 top-0 flex h-full w-72 max-w-[80%] flex-col bg-white shadow-2xl">
            <div className="flex h-16 items-center justify-between border-b border-slate-100 px-5">
              <Logo />
              <button onClick={() => setMobileOpen(false)} className="grid h-8 w-8 place-items-center rounded-lg hover:bg-slate-100" aria-label="Close menu">
                <X size={18} />
              </button>
            </div>
            <SidebarNav items={items} onNavigate={() => setMobileOpen(false)} />
            <SidebarUser user={user} roleLabel={ROLE_LABEL[user.role]} onLogout={handleLogout} />
          </aside>
        </div>
      )}

      {/* Main column */}
      <div className="flex min-h-screen min-w-0 flex-1 flex-col">
        {/* Top bar (mobile) */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white/90 px-4 backdrop-blur-md lg:hidden">
          <button onClick={() => setMobileOpen(true)} className="grid h-10 w-10 place-items-center rounded-xl hover:bg-slate-100" aria-label="Open menu">
            <Menu size={22} />
          </button>
          <Logo />
          <Link to="/app/profile" className="lg:hidden">
            <Avatar name={user.name} color={user.avatarColor} size="sm" />
          </Link>
        </header>

        <main className="flex-1 pb-24 lg:pb-10">
          <Outlet />
        </main>
      </div>

      {/* Mobile bottom tab bar */}
      <nav className="fixed inset-x-0 bottom-0 z-40 flex border-t border-slate-200 bg-white/95 backdrop-blur-md lg:hidden">
        {tabItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              cn(
                'flex flex-1 flex-col items-center gap-1 py-2.5 text-[11px] font-medium transition',
                isActive ? 'text-brand' : 'text-slate-500',
              )
            }
          >
            {({ isActive }) => (
              <>
                <span className={cn('rounded-lg px-3 py-1', isActive && 'bg-brand-50')}>
                  <Icon name={item.icon} size={20} />
                </span>
                <span className="truncate">{item.label.split(' ')[0]}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>
    </div>
  )
}

function SidebarNav({ items, onNavigate }: { items: NavItem[]; onNavigate?: () => void }) {
  return (
    <nav className="flex-1 space-y-1 overflow-y-auto p-3">
      <Link
        to="/"
        onClick={onNavigate}
        className="mb-2 flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium text-slate-400 hover:text-brand"
      >
        <ChevronLeft size={14} /> Back to website
      </Link>
      {items.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          onClick={onNavigate}
          className={({ isActive }) =>
            cn(
              'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition',
              isActive ? 'bg-brand text-white shadow-soft' : 'text-slate-600 hover:bg-slate-100',
            )
          }
        >
          <Icon name={item.icon} size={18} />
          {item.label}
        </NavLink>
      ))}
    </nav>
  )
}

function SidebarUser({
  user,
  roleLabel,
  onLogout,
}: {
  user: NonNullable<ReturnType<typeof useStore.getState>['users'][number]>
  roleLabel: string
  onLogout: () => void
}) {
  return (
    <div className="border-t border-slate-100 p-3">
      <Link to={user.role === 'shipper' ? '/app/profile' : user.role === 'transporter' ? '/transporter/profile' : '/admin/dashboard'} className="flex items-center gap-3 rounded-xl p-2 hover:bg-slate-50">
        <Avatar name={user.name} color={user.avatarColor} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-ink">{user.name}</p>
          <div className="mt-0.5 flex items-center gap-1.5">
            <span className="text-xs text-slate-500">{roleLabel}</span>
            <StatusBadge kind="kyc" value={user.kycStatus} className="scale-90" />
          </div>
        </div>
      </Link>
      <button onClick={onLogout} className="mt-2 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-rose-50 hover:text-danger">
        <LogOut size={18} /> Sign out
      </button>
    </div>
  )
}
