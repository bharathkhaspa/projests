import { useMemo } from 'react'
import { MapPin, Navigation, Truck } from 'lucide-react'
import { cn } from '@/lib/utils'

// India bounding box (approx) for projecting [lng, lat] into the SVG canvas.
const BOUNDS = { minLng: 68, maxLng: 90, minLat: 8, maxLat: 34 }
const W = 600
const H = 460

function project([lng, lat]: [number, number]): [number, number] {
  const x = ((lng - BOUNDS.minLng) / (BOUNDS.maxLng - BOUNDS.minLng)) * W
  const y = H - ((lat - BOUNDS.minLat) / (BOUNDS.maxLat - BOUNDS.minLat)) * H
  return [x, y]
}

interface MapViewProps {
  origin: [number, number]
  destination: [number, number]
  originLabel?: string
  destinationLabel?: string
  current?: [number, number]
  /** Show the animated truck marker on the route. */
  live?: boolean
  className?: string
  height?: number
}

/**
 * A self-contained, dependency-free route map. When a real Mapbox/Google key
 * is configured this component can be swapped for an interactive map — until
 * then it renders a clean, branded static map so the layout never breaks.
 */
export function MapView({
  origin,
  destination,
  originLabel,
  destinationLabel,
  current,
  live,
  className,
  height = 320,
}: MapViewProps) {
  const a = useMemo(() => project(origin), [origin])
  const b = useMemo(() => project(destination), [destination])
  const c = current ? project(current) : null

  // Quadratic control point for a gently curved route.
  const ctrl: [number, number] = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2 - 50]
  const path = `M ${a[0]} ${a[1]} Q ${ctrl[0]} ${ctrl[1]} ${b[0]} ${b[1]}`

  return (
    <div
      className={cn('relative overflow-hidden rounded-2xl border border-slate-200 bg-brand-50', className)}
      style={{ height }}
    >
      <svg viewBox={`0 0 ${W} ${H}`} className="h-full w-full" preserveAspectRatio="xMidYMid slice">
        <defs>
          <pattern id="grid" width="28" height="28" patternUnits="userSpaceOnUse">
            <path d="M 28 0 L 0 0 0 28" fill="none" stroke="#cdd9ec" strokeWidth="1" />
          </pattern>
          <linearGradient id="mapBg" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#eaf1fb" />
            <stop offset="100%" stopColor="#dde8f7" />
          </linearGradient>
        </defs>

        <rect width={W} height={H} fill="url(#mapBg)" />
        <rect width={W} height={H} fill="url(#grid)" />

        {/* decorative landmass blobs */}
        <g fill="#cfe0d4" opacity="0.55">
          <path d="M120 90 q60 -30 130 10 q70 40 40 120 q-30 80 -130 70 q-110 -10 -120 -110 q-5 -60 80 -90Z" />
          <path d="M360 230 q50 -20 90 20 q40 50 -10 110 q-60 50 -120 10 q-40 -60 40 -150Z" />
        </g>

        {/* route */}
        <path d={path} fill="none" stroke="#1A3D7C" strokeWidth="4" strokeDasharray="2 9" strokeLinecap="round" opacity="0.85" />

        {/* origin marker */}
        <g>
          <circle cx={a[0]} cy={a[1]} r="9" fill="#1A3D7C" stroke="#fff" strokeWidth="3" />
          <circle cx={a[0]} cy={a[1]} r="16" fill="#1A3D7C" opacity="0.15" />
        </g>

        {/* destination marker */}
        <g>
          <circle cx={b[0]} cy={b[1]} r="9" fill="#F5821F" stroke="#fff" strokeWidth="3" />
          <circle cx={b[0]} cy={b[1]} r="16" fill="#F5821F" opacity="0.18" />
        </g>

        {/* live truck */}
        {c && (
          <g transform={`translate(${c[0] - 14} ${c[1] - 14})`} className={live ? 'animate-truck-move' : undefined}>
            <circle cx="14" cy="14" r="20" fill="#28A745" opacity="0.18" />
            <circle cx="14" cy="14" r="14" fill="#28A745" stroke="#fff" strokeWidth="2.5" />
          </g>
        )}
      </svg>

      {/* truck icon overlay (HTML, crisp) on live position */}
      {c && (
        <div
          className="pointer-events-none absolute"
          style={{ left: `${(c[0] / W) * 100}%`, top: `${(c[1] / H) * 100}%`, transform: 'translate(-50%,-50%)' }}
        >
          <Truck size={16} className="text-white drop-shadow" />
        </div>
      )}

      {/* labels */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between gap-2 p-3">
        {originLabel && (
          <span className="badge max-w-[45%] bg-white/95 text-brand shadow-soft">
            <MapPin size={12} /> <span className="truncate">{originLabel}</span>
          </span>
        )}
        {destinationLabel && (
          <span className="badge max-w-[45%] bg-white/95 text-accent-600 shadow-soft">
            <Navigation size={12} /> <span className="truncate">{destinationLabel}</span>
          </span>
        )}
      </div>

      {live && (
        <span className="absolute right-3 top-3 badge bg-success/90 text-white shadow-soft">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" /> Live
        </span>
      )}
    </div>
  )
}
