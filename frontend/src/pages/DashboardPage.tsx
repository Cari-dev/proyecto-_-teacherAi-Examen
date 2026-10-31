import {
  ArrowRight,
  Bot,
  CalendarDays,
  ClipboardCheck,
  ListChecks,
  NotebookPen,
  Plus,
  Puzzle,
  Sparkles,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { Badge, DemoBadge } from '../components/Badge'
import { buttonClasses } from '../components/Button'
import { Card, CardHeader } from '../components/Card'
import { EmptyState } from '../components/EmptyState'
import { ErrorState } from '../components/ErrorState'
import { PageLoader } from '../components/Spinner'
import { StatCard } from '../components/StatCard'
import { useApiResource } from '../hooks/useApiResource'
import type { DashboardData } from '../types'
import { formatDate } from '../utils/format'

const quickActions = [
  {
    to: '/planes/nueva',
    title: 'Planificar una clase',
    description: 'Organiza objetivos, contenidos y recursos.',
    icon: NotebookPen,
    tone: 'bg-brand-50 text-brand-700',
  },
  {
    to: '/actividades/nueva',
    title: 'Crear una actividad',
    description: 'Diseña dinámicas para tus estudiantes.',
    icon: Puzzle,
    tone: 'bg-emerald-50 text-emerald-700',
  },
  {
    to: '/evaluaciones/nueva',
    title: 'Preparar una evaluación',
    description: 'Construye cuestionarios con respuestas.',
    icon: ClipboardCheck,
    tone: 'bg-violet-50 text-violet-700',
  },
  {
    to: '/asistente',
    title: 'Pedir ayuda a TeacherAI',
    description: 'Genera ideas y material educativo.',
    icon: Sparkles,
    tone: 'bg-amber-50 text-amber-700',
  },
]

export function DashboardPage() {
  const { data, loading, error, reload } = useApiResource<DashboardData>('/dashboard')

  if (loading) return <PageLoader label="Cargando tu panel docente..." />
  if (error) return <ErrorState message={error} onRetry={reload} />
  if (!data) return null

  return (
    <div className="animate-fade-in">
      <section className="relative overflow-hidden rounded-2xl bg-brand-950 px-6 py-8 text-white shadow-lg shadow-brand-950/10 sm:px-8 sm:py-10">
        <div className="pointer-events-none absolute -right-16 -top-24 h-72 w-72 rounded-full bg-brand-500/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-28 right-32 h-64 w-64 rounded-full bg-sky-400/10 blur-3xl" />
        <div className="relative flex flex-col gap-7 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="blue" className="border-white/10 bg-white/10 text-brand-100">
                <CalendarDays className="h-3 w-3" />
                {new Intl.DateTimeFormat('es-ES', { dateStyle: 'long' }).format(new Date())}
              </Badge>
              <Badge variant={data.assistant_mode === 'gemini' ? 'green' : 'amber'}>
                {data.assistant_mode === 'gemini' ? 'Gemini activo' : 'Asistente en modo demo'}
              </Badge>
            </div>
            <h1 className="mt-4 text-2xl font-bold tracking-tight sm:text-3xl">
              Hola, {data.teacher_name}
            </h1>
            <p className="mt-2 max-w-xl text-sm leading-6 text-brand-200">
              Bienvenido a tu espacio de trabajo. Organiza tus clases, crea material y aprovecha el
              asistente pedagógico para preparar mejores experiencias de aprendizaje.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link to="/planes/nueva" className={buttonClasses('primary', 'md', 'bg-brand-500 hover:bg-brand-400')}>
              <Plus className="h-4 w-4" />
              Nueva planificación
            </Link>
            <Link
              to="/asistente"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              <Bot className="h-4 w-4" />
              Abrir asistente
            </Link>
          </div>
        </div>
      </section>

      <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={NotebookPen}
          label="Planificaciones"
          value={data.stats.plans}
          hint="Clases planificadas y listas para usar"
          tone="blue"
        />
        <StatCard
          icon={Puzzle}
          label="Actividades"
          value={data.stats.activities}
          hint="Dinámicas registradas en tu biblioteca"
          tone="emerald"
        />
        <StatCard
          icon={ClipboardCheck}
          label="Evaluaciones"
          value={data.stats.assessments}
          hint="Cuestionarios guardados en el sistema"
          tone="violet"
        />
        <StatCard
          icon={ListChecks}
          label="Preguntas"
          value={data.stats.questions}
          hint="Reactivos disponibles en tus evaluaciones"
          tone="sky"
        />
      </section>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <Card>
          <CardHeader
            title="Accesos rápidos"
            description="Las tareas más frecuentes de tu día a día."
          />
          <div className="grid gap-3 p-5 sm:grid-cols-2">
            {quickActions.map(({ to, title, description, icon: Icon, tone }) => (
              <Link
                key={to}
                to={to}
                className="group flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50/70 p-4 transition hover:border-brand-200 hover:bg-brand-50/60"
              >
                <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${tone}`}>
                  <Icon className="h-5 w-5" />
                </span>
                <span className="min-w-0">
                  <span className="flex items-center gap-1.5 text-sm font-semibold text-slate-900">
                    {title}
                    <ArrowRight className="h-3.5 w-3.5 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-brand-600" />
                  </span>
                  <span className="mt-1 block text-xs leading-5 text-slate-500">{description}</span>
                </span>
              </Link>
            ))}
          </div>
        </Card>

        <Card>
          <CardHeader
            title="Últimas planificaciones"
            description="Los registros más recientes de la base de datos."
            action={
              <Link to="/planes" className="text-xs font-semibold text-brand-700 hover:text-brand-800">
                Ver todas
              </Link>
            }
          />
          {data.latest_plans.length === 0 ? (
            <EmptyState
              icon={NotebookPen}
              title="Aún no hay planificaciones"
              description="Crea tu primera planificación para verla reflejada aquí."
              action={
                <Link to="/planes/nueva" className={buttonClasses('primary', 'sm')}>
                  <Plus className="h-3.5 w-3.5" />
                  Crear planificación
                </Link>
              }
            />
          ) : (
            <ul className="divide-y divide-slate-100">
              {data.latest_plans.map((plan) => (
                <li key={plan.id}>
                  <Link
                    to={`/planes/${plan.id}`}
                    className="flex items-center gap-3 px-5 py-3.5 transition hover:bg-slate-50"
                  >
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                      <NotebookPen className="h-4.5 w-4.5" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex flex-wrap items-center gap-2">
                        <span className="truncate text-sm font-semibold text-slate-900">{plan.title}</span>
                        {plan.is_demo && <DemoBadge />}
                      </span>
                      <span className="mt-0.5 block truncate text-xs text-slate-500">
                        {plan.subject} · {plan.education_level} · {formatDate(plan.created_at)}
                      </span>
                    </span>
                    <ArrowRight className="h-4 w-4 shrink-0 text-slate-300" />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  )
}
