import { Link } from 'react-router-dom'
import { cn } from '@/lib/utils'

interface LogoProps {
  /** Use white text for dark backgrounds. */
  variant?: 'default' | 'light'
  className?: string
  /** Wrap in a link to home. */
  to?: string
}

export function Logo({ variant = 'default', className, to = '/' }: LogoProps) {
  const textColor = variant === 'light' ? 'text-white' : 'text-brand'
  const accentColor = 'text-accent'

  const mark = (
    <span className={cn('flex items-center gap-2.5', className)}>
      <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand shadow-soft">
        <svg viewBox="0 0 32 32" className="h-6 w-6" aria-hidden="true">
          <rect x="2" y="9" width="15" height="11" rx="2" fill="#FFFFFF" />
          <path d="M17 12h6l5 5v3h-11z" fill="#F5821F" />
          <circle cx="9" cy="22" r="3" fill="#1F2933" stroke="#FFFFFF" strokeWidth="1.5" />
          <circle cx="22" cy="22" r="3" fill="#1F2933" stroke="#FFFFFF" strokeWidth="1.5" />
        </svg>
      </span>
      <span className="text-lg font-extrabold leading-none tracking-tight">
        <span className={textColor}>Pass</span>
        <span className={accentColor}> &amp; </span>
        <span className={textColor}>Pay</span>
      </span>
    </span>
  )

  if (to) {
    return (
      <Link to={to} aria-label="Pass and Pay home" className="inline-flex">
        {mark}
      </Link>
    )
  }
  return mark
}
