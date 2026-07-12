import { useMemo, useState } from 'react'
import { Download, Receipt, CreditCard, ShieldCheck, Wallet, CheckCircle2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { Page } from '@/components/app/Page'
import { PageHeader } from '@/components/ui/PageHeader'
import { StatCard } from '@/components/ui/StatCard'
import { EmptyState } from '@/components/ui/EmptyState'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { Modal } from '@/components/ui/Modal'
import { useStore } from '@/store/useStore'
import { downloadInvoice } from '@/lib/invoice'
import { formatDate, formatINR } from '@/lib/utils'
import type { Booking } from '@/lib/types'

export function PaymentsPage() {
  const user = useStore((s) => s.currentUser())!
  const bookings = useStore((s) => s.bookings)
  const payBooking = useStore((s) => s.payBooking)
  const [payTarget, setPayTarget] = useState<Booking | null>(null)
  const [processing, setProcessing] = useState(false)

  const mine = useMemo(
    () => bookings.filter((b) => b.shipperId === user.id && b.status !== 'cancelled'),
    [bookings, user.id],
  )
  const paid = mine.filter((b) => b.paymentStatus === 'paid')
  const due = mine.filter((b) => b.paymentStatus === 'unpaid')
  const totalPaid = paid.reduce((s, b) => s + b.fare.total, 0)
  const totalDue = due.reduce((s, b) => s + b.fare.total, 0)

  const handlePay = () => {
    if (!payTarget) return
    setProcessing(true)
    // Simulate a payment-gateway round trip (Razorpay/Stripe test mode).
    setTimeout(() => {
      payBooking(payTarget.id)
      setProcessing(false)
      setPayTarget(null)
      toast.success('Payment successful! Invoice is ready to download.')
    }, 1400)
  }

  return (
    <Page>
      <PageHeader title="Payments & Invoices" subtitle="View payment history and download GST invoices." />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Total paid" value={formatINR(totalPaid)} icon={<Wallet size={20} />} accent="success" />
        <StatCard label="Amount due" value={formatINR(totalDue)} icon={<CreditCard size={20} />} accent="danger" />
        <StatCard label="Invoices" value={mine.length} icon={<Receipt size={20} />} accent="brand" />
      </div>

      {mine.length === 0 ? (
        <EmptyState icon={<Receipt size={24} />} title="No invoices yet" description="Invoices appear here after you book a truck." />
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[680px] text-left text-sm">
              <thead className="bg-mist text-slate-600">
                <tr>
                  <th className="px-5 py-3 font-semibold">Invoice</th>
                  <th className="px-5 py-3 font-semibold">Route</th>
                  <th className="px-5 py-3 font-semibold">Date</th>
                  <th className="px-5 py-3 text-right font-semibold">Amount</th>
                  <th className="px-5 py-3 font-semibold">Status</th>
                  <th className="px-5 py-3 text-right font-semibold">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {mine.map((b) => (
                  <tr key={b.id} className="hover:bg-mist/40">
                    <td className="px-5 py-3 font-mono text-xs text-slate-500">INV-{b.id.slice(-6).toUpperCase()}</td>
                    <td className="px-5 py-3 font-medium text-ink">{b.origin} → {b.destination}</td>
                    <td className="px-5 py-3 text-slate-500">{formatDate(b.pickupDate)}</td>
                    <td className="px-5 py-3 text-right font-semibold text-ink">{formatINR(b.fare.total)}</td>
                    <td className="px-5 py-3"><StatusBadge kind="payment" value={b.paymentStatus} /></td>
                    <td className="px-5 py-3 text-right">
                      {b.paymentStatus === 'unpaid' ? (
                        <button onClick={() => setPayTarget(b)} className="btn-primary px-3 py-1.5 text-xs">Pay now</button>
                      ) : (
                        <button onClick={() => downloadInvoice(b, user.name)} className="btn-outline px-3 py-1.5 text-xs">
                          <Download size={13} /> Invoice
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Mock checkout */}
      <Modal
        open={!!payTarget}
        onClose={() => !processing && setPayTarget(null)}
        title="Secure checkout"
        footer={
          <>
            <button className="btn-outline" onClick={() => setPayTarget(null)} disabled={processing}>Cancel</button>
            <button className="btn-primary" onClick={handlePay} disabled={processing}>
              {processing ? 'Processing…' : `Pay ${payTarget ? formatINR(payTarget.fare.total) : ''}`}
            </button>
          </>
        }
      >
        {payTarget && (
          <div className="space-y-4">
            <div className="flex items-center justify-between rounded-xl bg-mist p-4">
              <div>
                <p className="text-sm font-semibold text-ink">{payTarget.origin} → {payTarget.destination}</p>
                <p className="text-xs text-slate-500">Invoice INV-{payTarget.id.slice(-6).toUpperCase()}</p>
              </div>
              <p className="text-xl font-extrabold text-brand">{formatINR(payTarget.fare.total)}</p>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {['UPI', 'Card', 'Netbanking'].map((m, i) => (
                <div key={m} className={`rounded-xl border-2 p-3 text-center text-sm font-medium ${i === 0 ? 'border-brand bg-brand-50 text-brand' : 'border-slate-200 text-slate-500'}`}>
                  {m}
                </div>
              ))}
            </div>
            <div className="space-y-2">
              <input className="input" placeholder="yourname@upi" defaultValue="ananya@okhdfc" />
            </div>
            <p className="flex items-center justify-center gap-1.5 text-xs text-slate-400">
              <ShieldCheck size={14} className="text-success" /> Test mode · No real payment is charged
            </p>
            {processing && (
              <div className="flex items-center justify-center gap-2 text-sm text-brand">
                <CheckCircle2 size={16} className="animate-pulse" /> Confirming payment…
              </div>
            )}
          </div>
        )}
      </Modal>
    </Page>
  )
}
