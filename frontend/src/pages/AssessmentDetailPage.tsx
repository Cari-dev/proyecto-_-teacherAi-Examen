import { CheckCircle2, ListChecks, Trash2 } from 'lucide-react'
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
import { deleteAssessment } from '../services/assessments'
import { getErrorMessage } from '../services/api'
import type { AssessmentDetail } from '../types'
import { formatDateTime } from '../utils/format'

export function AssessmentDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { notify } = useToast()
  const { data: assessment, loading, error, reload } = useApiResource<AssessmentDetail>(
    id ? `/assessments/${id}` : null,
  )
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const handleDelete = async () => {
    if (!assessment) return
    setDeleting(true)
    try {
      await deleteAssessment(assessment.id)
      notify('Evaluación eliminada correctamente.')
      navigate('/evaluaciones')
    } catch (requestError) {
      notify(getErrorMessage(requestError), 'error')
      setDeleting(false)
    }
  }

  if (loading) return <PageLoader label="Cargando evaluación..." />
  if (error) return <ErrorState message={error} onRetry={reload} />
  if (!assessment) return null

  return (
    <div className="animate-fade-in">
      <PageHeader
        title={assessment.title}
        description={`${assessment.subject} · ${assessment.education_level}`}
        backTo="/evaluaciones"
        actions={
          <Button variant="danger" onClick={() => setConfirmOpen(true)}>
            <Trash2 className="h-4 w-4" />
            Eliminar
          </Button>
        }
      />

      <div className="mb-5 flex flex-wrap items-center gap-2">
        <Badge variant="violet">
          <ListChecks className="h-3 w-3" />
          {assessment.question_count} {assessment.question_count === 1 ? 'pregunta' : 'preguntas'}
        </Badge>
        <Badge variant="blue">{assessment.subject}</Badge>
        <Badge>{assessment.education_level}</Badge>
        <Badge>{formatDateTime(assessment.created_at)}</Badge>
        {assessment.is_demo && <DemoBadge />}
      </div>

      <div className="space-y-5">
        <Card>
          <CardHeader title="Instrucciones" />
          <p className="whitespace-pre-line p-5 text-sm leading-7 text-slate-600">
            {assessment.instructions}
          </p>
        </Card>

        {assessment.questions.map((question, questionIndex) => (
          <Card key={question.id}>
            <div className="flex items-start gap-3 border-b border-slate-100 px-5 py-4">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-950 text-xs font-bold text-white">
                {questionIndex + 1}
              </span>
              <h2 className="pt-1 text-sm font-semibold leading-6 text-slate-900">{question.text}</h2>
            </div>
            <ul className="space-y-2 p-5">
              {question.options.map((option, optionIndex) => (
                <li
                  key={option.id}
                  className={`flex items-center gap-3 rounded-xl border px-3.5 py-2.5 text-sm ${
                    option.is_correct
                      ? 'border-emerald-200 bg-emerald-50/70 text-emerald-900'
                      : 'border-slate-100 bg-slate-50/60 text-slate-600'
                  }`}
                >
                  <span
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-[11px] font-bold ${
                      option.is_correct
                        ? 'bg-emerald-600 text-white'
                        : 'bg-white text-slate-500 shadow-sm'
                    }`}
                  >
                    {String.fromCharCode(65 + optionIndex)}
                  </span>
                  <span className="flex-1">{option.text}</span>
                  {option.is_correct && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700">
                      <CheckCircle2 className="h-4 w-4" />
                      Correcta
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </Card>
        ))}
      </div>

      <ConfirmDialog
        open={confirmOpen}
        title="Eliminar evaluación"
        description={`¿Seguro que deseas eliminar "${assessment.title}" y todas sus preguntas? Esta acción no se puede deshacer.`}
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setConfirmOpen(false)}
      />
    </div>
  )
}
