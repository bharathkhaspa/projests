import type { FareBreakdown, TruckTypeId } from './types'
import { getTruckType } from './trucks'

const GST_RATE = 0.05 // 5% GST on transport of goods

/**
 * Compute a full fare estimate for a single (full-load) booking.
 *
 * fare = base fare + (distance × per-km rate by truck type) + surcharges,
 * then 5% GST is applied on the running subtotal.
 */
export function computeFare(opts: {
  truckTypeId: TruckTypeId
  distanceKm: number
  weightTons?: number
  /** Optional surcharge fraction, e.g. peak/long-haul. */
  surchargePct?: number
  surchargeLabel?: string
}): FareBreakdown {
  const truck = getTruckType(opts.truckTypeId)
  const baseFare = truck.baseFare
  const perKmRate = truck.perKmRate
  const distanceCost = Math.round(opts.distanceKm * perKmRate)

  // Long-haul surcharge applies automatically beyond 800 km unless overridden.
  let surchargePct = opts.surchargePct ?? 0
  let surchargeLabel = opts.surchargeLabel
  if (opts.surchargePct === undefined && opts.distanceKm > 800) {
    surchargePct = 0.08
    surchargeLabel = 'Long-haul surcharge (8%)'
  }

  const preSurcharge = baseFare + distanceCost
  const surcharge = Math.round(preSurcharge * surchargePct)
  const subtotal = preSurcharge + surcharge
  const gst = Math.round(subtotal * GST_RATE)
  const total = subtotal + gst

  return {
    baseFare,
    distanceKm: opts.distanceKm,
    perKmRate,
    distanceCost,
    surcharge,
    surchargeLabel: surcharge > 0 ? surchargeLabel : undefined,
    gst,
    total,
  }
}

/**
 * Part-load (shared truck) fare.
 *
 * The full-truck fare for the route is computed once, then split across
 * shippers in proportion to the weight (volume) each one occupies. A shipper
 * filling 25% of the truck pays ~25% of the full fare. Sharing also unlocks a
 * small efficiency discount versus booking a whole truck for a part load.
 */
export function computeSharedFare(opts: {
  truckTypeId: TruckTypeId
  distanceKm: number
  myWeightTons: number
  truckCapacityTons: number
}): FareBreakdown & { sharePct: number } {
  const full = computeFare({
    truckTypeId: opts.truckTypeId,
    distanceKm: opts.distanceKm,
  })

  const sharePct = clampShare(opts.myWeightTons / opts.truckCapacityTons)
  const SHARING_DISCOUNT = 0.85 // shared loads are 15% cheaper than the pro-rata full fare

  const baseFare = Math.round(full.baseFare * sharePct * SHARING_DISCOUNT)
  const distanceCost = Math.round(full.distanceCost * sharePct * SHARING_DISCOUNT)
  const surcharge = Math.round(full.surcharge * sharePct * SHARING_DISCOUNT)
  const subtotal = baseFare + distanceCost + surcharge
  const gst = Math.round(subtotal * GST_RATE)
  const total = subtotal + gst

  return {
    baseFare,
    distanceKm: opts.distanceKm,
    perKmRate: full.perKmRate,
    distanceCost,
    surcharge,
    surchargeLabel: surcharge > 0 ? `Shared route surcharge` : undefined,
    gst,
    total,
    sharePct,
  }
}

function clampShare(v: number): number {
  if (!Number.isFinite(v) || v <= 0) return 0.1
  return Math.min(v, 1)
}
