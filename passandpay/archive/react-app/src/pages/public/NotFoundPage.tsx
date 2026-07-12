import { Link } from 'react-router-dom'
import { Truck, Home } from 'lucide-react'

export function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-mist px-6 text-center">
      <div className="mb-6 grid h-20 w-20 place-items-center rounded-3xl bg-brand text-white shadow-card">
        <Truck size={40} className="animate-truck-move" />
      </div>
      <p className="text-6xl font-extrabold text-brand">404</p>
      <h1 className="mt-2 text-2xl font-bold text-ink">This route hit a dead end</h1>
      <p className="mt-2 max-w-sm text-slate-500">
        The page you're looking for has moved or never existed. Let's get you back on the road.
      </p>
      <Link to="/" className="btn-primary mt-7">
        <Home size={16} /> Back to home
      </Link>
    </div>
  )
}
