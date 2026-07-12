import { Check } from 'lucide-react'
import type { TripEvent } from '@/lib/types'
import { formatDateTime } from '@/lib/utils'
import { cn } from '@/lib/utils'

export function Timeline({ events }: { events: TripEvent[] }) {
  const lastReached = events.reduce((acc, e, i) => (e.at ? i : acc), -1)

  return (
    <ol className="relative">
      {events.map((ev, i) => {
        const reached = !!ev.at
        const isCurrent = i === lastReached
        const isLast = i === events.length - 1
        return (
          <li key={ev.status} className="relative flex gap-4 pb-6 last:pb-0">
            {/* connector */}
            {!isLast && (
              <span
                className={cn(
                  'absolute left-[15px] top-8 h-[calc(100%-1.5rem)] w-0.5',
                  i < lastReached ? 'bg-success' : 'bg-slate-200',
                )}
              />
            )}
            <span
              className={cn(
                'relative grid h-8 w-8 shrink-0 place-items-center rounded-full transition',
                reached ? 'bg-success text-white' : 'border-2 border-slate-200 bg-white text-slate-300',
                isCurrent && 'ring-4 ring-success/20',
              )}
            >
              {reached ? <Check size={16} /> : <span className="h-2 w-2 rounded-full bg-current" />}
            </span>
            <div className="pt-1">
              <p className={cn('text-sm font-semibold', reached ? 'text-ink' : 'text-slate-400')}>{ev.label}</p>
              <p className="text-xs text-slate-400">{ev.at ? formatDateTime(ev.at) : 'Pending'}</p>
            </div>
          </li>
        )
      })}
    </ol>
  )
}
