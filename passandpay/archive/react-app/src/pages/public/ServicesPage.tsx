import { Link } from 'react-router-dom'
import { Truck, Split, Satellite, IndianRupee, Check, ArrowRight } from 'lucide-react'
import { SectionHeading } from './HomePage'
import { TRUCK_TYPES } from '@/lib/trucks'
import { formatINR } from '@/lib/utils'

const SERVICES = [
  {
    icon: Truck,
    title: 'Full Truck Load (FTL)',
    desc: 'Book an entire truck for your shipment — ideal for bulk goods, time-sensitive cargo and long hauls.',
    points: ['Dedicated truck', 'Direct point-to-point', 'Fastest delivery', 'Sizes from 1 to 20+ tons'],
  },
  {
    icon: Split,
    title: 'Part Load (Truck Sharing)',
    desc: 'Only filling part of a truck? Share it with other shippers on the same route and pay for the space you use.',
    points: ['Up to 40% cheaper', 'Proportional weight pricing', 'Same-route matching', 'Great for small loads'],
  },
  {
    icon: Satellite,
    title: 'GPS Live Tracking',
    desc: 'Track every shipment in real time with status updates from pickup to delivery — no more guesswork.',
    points: ['Live truck location', 'Status timeline', 'Delivery ETA', 'Driver contact'],
  },
  {
    icon: IndianRupee,
    title: 'Transparent Pricing',
    desc: 'See a full fare breakdown before you book — base fare, distance cost and GST. No surge, no surprises.',
    points: ['Upfront estimate', 'No booking fee', 'GST invoice', 'Secure online payment'],
  },
]

export function ServicesPage() {
  return (
    <div>
      <section className="bg-brand-900 py-16 text-center sm:py-20">
        <div className="container-px">
          <h1 className="text-4xl font-extrabold text-white sm:text-5xl">Our services</h1>
          <p className="mx-auto mt-4 max-w-xl text-slate-300">
            Everything you need to move goods across India — full loads, shared loads, live tracking and
            transparent pricing.
          </p>
        </div>
      </section>

      <section className="container-px py-16 sm:py-20">
        <div className="grid gap-6 md:grid-cols-2">
          {SERVICES.map((s) => (
            <div key={s.title} className="card p-7">
              <div className="mb-4 grid h-12 w-12 place-items-center rounded-2xl bg-brand-50 text-brand">
                <s.icon size={24} />
              </div>
              <h3 className="text-xl font-bold text-ink">{s.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-500">{s.desc}</p>
              <ul className="mt-4 grid grid-cols-2 gap-2">
                {s.points.map((p) => (
                  <li key={p} className="flex items-center gap-2 text-sm text-slate-600">
                    <Check size={15} className="text-success" /> {p}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing table */}
      <section className="bg-white py-16 sm:py-20">
        <div className="container-px">
          <SectionHeading eyebrow="Pricing" title="Simple, per-km pricing by truck type" subtitle="Final fare = base fare + (distance × per-km rate) + 5% GST. Long-haul surcharge may apply beyond 800 km." />
          <div className="mt-10 overflow-hidden rounded-2xl border border-slate-200">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-left text-sm">
                <thead className="bg-mist text-slate-600">
                  <tr>
                    <th className="px-5 py-3 font-semibold">Truck type</th>
                    <th className="px-5 py-3 font-semibold">Capacity</th>
                    <th className="px-5 py-3 font-semibold">Example use</th>
                    <th className="px-5 py-3 text-right font-semibold">Base fare</th>
                    <th className="px-5 py-3 text-right font-semibold">Per km</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {TRUCK_TYPES.map((t) => (
                    <tr key={t.id} className="hover:bg-mist/50">
                      <td className="px-5 py-3 font-semibold text-ink">{t.name}</td>
                      <td className="px-5 py-3 text-slate-600">{t.capacityLabel}</td>
                      <td className="px-5 py-3 text-slate-500">{t.exampleUse}</td>
                      <td className="px-5 py-3 text-right font-medium text-ink">{formatINR(t.baseFare)}</td>
                      <td className="px-5 py-3 text-right font-medium text-brand">{formatINR(t.perKmRate)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div className="mt-8 text-center">
            <Link to="/signup" className="btn-primary px-6 py-3 text-base">
              Book a truck <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
