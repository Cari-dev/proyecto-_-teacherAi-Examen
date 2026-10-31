import { Eye, NotebookPen, Pencil, Plus, Search, Trash2 } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Badge, DemoBadge } from '../components/Badge'
import { Button, buttonClasses } from '../components/Button'
import { Card } from '../components/Card'
import { ConfirmDialog } from '../components/ConfirmDialog'
import { EmptyState } from '../components/EmptyState'
import { ErrorState } from '../components/ErrorState'
import { PageHeader } from '../components/PageHeader'
import { SkeletonRow } from '../components/Spinner'
import { useToast } from '../components/ToastProvider'
import { useApiResource } from '../hooks/useApiResource'
import { deletePlan } from '../services/plans'
import type { Plan } from '../types'
import { getErrorMessage } from '../services/api'
import { cn, formatDate, formatDuration } from '../utils/format'

export function PlansPage() {
  const { data, loading, error, reload } = useApiResource<Plan[]>('/plans')
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<Plan | null>(null)
  const [deleting, setDeleting] = useState(false)
  const { notify } = useToast()

  const plans = data ?? []
  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase()
    if (!query) return plans
    return plans.filter((plan) =>
      [plan.title, plan.subject, plan.topic, plan.education_level].some((value) =>
        value.toLowerCase().includes(query),
      ),
    )
  }, [plans, search])

  const handleDelete = async () => {
    if (!selected) return
    setDeleting(true)
    try {
      await deletePlan(selected.id)
      notify('Planificación eliminada correctamente.')
      setSelected(null)
      reload()
    } catch (requestError) {
      notify(getErrorMessage(requestError), 'error')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Planificaciones"
        description="Organiza tus clases con objetivos, contenidos, actividades y recursos."
        actions={
          <Link to="/planes/nueva" className={buttonClasses('primary')}>
            <Plus className="h-4 w-4" />
            Nueva planificación
          </Link>
        }
      />

      <Card>
        <div className="flex flex-col gap-3 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:max-w-sm">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar por título, tema o asignatura..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-3.5 text-sm outline-none transition placeholder:text-slate-400 focus:border-brand-400 focus:bg-white focus:ring-2 focus:ring-brand-100"
              aria-label="Buscar planificaciones"
            />
          </div>
          <p className="text-xs text-slate-500">
            {filtered.length} de {plans.length} planificaciones
          </p>
        </div>

        {loading && (
          <div>
            <SkeletonRow />
            <SkeletonRow />
            <SkeletonRow />
          </div>
        )}

        {!loading && error && <ErrorState message={error} onRetry={reload} />}

        {!loading && !error && plans.length === 0 && (
          <EmptyState
            icon={NotebookPen}
            title="Todavía no hay planificaciones"
            description="Crea una planificación para organizar tu próxima clase paso a paso."
            action={
              <Link to="/planes/nueva" className={buttonClasses('primary', 'sm')}>
                <Plus className="h-3.5 w-3.5" />
                Crear la primera
              </Link>
            }
          />
        )}

        {!loading && !error && plans.length > 0 && filtered.length === 0 && (
          <EmptyState
            icon={Search}
            title="Sin resultados"
            description="No encontramos planificaciones que coincidan con tu búsqueda."
          />
        )}

        {!loading && !error && filtered.length > 0 && (
          <>
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/70 text-[11px] uppercase tracking-wider text-slate-500">
                    <th className="px-5 py-3 font-semibold">Planificación</th>
                    <th className="px-5 py-3 font-semibold">Asignatura</th>
                    <th className="px-5 py-3 font-semibold">Nivel / Curso</th>
                    <th className="px-5 py-3 font-semibold">Duración</th>
                    <th className="px-5 py-3 font-semibold">Creada</th>
                    <th className="px-5 py-3 text-right font-semibold">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filtered.map((plan) => (
                    <tr key={plan.id} className="transition hover:bg-slate-50/70">
                      <td className="max-w-[280px] px-5 py-4">
                        <Link to={`/planes/${plan.id}`} className="block">
                          <span className="flex items-center gap-2">
                            <span className="truncate text-sm font-semibold text-slate-900">{plan.title}</span>
                            {plan.is_demo && <DemoBadge />}
                          </span>
                          <span className="mt-0.5 block truncate text-xs text-slate-500">{plan.topic}</span>
                        </Link>
                      </td>
                      <td className="px-5 py-4">
                        <Badge variant="blue">{plan.subject}</Badge>
                      </td>
                      <td className="px-5 py-4 text-sm text-slate-600">
                        {plan.education_level}
                        <span className="block text-xs text-slate-400">{plan.course}</span>
                      </td>
                      <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-600">
                        {formatDuration(plan.duration_minutes)}
                      </td>
                      <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-500">
                        {formatDate(plan.created_at)}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-end gap-1">
                          <Link
                            to={`/planes/${plan.id}`}
                            className="rounded-lg p-2 text-slate-400 transition hover:bg-brand-50 hover:text-brand-700"
                            aria-label={`Ver ${plan.title}`}
                          >
                            <Eye className="h-4 w-4" />
                          </Link>
                          <Link
                            to={`/planes/${plan.id}/editar`}
                            className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                            aria-label={`Editar ${plan.title}`}
                          >
                            <Pencil className="h-4 w-4" />
                          </Link>
                          <button
                            type="button"
                            onClick={() => setSelected(plan)}
                            className="rounded-lg p-2 text-slate-400 transition hover:bg-rose-50 hover:text-rose-600"
                            aria-label={`Eliminar ${plan.title}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="divide-y divide-slate-100 md:hidden">
              {filtered.map((plan) => (
                <article key={plan.id} className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <Link to={`/planes/${plan.id}`} className="min-w-0">
                      <p className="text-sm font-semibold text-slate-900">{plan.title}</p>
                      <p className="mt-0.5 text-xs text-slate-500">{plan.topic}</p>
                    </Link>
                    {plan.is_demo && <DemoBadge />}
                  </div>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    <Badge variant="blue">{plan.subject}</Badge>
                    <Badge>{plan.education_level}</Badge>
                    <Badge>{formatDuration(plan.duration_minutes)}</Badge>
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-xs text-slate-400">{formatDate(plan.created_at)}</span>
                    <div className="flex gap-1">
                      <Link
                        to={`/planes/${plan.id}/editar`}
                        className={cn(buttonClasses('secondary', 'sm', 'px-2.5 py-1.5'))}
                        aria-label={`Editar ${plan.title}`}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                        Editar
                      </Link>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="px-2.5 py-1.5 text-rose-600 hover:bg-rose-50"
                        onClick={() => setSelected(plan)}
                        aria-label={`Eliminar ${plan.title}`}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </>
        )}
      </Card>

      <ConfirmDialog
        open={Boolean(selected)}
        title="Eliminar planificación"
        description={`¿Seguro que deseas eliminar "${selected?.title ?? ''}"? Esta acción no se puede deshacer.`}
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setSelected(null)}
      />
    </div>
  )
}
