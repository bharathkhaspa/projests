import { useMemo, useState } from 'react'
import { ClipboardList, Search } from 'lucide-react'
import { Page } from '@/components/app/Page'
import { PageHeader } from '@/components/ui/PageHeader'
import { EmptyState } from '@/components/ui/EmptyState'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { useStore } from '@/store/useStore'
import { cn, formatDate, formatINR } from '@/lib/utils'
import type { BookingStatus } from '@/lib/types'

const FILTERS: { id: 'all' | BookingStatus; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'pending', label: 'Pending' },
  { id: 'confirmed', label: 'Confirmed' },
  { id: 'in-transit', label: 'In transit' },
  { id: 'delivered', label: 'Delivered' },
  { id: 'cancelled', label: 'Cancelled' },
]

export function AdminBookingsPage() {
  const bookings = useStore((s) => s.bookings)
  const [filter, setFilter] = useState<'all' | BookingStatus>('all')
  const [q, setQ] = useState('')

  const rows = useMemo(() => {
    return bookings
      .filter((b) => (filter === 'all' ? true : b.status === filter))
      .filter((b) => {
        if (!q.trim()) return true
        const t = q.toLowerCase()
        return (
          b.shipperName.toLowerCase().includes(t) ||
          b.origin.toLowerCase().includes(t) ||
          b.destination.toLowerCase().includes(t) ||
          b.id.toLowerCase().includes(t)
        )
      })
  }, [bookings, filter, q])

  return (
    <Page>
      <PageHeader title="All Bookings" subtitle={`${bookings.length} bookings on the platform`} />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="-mx-1 flex gap-2 overflow-x-auto px-1">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={cn(
                'whitespace-nowrap rounded-full px-3.5 py-1.5 text-sm font-medium transition',
                filter === f.id ? 'bg-brand text-white' : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50',
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
        <div className="relative sm:w-64">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input className="input pl-9" placeholder="Search bookings…" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
      </div>

      {rows.length === 0 ? (
        <EmptyState icon={<ClipboardList size={24} />} title="No bookings found" description="Try a different filter or search." />
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] text-left text-sm">
              <thead className="bg-mist text-slate-600">
                <tr>
                  <th className="px-5 py-3 font-semibold">ID</th>
                  <th className="px-5 py-3 font-semibold">Shipper</th>
                  <th className="px-5 py-3 font-semibold">Transporter</th>
                  <th className="px-5 py-3 font-semibold">Route</th>
                  <th className="px-5 py-3 font-semibold">Date</th>
                  <th className="px-5 py-3 text-right font-semibold">Fare</th>
                  <th className="px-5 py-3 font-semibold">Payment</th>
                  <th className="px-5 py-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rows.map((b) => (
                  <tr key={b.id} className="hover:bg-mist/40">
                    <td className="px-5 py-3 font-mono text-xs text-slate-500">#{b.id.slice(-6).toUpperCase()}</td>
                    <td className="px-5 py-3 font-medium text-ink">{b.shipperName}</td>
                    <td className="px-5 py-3 text-slate-600">{b.transporterName ?? '—'}</td>
                    <td className="px-5 py-3 text-slate-600">{b.origin} → {b.destination}</td>
                    <td className="px-5 py-3 text-slate-500">{formatDate(b.pickupDate)}</td>
                    <td className="px-5 py-3 text-right font-semibold text-ink">{formatINR(b.fare.total)}</td>
                    <td className="px-5 py-3"><StatusBadge kind="payment" value={b.paymentStatus} /></td>
                    <td className="px-5 py-3"><StatusBadge kind="booking" value={b.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </Page>
  )
}
