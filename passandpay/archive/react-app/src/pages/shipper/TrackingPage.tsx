import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { MapPin, Phone, Package, Weight, Truck as TruckIcon, Star, CheckCircle2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { Page } from '@/components/app/Page'
import { PageHeader } from '@/components/ui/PageHeader'
import { MapView } from '@/components/MapView'
import { EmptyState } from '@/components/ui/EmptyState'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { Timeline } from '@/components/app/Timeline'
import { Modal } from '@/components/ui/Modal'
import { RatingInput } from '@/components/ui/Stars'
import { useStore } from '@/store/useStore'
import { getTruckType } from '@/lib/trucks'
import { formatINR } from '@/lib/utils'

export function TrackingPage() {
  const { bookingId } = useParams()
  const user = useStore((s) => s.currentUser())!
  const bookings = useStore((s) => s.bookings)
  const rateTransporter = useStore((s) => s.rateTransporter)

  const mine = useMemo(
    () => bookings.filter((b) => b.shipperId === user.id && b.status !== 'cancelled'),
    [bookings, user.id],
  )
  const trackable = mine.filter((b) => b.status !== 'pending')
  const selected = bookingId ? bookings.find((b) => b.id === bookingId) : trackable[0]

  const [rateOpen, setRateOpen] = useState(false)
  const [rating, setRating] = useState(5)

  if (!selected) {
    return (
      <Page>
        <PageHeader title="Live Tracking" subtitle="Follow your shipments in real time." />
        <EmptyState
          icon={<MapPin size={24} />}
          title="Nothing to track yet"
          description="Once a transporter confirms your booking, you'll be able to track it live here."
          action={<Link to="/app/book" className="btn-primary">Book a Truck</Link>}
        />
      </Page>
    )
  }

  const truck = getTruckType(selected.truckTypeId)
  const submitRating = () => {
    rateTransporter(selected.id, rating)
    setRateOpen(false)
    toast.success('Thanks for rating your transporter!')
  }

  return (
    <Page>
      <PageHeader
        title="Live Tracking"
        subtitle={`Shipment #${selected.id.slice(-6).toUpperCase()}`}
        actions={<StatusBadge kind="booking" value={selected.status} />}
      />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Map + route */}
        <div className="space-y-4 lg:col-span-2">
          <MapView
            origin={selected.originCoord}
            destination={selected.destinationCoord}
            current={selected.currentCoord}
            originLabel={selected.origin}
            destinationLabel={selected.destination}
            live={selected.status === 'in-transit'}
            height={360}
          />

          <div className="card p-5">
            <h3 className="mb-4 font-bold text-ink">Trip status</h3>
            <Timeline events={selected.timeline} />
          </div>
        </div>

        {/* Details */}
        <div className="space-y-4">
          <div className="card p-5">
            <h3 className="font-bold text-ink">Shipment details</h3>
            <dl className="mt-3 space-y-3 text-sm">
              <Row icon={<MapPin size={15} />} label="Route" value={`${selected.origin} → ${selected.destination}`} />
              <Row icon={<TruckIcon size={15} />} label="Truck" value={truck.name} />
              <Row icon={<Package size={15} />} label="Goods" value={selected.goodsType} />
              <Row icon={<Weight size={15} />} label="Weight" value={`${selected.weightTons} ton`} />
            </dl>
            <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4">
              <span className="text-sm text-slate-500">Fare</span>
              <span className="text-lg font-extrabold text-brand">{formatINR(selected.fare.total)}</span>
            </div>
          </div>

          {selected.transporterName && (
            <div className="card p-5">
              <h3 className="font-bold text-ink">Your transporter</h3>
              <div className="mt-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-ink">{selected.transporterName}</p>
                  <p className="text-xs text-slate-500">{truck.name}</p>
                </div>
                <a href="tel:+919910044556" className="btn-outline">
                  <Phone size={15} /> Call
                </a>
              </div>
            </div>
          )}

          {selected.status === 'delivered' && (
            <div className="card p-5">
              <div className="flex items-center gap-2 text-success">
                <CheckCircle2 size={20} />
                <p className="font-semibold">Delivered successfully</p>
              </div>
              {selected.transporterRating ? (
                <p className="mt-2 flex items-center gap-1.5 text-sm text-slate-500">
                  You rated this trip <Star size={14} className="fill-amber-400 text-amber-400" /> {selected.transporterRating}
                </p>
              ) : (
                <button onClick={() => setRateOpen(true)} className="btn-primary mt-3 w-full">
                  <Star size={15} /> Rate your transporter
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Other shipments quick-switch */}
      {trackable.length > 1 && (
        <div>
          <h3 className="mb-3 font-bold text-ink">Other shipments</h3>
          <div className="flex gap-3 overflow-x-auto pb-2">
            {trackable.filter((b) => b.id !== selected.id).map((b) => (
              <Link key={b.id} to={`/app/tracking/${b.id}`} className="card min-w-[220px] shrink-0 p-4 hover:shadow-soft">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-slate-400">#{b.id.slice(-6).toUpperCase()}</span>
                  <StatusBadge kind="booking" value={b.status} className="scale-90" />
                </div>
                <p className="mt-2 text-sm font-semibold text-ink">{b.origin} → {b.destination}</p>
                <p className="text-xs text-slate-500">{b.goodsType}</p>
              </Link>
            ))}
          </div>
        </div>
      )}

      <Modal
        open={rateOpen}
        onClose={() => setRateOpen(false)}
        title="Rate your transporter"
        footer={
          <>
            <button className="btn-outline" onClick={() => setRateOpen(false)}>Cancel</button>
            <button className="btn-primary" onClick={submitRating}>Submit rating</button>
          </>
        }
      >
        <div className="flex flex-col items-center gap-4 py-2">
          <p className="text-sm text-slate-600">How was your experience with <strong>{selected.transporterName}</strong>?</p>
          <RatingInput value={rating} onChange={setRating} />
          <p className="text-sm font-medium text-slate-500">{['Poor', 'Fair', 'Good', 'Very good', 'Excellent'][rating - 1]}</p>
        </div>
      </Modal>
    </Page>
  )
}

function Row({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="flex items-center gap-2 text-slate-500"><span className="text-slate-400">{icon}</span>{label}</dt>
      <dd className="text-right font-medium text-ink">{value}</dd>
    </div>
  )
}
