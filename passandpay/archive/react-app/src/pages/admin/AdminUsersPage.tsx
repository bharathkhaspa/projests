import { useMemo, useState } from 'react'
import { Users as UsersIcon, Search } from 'lucide-react'
import { Page } from '@/components/app/Page'
import { PageHeader } from '@/components/ui/PageHeader'
import { EmptyState } from '@/components/ui/EmptyState'
import { Avatar } from '@/components/ui/Avatar'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { useStore } from '@/store/useStore'
import { cn, formatDate } from '@/lib/utils'
import type { Role } from '@/lib/types'

const ROLE_TABS: { id: 'all' | Role; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'shipper', label: 'Shippers' },
  { id: 'transporter', label: 'Transporters' },
  { id: 'admin', label: 'Admins' },
]

export function AdminUsersPage() {
  const users = useStore((s) => s.users)
  const [role, setRole] = useState<'all' | Role>('all')
  const [q, setQ] = useState('')

  const rows = useMemo(() => {
    return users
      .filter((u) => (role === 'all' ? true : u.role === role))
      .filter((u) => {
        if (!q.trim()) return true
        const t = q.toLowerCase()
        return u.name.toLowerCase().includes(t) || u.email.toLowerCase().includes(t) || (u.company?.toLowerCase().includes(t) ?? false)
      })
  }, [users, role, q])

  return (
    <Page>
      <PageHeader title="Users" subtitle={`${users.length} registered users`} />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="-mx-1 flex gap-2 overflow-x-auto px-1">
          {ROLE_TABS.map((r) => (
            <button
              key={r.id}
              onClick={() => setRole(r.id)}
              className={cn(
                'whitespace-nowrap rounded-full px-3.5 py-1.5 text-sm font-medium transition',
                role === r.id ? 'bg-brand text-white' : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50',
              )}
            >
              {r.label}
            </button>
          ))}
        </div>
        <div className="relative sm:w-64">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input className="input pl-9" placeholder="Search users…" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
      </div>

      {rows.length === 0 ? (
        <EmptyState icon={<UsersIcon size={24} />} title="No users found" description="Try a different filter or search." />
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="bg-mist text-slate-600">
                <tr>
                  <th className="px-5 py-3 font-semibold">User</th>
                  <th className="px-5 py-3 font-semibold">Role</th>
                  <th className="px-5 py-3 font-semibold">Contact</th>
                  <th className="px-5 py-3 font-semibold">Joined</th>
                  <th className="px-5 py-3 font-semibold">KYC</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rows.map((u) => (
                  <tr key={u.id} className="hover:bg-mist/40">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar name={u.name} color={u.avatarColor} size="sm" />
                        <div>
                          <p className="font-semibold text-ink">{u.name}</p>
                          {u.company && <p className="text-xs text-slate-400">{u.company}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3 capitalize text-slate-600">{u.role}</td>
                    <td className="px-5 py-3 text-slate-500">
                      <p>{u.email}</p>
                      <p className="text-xs">{u.phone}</p>
                    </td>
                    <td className="px-5 py-3 text-slate-500">{formatDate(u.createdAt)}</td>
                    <td className="px-5 py-3"><StatusBadge kind="kyc" value={u.kycStatus} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </Page>
  )
}
