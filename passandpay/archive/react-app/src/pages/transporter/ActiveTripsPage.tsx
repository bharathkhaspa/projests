import { useMemo } from 'react'
import { Route, Phone, Navigation, ChevronRight, Package, Weight } from 'lucide-react'
import toast from 'react-hot-toast'
import { Page } from '@/components/app/Page'
import { PageHeader } from '@/components/ui/PageHeader'
import { EmptyState } from '@/components/ui/EmptyState'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { MapView } from '@/components/MapView'
import { Timeline } from '@/components/app/Timeline'
import { useStore } from '@/store/useStore'
import { getTruckType } from '@/lib/trucks'
import { formatINR } from '@/lib/utils'
import type { BookingStatus } from '@/lib/types'

const NEXT_LABEL: Partial<Record<BookingStatus, string>> = {
  confirmed: 'Mark as picked up',
  'picked-up': 'Start transit',
  'in-transit': 'Mark as delivered',
}

export function ActiveTripsPage() {
  const user = useStore((s) => s.currentUser())!
  const bookings = useStore((s) => s.bookings)
  const advanceStatus = useStore((s) => s.advanceStatus)

  const trips = useMemo(
    () => bookings.filter((b) => b.transporterId === user.id && ['confirmed', 'picked-up', 'in-transit'].includes(b.status)),
    [bookings, user.id],
  )

  const advance = (id: string, label: string) => {
    advanceStatus(id)
    toast.success(label.replace('Mark as ', '').replace('Start ', 'Now in ') + ' ✓')
  }

  return (
    <Page>
      <PageHeader title="Active Trips" subtitle="Update trip status as you go." />

      {trips.length === 0 ? (
        <EmptyState icon={<Route size={24} />} title="No active trips" description="Accept loads to see your live trips here." />
      ) : (
        <div className="space-y-6">
          {trips.map((b) => {
            const truck = getTruckType(b.truckTypeId)
            const nextLabel = NEXT_LABEL[b.status]
            return (
              <div key={b.id} className="card overflow-hidden">
                <div className="grid lg:grid-cols-2">
                  <MapView
                    origin={b.originCoord}
                    destination={b.destinationCoord}
                    current={b.currentCoord}
                    originLabel={b.origin}
                    destinationLabel={b.destination}
                    live={b.status === 'in-transit'}
                    height={260}
                    className="rounded-none border-0 lg:border-r"
                  />
                  <div className="p-5">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-xs font-mono text-slate-400">#{b.id.slice(-6).toUpperCase()}</p>
                        <h3 className="text-lg font-bold text-ink">{b.origin} → {b.destination}</h3>
                      </div>
                      <StatusBadge kind="booking" value={b.status} />
                    </div>

                    <div className="mt-3 grid grid-cols-2 gap-2 rounded-xl bg-mist/60 p-3 text-xs text-slate-600">
                      <span className="flex items-center gap-1.5"><Package size={13} /> {b.goodsType}</span>
                      <span className="flex items-center gap-1.5"><Weight size={13} /> {b.weightTons} ton</span>
                      <span className="flex items-center gap-1.5">🚚 {truck.name.split(' (')[0]}</span>
                      <span className="font-semibold text-success">{formatINR(b.fare.total)}</span>
                    </div>

                    <div className="mt-4 flex items-center justify-between rounded-xl border border-slate-100 p-3">
                      <div>
                        <p className="text-sm font-semibold text-ink">{b.shipperName}</p>
                        <p className="text-xs text-slate-500">Shipper</p>
                      </div>
                      <div className="flex gap-2">
                        <a href="tel:+919820011223" className="btn-outline px-3 py-2"><Phone size={15} /></a>
                        <a href={`https://www.google.com/maps/dir/${b.origin}/${b.destination}`} target="_blank" rel="noreferrer" className="btn-outline px-3 py-2"><Navigation size={15} /></a>
                      </div>
                    </div>

                    {nextLabel && (
                      <button onClick={() => advance(b.id, nextLabel)} className="btn-primary mt-4 w-full">
                        {nextLabel} <ChevronRight size={16} />
                      </button>
                    )}
                  </div>
                </div>
                <div className="border-t border-slate-100 p-5">
                  <Timeline events={b.timeline} />
                </div>
              </div>
            )
          })}
        </div>
      )}
    </Page>
  )
}
