import { useState } from 'react'
import { FileText, Upload, ShieldCheck, Mail, Phone, Building2, MapPin, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { Page } from '@/components/app/Page'
import { PageHeader } from '@/components/ui/PageHeader'
import { Avatar } from '@/components/ui/Avatar'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { Stars } from '@/components/ui/Stars'
import { useStore } from '@/store/useStore'
import { formatDate } from '@/lib/utils'

const SUGGESTED_DOCS = ['PAN Card', 'Aadhaar', 'GST Certificate', 'Driving License', 'Address Proof']

export function ProfileView() {
  const user = useStore((s) => s.currentUser())!
  const uploadDocument = useStore((s) => s.uploadDocument)
  const [docLabel, setDocLabel] = useState(SUGGESTED_DOCS[0])

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    const fileName = file?.name ?? `${docLabel.toLowerCase().replace(/\s+/g, '_')}.pdf`
    uploadDocument(docLabel, fileName)
    toast.success(`${docLabel} uploaded — pending review`)
    e.target.value = ''
  }

  return (
    <Page>
      <PageHeader title="Profile & KYC" subtitle="Manage your details and verification documents." />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Profile card */}
        <div className="card p-6 lg:col-span-1">
          <div className="flex flex-col items-center text-center">
            <Avatar name={user.name} color={user.avatarColor} size="lg" />
            <h2 className="mt-3 text-lg font-bold text-ink">{user.name}</h2>
            <p className="text-sm capitalize text-slate-500">{user.role}</p>
            <div className="mt-2"><StatusBadge kind="kyc" value={user.kycStatus} /></div>
            {user.rating !== undefined && (
              <div className="mt-3 flex items-center gap-2">
                <Stars value={user.rating} /> <span className="text-sm font-medium text-slate-600">{user.rating}</span>
              </div>
            )}
          </div>
          <dl className="mt-6 space-y-3 text-sm">
            <Row icon={<Mail size={15} />} value={user.email} />
            <Row icon={<Phone size={15} />} value={user.phone} />
            {user.company && <Row icon={<Building2 size={15} />} value={user.company} />}
            {user.city && <Row icon={<MapPin size={15} />} value={user.city} />}
          </dl>
        </div>

        {/* KYC docs */}
        <div className="space-y-6 lg:col-span-2">
          <div className="card p-6">
            <div className="flex items-center gap-2">
              <ShieldCheck size={20} className="text-brand" />
              <h3 className="font-bold text-ink">Verification status</h3>
            </div>
            {user.kycStatus === 'verified' ? (
              <p className="mt-2 text-sm text-success">Your account is fully verified. You can book and transact without limits.</p>
            ) : user.kycStatus === 'pending' ? (
              <p className="mt-2 text-sm text-warn">Your documents are under review. This usually takes a few hours.</p>
            ) : (
              <p className="mt-2 text-sm text-slate-500">Upload your KYC documents to get verified and unlock all features.</p>
            )}

            <div className="mt-4 flex flex-col gap-3 sm:flex-row">
              <select className="input sm:w-56" value={docLabel} onChange={(e) => setDocLabel(e.target.value)}>
                {SUGGESTED_DOCS.map((d) => <option key={d}>{d}</option>)}
              </select>
              <label className="btn-primary cursor-pointer">
                <Upload size={16} /> Upload document
                <input type="file" className="hidden" onChange={handleUpload} accept=".pdf,.jpg,.jpeg,.png" />
              </label>
            </div>
          </div>

          <div className="card p-6">
            <h3 className="mb-4 font-bold text-ink">Uploaded documents</h3>
            {user.documents.length === 0 ? (
              <p className="rounded-xl bg-mist p-4 text-sm text-slate-500">No documents uploaded yet.</p>
            ) : (
              <ul className="divide-y divide-slate-100">
                {user.documents.map((d) => (
                  <li key={d.id} className="flex items-center justify-between gap-3 py-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand">
                        <FileText size={18} />
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-ink">{d.label}</p>
                        <p className="truncate text-xs text-slate-400">{d.fileName} · {formatDate(d.uploadedAt)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <StatusBadge kind="kyc" value={d.status} />
                      <button className="text-slate-300 hover:text-danger" aria-label="Remove document" disabled>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </Page>
  )
}

function Row({ icon, value }: { icon: React.ReactNode; value: string }) {
  return (
    <div className="flex items-center gap-3 text-slate-600">
      <span className="text-slate-400">{icon}</span>
      <span className="truncate">{value}</span>
    </div>
  )
}
