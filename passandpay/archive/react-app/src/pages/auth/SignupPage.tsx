import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Package, Truck, UserPlus, Check } from 'lucide-react'
import toast from 'react-hot-toast'
import { AuthShell } from './AuthShell'
import { useStore } from '@/store/useStore'
import { dashboardPath } from '@/lib/nav'
import { CityPicker } from '@/components/ui/CityPicker'
import { cn } from '@/lib/utils'
import type { Role } from '@/lib/types'

export function SignupPage() {
  const signup = useStore((s) => s.signup)
  const navigate = useNavigate()
  const [role, setRole] = useState<Exclude<Role, 'admin'>>('shipper')
  const [form, setForm] = useState({ name: '', email: '', phone: '', company: '', city: '' })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const user = signup({ ...form, role })
    toast.success(`Account created — welcome, ${user.name.split(' ')[0]}!`)
    navigate(dashboardPath(user.role))
  }

  const ROLES: { id: Exclude<Role, 'admin'>; label: string; desc: string; icon: typeof Package }[] = [
    { id: 'shipper', label: 'I need to move goods', desc: 'Book trucks & track shipments', icon: Package },
    { id: 'transporter', label: 'I own / drive trucks', desc: 'Find loads & earn more', icon: Truck },
  ]

  return (
    <AuthShell>
      <h1 className="text-2xl font-bold text-ink sm:text-3xl">Create your account</h1>
      <p className="mt-2 text-sm text-slate-500">Free to join. No booking fees.</p>

      {/* Role selection */}
      <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {ROLES.map((r) => {
          const active = role === r.id
          return (
            <button
              key={r.id}
              type="button"
              onClick={() => setRole(r.id)}
              className={cn(
                'relative flex items-start gap-3 rounded-2xl border-2 p-4 text-left transition',
                active ? 'border-brand bg-brand-50' : 'border-slate-200 hover:border-slate-300',
              )}
            >
              <span className={cn('grid h-10 w-10 shrink-0 place-items-center rounded-xl', active ? 'bg-brand text-white' : 'bg-slate-100 text-slate-500')}>
                <r.icon size={20} />
              </span>
              <span>
                <span className="block text-sm font-semibold text-ink">{r.label}</span>
                <span className="block text-xs text-slate-500">{r.desc}</span>
              </span>
              {active && (
                <span className="absolute right-3 top-3 grid h-5 w-5 place-items-center rounded-full bg-brand text-white">
                  <Check size={12} />
                </span>
              )}
            </button>
          )
        })}
      </div>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <label className="label" htmlFor="s-name">Full name</label>
          <input id="s-name" required className="input" placeholder="e.g. Ravi Kumar" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label" htmlFor="s-email">Email</label>
            <input id="s-email" type="email" required className="input" placeholder="you@example.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </div>
          <div>
            <label className="label" htmlFor="s-phone">Phone</label>
            <input id="s-phone" required className="input" placeholder="+91 90000 00000" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label" htmlFor="s-company">{role === 'transporter' ? 'Fleet / company' : 'Company (optional)'}</label>
            <input id="s-company" className="input" placeholder="Company name" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} />
          </div>
          <div>
            <label className="label" htmlFor="s-city">Base city</label>
            <CityPicker id="s-city" value={form.city} onChange={(v) => setForm({ ...form, city: v })} placeholder="Select city" />
          </div>
        </div>

        <button type="submit" className="btn-primary w-full">
          <UserPlus size={16} /> Create {role === 'shipper' ? 'shipper' : 'transporter'} account
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-500">
        Already have an account?{' '}
        <Link to="/login" className="font-semibold text-brand hover:underline">
          Log in
        </Link>
      </p>
    </AuthShell>
  )
}
