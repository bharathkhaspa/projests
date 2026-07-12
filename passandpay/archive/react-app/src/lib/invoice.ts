import type { Booking } from './types'
import { getTruckType } from './trucks'
import { formatDate, formatINR } from './utils'

/**
 * Generates a printable GST invoice as a standalone HTML file and triggers a
 * download. Opening it in a browser and using "Save as PDF" yields a PDF — no
 * server or PDF library required.
 */
export function downloadInvoice(booking: Booking, shipperName: string) {
  const truck = getTruckType(booking.truckTypeId)
  const f = booking.fare
  const number = `INV-${booking.id.slice(-6).toUpperCase()}`

  const html = `<!doctype html>
<html><head><meta charset="utf-8"><title>${number} · Pass & Pay</title>
<style>
  body{font-family:Inter,Arial,sans-serif;color:#1F2933;max-width:720px;margin:32px auto;padding:0 24px}
  .top{display:flex;justify-content:space-between;align-items:flex-start;border-bottom:3px solid #1A3D7C;padding-bottom:16px}
  .brand{font-size:24px;font-weight:800;color:#1A3D7C}
  .brand span{color:#F5821F}
  .muted{color:#667;font-size:13px}
  table{width:100%;border-collapse:collapse;margin-top:24px}
  th,td{text-align:left;padding:10px 8px;font-size:14px;border-bottom:1px solid #eee}
  th{background:#F4F6F9;color:#445}
  .right{text-align:right}
  .total{font-size:20px;font-weight:800;color:#1A3D7C}
  .tag{display:inline-block;background:#28A745;color:#fff;padding:3px 10px;border-radius:99px;font-size:12px}
</style></head>
<body>
  <div class="top">
    <div>
      <div class="brand">Pass <span>&amp;</span> Pay</div>
      <div class="muted">Book a truck. Move anything. Pay simply.</div>
      <div class="muted">hello@passandpay.in · GSTIN 29ABCDE1234F1Z5</div>
    </div>
    <div style="text-align:right">
      <h2 style="margin:0">TAX INVOICE</h2>
      <div class="muted">${number}</div>
      <div class="muted">Date: ${formatDate(booking.pickupDate)}</div>
      <div style="margin-top:6px"><span class="tag">${booking.paymentStatus === 'paid' ? 'PAID' : 'DUE'}</span></div>
    </div>
  </div>

  <div style="margin-top:20px">
    <strong>Billed to:</strong> ${shipperName}<br/>
    <span class="muted">Shipment: ${booking.origin} → ${booking.destination} (${booking.distanceKm} km)</span>
  </div>

  <table>
    <thead><tr><th>Description</th><th class="right">Amount</th></tr></thead>
    <tbody>
      <tr><td>${truck.name} — base fare</td><td class="right">${formatINR(f.baseFare)}</td></tr>
      <tr><td>Distance · ${f.distanceKm} km × ${formatINR(f.perKmRate)}/km</td><td class="right">${formatINR(f.distanceCost)}</td></tr>
      ${f.surcharge > 0 ? `<tr><td>${f.surchargeLabel ?? 'Surcharge'}</td><td class="right">${formatINR(f.surcharge)}</td></tr>` : ''}
      <tr><td>GST (5%)</td><td class="right">${formatINR(f.gst)}</td></tr>
    </tbody>
    <tfoot>
      <tr><td class="total">Total</td><td class="right total">${formatINR(f.total)}</td></tr>
    </tfoot>
  </table>

  <p class="muted" style="margin-top:32px">This is a computer-generated invoice and does not require a signature.<br/>
  ${booking.mode === 'shared' ? 'Part-load (shared truck) — fare reflects your share of the truck.' : 'Full truck load.'}</p>
</body></html>`

  const blob = new Blob([html], { type: 'text/html' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${number}.html`
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}
