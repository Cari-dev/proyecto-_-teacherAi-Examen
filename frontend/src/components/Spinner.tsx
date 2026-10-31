import { Loader2 } from 'lucide-react'

export function Spinner({ className = 'h-5 w-5' }: { className?: string }) {
  return <Loader2 className={`animate-spin text-brand-600 ${className}`} aria-hidden="true" />
}

export function PageLoader({ label = 'Cargando información...' }: { label?: string }) {
  return (
    <div className="flex min-h-[240px] flex-col items-center justify-center gap-3 text-slate-500">
      <Spinner className="h-7 w-7" />
      <p className="text-sm">{label}</p>
    </div>
  )
}

export function SkeletonRow() {
  return (
    <div className="flex items-center gap-4 border-b border-slate-100 px-5 py-4 last:border-0">
      <div className="h-10 w-10 animate-pulse rounded-xl bg-slate-100" />
      <div className="flex-1 space-y-2">
        <div className="h-3.5 w-1/3 animate-pulse rounded bg-slate-100" />
        <div className="h-3 w-1/4 animate-pulse rounded bg-slate-100" />
      </div>
      <div className="h-8 w-24 animate-pulse rounded-lg bg-slate-100" />
    </div>
  )
}
