import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { PackagePlus, XCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import { Page } from '@/components/app/Page'
import { PageHeader } from '@/components/ui/PageHeader'
import { BookingCard } from '@/components/app/BookingCard'
import { EmptyState } from '@/components/ui/EmptyState'
import { useStore } from '@/store/useStore'
import { cn } from '@/lib/utils'
import type { BookingStatus } from '@/lib/types'

const FILTERS: { id: 'all' | BookingStatus; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'pending', label: 'Pending' },
  { id: 'confirmed', label: 'Confirmed' },
  { id: 'in-transit', label: 'In transit' },
  { id: 'delivered', label: 'Delivered' },
  { id: 'cancelled', label: 'Cancelled' },
]

export function MyBookingsPage() {
  const user = useStore((s) => s.currentUser())!
  const bookings = useStore((s) => s.bookings)
  const cancelBooking = useStore((s) => s.cancelBooking)
  const [filter, setFilter] = useState<'all' | BookingStatus>('all')

  const mine = useMemo(
    () => bookings.filter((b) => b.shipperId === user.id),
    [bookings, user.id],
  )
  const filtered = filter === 'all' ? mine : mine.filter((b) => b.status === filter)

  const handleCancel = (id: string) => {
    cancelBooking(id)
    toast.success('Booking cancelled')
  }

  return (
    <Page>
      <PageHeader
        title="My Bookings"
        subtitle={`${mine.length} booking${mine.length === 1 ? '' : 's'} total`}
        actions={<Link to="/app/book" className="btn-primary"><PackagePlus size={16} /> New booking</Link>}
      />

      <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
        {FILTERS.map((f) => {
          const count = f.id === 'all' ? mine.length : mine.filter((b) => b.status === f.id).length
          return (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={cn(
                'whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-medium transition',
                filter === f.id ? 'bg-brand text-white' : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50',
              )}
            >
              {f.label} <span className="opacity-60">{count}</span>
            </button>
          )
        })}
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title="No bookings here"
          description={filter === 'all' ? 'Book your first truck to get started.' : `You have no ${filter} bookings.`}
          action={<Link to="/app/book" className="btn-primary">Book a Truck</Link>}
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {filtered.map((b) => (
            <BookingCard
              key={b.id}
              booking={b}
              trackHref={`/app/tracking/${b.id}`}
              footer={
                b.status === 'pending' ? (
                  <button onClick={() => handleCancel(b.id)} className="flex items-center gap-1.5 text-sm font-medium text-danger hover:underline">
                    <XCircle size={15} /> Cancel booking
                  </button>
                ) : b.status === 'delivered' && b.paymentStatus === 'unpaid' ? (
                  <Link to="/app/payments" className="text-sm font-semibold text-accent hover:underline">
                    Pay now →
                  </Link>
                ) : (
                  <span className="text-xs text-slate-400">Booked on {new Date(b.createdAt).toLocaleDateString('en-IN')}</span>
                )
              }
            />
          ))}
        </div>
      )}
    </Page>
  )
}
