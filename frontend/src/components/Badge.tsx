import type { ReactNode } from 'react'
import { cn } from '../utils/format'

export type BadgeVariant = 'neutral' | 'blue' | 'green' | 'amber' | 'rose' | 'violet'

const styles: Record<BadgeVariant, string> = {
  neutral: 'border-slate-200 bg-slate-50 text-slate-600',
  blue: 'border-sky-200 bg-sky-50 text-sky-700',
  green: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  amber: 'border-amber-200 bg-amber-50 text-amber-800',
  rose: 'border-rose-200 bg-rose-50 text-rose-700',
  violet: 'border-violet-200 bg-violet-50 text-violet-700',
}

export function Badge({
  children,
  variant = 'neutral',
  className,
}: {
  children: ReactNode
  variant?: BadgeVariant
  className?: string
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold tracking-wide',
        styles[variant],
        className,
      )}
    >
      {children}
    </span>
  )
}

export function DemoBadge() {
  return <Badge variant="amber">Demostración</Badge>
}
