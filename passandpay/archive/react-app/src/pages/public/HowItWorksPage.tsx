import { Link } from 'react-router-dom'
import {
  PackagePlus,
  Search,
  Truck,
  MapPinned,
  CreditCard,
  Star,
  Users,
  Split,
  ArrowRight,
} from 'lucide-react'
import { SectionHeading } from './HomePage'

const BOOKING_STEPS = [
  { icon: PackagePlus, title: 'Post your load', desc: 'Add pickup & drop locations, goods type, weight and preferred truck. Get an instant fare estimate.' },
  { icon: Search, title: 'Choose full or shared', desc: 'Book the whole truck, or mark your load as shareable to split costs with others on the same route.' },
  { icon: Truck, title: 'Transporter accepts', desc: 'A verified, nearby transporter accepts your booking. You both get each other’s contact details.' },
  { icon: MapPinned, title: 'Track live', desc: 'Watch the truck move in real time through every status: picked up → in transit → delivered.' },
  { icon: CreditCard, title: 'Pay on delivery', desc: 'Pay securely online once your goods arrive. Download a GST invoice instantly.' },
  { icon: Star, title: 'Rate the trip', desc: 'Rate your transporter. Great ratings keep our network reliable for everyone.' },
]

export function HowItWorksPage() {
  return (
    <div>
      <section className="bg-brand-900 py-16 text-center sm:py-20">
        <div className="container-px">
          <h1 className="text-4xl font-extrabold text-white sm:text-5xl">How Pass &amp; Pay works</h1>
          <p className="mx-auto mt-4 max-w-xl text-slate-300">
            Booking a truck should be as easy as booking a cab. Here's the whole journey — for both
            shippers and transporters.
          </p>
        </div>
      </section>

      <section className="container-px py-16 sm:py-20">
        <SectionHeading eyebrow="For shippers" title="From load to delivery" />
        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {BOOKING_STEPS.map((s, i) => (
            <div key={s.title} className="card relative p-7">
              <span className="absolute -top-4 left-7 grid h-9 w-9 place-items-center rounded-xl bg-brand font-bold text-white shadow-soft">
                {i + 1}
              </span>
              <div className="mb-4 mt-2 grid h-12 w-12 place-items-center rounded-2xl bg-accent-50 text-accent-600">
                <s.icon size={24} />
              </div>
              <h3 className="text-lg font-bold text-ink">{s.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-500">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Part-load explainer */}
      <section className="bg-white py-16 sm:py-20">
        <div className="container-px grid gap-10 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="text-sm font-bold uppercase tracking-wide text-accent">Truck sharing</p>
            <h2 className="mt-2 text-3xl font-extrabold text-ink sm:text-4xl">Part-load? Share the truck, split the cost.</h2>
            <p className="mt-4 text-slate-500">
              If your goods don't fill a whole truck, mark the load as <strong>shareable</strong>. We group it with other
              shipments going the same way on the same day until the truck is full — and each shipper pays only for the
              space they use.
            </p>
            <ul className="mt-6 space-y-4">
              {[
                { icon: Split, title: 'Proportional pricing', desc: 'Fare is split by the weight/volume each shipper occupies.' },
                { icon: Users, title: 'Same-route matching', desc: 'We match loads with the same origin → destination and date window.' },
                { icon: Truck, title: 'One truck, many loads', desc: 'Capacity is filled efficiently, cutting cost and empty miles.' },
              ].map((f) => (
                <li key={f.title} className="flex gap-3">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand">
                    <f.icon size={20} />
                  </span>
                  <div>
                    <p className="font-semibold text-ink">{f.title}</p>
                    <p className="text-sm text-slate-500">{f.desc}</p>
                  </div>
                </li>
              ))}
            </ul>
            <Link to="/signup" className="btn-primary mt-8">
              Try part-load booking <ArrowRight size={16} />
            </Link>
          </div>
          <div className="overflow-hidden rounded-3xl shadow-card">
            <img
              src="https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&w=900&q=70"
              alt="Container truck being loaded at a logistics warehouse"
              loading="lazy"
              className="h-full w-full object-cover"
            />
          </div>
        </div>
      </section>

      <section className="container-px py-16 text-center">
        <h2 className="text-2xl font-extrabold text-ink sm:text-3xl">Ready in two minutes</h2>
        <p className="mx-auto mt-3 max-w-md text-slate-500">Create a free account and post your first load today.</p>
        <Link to="/signup" className="btn-primary mt-6 px-6 py-3 text-base">
          Get started <ArrowRight size={18} />
        </Link>
      </section>
    </div>
  )
}
