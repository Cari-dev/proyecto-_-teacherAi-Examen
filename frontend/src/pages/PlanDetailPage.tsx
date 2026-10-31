import { CalendarDays, Clock, Pencil, Target, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Badge, DemoBadge } from '../components/Badge'
import { Button, buttonClasses } from '../components/Button'
import { Card, CardHeader } from '../components/Card'
import { ConfirmDialog } from '../components/ConfirmDialog'
import { ErrorState } from '../components/ErrorState'
import { PageHeader } from '../components/PageHeader'
import { PageLoader } from '../components/Spinner'
import { useToast } from '../components/ToastProvider'
import { useApiResource } from '../hooks/useApiResource'
import { getErrorMessage } from '../services/api'
import { deletePlan } from '../services/plans'
import type { Plan } from '../types'
import { formatDateTime, formatDuration } from '../utils/format'

function TextSection({ title, content }: { title: string; content: string }) {
  return (
    <div>
      <h3 className="text-sm font-semibold text-brand-950">{title}</h3>
      <p className="mt-2 whitespace-pre-line text-sm leading-7 text-slate-600">{content}</p>
    </div>
  )
}

export function PlanDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { notify } = useToast()
  const { data: plan, loading, error, reload } = useApiResource<Plan>(id ? `/plans/${id}` : null)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const handleDelete = async () => {
    if (!plan) return
    setDeleting(true)
    try {
      await deletePlan(plan.id)
      notify('Planificación eliminada correctamente.')
      navigate('/planes')
    } catch (requestError) {
      notify(getErrorMessage(requestError), 'error')
      setDeleting(false)
    }
  }

  if (loading) return <PageLoader label="Cargando planificación..." />
  if (error) return <ErrorState message={error} onRetry={reload} />
  if (!plan) return null

  return (
    <div className="animate-fade-in">
      <PageHeader
        title={plan.title}
        description={`${plan.subject} · ${plan.education_level} · ${plan.course}`}
        backTo="/planes"
        actions={
          <>
            <Link to={`/planes/${plan.id}/editar`} className={buttonClasses('secondary')}>
              <Pencil className="h-4 w-4" />
              Editar
            </Link>
            <Button variant="danger" onClick={() => setConfirmOpen(true)}>
              <Trash2 className="h-4 w-4" />
              Eliminar
            </Button>
          </>
        }
      />

      <div className="mb-5 flex flex-wrap items-center gap-2">
        <Badge variant="blue">{plan.subject}</Badge>
        <Badge>{plan.education_level}</Badge>
        <Badge>{plan.course}</Badge>
        <Badge variant="violet">
          <Clock className="h-3 w-3" />
          {formatDuration(plan.duration_minutes)}
        </Badge>
        <Badge>
          <CalendarDays className="h-3 w-3" />
          {formatDateTime(plan.created_at)}
        </Badge>
        {plan.is_demo && <DemoBadge />}
      </div>

      <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
        <Card>
          <CardHeader title="Objetivo de aprendizaje" />
          <div className="p-5">
            <div className="flex gap-3 rounded-xl bg-brand-50/70 p-4">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-brand-700 shadow-sm">
                <Target className="h-4.5 w-4.5" />
              </span>
              <p className="whitespace-pre-line text-sm leading-7 text-slate-700">{plan.learning_objective}</p>
            </div>
          </div>

          <div className="space-y-6 border-t border-slate-100 p-5">
            <TextSection title="Tema" content={plan.topic} />
            <TextSection title="Contenido" content={plan.content} />
            <TextSection title="Actividades" content={plan.activities} />
            <TextSection title="Recursos necesarios" content={plan.resources} />
          </div>
        </Card>

        <div className="space-y-5">
          <Card>
            <CardHeader title="Ficha de la clase" />
            <dl className="divide-y divide-slate-100 text-sm">
              <div className="flex items-start justify-between gap-3 px-5 py-3">
                <dt className="text-slate-500">Asignatura</dt>
                <dd className="text-right font-medium text-slate-800">{plan.subject}</dd>
              </div>
              <div className="flex items-start justify-between gap-3 px-5 py-3">
                <dt className="text-slate-500">Nivel</dt>
                <dd className="text-right font-medium text-slate-800">{plan.education_level}</dd>
              </div>
              <div className="flex items-start justify-between gap-3 px-5 py-3">
                <dt className="text-slate-500">Curso</dt>
                <dd className="text-right font-medium text-slate-800">{plan.course}</dd>
              </div>
              <div className="flex items-start justify-between gap-3 px-5 py-3">
                <dt className="text-slate-500">Duración</dt>
                <dd className="text-right font-medium text-slate-800">{formatDuration(plan.duration_minutes)}</dd>
              </div>
              <div className="flex items-start justify-between gap-3 px-5 py-3">
                <dt className="text-slate-500">Creada</dt>
                <dd className="text-right font-medium text-slate-800">{formatDateTime(plan.created_at)}</dd>
              </div>
              <div className="flex items-start justify-between gap-3 px-5 py-3">
                <dt className="text-slate-500">Actualizada</dt>
                <dd className="text-right font-medium text-slate-800">{formatDateTime(plan.updated_at)}</dd>
              </div>
            </dl>
          </Card>

          <Card className="border-brand-100 bg-brand-50/50">
            <div className="p-5">
              <p className="text-sm font-semibold text-brand-950">Siguiente paso</p>
              <p className="mt-1 text-xs leading-5 text-slate-600">
                Complementa esta clase con una actividad o una evaluación desde el asistente.
              </p>
              <Link to="/asistente" className={buttonClasses('primary', 'sm', 'mt-3 w-full')}>
                Abrir asistente
              </Link>
            </div>
          </Card>
        </div>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        title="Eliminar planificación"
        description={`¿Seguro que deseas eliminar "${plan.title}"? Esta acción no se puede deshacer.`}
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setConfirmOpen(false)}
      />
    </div>
  )
}
