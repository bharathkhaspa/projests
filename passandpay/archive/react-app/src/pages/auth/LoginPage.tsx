import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { LogIn, Package, Truck, ShieldCheck } from 'lucide-react'
import toast from 'react-hot-toast'
import { AuthShell } from './AuthShell'
import { useStore } from '@/store/useStore'
import { dashboardPath } from '@/lib/nav'
import type { Role } from '@/lib/types'

const DEMO: { role: Role; label: string; email: string; icon: typeof Package }[] = [
  { role: 'shipper', label: 'Shipper', email: 'shipper@passandpay.in', icon: Package },
  { role: 'transporter', label: 'Transporter', email: 'transporter@passandpay.in', icon: Truck },
  { role: 'admin', label: 'Admin', email: 'admin@passandpay.in', icon: ShieldCheck },
]

export function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const login = useStore((s) => s.login)
  const navigate = useNavigate()

  const doLogin = (value: string) => {
    const user = login(value)
    if (!user) {
      toast.error('No account found with that email. Try a demo account or sign up.')
      return
    }
    toast.success(`Welcome back, ${user.name.split(' ')[0]}!`)
    navigate(dashboardPath(user.role))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    doLogin(email)
  }

  return (
    <AuthShell>
      <h1 className="text-2xl font-bold text-ink sm:text-3xl">Welcome back</h1>
      <p className="mt-2 text-sm text-slate-500">Log in to manage your bookings and shipments.</p>

      <form onSubmit={handleSubmit} className="mt-7 space-y-4">
        <div>
          <label className="label" htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            required
            className="input"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div>
          <div className="flex items-center justify-between">
            <label className="label" htmlFor="password">Password</label>
            <button type="button" className="text-xs font-medium text-brand hover:underline">Forgot?</button>
          </div>
          <input
            id="password"
            type="password"
            className="input"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <button type="submit" className="btn-primary w-full">
          <LogIn size={16} /> Log in
        </button>
      </form>

      <div className="my-6 flex items-center gap-3 text-xs text-slate-400">
        <span className="h-px flex-1 bg-slate-200" /> or try a demo account <span className="h-px flex-1 bg-slate-200" />
      </div>

      <div className="grid grid-cols-3 gap-3">
        {DEMO.map((d) => (
          <button
            key={d.role}
            onClick={() => doLogin(d.email)}
            className="flex flex-col items-center gap-2 rounded-xl border border-slate-200 bg-white px-2 py-3 text-xs font-semibold text-slate-700 transition hover:border-brand hover:text-brand"
          >
            <d.icon size={20} />
            {d.label}
          </button>
        ))}
      </div>

      <p className="mt-7 text-center text-sm text-slate-500">
        Don't have an account?{' '}
        <Link to="/signup" className="font-semibold text-brand hover:underline">
          Sign up free
        </Link>
      </p>
    </AuthShell>
  )
}
