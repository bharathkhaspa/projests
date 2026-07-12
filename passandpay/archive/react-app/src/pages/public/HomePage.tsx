import { Link } from 'react-router-dom'
import {
  ArrowRight,
  ShieldCheck,
  Truck,
  MapPinned,
  Wallet,
  Users,
  PackageCheck,
  Star,
  Phone,
  Clock,
  BadgeCheck,
} from 'lucide-react'
import { QuoteWidget } from '@/components/public/QuoteWidget'
import { TRUCK_TYPES } from '@/lib/trucks'

const STATS = [
  { value: '50,000+', label: 'Trucks on network' },
  { value: '1,200+', label: 'Routes covered' },
  { value: '4.8/5', label: 'Customer rating' },
  { value: '₹0', label: 'Booking fee' },
]

const STEPS = [
  {
    icon: PackageCheck,
    title: 'Post your load',
    desc: 'Enter pickup, drop, goods type and weight. Get an instant, transparent fare estimate.',
  },
  {
    icon: Truck,
    title: 'Get matched',
    desc: 'Verified transporters near your route accept your booking — full truck or shared part-load.',
  },
  {
    icon: MapPinned,
    title: 'Track & pay',
    desc: 'Follow your shipment live, get delivery updates, and pay securely on completion.',
  },
]

const FEATURES = [
  { icon: ShieldCheck, title: 'Verified partners', desc: 'Every driver and truck is KYC-verified before they can accept a load.' },
  { icon: Wallet, title: 'Transparent pricing', desc: 'Upfront fare breakdown — base, distance, GST. No surge, no surprises.' },
  { icon: Users, title: 'Part-load sharing', desc: 'Share a truck on the same route and pay only for the space you use.' },
  { icon: MapPinned, title: 'Live GPS tracking', desc: 'Real-time location and status from pickup to delivery.' },
]

const TESTIMONIALS = [
  {
    name: 'Ananya Sharma',
    role: 'Sharma Textiles, Mumbai',
    quote: 'Booked a 5-ton Eicher in under two minutes. The live tracking meant I never had to call the driver once.',
    color: '#1A3D7C',
  },
  {
    name: 'Karan Mehta',
    role: 'D2C founder, Delhi',
    quote: 'Part-load sharing cut my Delhi–Jaipur freight cost by nearly 40%. Game changer for small shipments.',
    color: '#F5821F',
  },
  {
    name: 'Rajinder Singh',
    role: 'Transporter, 6 trucks',
    quote: 'I find return loads instead of driving back empty. My trucks earn on both legs now.',
    color: '#28A745',
  },
]

