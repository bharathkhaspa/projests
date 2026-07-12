import type { ReactNode } from 'react'

/** Consistent padded container for authenticated app pages. */
export function Page({ children }: { children: ReactNode }) {
  return <div className="mx-auto w-full max-w-6xl space-y-6 px-4 py-6 sm:px-6 sm:py-8">{children}</div>
}
