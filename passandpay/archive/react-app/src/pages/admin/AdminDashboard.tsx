import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Users, Truck, ClipboardList, IndianRupee, ShieldAlert, ArrowRight } from 'lucide-react'
import {
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from 'recharts'
import { Page } from '@/components/app/Page'
import { PageHeader } from '@/components/ui/PageHeader'
import { StatCard } from '@/components/ui/StatCard'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { useStore } from '@/store/useStore'
import { formatINR } from '@/lib/utils'
import type { BookingStatus } from '@/lib/types'

const STATUS_COLORS: Record<BookingStatus, string> = {
  pending: '#E0A106',
  confirmed: '#2f59a6',
  'picked-up': '#6366f1',
  'in-transit': '#7A3FF2',
  delivered: '#28A745',
  cancelled: '#E63946',
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']

export function AdminDashboard() {
  const users = useStore((s) => s.users)
  const trucks = useStore((s) => s.trucks)
  const bookings = useStore((s) => s.bookings)

  const revenue = bookings.reduce((s, b) => s + b.fare.total, 0)
  const pendingKyc =
    users.filter((u) => u.kycStatus === 'pending').length + trucks.filter((t) => t.kycStatus === 'pending').length

  const statusData = useMemo(() => {
    const counts = bookings.reduce<Record<string, number>>((acc, b) => {
      acc[b.status] = (acc[b.status] ?? 0) + 1
      return acc
    }, {})
    return Object.entries(counts).map(([status, value]) => ({ status, value }))
  }, [bookings])

  const revenueData = MONTHS.map((m, i) => ({
    month: m,
    revenue: Math.round((revenue / 6) * (0.5 + ((i * 3) % 4) / 4)) + 40000 * (i + 1),
  }))

  return (
    <Page>
      <PageHeader title="Admin Dashboard" subtitle="Platform overview and operations." />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Total users" value={users.length} icon={<Users size={20} />} accent="brand" />
        <StatCard label="Trucks" value={trucks.length} icon={<Truck size={20} />} accent="accent" />
        <StatCard label="Bookings" value={bookings.length} icon={<ClipboardList size={20} />} accent="success" />
        <StatCard label="GMV" value={formatINR(revenue)} icon={<IndianRupee size={20} />} accent="brand" />
      </div>

      {/* Verification alert */}
      {pendingKyc > 0 && (
        <Link to="/admin/verification" className="card flex items-center justify-between border-l-4 border-l-warn p-4 hover:shadow-soft">
          <div className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-amber-50 text-warn"><ShieldAlert size={22} /></span>
            <div>
              <p className="text-sm font-semibold text-ink">{pendingKyc} verification{pendingKyc === 1 ? '' : 's'} pending</p>
              <p className="text-xs text-slate-500">Review KYC documents and truck papers.</p>
            </div>
          </div>
          <ArrowRight size={18} className="text-slate-400" />
        </Link>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Revenue */}
        <div className="card p-5 lg:col-span-2">
          <h2 className="mb-4 font-bold text-ink">Revenue trend</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
                <defs>
                  <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#1A3D7C" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#1A3D7C" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eef1f6" />
                <XAxis dataKey="month" tickLine={false} axisLine={false} fontSize={12} stroke="#94a3b8" />
                <YAxis tickFormatter={(v) => `₹${Math.round(v / 1000)}k`} tickLine={false} axisLine={false} fontSize={12} stroke="#94a3b8" />
                <Tooltip formatter={(v: number) => [formatINR(v), 'Revenue']} contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 13 }} />
                <Area type="monotone" dataKey="revenue" stroke="#1A3D7C" strokeWidth={2.5} fill="url(#rev)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Booking status pie */}
        <div className="card p-5">
          <h2 className="mb-4 font-bold text-ink">Bookings by status</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={statusData} dataKey="value" nameKey="status" cx="50%" cy="45%" innerRadius={45} outerRadius={75} paddingAngle={2}>
                  {statusData.map((d) => (
                    <Cell key={d.status} fill={STATUS_COLORS[d.status as BookingStatus]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 13 }} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent bookings */}
      <div className="card overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <h2 className="font-bold text-ink">Recent bookings</h2>
          <Link to="/admin/bookings" className="text-sm font-semibold text-brand hover:underline">View all</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="bg-mist text-slate-600">
              <tr>
                <th className="px-5 py-3 font-semibold">ID</th>
                <th className="px-5 py-3 font-semibold">Shipper</th>
                <th className="px-5 py-3 font-semibold">Route</th>
                <th className="px-5 py-3 text-right font-semibold">Fare</th>
                <th className="px-5 py-3 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {bookings.slice(0, 6).map((b) => (
                <tr key={b.id} className="hover:bg-mist/40">
                  <td className="px-5 py-3 font-mono text-xs text-slate-500">#{b.id.slice(-6).toUpperCase()}</td>
                  <td className="px-5 py-3 font-medium text-ink">{b.shipperName}</td>
                  <td className="px-5 py-3 text-slate-600">{b.origin} → {b.destination}</td>
                  <td className="px-5 py-3 text-right font-semibold text-ink">{formatINR(b.fare.total)}</td>
                  <td className="px-5 py-3"><StatusBadge kind="booking" value={b.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Page>
  )
}
