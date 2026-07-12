import { cn } from '@/lib/utils'
import { initials } from '@/lib/utils'

export function Avatar({
  name,
  color,
  size = 'md',
  className,
}: {
  name: string
  color: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
}) {
  const dims =
    size === 'sm' ? 'h-8 w-8 text-xs' : size === 'lg' ? 'h-14 w-14 text-lg' : 'h-10 w-10 text-sm'
  return (
    <span
      className={cn(
        'inline-grid shrink-0 place-items-center rounded-full font-bold text-white',
        dims,
        className,
      )}
      style={{ backgroundColor: color }}
      aria-hidden="true"
    >
      {initials(name)}
    </span>
  )
}
