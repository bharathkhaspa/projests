import { Link } from 'react-router-dom'
import { Target, Heart, Leaf, TrendingUp, ArrowRight } from 'lucide-react'
import { SectionHeading } from './HomePage'

const VALUES = [
  { icon: Target, title: 'Reliability first', desc: 'Verified partners and live tracking so your goods always arrive as promised.' },
  { icon: Heart, title: 'Fair for everyone', desc: 'Transparent pricing for shippers and better earnings for transporters.' },
  { icon: Leaf, title: 'Less empty miles', desc: 'Truck sharing and return loads cut wasted trips and emissions.' },
  { icon: TrendingUp, title: 'Built to scale', desc: 'Technology that grows from a single carton to nationwide freight.' },
]

export function AboutPage() {
  return (
    <div>
      <section className="bg-brand-900 py-16 sm:py-20">
        <div className="container-px grid gap-8 lg:grid-cols-2 lg:items-center">
          <div>
            <h1 className="text-4xl font-extrabold text-white sm:text-5xl">Moving India's goods, simply.</h1>
            <p className="mt-4 max-w-lg text-slate-300">
              Pass &amp; Pay was built to fix a broken experience: finding a reliable truck at a fair price
              shouldn't take dozens of phone calls. We connect shippers directly with verified transporters —
              with transparent pricing, live tracking and the option to share trucks on part loads.
            </p>
          </div>
          <div className="overflow-hidden rounded-3xl shadow-card">
            <img
              src="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=900&q=70"
              alt="Logistics warehouse with cargo being organised"
              loading="lazy"
              className="h-full w-full object-cover"
            />
          </div>
        </div>
      </section>

      <section className="container-px py-16 sm:py-20">
        <SectionHeading eyebrow="Our values" title="What we stand for" />
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {VALUES.map((v) => (
            <div key={v.title} className="card p-6">
              <div className="mb-4 grid h-12 w-12 place-items-center rounded-2xl bg-accent-50 text-accent-600">
                <v.icon size={24} />
              </div>
              <h3 className="text-base font-bold text-ink">{v.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-500">{v.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-white py-16 sm:py-20">
        <div className="container-px grid grid-cols-2 gap-6 text-center lg:grid-cols-4">
          {[
            { value: '2024', label: 'Founded' },
            { value: '50k+', label: 'Trucks' },
            { value: '120+', label: 'Cities' },
            { value: '₹100Cr+', label: 'Freight moved' },
          ].map((s) => (
            <div key={s.label}>
              <p className="text-3xl font-extrabold text-brand sm:text-4xl">{s.value}</p>
              <p className="mt-1 text-sm text-slate-500">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="container-px py-16 text-center">
        <h2 className="text-2xl font-extrabold text-ink sm:text-3xl">Join the network</h2>
        <p className="mx-auto mt-3 max-w-md text-slate-500">Whether you ship goods or drive trucks, there's a place for you.</p>
        <Link to="/signup" className="btn-primary mt-6 px-6 py-3 text-base">
          Get started <ArrowRight size={18} />
        </Link>
      </section>
    </div>
  )
}
