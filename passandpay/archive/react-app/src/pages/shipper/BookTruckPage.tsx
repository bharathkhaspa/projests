import { useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import {
  MapPin,
  Navigation,
  Calendar,
  Package,
  Weight,
  Truck as TruckIcon,
  Split,
  Check,
  ArrowRight,
  ArrowLeft,
  Users,
  Info,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { Page } from '@/components/app/Page'
import { PageHeader } from '@/components/ui/PageHeader'
import { CityPicker } from '@/components/ui/CityPicker'
import { MapView } from '@/components/MapView'
import { FareBreakdownCard } from '@/components/ui/FareBreakdown'
import { TRUCK_TYPES, getTruckType } from '@/lib/trucks'
import { getCity, roadDistanceKm } from '@/lib/cities'
import { computeFare, computeSharedFare } from '@/lib/fare'
import { useStore } from '@/store/useStore'
import { cn } from '@/lib/utils'
import type { LoadMode, TruckTypeId } from '@/lib/types'

const STEPS = ['Route', 'Cargo', 'Review']

export function BookTruckPage() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const createBooking = useStore((s) => s.createBooking)
  const shareGroups = useStore((s) => s.shareGroups)
  const today = new Date().toISOString().slice(0, 10)

  const [step, setStep] = useState(0)
  const [origin, setOrigin] = useState(params.get('origin') ?? '')
  const [destination, setDestination] = useState(params.get('destination') ?? '')
  const [date, setDate] = useState(params.get('date') ?? today)
  const [truckTypeId, setTruckTypeId] = useState<TruckTypeId>((params.get('truck') as TruckTypeId) ?? 'eicher14')
  const [goodsType, setGoodsType] = useState('')
  const [weight, setWeight] = useState('')
  const [mode, setMode] = useState<LoadMode>('full')

  const truck = getTruckType(truckTypeId)
  const weightNum = Math.max(0, parseFloat(weight) || 0)
  const distanceKm = origin && destination && origin !== destination ? roadDistanceKm(origin, destination) : 0

  const fare = useMemo(() => {
    if (!distanceKm) return null
    if (mode === 'shared') {
      return computeSharedFare({
        truckTypeId,
        distanceKm,
        myWeightTons: weightNum || truck.capacityTons * 0.3,
        truckCapacityTons: truck.capacityTons,
      })
    }
    return computeFare({ truckTypeId, distanceKm })
  }, [distanceKm, mode, truckTypeId, weightNum, truck.capacityTons])

  // Existing share group a part-load would join.
  const matchingGroup = useMemo(() => {
    if (mode !== 'shared' || !origin || !destination) return null
    return shareGroups.find(
      (g) =>
        g.truckTypeId === truckTypeId &&
        g.origin === origin &&
        g.destination === destination &&
        new Date(g.pickupDate).toDateString() === new Date(date).toDateString() &&
        g.usedTons + weightNum <= g.capacityTons,
    )
  }, [mode, origin, destination, truckTypeId, date, weightNum, shareGroups])

  const step0Valid = origin && destination && origin !== destination && date
  const step1Valid = goodsType.trim() && weightNum > 0 && weightNum <= truck.capacityTons

  const confirm = () => {
    const booking = createBooking({
      origin,
      destination,
      goodsType: goodsType.trim(),
      weightTons: weightNum,
      truckTypeId,
      pickupDate: new Date(date).toISOString(),
      mode,
    })
    toast.success('Booking created! Searching for transporters…')
    navigate(`/app/tracking/${booking.id}`)
  }

  return (
    <Page>
      <PageHeader title="Book a Truck" subtitle="Post your load and get an instant fare estimate." />

      {/* Stepper */}
      <ol className="flex items-center gap-2">
        {STEPS.map((label, i) => (
          <li key={label} className="flex flex-1 items-center gap-2">
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  'grid h-8 w-8 shrink-0 place-items-center rounded-full text-sm font-bold transition',
                  i < step ? 'bg-success text-white' : i === step ? 'bg-brand text-white' : 'bg-slate-200 text-slate-500',
                )}
              >
                {i < step ? <Check size={16} /> : i + 1}
              </span>
              <span className={cn('text-sm font-medium', i === step ? 'text-ink' : 'text-slate-400')}>{label}</span>
            </div>
            {i < STEPS.length - 1 && <span className={cn('h-px flex-1', i < step ? 'bg-success' : 'bg-slate-200')} />}
          </li>
        ))}
      </ol>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {/* STEP 0 — Route */}
          {step === 0 && (
            <div className="card animate-fade-in space-y-4 p-6">
              <h2 className="font-bold text-ink">Where are you shipping?</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="label flex items-center gap-1.5"><MapPin size={14} className="text-brand" /> Pickup city</label>
                  <CityPicker value={origin} onChange={setOrigin} exclude={destination} placeholder="From" />
                </div>
                <div>
                  <label className="label flex items-center gap-1.5"><Navigation size={14} className="text-accent" /> Drop city</label>
                  <CityPicker value={destination} onChange={setDestination} exclude={origin} placeholder="To" />
                </div>
              </div>
              <div>
                <label className="label flex items-center gap-1.5"><Calendar size={14} className="text-brand" /> Pickup date</label>
                <input type="date" min={today} className="input" value={date} onChange={(e) => setDate(e.target.value)} />
              </div>
              {distanceKm > 0 && (
                <div className="rounded-xl bg-brand-50 px-4 py-3 text-sm text-brand">
                  Estimated route distance: <strong>{distanceKm} km</strong>
                </div>
              )}
            </div>
          )}

          {/* STEP 1 — Cargo */}
          {step === 1 && (
            <div className="space-y-6 animate-fade-in">
              <div className="card space-y-4 p-6">
                <h2 className="font-bold text-ink">Choose your truck</h2>
                <div className="grid gap-3 sm:grid-cols-2">
                  {TRUCK_TYPES.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setTruckTypeId(t.id)}
                      className={cn(
                        'flex items-center gap-3 rounded-2xl border-2 p-3 text-left transition',
                        truckTypeId === t.id ? 'border-brand bg-brand-50' : 'border-slate-200 hover:border-slate-300',
                      )}
                    >
                      <img src={t.image} alt={t.name} loading="lazy" className="h-14 w-16 shrink-0 rounded-lg object-cover" />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-ink">{t.name}</p>
                        <p className="text-xs text-slate-500">{t.capacityLabel} · ₹{t.perKmRate}/km</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="card space-y-4 p-6">
                <h2 className="font-bold text-ink">What are you shipping?</h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="label flex items-center gap-1.5"><Package size={14} className="text-brand" /> Goods type</label>
                    <input className="input" placeholder="e.g. Furniture, electronics" value={goodsType} onChange={(e) => setGoodsType(e.target.value)} />
                  </div>
                  <div>
                    <label className="label flex items-center gap-1.5"><Weight size={14} className="text-brand" /> Weight (tons)</label>
                    <input type="number" step="0.1" min="0.1" max={truck.capacityTons} className="input" placeholder={`Max ${truck.capacityTons} ton`} value={weight} onChange={(e) => setWeight(e.target.value)} />
                    {weightNum > truck.capacityTons && (
                      <p className="mt-1 text-xs text-danger">Exceeds {truck.name} capacity ({truck.capacityTons} ton).</p>
                    )}
                  </div>
                </div>

                {/* Load mode */}
                <div>
                  <label className="label">Load type</label>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <ModeOption
                      active={mode === 'full'}
                      onClick={() => setMode('full')}
                      icon={<TruckIcon size={18} />}
                      title="Full Truck Load"
                      desc="Book the entire truck for your goods."
                    />
                    <ModeOption
                      active={mode === 'shared'}
                      onClick={() => setMode('shared')}
                      icon={<Split size={18} />}
                      title="Part Load (Shared)"
                      desc="Share the truck & split the fare by weight."
                    />
                  </div>
                </div>

                {mode === 'shared' && (
                  <div className="flex items-start gap-2 rounded-xl bg-accent-50 px-4 py-3 text-sm text-accent-700">
                    <Info size={16} className="mt-0.5 shrink-0" />
                    {matchingGroup ? (
                      <span>
                        Great news — an existing shared truck on <strong>{origin} → {destination}</strong> has room.
                        You'll join {matchingGroup.bookingIds.length} other shipment(s) and split the cost.
                      </span>
                    ) : (
                      <span>We'll start a new shared truck for this route and match other part-loads going the same way.</span>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* STEP 2 — Review */}
          {step === 2 && fare && (
            <div className="card animate-fade-in space-y-4 p-6">
              <h2 className="font-bold text-ink">Review your booking</h2>
              <MapView origin={getCity(origin)!.coord} destination={getCity(destination)!.coord} originLabel={origin} destinationLabel={destination} height={200} />
              <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
                <Detail label="Route" value={`${origin} → ${destination}`} />
                <Detail label="Distance" value={`${distanceKm} km`} />
                <Detail label="Truck" value={truck.name} />
                <Detail label="Load type" value={mode === 'shared' ? 'Part load (shared)' : 'Full truck load'} />
                <Detail label="Goods" value={goodsType} />
                <Detail label="Weight" value={`${weightNum} ton`} />
              </dl>
            </div>
          )}

          {/* Nav buttons */}
          <div className="flex items-center justify-between">
            {step > 0 ? (
              <button className="btn-outline" onClick={() => setStep((s) => s - 1)}>
                <ArrowLeft size={16} /> Back
              </button>
            ) : (
              <span />
            )}
            {step < 2 ? (
              <button
                className="btn-primary"
                disabled={(step === 0 && !step0Valid) || (step === 1 && !step1Valid)}
                onClick={() => setStep((s) => s + 1)}
              >
                Continue <ArrowRight size={16} />
              </button>
            ) : (
              <button className="btn-primary" onClick={confirm}>
                <Check size={16} /> Confirm booking
              </button>
            )}
          </div>
        </div>

        {/* Fare summary sidebar */}
        <div className="space-y-4">
          <div className="card sticky top-20 p-5">
            <h3 className="mb-3 font-bold text-ink">Fare estimate</h3>
            {fare ? (
              <FareBreakdownCard fare={fare} sharePct={'sharePct' in fare ? (fare.sharePct as number) : undefined} />
            ) : (
              <p className="rounded-xl bg-mist p-4 text-sm text-slate-500">
                Select pickup and drop cities to see your estimated fare.
              </p>
            )}
            {mode === 'shared' && fare && (
              <p className="mt-3 flex items-center gap-1.5 text-xs text-success">
                <Users size={13} /> You're saving ~15% vs a full truck for this part load.
              </p>
            )}
            <p className="mt-3 text-center text-xs text-slate-400">No booking fee · Pay on delivery</p>
          </div>
        </div>
      </div>
    </Page>
  )
}

function ModeOption({ active, onClick, icon, title, desc }: { active: boolean; onClick: () => void; icon: React.ReactNode; title: string; desc: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex items-start gap-3 rounded-2xl border-2 p-4 text-left transition',
        active ? 'border-brand bg-brand-50' : 'border-slate-200 hover:border-slate-300',
      )}
    >
      <span className={cn('grid h-10 w-10 shrink-0 place-items-center rounded-xl', active ? 'bg-brand text-white' : 'bg-slate-100 text-slate-500')}>
        {icon}
      </span>
      <span>
        <span className="block text-sm font-semibold text-ink">{title}</span>
        <span className="block text-xs text-slate-500">{desc}</span>
      </span>
    </button>
  )
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs text-slate-400">{label}</dt>
      <dd className="font-medium text-ink">{value || '—'}</dd>
    </div>
  )
}
