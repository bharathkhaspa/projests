import type { FareBreakdown } from '@/lib/types'
import { formatINR } from '@/lib/utils'

export function FareBreakdownCard({
  fare,
  sharePct,
}: {
  fare: FareBreakdown
  sharePct?: number
}) {
  const rows: { label: string; value: string; muted?: boolean }[] = [
    { label: 'Base fare', value: formatINR(fare.baseFare) },
    {
      label: `Distance · ${fare.distanceKm} km × ${formatINR(fare.perKmRate)}/km`,
      value: formatINR(fare.distanceCost),
    },
  ]
  if (fare.surcharge > 0) {
    rows.push({ label: fare.surchargeLabel ?? 'Surcharge', value: formatINR(fare.surcharge) })
  }
  rows.push({ label: 'GST (5%)', value: formatINR(fare.gst), muted: true })

  return (
    <div className="rounded-2xl border border-slate-200 bg-mist/60 p-4">
      {sharePct !== undefined && (
        <div className="mb-3 flex items-center justify-between rounded-xl bg-accent-50 px-3 py-2 text-sm">
          <span className="font-medium text-accent-700">Your share of the truck</span>
          <span className="font-bold text-accent-700">{Math.round(sharePct * 100)}%</span>
        </div>
      )}
      <dl className="space-y-2">
        {rows.map((r) => (
          <div key={r.label} className="flex items-center justify-between text-sm">
            <dt className={r.muted ? 'text-slate-400' : 'text-slate-600'}>{r.label}</dt>
            <dd className={r.muted ? 'text-slate-500' : 'font-medium text-ink'}>{r.value}</dd>
          </div>
        ))}
      </dl>
      <div className="mt-3 flex items-center justify-between border-t border-slate-200 pt-3">
        <span className="text-sm font-semibold text-ink">Total estimate</span>
        <span className="text-xl font-extrabold text-brand">{formatINR(fare.total)}</span>
      </div>
    </div>
  )
}
