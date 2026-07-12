import { useMemo, useState } from 'react'
import { Boxes, MapPin, Package, Weight, Calendar, Split, Check, AlertTriangle } from 'lucide-react'
import toast from 'react-hot-toast'
import { Page } from '@/components/app/Page'
import { PageHeader } from '@/components/ui/PageHeader'
import { EmptyState } from '@/components/ui/EmptyState'
import { Modal } from '@/components/ui/Modal'
import { CityPicker } from '@/components/ui/CityPicker'
import { useStore } from '@/store/useStore'
import { getTruckType, TRUCK_TYPES } from '@/lib/trucks'
import { cn, formatDate, formatINR } from '@/lib/utils'
import type { Booking, TruckTypeId } from '@/lib/types'

export function AvailableLoadsPage() {
  const user = useStore((s) => s.currentUser())!
  const bookings = useStore((s) => s.bookings)
  const trucks = useStore((s) => s.trucks)
  const acceptLoad = useStore((s) => s.acceptLoad)

  const [originFilter, setOriginFilter] = useState('')
  const [typeFilter, setTypeFilter] = useState<'all' | TruckTypeId>('all')
  const [target, setTarget] = useState<Booking | null>(null)
  const [chosenTruck, setChosenTruck] = useState<string>('')

  const myTrucks = useMemo(() => trucks.filter((t) => t.ownerId === user.id), [trucks, user.id])

  const open = useMemo(() => {
    return bookings
      .filter((b) => b.status === 'pending' && b.shipperId !== user.id)
      .filter((b) => (originFilter ? b.origin === originFilter : true))
      .filter((b) => (typeFilter === 'all' ? true : b.truckTypeId === typeFilter))
  }, [bookings, user.id, originFilter, typeFilter])

  // Trucks eligible for a given load: available, verified, capacity >= weight.
  const eligibleTrucks = (b: Booking) =>
    myTrucks.filter(
      (t) => t.status === 'available' && t.kycStatus === 'verified' && t.capacityTons >= b.weightTons,
    )

  const openAccept = (b: Booking) => {
    const elig = eligibleTrucks(b)
    setTarget(b)
    setChosenTruck(elig[0]?.id ?? '')
  }

  const confirmAccept = () => {
    if (!target || !chosenTruck) return
    acceptLoad(target.id, chosenTruck)
    toast.success(`Load #${target.id.slice(-6).toUpperCase()} accepted — trip confirmed!`)
    setTarget(null)
  }

  return (
    <Page>
      <PageHeader title="Available Loads" subtitle="Find loads matching your route and trucks." />

      {/* Filters */}
      <div className="card flex flex-col gap-3 p-4 sm:flex-row sm:items-end">
        <div className="flex-1">
          <label className="label">Pickup city</label>
          <CityPicker value={originFilter} onChange={setOriginFilter} placeholder="Any city" />
        </div>
        <div className="flex-1">
          <label className="label">Truck type</label>
          <select className="input" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value as TruckTypeId | 'all')}>
            <option value="all">Any type</option>
            {TRUCK_TYPES.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
        </div>
        {(originFilter || typeFilter !== 'all') && (
          <button className="btn-ghost" onClick={() => { setOriginFilter(''); setTypeFilter('all') }}>Clear</button>
        )}
      </div>

      {open.length === 0 ? (
        <EmptyState icon={<Boxes size={24} />} title="No open loads" description="No loads match your filters right now. Check back soon — new loads appear all the time." />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {open.map((b) => {
            const truck = getTruckType(b.truckTypeId)
            const elig = eligibleTrucks(b)
            return (
              <div key={b.id} className="card p-5">
                <div className="flex items-start justify-between">
                  <span className="text-xs font-mono text-slate-400">#{b.id.slice(-6).toUpperCase()}</span>
                  {b.mode === 'shared' && <span className="badge bg-accent-50 text-accent-700"><Split size={12} /> Part load</span>}
                </div>
                <div className="mt-2 flex items-center gap-2 text-base font-bold text-ink">
                  <MapPin size={16} className="text-brand" /> {b.origin}
                  <span className="text-slate-300">→</span>
                  {b.destination}
                </div>
                <p className="text-xs text-slate-400">{b.distanceKm} km</p>

                <div className="mt-3 grid grid-cols-2 gap-2 rounded-xl bg-mist/60 p-3 text-xs text-slate-600">
                  <span className="flex items-center gap-1.5"><Package size={13} /> {b.goodsType}</span>
                  <span className="flex items-center gap-1.5"><Weight size={13} /> {b.weightTons} ton</span>
                  <span className="flex items-center gap-1.5"><Calendar size={13} /> {formatDate(b.pickupDate)}</span>
                  <span className="flex items-center gap-1.5">🚚 {truck.name.split(' (')[0]}</span>
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <div>
                    <p className="text-lg font-extrabold text-success">{formatINR(b.fare.total)}</p>
                    <p className="text-xs text-slate-400">Shipper: {b.shipperName}</p>
                  </div>
                  <button
                    onClick={() => openAccept(b)}
                    disabled={elig.length === 0}
                    className="btn-primary"
                    title={elig.length === 0 ? 'No eligible truck available' : 'Accept this load'}
                  >
                    <Check size={16} /> Accept
                  </button>
                </div>
                {elig.length === 0 && (
                  <p className="mt-2 flex items-center gap-1.5 text-xs text-warn">
                    <AlertTriangle size={13} /> Needs an available, verified truck ≥ {b.weightTons} ton.
                  </p>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Accept modal */}
      <Modal
        open={!!target}
        onClose={() => setTarget(null)}
        title="Accept load"
        footer={
          <>
            <button className="btn-outline" onClick={() => setTarget(null)}>Cancel</button>
            <button className="btn-primary" onClick={confirmAccept} disabled={!chosenTruck}><Check size={16} /> Confirm trip</button>
          </>
        }
      >
        {target && (
          <div className="space-y-4">
            <div className="rounded-xl bg-mist p-4">
              <p className="text-sm font-semibold text-ink">{target.origin} → {target.destination}</p>
              <p className="text-xs text-slate-500">{target.goodsType} · {target.weightTons} ton · {formatINR(target.fare.total)}</p>
            </div>
            <div>
              <label className="label">Assign a truck</label>
              <div className="space-y-2">
                {eligibleTrucks(target).map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setChosenTruck(t.id)}
                    className={cn(
                      'flex w-full items-center justify-between rounded-xl border-2 p-3 text-left transition',
                      chosenTruck === t.id ? 'border-brand bg-brand-50' : 'border-slate-200 hover:border-slate-300',
                    )}
                  >
                    <div>
                      <p className="text-sm font-semibold text-ink">{t.registrationNo}</p>
                      <p className="text-xs text-slate-500">{t.modelName} · {t.capacityTons} ton</p>
                    </div>
                    {chosenTruck === t.id && <Check size={18} className="text-brand" />}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </Page>
  )
}
