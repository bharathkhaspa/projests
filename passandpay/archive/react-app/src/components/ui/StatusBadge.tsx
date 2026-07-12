import { cn } from '@/lib/utils'
import type { BookingStatus, KycStatus, PaymentStatus, TruckStatus } from '@/lib/types'

const BOOKING_STYLES: Record<BookingStatus, { label: string; cls: string }> = {
  pending: { label: 'Pending', cls: 'bg-amber-100 text-amber-800' },
  confirmed: { label: 'Confirmed', cls: 'bg-blue-100 text-blue-800' },
  'picked-up': { label: 'Picked up', cls: 'bg-indigo-100 text-indigo-800' },
  'in-transit': { label: 'In transit', cls: 'bg-violet-100 text-violet-800' },
  delivered: { label: 'Delivered', cls: 'bg-green-100 text-green-800' },
  cancelled: { label: 'Cancelled', cls: 'bg-rose-100 text-rose-800' },
}

const PAYMENT_STYLES: Record<PaymentStatus, { label: string; cls: string }> = {
  unpaid: { label: 'Unpaid', cls: 'bg-rose-100 text-rose-800' },
  paid: { label: 'Paid', cls: 'bg-green-100 text-green-800' },
  refunded: { label: 'Refunded', cls: 'bg-slate-200 text-slate-700' },
}

const KYC_STYLES: Record<KycStatus, { label: string; cls: string }> = {
  unverified: { label: 'Unverified', cls: 'bg-slate-200 text-slate-700' },
  pending: { label: 'Pending review', cls: 'bg-amber-100 text-amber-800' },
  verified: { label: 'Verified', cls: 'bg-green-100 text-green-800' },
  rejected: { label: 'Rejected', cls: 'bg-rose-100 text-rose-800' },
}

const TRUCK_STYLES: Record<TruckStatus, { label: string; cls: string }> = {
  available: { label: 'Available', cls: 'bg-green-100 text-green-800' },
  'on-trip': { label: 'On trip', cls: 'bg-violet-100 text-violet-800' },
  maintenance: { label: 'Maintenance', cls: 'bg-amber-100 text-amber-800' },
}

type Props =
  | { kind: 'booking'; value: BookingStatus; className?: string }
  | { kind: 'payment'; value: PaymentStatus; className?: string }
  | { kind: 'kyc'; value: KycStatus; className?: string }
  | { kind: 'truck'; value: TruckStatus; className?: string }

export function StatusBadge(props: Props) {
  let cfg: { label: string; cls: string }
  if (props.kind === 'booking') cfg = BOOKING_STYLES[props.value]
  else if (props.kind === 'payment') cfg = PAYMENT_STYLES[props.value]
  else if (props.kind === 'kyc') cfg = KYC_STYLES[props.value]
  else cfg = TRUCK_STYLES[props.value]

  return (
    <span className={cn('badge', cfg.cls, props.className)}>
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
      {cfg.label}
    </span>
  )
}
