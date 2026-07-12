import { useMemo, useState } from 'react'
import { Truck, Plus, Upload, FileText, Settings2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { Page } from '@/components/app/Page'
import { PageHeader } from '@/components/ui/PageHeader'
import { EmptyState } from '@/components/ui/EmptyState'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { Modal } from '@/components/ui/Modal'
import { CityPicker } from '@/components/ui/CityPicker'
import { useStore } from '@/store/useStore'
import { TRUCK_TYPES, getTruckType } from '@/lib/trucks'
import { formatDate } from '@/lib/utils'
import type { TruckStatus, TruckTypeId } from '@/lib/types'

export function MyTrucksPage() {
  const user = useStore((s) => s.currentUser())!
  const trucks = useStore((s) => s.trucks)
  const addTruck = useStore((s) => s.addTruck)
  const setTruckStatus = useStore((s) => s.setTruckStatus)
  const uploadTruckDocument = useStore((s) => s.uploadTruckDocument)

  const mine = useMemo(() => trucks.filter((t) => t.ownerId === user.id), [trucks, user.id])
  const [addOpen, setAddOpen] = useState(false)
  const [form, setForm] = useState({ typeId: 'eicher14' as TruckTypeId, registrationNo: '', modelName: '', city: user.city ?? '' })

  const submit = () => {
    if (!form.registrationNo.trim() || !form.modelName.trim() || !form.city) {
      toast.error('Please fill all truck details')
      return
    }
    addTruck(form)
    toast.success('Truck added — upload documents to get it verified')
    setAddOpen(false)
    setForm({ typeId: 'eicher14', registrationNo: '', modelName: '', city: user.city ?? '' })
  }

  const handleDoc = (truckId: string) => {
    uploadTruckDocument(truckId, 'RC Book', `rc_${truckId}.pdf`)
    toast.success('Document uploaded — pending review')
  }

  return (
    <Page>
      <PageHeader
        title="My Trucks"
        subtitle={`${mine.length} truck${mine.length === 1 ? '' : 's'} in your fleet`}
        actions={<button className="btn-primary" onClick={() => setAddOpen(true)}><Plus size={16} /> Add truck</button>}
      />

      {mine.length === 0 ? (
        <EmptyState icon={<Truck size={24} />} title="No trucks yet" description="Add your first truck to start accepting loads." action={<button className="btn-primary" onClick={() => setAddOpen(true)}>Add truck</button>} />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {mine.map((t) => {
            const type = getTruckType(t.typeId)
            return (
              <div key={t.id} className="card overflow-hidden">
                <div className="flex gap-4 p-5">
                  <img src={type.image} alt={type.name} loading="lazy" className="h-20 w-24 shrink-0 rounded-xl object-cover" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-base font-bold text-ink">{t.registrationNo}</p>
                        <p className="text-sm text-slate-500">{t.modelName}</p>
                      </div>
                      <StatusBadge kind="truck" value={t.status} />
                    </div>
                    <p className="mt-1 text-xs text-slate-400">{type.name} · {t.capacityTons} ton · {t.city}</p>
                    <div className="mt-2"><StatusBadge kind="kyc" value={t.kycStatus} className="scale-90" /></div>
                  </div>
                </div>

                {/* docs */}
                <div className="border-t border-slate-100 px-5 py-3">
                  {t.documents.length > 0 ? (
                    <ul className="space-y-1.5">
                      {t.documents.map((d) => (
                        <li key={d.id} className="flex items-center justify-between text-xs">
                          <span className="flex items-center gap-1.5 text-slate-600"><FileText size={13} /> {d.label} <span className="text-slate-300">·</span> {formatDate(d.uploadedAt)}</span>
                          <StatusBadge kind="kyc" value={d.status} className="scale-90" />
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-xs text-slate-400">No documents uploaded.</p>
                  )}
                </div>

                <div className="flex items-center gap-2 border-t border-slate-100 bg-mist/40 px-5 py-3">
                  <button onClick={() => handleDoc(t.id)} className="btn-outline px-3 py-1.5 text-xs"><Upload size={13} /> Upload doc</button>
                  <div className="ml-auto flex items-center gap-1.5">
                    <Settings2 size={14} className="text-slate-400" />
                    <select
                      value={t.status}
                      onChange={(e) => setTruckStatus(t.id, e.target.value as TruckStatus)}
                      className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs font-medium"
                      disabled={t.status === 'on-trip'}
                    >
                      <option value="available">Available</option>
                      <option value="maintenance">Maintenance</option>
                      {t.status === 'on-trip' && <option value="on-trip">On trip</option>}
                    </select>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      <Modal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        title="Add a truck"
        footer={
          <>
            <button className="btn-outline" onClick={() => setAddOpen(false)}>Cancel</button>
            <button className="btn-primary" onClick={submit}><Plus size={16} /> Add truck</button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="label">Truck type</label>
            <select className="input" value={form.typeId} onChange={(e) => setForm({ ...form, typeId: e.target.value as TruckTypeId })}>
              {TRUCK_TYPES.map((t) => <option key={t.id} value={t.id}>{t.name} · {t.capacityLabel}</option>)}
            </select>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label">Registration no.</label>
              <input className="input uppercase" placeholder="DL 01 AB 1234" value={form.registrationNo} onChange={(e) => setForm({ ...form, registrationNo: e.target.value })} />
            </div>
            <div>
              <label className="label">Model</label>
              <input className="input" placeholder="e.g. Eicher Pro 2049" value={form.modelName} onChange={(e) => setForm({ ...form, modelName: e.target.value })} />
            </div>
          </div>
          <div>
            <label className="label">Base city</label>
            <CityPicker value={form.city} onChange={(v) => setForm({ ...form, city: v })} />
          </div>
        </div>
      </Modal>
    </Page>
  )
}
