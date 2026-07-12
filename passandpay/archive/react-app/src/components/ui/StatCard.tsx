import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

export function StatCard({
  label,
  value,
  icon,
  trend,
  accent = 'brand',
}: {
  label: string
  value: ReactNode
  icon?: ReactNode
  trend?: string
  accent?: 'brand' | 'accent' | 'success' | 'danger'
}) {
  const accentCls = {
    brand: 'bg-brand-50 text-brand',
    accent: 'bg-accent-50 text-accent-600',
    success: 'bg-green-50 text-success',
    danger: 'bg-rose-50 text-danger',
  }[accent]

  return (
    <div className="card flex items-start justify-between gap-3 p-5">
      <div className="min-w-0">
        <p className="text-sm font-medium text-slate-500">{label}</p>
        <p className="mt-1.5 truncate text-2xl font-bold text-ink">{value}</p>
        {trend && <p className="mt-1 text-xs font-medium text-success">{trend}</p>}
      </div>
      {icon && <div className={cn('grid h-11 w-11 shrink-0 place-items-center rounded-xl', accentCls)}>{icon}</div>}
    </div>
  )
}
