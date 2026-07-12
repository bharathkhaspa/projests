import { useState } from 'react'
import { Mail, Phone, MapPin, MessageSquare, Send } from 'lucide-react'
import toast from 'react-hot-toast'

export function ContactPage() {
  const [submitted, setSubmitted] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
    toast.success("Thanks! We'll get back to you within one business day.")
    setForm({ name: '', email: '', subject: '', message: '' })
    setTimeout(() => setSubmitted(false), 4000)
  }

  return (
    <div>
      <section className="bg-brand-900 py-16 text-center sm:py-20">
        <div className="container-px">
          <h1 className="text-4xl font-extrabold text-white sm:text-5xl">Get in touch</h1>
          <p className="mx-auto mt-4 max-w-xl text-slate-300">
            Questions about booking, partnerships or pricing? Our team is here 24×7.
          </p>
        </div>
      </section>

      <section className="container-px py-16 sm:py-20">
        <div className="grid gap-10 lg:grid-cols-5">
          <div className="space-y-4 lg:col-span-2">
            {[
              { icon: Phone, title: 'Call us', value: '1800-000-000 (toll free)', href: 'tel:+911800000000' },
              { icon: Mail, title: 'Email', value: 'hello@passandpay.in', href: 'mailto:hello@passandpay.in' },
              { icon: MessageSquare, title: 'Support', value: 'support@passandpay.in', href: 'mailto:support@passandpay.in' },
              { icon: MapPin, title: 'Office', value: 'Koramangala, Bengaluru, India', href: undefined },
            ].map((c) => (
              <div key={c.title} className="card flex items-center gap-4 p-5">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand">
                  <c.icon size={20} />
                </span>
                <div>
                  <p className="text-sm font-semibold text-ink">{c.title}</p>
                  {c.href ? (
                    <a href={c.href} className="text-sm text-slate-500 hover:text-brand">
                      {c.value}
                    </a>
                  ) : (
                    <p className="text-sm text-slate-500">{c.value}</p>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="card p-7 lg:col-span-3">
            <h2 className="text-xl font-bold text-ink">Send us a message</h2>
            <form onSubmit={handleSubmit} className="mt-5 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="label" htmlFor="c-name">Full name</label>
                  <input id="c-name" required className="input" placeholder="Your name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                </div>
                <div>
                  <label className="label" htmlFor="c-email">Email</label>
                  <input id="c-email" type="email" required className="input" placeholder="you@example.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                </div>
              </div>
              <div>
                <label className="label" htmlFor="c-subject">Subject</label>
                <input id="c-subject" required className="input" placeholder="How can we help?" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} />
              </div>
              <div>
                <label className="label" htmlFor="c-message">Message</label>
                <textarea id="c-message" required rows={5} className="input resize-none" placeholder="Tell us a bit more…" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />
              </div>
              <button type="submit" className="btn-primary w-full sm:w-auto" disabled={submitted}>
                <Send size={16} /> {submitted ? 'Sent!' : 'Send message'}
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  )
}
