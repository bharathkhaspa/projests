import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Check } from 'lucide-react'
import { Logo } from '@/components/Logo'

const PERKS = [
  'No booking fees, ever',
  'Verified trucks & drivers',
  'Live GPS tracking',
  'Transparent, instant pricing',
]

export function AuthShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen">
      {/* Brand panel */}
      <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-brand-900 p-12 lg:flex">
        <img
          src="https://images.unsplash.com/photo-1591768793355-74d04bb6608f?auto=format&fit=crop&w=1200&q=70"
          alt="Truck fleet"
          className="absolute inset-0 h-full w-full object-cover opacity-20"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-brand-900/70 to-brand-900" />
        <div className="relative">
          <Logo variant="light" />
        </div>
        <div className="relative">
          <h2 className="text-3xl font-extrabold leading-tight text-white">
            Book a truck. Move anything. <span className="text-accent">Pay simply.</span>
          </h2>
          <ul className="mt-8 space-y-3">
            {PERKS.map((p) => (
              <li key={p} className="flex items-center gap-3 text-slate-200">
                <span className="grid h-6 w-6 place-items-center rounded-full bg-accent text-white">
                  <Check size={14} />
                </span>
                {p}
              </li>
            ))}
          </ul>
        </div>
        <p className="relative text-sm text-slate-400">© {new Date().getFullYear()} Pass &amp; Pay</p>
      </div>

      {/* Form panel */}
      <div className="flex w-full flex-col lg:w-1/2">
        <div className="flex items-center justify-between p-6 lg:hidden">
          <Logo />
          <Link to="/" className="text-sm font-medium text-slate-500 hover:text-brand">
            Home
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-center px-6 py-8">
          <div className="w-full max-w-md">{children}</div>
        </div>
      </div>
    </div>
  )
}
