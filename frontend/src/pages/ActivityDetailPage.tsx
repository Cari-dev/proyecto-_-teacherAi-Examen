import { Clock, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Badge, DemoBadge } from '../components/Badge'
import { Button } from '../components/Button'
import { Card, CardHeader } from '../components/Card'
import { ConfirmDialog } from '../components/ConfirmDialog'
import { ErrorState } from '../components/ErrorState'
import { PageHeader } from '../components/PageHeader'
import { PageLoader } from '../components/Spinner'
import { useToast } from '../components/ToastProvider'
import { useApiResource } from '../hooks/useApiResource'
import { deleteActivity } from '../services/activities'
import { getErrorMessage } from '../services/api'
import type { Activity } from '../types'
import { formatDateTime, formatDuration } from '../utils/format'

export function ActivityDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { notify } = useToast()
  const { data: activity, loading, error, reload } = useApiResource<Activity>(
    id ? `/activities/${id}` : null,
  )
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const handleDelete = async () => {
    if (!activity) return
    setDeleting(true)
    try {
      await deleteActivity(activity.id)
      notify('Actividad eliminada correctamente.')
      navigate('/actividades')
    } catch (requestError) {
      notify(getErrorMessage(requestError), 'error')
      setDeleting(false)
    }
  }

  if (loading) return <PageLoader label="Cargando actividad..." />
  if (error) return <ErrorState message={error} onRetry={reload} />
  if (!activity) return null

  return (
    <div className="animate-fade-in">
      <PageHeader
        title={activity.title}
        description={`${activity.subject} · ${activity.education_level}`}
        backTo="/actividades"
        actions={
          <Button variant="danger" onClick={() => setConfirmOpen(true)}>
            <Trash2 className="h-4 w-4" />
            Eliminar
          </Button>
        }
      />

      <div className="mb-5 flex flex-wrap items-center gap-2">
        <Badge variant="green">{activity.activity_type}</Badge>
        <Badge variant="blue">{activity.subject}</Badge>
        <Badge>{activity.education_level}</Badge>
        <Badge variant="violet">
          <Clock className="h-3 w-3" />
          {formatDuration(activity.estimated_duration_minutes)}
        </Badge>
        {activity.is_demo && <DemoBadge />}
      </div>

      <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
        <Card>
          <CardHeader title="Descripción de la actividad" />
          <div className="p-5">
            <p className="whitespace-pre-line text-sm leading-7 text-slate-600">{activity.description}</p>
          </div>
        </Card>

        <Card>
          <CardHeader title="Ficha rápida" />
          <dl className="divide-y divide-slate-100 text-sm">
            <div className="flex items-start justify-between gap-3 px-5 py-3">
              <dt className="text-slate-500">Tema</dt>
              <dd className="text-right font-medium text-slate-800">{activity.topic}</dd>
            </div>
            <div className="flex items-start justify-between gap-3 px-5 py-3">
              <dt className="text-slate-500">Tipo</dt>
              <dd className="text-right font-medium text-slate-800">{activity.activity_type}</dd>
            </div>
            <div className="flex items-start justify-between gap-3 px-5 py-3">
              <dt className="text-slate-500">Duración</dt>
              <dd className="text-right font-medium text-slate-800">
                {formatDuration(activity.estimated_duration_minutes)}
              </dd>
            </div>
            <div className="flex items-start justify-between gap-3 px-5 py-3">
              <dt className="text-slate-500">Registrada</dt>
              <dd className="text-right font-medium text-slate-800">{formatDateTime(activity.created_at)}</dd>
            </div>
          </dl>
        </Card>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        title="Eliminar actividad"
        description={`¿Seguro que deseas eliminar "${activity.title}"? Esta acción no se puede deshacer.`}
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setConfirmOpen(false)}
      />
    </div>
  )
}
