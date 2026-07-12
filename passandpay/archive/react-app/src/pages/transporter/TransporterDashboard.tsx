import { Link } from 'react-router-dom'
import { useMemo } from 'react'
import { Wallet, Route, Truck, Boxes, ArrowRight, TrendingUp, Star } from 'lucide-react'
import { Page } from '@/components/app/Page'
import { PageHeader } from '@/components/ui/PageHeader'
import { StatCard } from '@/components/ui/StatCard'
import { BookingCard } from '@/components/app/BookingCard'
import { EmptyState } from '@/components/ui/EmptyState'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { useStore } from '@/store/useStore'
import { formatINR } from '@/lib/utils'

export function TransporterDashboard() {
  const user = useStore((s) => s.currentUser())!
  const bookings = useStore((s) => s.bookings)
  const trucks = useStore((s) => s.trucks)

  const myTrucks = useMemo(() => trucks.filter((t) => t.ownerId === user.id), [trucks, user.id])
  const myTrips = useMemo(() => bookings.filter((b) => b.transporterId === user.id), [bookings, user.id])
  const active = myTrips.filter((b) => ['confirmed', 'picked-up', 'in-transit'].includes(b.status))
  const completed = myTrips.filter((b) => b.status === 'delivered')
  const earnings = completed.reduce((s, b) => s + b.fare.total, 0)
  const openLoads = bookings.filter((b) => b.status === 'pending').length

  return (
    <Page>
      <PageHeader
        title={`Welcome, ${user.name.split(' ')[0]} 🚛`}
        subtitle="Your fleet at a glance."
        actions={<Link to="/transporter/loads" className="btn-primary"><Boxes size={16} /> Find loads</Link>}
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Total earnings" value={formatINR(earnings)} icon={<Wallet size={20} />} accent="success" trend="+12% this month" />
        <StatCard label="Active trips" value={active.length} icon={<Route size={20} />} accent="brand" />
        <StatCard label="My trucks" value={myTrucks.length} icon={<Truck size={20} />} accent="accent" />
        <StatCard label="Open loads" value={openLoads} icon={<Boxes size={20} />} accent="brand" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Active trips */}
        <div className="lg:col-span-2">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-bold text-ink">Active trips</h2>
            <Link to="/transporter/trips" className="text-sm font-semibold text-brand hover:underline">Manage</Link>
          </div>
          {active.length === 0 ? (
            <EmptyState
              icon={<Route size={24} />}
              title="No active trips"
              description="Accept a load to start earning."
              action={<Link to="/transporter/loads" className="btn-primary">Browse loads</Link>}
            />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {active.slice(0, 4).map((b) => (
                <BookingCard key={b.id} booking={b} perspective="transporter" />
              ))}
            </div>
          )}
        </div>

        {/* Fleet + performance */}
        <div className="space-y-4">
          <div className="card p-5">
            <h2 className="mb-3 font-bold text-ink">My fleet</h2>
            {myTrucks.length === 0 ? (
              <p className="text-sm text-slate-500">No trucks added yet.</p>
            ) : (
              <ul className="space-y-3">
                {myTrucks.map((t) => (
                  <li key={t.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="grid h-9 w-9 place-items-center rounded-lg bg-brand-50 text-brand"><Truck size={16} /></span>
                      <div>
                        <p className="text-sm font-semibold text-ink">{t.registrationNo}</p>
                        <p className="text-xs text-slate-500">{t.modelName}</p>
                      </div>
                    </div>
                    <StatusBadge kind="truck" value={t.status} className="scale-90" />
                  </li>
                ))}
              </ul>
            )}
            <Link to="/transporter/trucks" className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-accent hover:underline">
              Manage trucks <ArrowRight size={14} />
            </Link>
          </div>

          <div className="card p-5">
            <h2 className="mb-3 font-bold text-ink">Performance</h2>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-slate-500"><Star size={15} className="text-amber-400" /> Rating</span>
                <span className="font-semibold text-ink">{user.rating ?? '—'} / 5</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-slate-500"><TrendingUp size={15} className="text-success" /> Completed trips</span>
                <span className="font-semibold text-ink">{completed.length}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Page>
  )
}
