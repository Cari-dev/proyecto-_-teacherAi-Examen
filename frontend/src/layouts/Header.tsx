import { Menu, Sparkles } from 'lucide-react'
import { useLocation } from 'react-router-dom'
import { Badge } from '../components/Badge'

function resolveTitle(pathname: string): string {
  if (pathname === '/') return 'Dashboard'
  if (pathname === '/planes/nueva') return 'Nueva planificación'
  if (/^\/planes\/\d+\/editar$/.test(pathname)) return 'Editar planificación'
  if (/^\/planes\/\d+$/.test(pathname)) return 'Detalle de planificación'
  if (pathname.startsWith('/planes')) return 'Planificaciones'
  if (pathname === '/actividades/nueva') return 'Nueva actividad'
  if (/^\/actividades\/\d+$/.test(pathname)) return 'Detalle de actividad'
  if (pathname.startsWith('/actividades')) return 'Actividades'
  if (pathname === '/evaluaciones/nueva') return 'Nueva evaluación'
  if (/^\/evaluaciones\/\d+$/.test(pathname)) return 'Detalle de evaluación'
  if (pathname.startsWith('/evaluaciones')) return 'Evaluaciones'
  if (pathname.startsWith('/asistente')) return 'Asistente TeacherAI'
  return 'TeacherAI'
}

export function Header({
  onOpenSidebar,
  assistantMode,
}: {
  onOpenSidebar: () => void
  assistantMode?: 'demo' | 'gemini'
}) {
  const { pathname } = useLocation()
  const today = new Intl.DateTimeFormat('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(new Date())

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/85 backdrop-blur-md">
      <div className="flex h-[76px] items-center gap-3 px-4 sm:px-6 lg:px-8">
        <button
          type="button"
          onClick={onOpenSidebar}
          className="rounded-xl border border-slate-200 bg-white p-2 text-slate-600 shadow-sm transition hover:bg-slate-50 lg:hidden"
          aria-label="Abrir menú"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">
            Panel docente
          </p>
          <p className="truncate text-sm font-semibold text-brand-950">{resolveTitle(pathname)}</p>
        </div>

        <div className="hidden items-center gap-2 md:flex">
          <span className="text-xs capitalize text-slate-400">{today}</span>
        </div>

        {assistantMode && (
          <Badge variant={assistantMode === 'gemini' ? 'green' : 'amber'} className="hidden sm:inline-flex">
            <Sparkles className="h-3 w-3" />
            {assistantMode === 'gemini' ? 'Gemini activo' : 'IA en demostración'}
          </Badge>
        )}

        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-950 text-xs font-bold text-white ring-2 ring-brand-100">
          D
        </div>
      </div>
    </header>
  )
}
