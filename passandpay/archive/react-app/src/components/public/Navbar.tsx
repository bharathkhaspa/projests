import { useEffect, useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { Menu, X, LayoutDashboard } from 'lucide-react'
import { Logo } from '@/components/Logo'
import { useStore } from '@/store/useStore'
import { Avatar } from '@/components/ui/Avatar'
import { cn } from '@/lib/utils'
import { dashboardPath } from '@/lib/nav'

const LINKS = [
  { to: '/how-it-works', label: 'How it works' },
  { to: '/services', label: 'Services' },
  { to: '/about', label: 'About' },
  { to: '/contact', label: 'Contact' },
]

export function Navbar() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const user = useStore((s) => s.currentUser())
  const navigate = useNavigate()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={cn(
        'sticky top-0 z-50 w-full border-b transition-all',
        scrolled ? 'border-slate-200 bg-white/90 backdrop-blur-md shadow-soft' : 'border-transparent bg-white',
      )}
    >
      <nav className="container-px flex h-16 items-center justify-between gap-4">
        <Logo />

        <div className="hidden items-center gap-1 md:flex">
          {LINKS.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              className={({ isActive }) =>
                cn(
                  'rounded-lg px-3 py-2 text-sm font-medium transition',
                  isActive ? 'text-brand' : 'text-slate-600 hover:text-brand',
                )
              }
            >
              {l.label}
            </NavLink>
          ))}
        </div>

        <div className="hidden items-center gap-3 md:flex">
          {user ? (
            <Link to={dashboardPath(user.role)} className="flex items-center gap-2 rounded-xl px-2 py-1.5 hover:bg-slate-100">
              <Avatar name={user.name} color={user.avatarColor} size="sm" />
              <span className="text-sm font-semibold text-ink">Dashboard</span>
            </Link>
          ) : (
            <>
              <Link to="/login" className="btn-ghost">
                Log in
              </Link>
              <Link to="/signup" className="btn-primary">
                Get started
              </Link>
            </>
          )}
        </div>

        <button
          className="grid h-10 w-10 place-items-center rounded-xl text-ink hover:bg-slate-100 md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </nav>

      {/* Mobile menu */}
      {open && (
        <div className="border-t border-slate-200 bg-white md:hidden">
          <div className="container-px flex flex-col gap-1 py-4">
            {LINKS.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  cn(
                    'rounded-lg px-3 py-3 text-sm font-medium',
                    isActive ? 'bg-brand-50 text-brand' : 'text-slate-700 hover:bg-slate-100',
                  )
                }
              >
                {l.label}
              </NavLink>
            ))}
            <div className="mt-3 flex flex-col gap-2">
              {user ? (
                <button
                  className="btn-primary w-full"
                  onClick={() => {
                    setOpen(false)
                    navigate(dashboardPath(user.role))
                  }}
                >
                  <LayoutDashboard size={16} /> Go to dashboard
                </button>
              ) : (
                <>
                  <Link to="/login" onClick={() => setOpen(false)} className="btn-outline w-full">
                    Log in
                  </Link>
                  <Link to="/signup" onClick={() => setOpen(false)} className="btn-primary w-full">
                    Get started
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
