import { ClipboardCheck, Eye, ListChecks, Plus, Trash2 } from 'lucide-react'
import { useState } from 'react'
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
import { deleteAssessment } from '../services/assessments'
import { getErrorMessage } from '../services/api'
import type { AssessmentSummary } from '../types'
import { formatDate } from '../utils/format'

export function AssessmentsPage() {
  const { data, loading, error, reload } = useApiResource<AssessmentSummary[]>('/assessments')
  const [selected, setSelected] = useState<AssessmentSummary | null>(null)
  const [deleting, setDeleting] = useState(false)
  const { notify } = useToast()

  const assessments = data ?? []

  const handleDelete = async () => {
    if (!selected) return
    setDeleting(true)
    try {
      await deleteAssessment(selected.id)
      notify('Evaluación eliminada correctamente.')
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
        title="Evaluaciones"
        description="Crea cuestionarios con preguntas, opciones y respuestas correctas."
        actions={
          <Link to="/evaluaciones/nueva" className={buttonClasses('primary')}>
            <Plus className="h-4 w-4" />
            Nueva evaluación
          </Link>
        }
      />

      {loading && <PageLoader label="Cargando evaluaciones..." />}

      {!loading && error && (
        <Card>
          <ErrorState message={error} onRetry={reload} />
        </Card>
      )}

      {!loading && !error && assessments.length === 0 && (
        <Card>
          <EmptyState
            icon={ClipboardCheck}
            title="Todavía no hay evaluaciones"
            description="Diseña un cuestionario y guarda las preguntas con sus respuestas correctas."
            action={
              <Link to="/evaluaciones/nueva" className={buttonClasses('primary', 'sm')}>
                <Plus className="h-3.5 w-3.5" />
                Crear evaluación
              </Link>
            }
          />
        </Card>
      )}

      {!loading && !error && assessments.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2">
          {assessments.map((assessment) => (
            <Card key={assessment.id} className="flex flex-col transition hover:-translate-y-0.5 hover:shadow-md">
              <div className="flex items-start justify-between gap-3 p-5 pb-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-700">
                  <ClipboardCheck className="h-5 w-5" />
                </span>
                <div className="flex flex-wrap justify-end gap-1.5">
                  <Badge variant="violet">
                    <ListChecks className="h-3 w-3" />
                    {assessment.question_count}{' '}
                    {assessment.question_count === 1 ? 'pregunta' : 'preguntas'}
                  </Badge>
                  {assessment.is_demo && <DemoBadge />}
                </div>
              </div>
              <div className="flex flex-1 flex-col px-5 pb-5">
                <Link to={`/evaluaciones/${assessment.id}`} className="group">
                  <h2 className="text-sm font-semibold text-slate-900 transition group-hover:text-brand-700">
                    {assessment.title}
                  </h2>
                </Link>
                <p className="mt-1 text-xs text-slate-500">
                  {assessment.subject} · {assessment.education_level}
                </p>
                <p className="mt-3 line-clamp-2 flex-1 text-sm leading-6 text-slate-600">
                  {assessment.instructions}
                </p>
                <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
                  <span className="text-xs text-slate-400">{formatDate(assessment.created_at)}</span>
                  <div className="flex items-center gap-1">
                    <Link
                      to={`/evaluaciones/${assessment.id}`}
                      className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-semibold text-brand-700 transition hover:bg-brand-50"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      Ver evaluación
                    </Link>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="px-2 py-1.5 text-rose-600 hover:bg-rose-50"
                      onClick={() => setSelected(assessment)}
                      aria-label={`Eliminar ${assessment.title}`}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={Boolean(selected)}
        title="Eliminar evaluación"
        description={`¿Seguro que deseas eliminar "${selected?.title ?? ''}" y todas sus preguntas? Esta acción no se puede deshacer.`}
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setSelected(null)}
      />
    </div>
  )
}
