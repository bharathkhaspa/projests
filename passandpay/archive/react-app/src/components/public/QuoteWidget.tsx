import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, IndianRupee, MapPin, Navigation, Calendar } from 'lucide-react'
import { CityPicker } from '@/components/ui/CityPicker'
import { TRUCK_TYPES } from '@/lib/trucks'
import { roadDistanceKm } from '@/lib/cities'
import { computeFare } from '@/lib/fare'
import { formatINR } from '@/lib/utils'
import type { TruckTypeId } from '@/lib/types'

/** Landing-page instant quote widget. Pre-fills the booking flow on submit. */
export function QuoteWidget() {
  const navigate = useNavigate()
  const today = new Date().toISOString().slice(0, 10)
  const [origin, setOrigin] = useState('Delhi')
  const [destination, setDestination] = useState('Jaipur')
  const [truckTypeId, setTruckTypeId] = useState<TruckTypeId>('eicher17')
  const [date, setDate] = useState(today)

  const estimate = useMemo(() => {
    if (!origin || !destination || origin === destination) return null
    const distanceKm = roadDistanceKm(origin, destination)
    if (!distanceKm) return null
    return { distanceKm, fare: computeFare({ truckTypeId, distanceKm }) }
  }, [origin, destination, truckTypeId])

  const submit = () => {
    const params = new URLSearchParams({ origin, destination, truck: truckTypeId, date })
    navigate(`/app/book?${params.toString()}`)
  }

  return (
    <div className="w-full rounded-3xl bg-white p-5 shadow-card sm:p-6">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-base font-bold text-ink">Get an instant quote</h3>
        <span className="badge bg-success/10 text-success">No hidden charges</span>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label className="label flex items-center gap-1.5">
            <MapPin size={14} className="text-brand" /> Pickup
          </label>
          <CityPicker value={origin} onChange={setOrigin} placeholder="From city" exclude={destination} />
        </div>
        <div>
          <label className="label flex items-center gap-1.5">
            <Navigation size={14} className="text-accent" /> Drop
          </label>
          <CityPicker value={destination} onChange={setDestination} placeholder="To city" exclude={origin} />
        </div>
        <div>
          <label className="label">Truck type</label>
          <select className="input" value={truckTypeId} onChange={(e) => setTruckTypeId(e.target.value as TruckTypeId)}>
            {TRUCK_TYPES.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name} · {t.capacityLabel}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="label flex items-center gap-1.5">
            <Calendar size={14} className="text-brand" /> Pickup date
          </label>
          <input type="date" className="input" min={today} value={date} onChange={(e) => setDate(e.target.value)} />
        </div>
      </div>

      <div className="mt-4 flex flex-col items-stretch gap-3 rounded-2xl bg-mist p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-medium text-slate-500">Estimated fare</p>
          {estimate ? (
            <p className="flex items-center text-2xl font-extrabold text-brand">
              <IndianRupee size={20} className="mt-0.5" />
              {formatINR(estimate.fare.total).replace('₹', '')}
              <span className="ml-2 text-xs font-medium text-slate-400">· {estimate.distanceKm} km</span>
            </p>
          ) : (
            <p className="text-sm text-slate-400">Choose two different cities</p>
          )}
        </div>
        <button onClick={submit} disabled={!estimate} className="btn-primary">
          Book this truck <ArrowRight size={16} />
        </button>
      </div>
    </div>
  )
}
