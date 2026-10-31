import { Clock, Eye, Plus, Puzzle, Search, Trash2 } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Badge, DemoBadge } from '../components/Badge'
import { Button, buttonClasses } from '../components/Button'
import { Card } from '../components/Card'
import { ConfirmDialog } from '../components/ConfirmDialog'
import { EmptyState } from '../components/EmptyState'
import { ErrorState } from '../components/ErrorState'
import { PageHeader } from '../components/PageHeader'
import { PageLoader } from '../components/Spinner'
import { useToast } from '../components/ToastProvider'
import { useApiResource } from '../hooks/useApiResource'
import { getErrorMessage } from '../services/api'
import { deleteActivity } from '../services/activities'
import type { Activity } from '../types'
import { formatDate, formatDuration } from '../utils/format'

export function ActivitiesPage() {
  const { data, loading, error, reload } = useApiResource<Activity[]>('/activities')
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [selected, setSelected] = useState<Activity | null>(null)
  const [deleting, setDeleting] = useState(false)
  const { notify } = useToast()

  const activities = data ?? []
  const activityTypes = useMemo(
    () => Array.from(new Set(activities.map((activity) => activity.activity_type))).sort(),
    [activities],
  )

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase()
    return activities.filter((activity) => {
      const matchesQuery =
        !query ||
        [activity.title, activity.topic, activity.subject, activity.description].some((value) =>
          value.toLowerCase().includes(query),
        )
      const matchesType = !typeFilter || activity.activity_type === typeFilter
      return matchesQuery && matchesType
    })
  }, [activities, search, typeFilter])

  const handleDelete = async () => {
    if (!selected) return
    setDeleting(true)
    try {
      await deleteActivity(selected.id)
      notify('Actividad eliminada correctamente.')
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
        title="Actividades educativas"
        description="Una biblioteca de dinámicas listas para complementar tus clases."
        actions={
          <Link to="/actividades/nueva" className={buttonClasses('primary')}>
            <Plus className="h-4 w-4" />
            Nueva actividad
          </Link>
        }
      />

      <div className="mb-5 flex flex-col gap-3 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar actividades..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-3.5 text-sm outline-none transition placeholder:text-slate-400 focus:border-brand-400 focus:bg-white focus:ring-2 focus:ring-brand-100"
            aria-label="Buscar actividades"
          />
        </div>
        <select
          value={typeFilter}
          onChange={(event) => setTypeFilter(event.target.value)}
          className="rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-700 outline-none transition focus:border-brand-400 focus:bg-white focus:ring-2 focus:ring-brand-100 sm:w-52"
          aria-label="Filtrar por tipo de actividad"
        >
          <option value="">Todos los tipos</option>
          {activityTypes.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
        <p className="text-xs text-slate-500">
          {filtered.length} de {activities.length}
        </p>
      </div>

      {loading && <PageLoader label="Cargando actividades..." />}

      {!loading && error && (
        <Card>
          <ErrorState message={error} onRetry={reload} />
        </Card>
      )}

      {!loading && !error && activities.length === 0 && (
        <Card>
          <EmptyState
            icon={Puzzle}
            title="Tu biblioteca está vacía"
            description="Registra una actividad para reutilizarla cuando prepares tus clases."
            action={
              <Link to="/actividades/nueva" className={buttonClasses('primary', 'sm')}>
                <Plus className="h-3.5 w-3.5" />
                Crear actividad
              </Link>
            }
          />
        </Card>
      )}

      {!loading && !error && activities.length > 0 && filtered.length === 0 && (
        <Card>
          <EmptyState
            icon={Search}
            title="Sin coincidencias"
            description="Prueba con otro término de búsqueda o cambia el tipo de actividad."
          />
        </Card>
      )}

      {!loading && !error && filtered.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((activity) => (
            <Card key={activity.id} className="flex flex-col transition hover:-translate-y-0.5 hover:shadow-md">
              <div className="flex items-start justify-between gap-3 p-5 pb-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                  <Puzzle className="h-5 w-5" />
                </span>
                <div className="flex flex-wrap justify-end gap-1.5">
                  <Badge variant="green">{activity.activity_type}</Badge>
                  {activity.is_demo && <DemoBadge />}
                </div>
              </div>
              <div className="flex flex-1 flex-col px-5 pb-5">
                <Link to={`/actividades/${activity.id}`} className="group">
                  <h2 className="text-sm font-semibold text-slate-900 transition group-hover:text-brand-700">
                    {activity.title}
                  </h2>
                </Link>
                <p className="mt-1 text-xs text-slate-500">
                  {activity.subject} · {activity.education_level}
                </p>
                <p className="mt-3 line-clamp-3 flex-1 text-sm leading-6 text-slate-600">
                  {activity.description}
                </p>
                <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                  <span className="inline-flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" />
                    {formatDuration(activity.estimated_duration_minutes)}
                  </span>
                  <span className="text-slate-300">•</span>
                  <span>{formatDate(activity.created_at)}</span>
                </div>
                <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
                  <Link
                    to={`/actividades/${activity.id}`}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-700 hover:text-brand-800"
                  >
                    <Eye className="h-3.5 w-3.5" />
                    Ver detalle
                  </Link>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="px-2 py-1.5 text-rose-600 hover:bg-rose-50"
                    onClick={() => setSelected(activity)}
                    aria-label={`Eliminar ${activity.title}`}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={Boolean(selected)}
        title="Eliminar actividad"
        description={`¿Seguro que deseas eliminar "${selected?.title ?? ''}"? Esta acción no se puede deshacer.`}
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setSelected(null)}
      />
    </div>
  )
}
