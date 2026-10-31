import {
  Bot,
  ClipboardCheck,
  GraduationCap,
  LayoutDashboard,
  NotebookPen,
  Puzzle,
  Sparkles,
  Wifi,
  WifiOff,
  X,
} from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { cn } from '../utils/format'

const navigation = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/planes', label: 'Planificaciones', icon: NotebookPen },
  { to: '/actividades', label: 'Actividades', icon: Puzzle },
  { to: '/evaluaciones', label: 'Evaluaciones', icon: ClipboardCheck },
  { to: '/asistente', label: 'Asistente TeacherAI', icon: Bot },
]

export function Sidebar({
  open,
  onClose,
  online,
  assistantMode,
}: {
  open: boolean
  onClose: () => void
  online: boolean
  assistantMode?: 'demo' | 'gemini'
}) {
  return (
    <>
      {open && (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-brand-950/50 backdrop-blur-sm lg:hidden"
          onClick={onClose}
          aria-label="Cerrar menú"
        />
      )}

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex w-[272px] flex-col bg-brand-950 text-white transition-transform duration-200 lg:translate-x-0',
          open ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className="flex h-[76px] items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-500 text-white shadow-lg shadow-brand-500/25">
              <GraduationCap className="h-5 w-5" />
            </span>
            <div>
              <p className="text-base font-bold tracking-tight">TeacherAI</p>
              <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-brand-300">
                Asistente docente
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-brand-200 transition hover:bg-white/10 hover:text-white lg:hidden"
            aria-label="Cerrar menú"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="px-4 pt-4">
          <p className="px-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-brand-400">
            Espacio de trabajo
          </p>
        </div>

        <nav className="mt-3 flex-1 space-y-1 px-3" aria-label="Navegación principal">
          {navigation.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={onClose}
              className={({ isActive }) =>
                cn(
                  'group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition',
                  isActive
                    ? 'bg-white/10 text-white shadow-sm'
                    : 'text-brand-200 hover:bg-white/5 hover:text-white',
                )
              }
            >
              {({ isActive }) => (
                <>
                  <Icon
                    className={cn(
                      'h-[18px] w-[18px] transition',
                      isActive ? 'text-brand-300' : 'text-brand-400 group-hover:text-brand-200',
                    )}
                  />
                  <span className="flex-1">{label}</span>
                  {to === '/asistente' && (
                    <Sparkles className="h-3.5 w-3.5 text-amber-300" aria-hidden="true" />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="m-3 space-y-3 rounded-2xl border border-white/10 bg-white/5 p-3.5">
          <div className="flex items-center gap-2.5">
            <span
              className={cn(
                'flex h-8 w-8 items-center justify-center rounded-lg',
                online ? 'bg-emerald-400/15 text-emerald-300' : 'bg-rose-400/15 text-rose-300',
              )}
            >
              {online ? <Wifi className="h-4 w-4" /> : <WifiOff className="h-4 w-4" />}
            </span>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-white">
                {online ? 'API conectada' : 'Sin conexión'}
              </p>
              <p className="truncate text-[11px] text-brand-300">
                {online ? 'Backend operativo' : 'Verifica el servidor'}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between rounded-lg bg-brand-950/60 px-2.5 py-2">
            <span className="text-[11px] font-medium text-brand-300">Asistente IA</span>
            <span
              className={cn(
                'rounded-full px-2 py-0.5 text-[10px] font-bold',
                assistantMode === 'gemini'
                  ? 'bg-emerald-400/15 text-emerald-300'
                  : 'bg-amber-300/15 text-amber-200',
              )}
            >
              {assistantMode === 'gemini' ? 'Gemini' : 'Demo'}
            </span>
          </div>
          <p className="text-[10px] leading-4 text-brand-400">
            {assistantMode === 'gemini'
              ? 'Las respuestas usan la API de Gemini.'
              : 'Las respuestas usan plantillas locales identificadas.'}
          </p>
        </div>
      </aside>
    </>
  )
}
