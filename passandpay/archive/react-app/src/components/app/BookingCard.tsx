import { Link } from 'react-router-dom'
import { ArrowRight, Package, Weight, Calendar, Split, Truck as TruckIcon } from 'lucide-react'
import type { Booking } from '@/lib/types'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { getTruckType } from '@/lib/trucks'
import { formatDate, formatINR } from '@/lib/utils'

export function BookingCard({
  booking,
  trackHref,
  footer,
  perspective = 'shipper',
}: {
  booking: Booking
  trackHref?: string
  footer?: React.ReactNode
  perspective?: 'shipper' | 'transporter'
}) {
  const truck = getTruckType(booking.truckTypeId)
  return (
    <div className="card overflow-hidden">
      <div className="flex flex-col gap-3 p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
            <span className="font-mono">#{booking.id.slice(-6).toUpperCase()}</span>
            {booking.mode === 'shared' && (
              <span className="badge bg-accent-50 text-accent-700">
                <Split size={12} /> Shared
              </span>
            )}
          </div>
          <StatusBadge kind="booking" value={booking.status} />
        </div>

        {/* Route */}
        <div className="flex items-center gap-2">
          <div className="flex flex-col items-center pt-1">
            <span className="h-2.5 w-2.5 rounded-full bg-brand" />
            <span className="my-0.5 h-7 w-px border-l border-dashed border-slate-300" />
            <span className="h-2.5 w-2.5 rounded-full bg-accent" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-ink">{booking.origin}</p>
            <p className="mt-3 text-sm font-semibold text-ink">{booking.destination}</p>
          </div>
          <div className="text-right">
            <p className="text-lg font-extrabold text-brand">{formatINR(booking.fare.total)}</p>
            <p className="text-xs text-slate-400">{booking.distanceKm} km</p>
          </div>
        </div>

        {/* Meta */}
        <div className="grid grid-cols-2 gap-x-4 gap-y-2 rounded-xl bg-mist/60 p-3 text-xs text-slate-600 sm:grid-cols-4">
          <Meta icon={<TruckIcon size={13} />} label={truck.name.split(' (')[0]} />
          <Meta icon={<Package size={13} />} label={booking.goodsType} />
          <Meta icon={<Weight size={13} />} label={`${booking.weightTons} ton`} />
          <Meta icon={<Calendar size={13} />} label={formatDate(booking.pickupDate)} />
        </div>

        {perspective === 'shipper' && booking.transporterName && (
          <p className="text-xs text-slate-500">
            Transporter: <span className="font-medium text-ink">{booking.transporterName}</span>
          </p>
        )}
        {perspective === 'transporter' && (
          <p className="text-xs text-slate-500">
            Shipper: <span className="font-medium text-ink">{booking.shipperName}</span>
          </p>
        )}

        {trackHref && ['confirmed', 'picked-up', 'in-transit', 'delivered'].includes(booking.status) && (
          <Link to={trackHref} className="inline-flex items-center gap-1 text-sm font-semibold text-accent hover:underline">
            Track shipment <ArrowRight size={14} />
          </Link>
        )}
      </div>
      {footer && <div className="border-t border-slate-100 bg-mist/40 px-5 py-3">{footer}</div>}
    </div>
  )
}

function Meta({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <span className="flex items-center gap-1.5 truncate">
      <span className="text-slate-400">{icon}</span>
      <span className="truncate">{label}</span>
    </span>
  )
}
