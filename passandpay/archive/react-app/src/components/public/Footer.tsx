import { Link } from 'react-router-dom'
import { Mail, MapPin, Phone } from 'lucide-react'
import { Logo } from '@/components/Logo'

const COLS = [
  {
    title: 'Company',
    links: [
      { to: '/about', label: 'About us' },
      { to: '/how-it-works', label: 'How it works' },
      { to: '/services', label: 'Services' },
      { to: '/contact', label: 'Contact' },
    ],
  },
  {
    title: 'Services',
    links: [
      { to: '/services', label: 'Full Truck Load' },
      { to: '/services', label: 'Part Load Sharing' },
      { to: '/services', label: 'GPS Tracking' },
      { to: '/services', label: 'Pricing' },
    ],
  },
  {
    title: 'For partners',
    links: [
      { to: '/signup', label: 'Become a transporter' },
      { to: '/signup', label: 'Add your truck' },
      { to: '/login', label: 'Partner login' },
    ],
  },
]

export function Footer() {
  return (
    <footer className="bg-brand-900 text-slate-300">
      <div className="container-px py-14">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <Logo variant="light" to="/" />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-slate-400">
              India's modern truck booking platform. Book full loads or share a truck on part
              loads — with live tracking and transparent, instant pricing.
            </p>
            <div className="mt-5 space-y-2 text-sm">
              <a href="tel:+911800000000" className="flex items-center gap-2 hover:text-white">
                <Phone size={15} className="text-accent" /> 1800-000-000 (toll free)
              </a>
              <a href="mailto:hello@passandpay.in" className="flex items-center gap-2 hover:text-white">
                <Mail size={15} className="text-accent" /> hello@passandpay.in
              </a>
              <p className="flex items-center gap-2">
                <MapPin size={15} className="text-accent" /> Bengaluru, India
              </p>
            </div>
          </div>

          {COLS.map((col) => (
            <div key={col.title}>
              <h4 className="text-sm font-semibold text-white">{col.title}</h4>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((l, i) => (
                  <li key={`${l.label}-${i}`}>
                    <Link to={l.to} className="text-sm text-slate-400 transition hover:text-white">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-6 text-sm text-slate-400 sm:flex-row">
          <p>© {new Date().getFullYear()} Pass &amp; Pay. All rights reserved.</p>
          <p className="text-slate-500">Book a truck. Move anything. Pay simply.</p>
        </div>
      </div>
    </footer>
  )
}
