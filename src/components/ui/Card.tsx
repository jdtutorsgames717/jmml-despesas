import type { PropsWithChildren } from 'react'

type Props = PropsWithChildren<{
  className?: string
}>

export function Card({ children, className = '' }: Props) {
  return (
    <div
      className={`rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800 ${className}`}
    >
      {children}
    </div>
  )
}

