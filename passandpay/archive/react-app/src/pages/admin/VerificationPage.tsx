import { useMemo, useState } from 'react'
import { ShieldCheck, Check, X, FileText, Truck, User as UserIcon } from 'lucide-react'
import toast from 'react-hot-toast'
import { Page } from '@/components/app/Page'
import { PageHeader } from '@/components/ui/PageHeader'
import { EmptyState } from '@/components/ui/EmptyState'
import { Avatar } from '@/components/ui/Avatar'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { useStore } from '@/store/useStore'
import { getTruckType } from '@/lib/trucks'
import { cn, formatDate } from '@/lib/utils'

type Tab = 'users' | 'trucks'

export function VerificationPage() {
  const users = useStore((s) => s.users)
  const trucks = useStore((s) => s.trucks)
  const setUserKyc = useStore((s) => s.setUserKyc)
  const setTruckKyc = useStore((s) => s.setTruckKyc)
  const [tab, setTab] = useState<Tab>('users')

  const pendingUsers = useMemo(() => users.filter((u) => u.kycStatus === 'pending'), [users])
  const pendingTrucks = useMemo(() => trucks.filter((t) => t.kycStatus === 'pending'), [trucks])

  return (
    <Page>
      <PageHeader title="Verification queue" subtitle="Approve or reject KYC and truck documents." />

      <div className="flex gap-2">
        <TabBtn active={tab === 'users'} onClick={() => setTab('users')} icon={<UserIcon size={15} />} label="Users" count={pendingUsers.length} />
        <TabBtn active={tab === 'trucks'} onClick={() => setTab('trucks')} icon={<Truck size={15} />} label="Trucks" count={pendingTrucks.length} />
      </div>

      {tab === 'users' &&
        (pendingUsers.length === 0 ? (
          <EmptyState icon={<ShieldCheck size={24} />} title="All caught up" description="No user verifications pending." />
        ) : (
          <div className="space-y-4">
            {pendingUsers.map((u) => (
              <div key={u.id} className="card p-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar name={u.name} color={u.avatarColor} />
                    <div>
                      <p className="font-semibold text-ink">{u.name}</p>
                      <p className="text-xs capitalize text-slate-500">{u.role} · {u.company ?? u.city ?? u.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => { setUserKyc(u.id, 'rejected'); toast.error(`${u.name} rejected`) }}
                      className="btn-outline text-danger hover:border-danger"
                    >
                      <X size={15} /> Reject
                    </button>
                    <button
                      onClick={() => { setUserKyc(u.id, 'verified'); toast.success(`${u.name} verified`) }}
                      className="btn-primary bg-success hover:bg-green-600"
                    >
                      <Check size={15} /> Approve
                    </button>
                  </div>
                </div>
                <DocList docs={u.documents} />
              </div>
            ))}
          </div>
        ))}

      {tab === 'trucks' &&
        (pendingTrucks.length === 0 ? (
          <EmptyState icon={<ShieldCheck size={24} />} title="All caught up" description="No truck verifications pending." />
        ) : (
          <div className="space-y-4">
            {pendingTrucks.map((t) => {
              const type = getTruckType(t.typeId)
              const owner = users.find((u) => u.id === t.ownerId)
              return (
                <div key={t.id} className="card p-5">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3">
                      <img src={type.image} alt={type.name} className="h-12 w-16 rounded-lg object-cover" />
                      <div>
                        <p className="font-semibold text-ink">{t.registrationNo}</p>
                        <p className="text-xs text-slate-500">{type.name} · {t.modelName} · Owner: {owner?.name ?? '—'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => { setTruckKyc(t.id, 'rejected'); toast.error(`${t.registrationNo} rejected`) }} className="btn-outline text-danger hover:border-danger"><X size={15} /> Reject</button>
                      <button onClick={() => { setTruckKyc(t.id, 'verified'); toast.success(`${t.registrationNo} verified`) }} className="btn-primary bg-success hover:bg-green-600"><Check size={15} /> Approve</button>
                    </div>
                  </div>
                  <DocList docs={t.documents} />
                </div>
              )
            })}
          </div>
        ))}
    </Page>
  )
}

function DocList({ docs }: { docs: { id: string; label: string; fileName: string; uploadedAt: string; status: import('@/lib/types').KycStatus }[] }) {
  if (docs.length === 0) return <p className="mt-4 rounded-xl bg-mist p-3 text-xs text-slate-400">No documents uploaded.</p>
  return (
    <ul className="mt-4 grid gap-2 sm:grid-cols-2">
      {docs.map((d) => (
        <li key={d.id} className="flex items-center justify-between rounded-xl border border-slate-100 px-3 py-2 text-xs">
          <span className="flex items-center gap-2 text-slate-600"><FileText size={14} className="text-brand" /> {d.label} <span className="text-slate-300">·</span> {formatDate(d.uploadedAt)}</span>
          <StatusBadge kind="kyc" value={d.status} className="scale-90" />
        </li>
      ))}
    </ul>
  )
}

function TabBtn({ active, onClick, icon, label, count }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string; count: number }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition',
        active ? 'bg-brand text-white' : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50',
      )}
    >
      {icon} {label}
      <span className={cn('rounded-full px-1.5 text-xs', active ? 'bg-white/20' : 'bg-amber-100 text-amber-700')}>{count}</span>
    </button>
  )
}