export function HomePage() {
  return (
    <div>
      {/* HERO */}
      <section className="relative overflow-hidden bg-brand-900">
        <img
          src="https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&w=1920&q=70"
          alt="Cargo truck on an Indian highway at dusk"
          className="absolute inset-0 h-full w-full object-cover opacity-25"
          loading="eager"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-brand-900 via-brand-900/90 to-brand-900/40" />

        <div className="container-px relative grid gap-10 py-16 lg:grid-cols-2 lg:items-center lg:py-24">
          <div className="animate-fade-in">
            <span className="badge bg-white/10 text-white ring-1 ring-white/20">
              <BadgeCheck size={14} className="text-accent" /> India's trusted truck booking platform
            </span>
            <h1 className="mt-5 text-4xl font-extrabold leading-tight text-white sm:text-5xl lg:text-6xl">
              Book a truck.<br />
              Move anything.<br />
              <span className="text-accent">Pay simply.</span>
            </h1>
            <p className="mt-5 max-w-md text-base leading-relaxed text-slate-300 sm:text-lg">
              From a single carton to a full container — get a verified truck at a transparent price,
              with live tracking from pickup to delivery.
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-3">
              <Link to="/signup" className="btn-primary px-6 py-3 text-base">
                Book a Truck <ArrowRight size={18} />
              </Link>
              <Link to="/how-it-works" className="btn px-6 py-3 text-base text-white ring-1 ring-white/30 hover:bg-white/10">
                How it works
              </Link>
            </div>
            <div className="mt-7 flex items-center gap-4 text-sm text-slate-300">
              <span className="flex items-center gap-1.5">
                <Star size={15} className="fill-amber-400 text-amber-400" /> 4.8 rating
              </span>
              <span className="flex items-center gap-1.5">
                <Clock size={15} className="text-accent" /> 2-min booking
              </span>
              <span className="flex items-center gap-1.5">
                <Phone size={15} className="text-accent" /> 24×7 support
              </span>
            </div>
          </div>

          <div className="animate-fade-in">
            <QuoteWidget />
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="border-b border-slate-200 bg-white">
        <div className="container-px grid grid-cols-2 gap-6 py-10 lg:grid-cols-4">
          {STATS.map((s) => (
            <div key={s.label} className="text-center">
              <p className="text-3xl font-extrabold text-brand sm:text-4xl">{s.value}</p>
              <p className="mt-1 text-sm text-slate-500">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="container-px py-16 sm:py-20">
        <SectionHeading eyebrow="How it works" title="Move goods in three simple steps" />
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {STEPS.map((s, i) => (
            <div key={s.title} className="card relative p-7">
              <span className="absolute -top-4 left-7 grid h-9 w-9 place-items-center rounded-xl bg-accent font-bold text-white shadow-soft">
                {i + 1}
              </span>
              <div className="mb-4 mt-2 grid h-12 w-12 place-items-center rounded-2xl bg-brand-50 text-brand">
                <s.icon size={24} />
              </div>
              <h3 className="text-lg font-bold text-ink">{s.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-500">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* TRUCK TYPES */}
      <section className="bg-white py-16 sm:py-20">
        <div className="container-px">
          <SectionHeading eyebrow="Our fleet" title="A truck for every load" />
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {TRUCK_TYPES.map((t) => (
              <div key={t.id} className="card group overflow-hidden">
                <div className="relative h-44 overflow-hidden">
                  <img
                    src={t.image}
                    alt={t.name}
                    loading="lazy"
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  />
                  <span className="absolute right-3 top-3 badge bg-white/95 text-brand shadow-soft">{t.capacityLabel}</span>
                </div>
                <div className="p-5">
                  <h3 className="text-base font-bold text-ink">{t.name}</h3>
                  <p className="mt-1 text-sm text-slate-500">{t.exampleUse}</p>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-sm font-semibold text-brand">From ₹{t.perKmRate}/km</span>
                    <Link to="/signup" className="text-sm font-semibold text-accent hover:underline">
                      Book now →
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="container-px py-16 sm:py-20">
        <SectionHeading eyebrow="Why Pass & Pay" title="Logistics made effortless" />
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((f) => (
            <div key={f.title} className="card p-6">
              <div className="mb-4 grid h-12 w-12 place-items-center rounded-2xl bg-accent-50 text-accent-600">
                <f.icon size={24} />
              </div>
              <h3 className="text-base font-bold text-ink">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-500">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="bg-white py-16 sm:py-20">
        <div className="container-px">
          <SectionHeading eyebrow="Loved by shippers & transporters" title="Trusted across India" />
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {TESTIMONIALS.map((t) => (
              <figure key={t.name} className="card flex flex-col p-7">
                <div className="mb-3 flex gap-0.5">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star key={i} size={16} className="fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <blockquote className="flex-1 text-sm leading-relaxed text-slate-600">"{t.quote}"</blockquote>
                <figcaption className="mt-5 flex items-center gap-3">
                  <span className="grid h-10 w-10 place-items-center rounded-full font-bold text-white" style={{ backgroundColor: t.color }}>
                    {t.name.split(' ').map((p) => p[0]).join('').slice(0, 2)}
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-ink">{t.name}</p>
                    <p className="text-xs text-slate-500">{t.role}</p>
                  </div>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container-px py-16">
        <div className="relative overflow-hidden rounded-3xl bg-brand px-6 py-14 text-center sm:px-12">
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 20% 20%, #fff 0, transparent 40%), radial-gradient(circle at 80% 60%, #F5821F 0, transparent 35%)' }} />
          <div className="relative">
            <h2 className="text-3xl font-extrabold text-white sm:text-4xl">Ready to move your goods?</h2>
            <p className="mx-auto mt-3 max-w-xl text-slate-300">
              Join thousands of shippers and transporters moving freight smarter. Sign up free — no booking fees.
            </p>
            <div className="mt-7 flex flex-wrap justify-center gap-3">
              <Link to="/signup" className="btn-primary px-6 py-3 text-base">
                Get started free <ArrowRight size={18} />
              </Link>
              <Link to="/contact" className="btn px-6 py-3 text-base text-white ring-1 ring-white/30 hover:bg-white/10">
                Talk to sales
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export function SectionHeading({ eyebrow, title, subtitle }: { eyebrow: string; title: string; subtitle?: string }) {
  return (
    <div className="mx-auto max-w-2xl text-center">
      <p className="text-sm font-bold uppercase tracking-wide text-accent">{eyebrow}</p>
      <h2 className="mt-2 text-3xl font-extrabold text-ink sm:text-4xl">{title}</h2>
      {subtitle && <p className="mt-3 text-base text-slate-500">{subtitle}</p>}
    </div>
  )
}
