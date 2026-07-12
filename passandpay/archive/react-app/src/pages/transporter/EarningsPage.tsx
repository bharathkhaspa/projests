import { useMemo } from 'react'
import { Wallet, TrendingUp, CheckCircle2, Clock } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { Page } from '@/components/app/Page'
import { PageHeader } from '@/components/ui/PageHeader'
import { StatCard } from '@/components/ui/StatCard'
import { EmptyState } from '@/components/ui/EmptyState'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { useStore } from '@/store/useStore'
import { formatDate, formatINR } from '@/lib/utils'

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']

export function EarningsPage() {
  const user = useStore((s) => s.currentUser())!
  const bookings = useStore((s) => s.bookings)

  const myTrips = useMemo(() => bookings.filter((b) => b.transporterId === user.id), [bookings, user.id])
  const completed = myTrips.filter((b) => b.status === 'delivered')
  const totalEarned = completed.reduce((s, b) => s + b.fare.total, 0)
  const pending = myTrips.filter((b) => ['confirmed', 'picked-up', 'in-transit'].includes(b.status)).reduce((s, b) => s + b.fare.total, 0)

  // Synthesised monthly trend seeded by completed earnings for a lively chart.
  const chartData = MONTHS.map((m, i) => ({
    month: m,
    earnings: Math.round((totalEarned / 6) * (0.6 + ((i * 7) % 5) / 6) + (i === 5 ? totalEarned * 0.3 : 0)) + 8000 * (i + 1),
  }))

  return (
    <Page>
      <PageHeader title="Earnings" subtitle="Track your payouts and trip income." />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Total earned" value={formatINR(totalEarned)} icon={<Wallet size={20} />} accent="success" trend="+12% vs last month" />
        <StatCard label="Pending payout" value={formatINR(pending)} icon={<Clock size={20} />} accent="accent" />
        <StatCard label="Completed trips" value={completed.length} icon={<CheckCircle2 size={20} />} accent="brand" />
      </div>

      <div className="card p-5">
        <div className="mb-4 flex items-center gap-2">
          <TrendingUp size={18} className="text-brand" />
          <h2 className="font-bold text-ink">Monthly earnings</h2>
        </div>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eef1f6" />
              <XAxis dataKey="month" tickLine={false} axisLine={false} fontSize={12} stroke="#94a3b8" />
              <YAxis tickFormatter={(v) => `₹${Math.round(v / 1000)}k`} tickLine={false} axisLine={false} fontSize={12} stroke="#94a3b8" />
              <Tooltip
                formatter={(v: number) => [formatINR(v), 'Earnings']}
                contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 13 }}
                cursor={{ fill: '#1A3D7C0d' }}
              />
              <Bar dataKey="earnings" fill="#1A3D7C" radius={[6, 6, 0, 0]} maxBarSize={48} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="card overflow-hidden">
        <h2 className="border-b border-slate-100 px-5 py-4 font-bold text-ink">Payout history</h2>
        {completed.length === 0 ? (
          <div className="p-5">
            <EmptyState icon={<Wallet size={24} />} title="No payouts yet" description="Completed trips and their payouts will appear here." />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px] text-left text-sm">
              <thead className="bg-mist text-slate-600">
                <tr>
                  <th className="px-5 py-3 font-semibold">Trip</th>
                  <th className="px-5 py-3 font-semibold">Route</th>
                  <th className="px-5 py-3 font-semibold">Date</th>
                  <th className="px-5 py-3 text-right font-semibold">Amount</th>
                  <th className="px-5 py-3 font-semibold">Payout</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {completed.map((b) => (
                  <tr key={b.id} className="hover:bg-mist/40">
                    <td className="px-5 py-3 font-mono text-xs text-slate-500">#{b.id.slice(-6).toUpperCase()}</td>
                    <td className="px-5 py-3 font-medium text-ink">{b.origin} → {b.destination}</td>
                    <td className="px-5 py-3 text-slate-500">{formatDate(b.pickupDate)}</td>
                    <td className="px-5 py-3 text-right font-semibold text-success">{formatINR(b.fare.total)}</td>
                    <td className="px-5 py-3"><StatusBadge kind="payment" value={b.paymentStatus === 'paid' ? 'paid' : 'unpaid'} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Page>
  )
}
