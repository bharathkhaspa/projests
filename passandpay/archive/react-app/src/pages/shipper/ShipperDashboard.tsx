import { Link } from 'react-router-dom'
import { useMemo } from 'react'
import {
  PackagePlus,
  ClipboardList,
  MapPin,
  Wallet,
  Truck,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react'
import { Page } from '@/components/app/Page'
import { PageHeader } from '@/components/ui/PageHeader'
import { StatCard } from '@/components/ui/StatCard'
import { BookingCard } from '@/components/app/BookingCard'
import { MapView } from '@/components/MapView'
import { EmptyState } from '@/components/ui/EmptyState'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { useStore } from '@/store/useStore'
import { formatINR } from '@/lib/utils'

export function ShipperDashboard() {
  const user = useStore((s) => s.currentUser())!
  const bookings = useStore((s) => s.bookings)

  const mine = useMemo(
    () => bookings.filter((b) => b.shipperId === user.id),
    [bookings, user.id],
  )
  const active = mine.filter((b) => ['pending', 'confirmed', 'picked-up', 'in-transit'].includes(b.status))
  const delivered = mine.filter((b) => b.status === 'delivered')
  const totalSpend = mine.filter((b) => b.paymentStatus === 'paid').reduce((sum, b) => sum + b.fare.total, 0)
  const tracking = mine.find((b) => b.status === 'in-transit') ?? mine.find((b) => ['picked-up', 'confirmed'].includes(b.status))

  return (
    <Page>
      <PageHeader
        title={`Hi, ${user.name.split(' ')[0]} 👋`}
        subtitle="Here's what's moving today."
        actions={
          <Link to="/app/book" className="btn-primary">
            <PackagePlus size={16} /> Book a Truck
          </Link>
        }
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Active bookings" value={active.length} icon={<Truck size={20} />} accent="brand" />
        <StatCard label="Delivered" value={delivered.length} icon={<CheckCircle2 size={20} />} accent="success" />
        <StatCard label="Total bookings" value={mine.length} icon={<ClipboardList size={20} />} accent="accent" />
        <StatCard label="Total spend" value={formatINR(totalSpend)} icon={<Wallet size={20} />} accent="brand" />
      </div>

      {/* Live shipment + quick actions */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="card overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <h2 className="font-bold text-ink">Current shipment</h2>
              {tracking && <StatusBadge kind="booking" value={tracking.status} />}
            </div>
            {tracking ? (
              <div>
                <MapView
                  origin={tracking.originCoord}
                  destination={tracking.destinationCoord}
                  current={tracking.currentCoord}
                  originLabel={tracking.origin}
                  destinationLabel={tracking.destination}
                  live={tracking.status === 'in-transit'}
                  height={240}
                  className="rounded-none border-0"
                />
                <div className="flex items-center justify-between px-5 py-4">
                  <div>
                    <p className="text-sm font-semibold text-ink">
                      {tracking.origin} → {tracking.destination}
                    </p>
                    <p className="text-xs text-slate-500">{tracking.goodsType} · {tracking.weightTons} ton</p>
                  </div>
                  <Link to={`/app/tracking/${tracking.id}`} className="btn-outline">
                    Track <ArrowRight size={15} />
                  </Link>
                </div>
              </div>
            ) : (
              <div className="p-5">
                <EmptyState
                  icon={<Truck size={24} />}
                  title="No active shipment"
                  description="Book a truck to see live tracking here."
                  action={<Link to="/app/book" className="btn-primary"><PackagePlus size={16} /> Book a Truck</Link>}
                />
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="font-bold text-ink">Quick actions</h2>
          {[
            { to: '/app/book', icon: PackagePlus, label: 'Book a new truck', desc: 'Full or shared load' },
            { to: '/app/bookings', icon: ClipboardList, label: 'My bookings', desc: `${mine.length} total` },
            { to: '/app/tracking', icon: MapPin, label: 'Live tracking', desc: `${active.length} in progress` },
            { to: '/app/payments', icon: Wallet, label: 'Payments & invoices', desc: 'View & download' },
          ].map((a) => (
            <Link key={a.to} to={a.to} className="card flex items-center gap-3 p-4 transition hover:shadow-soft">
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-brand-50 text-brand">
                <a.icon size={20} />
              </span>
              <div className="flex-1">
                <p className="text-sm font-semibold text-ink">{a.label}</p>
                <p className="text-xs text-slate-500">{a.desc}</p>
              </div>
              <ArrowRight size={16} className="text-slate-300" />
            </Link>
          ))}
        </div>
      </div>

      {/* Recent bookings */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-bold text-ink">Recent bookings</h2>
          <Link to="/app/bookings" className="text-sm font-semibold text-brand hover:underline">View all</Link>
        </div>
        {mine.length === 0 ? (
          <EmptyState title="No bookings yet" description="Your bookings will appear here once you book a truck." action={<Link to="/app/book" className="btn-primary">Book a Truck</Link>} />
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {mine.slice(0, 4).map((b) => (
              <BookingCard key={b.id} booking={b} trackHref={`/app/tracking/${b.id}`} />
            ))}
          </div>
        )}
      </div>
    </Page>
  )
}
