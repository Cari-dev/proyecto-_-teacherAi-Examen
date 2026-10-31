import { Save } from 'lucide-react'
import { useEffect, useState, type FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Button, buttonClasses } from '../components/Button'
import { Card, CardHeader } from '../components/Card'
import { ErrorState } from '../components/ErrorState'
import { FormField, inputClassName } from '../components/FormField'
import { PageHeader } from '../components/PageHeader'
import { PageLoader } from '../components/Spinner'
import { useToast } from '../components/ToastProvider'
import { useApiResource } from '../hooks/useApiResource'
import { getErrorMessage } from '../services/api'
import { createPlan, updatePlan } from '../services/plans'
import type { Plan, PlanPayload } from '../types'
import { EDUCATION_LEVELS, SUBJECT_SUGGESTIONS } from '../types/constants'

interface FormState {
  title: string
  subject: string
  education_level: string
  course: string
  topic: string
  learning_objective: string
  duration_minutes: string
  content: string
  activities: string
  resources: string
}

const emptyForm: FormState = {
  title: '',
  subject: '',
  education_level: 'Secundaria',
  course: '',
  topic: '',
  learning_objective: '',
  duration_minutes: '90',
  content: '',
  activities: '',
  resources: '',
}

function validate(form: FormState): Record<string, string> {
  const errors: Record<string, string> = {}
  const required: Array<[keyof FormState, string]> = [
    ['title', 'El título es obligatorio'],
    ['subject', 'La asignatura es obligatoria'],
    ['course', 'El curso es obligatorio'],
    ['topic', 'El tema es obligatorio'],
    ['learning_objective', 'El objetivo de aprendizaje es obligatorio'],
    ['content', 'El contenido es obligatorio'],
    ['activities', 'Describe al menos una actividad'],
    ['resources', 'Indica los recursos necesarios'],
  ]

  required.forEach(([field, message]) => {
    if (!form[field].trim()) errors[field] = message
  })

  if (form.title.trim() && form.title.trim().length < 3) errors.title = 'Usa al menos 3 caracteres'
  if (form.learning_objective.trim().length > 0 && form.learning_objective.trim().length < 10) {
    errors.learning_objective = 'Describe el objetivo con al menos 10 caracteres'
  }
  if (form.content.trim().length > 0 && form.content.trim().length < 10) {
    errors.content = 'Amplía el contenido a 10 caracteres como mínimo'
  }
  if (form.activities.trim().length > 0 && form.activities.trim().length < 10) {
    errors.activities = 'Describe las actividades con al menos 10 caracteres'
  }

  const duration = Number(form.duration_minutes)
  if (!Number.isFinite(duration) || duration < 5 || duration > 1200) {
    errors.duration_minutes = 'La duración debe estar entre 5 y 1200 minutos'
  }

  return errors
}

export function PlanFormPage() {
  const { id } = useParams()
  const isEdit = Boolean(id)
  const navigate = useNavigate()
  const { notify } = useToast()
  const resource = useApiResource<Plan>(isEdit ? `/plans/${id}` : null)

  const [form, setForm] = useState<FormState>(emptyForm)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  useEffect(() => {
    if (!resource.data) return
    setForm({
      title: resource.data.title,
      subject: resource.data.subject,
      education_level: resource.data.education_level,
      course: resource.data.course,
      topic: resource.data.topic,
      learning_objective: resource.data.learning_objective,
      duration_minutes: String(resource.data.duration_minutes),
      content: resource.data.content,
      activities: resource.data.activities,
      resources: resource.data.resources,
    })
  }, [resource.data])

  const update = (field: keyof FormState, value: string) => {
    setForm((current) => ({ ...current, [field]: value }))
    setErrors((current) => {
      if (!current[field]) return current
      const next = { ...current }
      delete next[field]
      return next
    })
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const validationErrors = validate(form)
    setErrors(validationErrors)
    if (Object.keys(validationErrors).length > 0) {
      setSubmitError('Revisa los campos marcados antes de guardar.')
      return
    }

    const payload: PlanPayload = {
      title: form.title.trim(),
      subject: form.subject.trim(),
      education_level: form.education_level,
      course: form.course.trim(),
      topic: form.topic.trim(),
      learning_objective: form.learning_objective.trim(),
      duration_minutes: Number(form.duration_minutes),
      content: form.content.trim(),
      activities: form.activities.trim(),
      resources: form.resources.trim(),
    }

    setSaving(true)
    setSubmitError(null)
    try {
      const saved = isEdit ? await updatePlan(Number(id), payload) : await createPlan(payload)
      notify(isEdit ? 'Planificación actualizada correctamente.' : 'Planificación creada correctamente.')
      navigate(`/planes/${saved.id}`)
    } catch (requestError) {
      setSubmitError(getErrorMessage(requestError))
    } finally {
      setSaving(false)
    }
  }

  if (isEdit && resource.loading) return <PageLoader label="Cargando planificación..." />
  if (isEdit && resource.error) return <ErrorState message={resource.error} onRetry={resource.reload} />

  return (
    <div className="animate-fade-in">
      <PageHeader
        title={isEdit ? 'Editar planificación' : 'Nueva planificación'}
        description="Completa la información pedagógica para tener tu clase lista y organizada."
        backTo={isEdit ? `/planes/${id}` : '/planes'}
      />

      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        <Card>
          <CardHeader
            title="Información general"
            description="Datos de identificación de la clase y su contexto."
          />
          <div className="grid gap-5 p-5 sm:grid-cols-2">
            <FormField label="Título" htmlFor="title" required error={errors.title} className="sm:col-span-2">
              <input
                id="title"
                className={inputClassName}
                value={form.title}
                onChange={(event) => update('title', event.target.value)}
                placeholder="Ej. Fracciones equivalentes en situaciones cotidianas"
                maxLength={200}
              />
            </FormField>

            <FormField label="Asignatura" htmlFor="subject" required error={errors.subject}>
              <input
                id="subject"
                className={inputClassName}
                list="subject-options"
                value={form.subject}
                onChange={(event) => update('subject', event.target.value)}
                placeholder="Ej. Matemática"
                maxLength={100}
              />
              <datalist id="subject-options">
                {SUBJECT_SUGGESTIONS.map((subject) => (
                  <option key={subject} value={subject} />
                ))}
              </datalist>
            </FormField>

            <FormField label="Nivel educativo" htmlFor="education_level" required error={errors.education_level}>
              <select
                id="education_level"
                className={inputClassName}
                value={form.education_level}
                onChange={(event) => update('education_level', event.target.value)}
              >
                {EDUCATION_LEVELS.map((level) => (
                  <option key={level} value={level}>
                    {level}
                  </option>
                ))}
              </select>
            </FormField>

            <FormField label="Curso" htmlFor="course" required error={errors.course}>
              <input
                id="course"
                className={inputClassName}
                value={form.course}
                onChange={(event) => update('course', event.target.value)}
                placeholder="Ej. 5.º grado / 1.º de secundaria"
                maxLength={100}
              />
            </FormField>

            <FormField
              label="Duración (minutos)"
              htmlFor="duration_minutes"
              required
              error={errors.duration_minutes}
              hint="Entre 5 y 1200 minutos."
            >
              <input
                id="duration_minutes"
                type="number"
                min={5}
                max={1200}
                className={inputClassName}
                value={form.duration_minutes}
                onChange={(event) => update('duration_minutes', event.target.value)}
              />
            </FormField>

            <FormField label="Tema" htmlFor="topic" required error={errors.topic} className="sm:col-span-2">
              <input
                id="topic"
                className={inputClassName}
                value={form.topic}
                onChange={(event) => update('topic', event.target.value)}
                placeholder="Ej. Fracciones equivalentes"
                maxLength={200}
              />
            </FormField>
          </div>
        </Card>

        <Card>
          <CardHeader
            title="Diseño pedagógico"
            description="Objetivo, contenido, actividades y recursos de la sesión."
          />
          <div className="space-y-5 p-5">
            <FormField
              label="Objetivo de aprendizaje"
              htmlFor="learning_objective"
              required
              error={errors.learning_objective}
              hint="Describe qué logrará el estudiante al finalizar la clase."
            >
              <textarea
                id="learning_objective"
                className={inputClassName}
                rows={3}
                value={form.learning_objective}
                onChange={(event) => update('learning_objective', event.target.value)}
                placeholder="Ej. Reconocer y representar fracciones equivalentes mediante material concreto."
                maxLength={5000}
              />
            </FormField>

            <FormField label="Contenido" htmlFor="content" required error={errors.content}>
              <textarea
                id="content"
                className={inputClassName}
                rows={5}
                value={form.content}
                onChange={(event) => update('content', event.target.value)}
                placeholder="Organiza los conceptos y momentos principales de la sesión..."
                maxLength={10000}
              />
            </FormField>

            <FormField label="Actividades" htmlFor="activities" required error={errors.activities}>
              <textarea
                id="activities"
                className={inputClassName}
                rows={5}
                value={form.activities}
                onChange={(event) => update('activities', event.target.value)}
                placeholder="Inicio, desarrollo y cierre de la clase..."
                maxLength={10000}
              />
            </FormField>

            <FormField label="Recursos necesarios" htmlFor="resources" required error={errors.resources}>
              <textarea
                id="resources"
                className={inputClassName}
                rows={3}
                value={form.resources}
                onChange={(event) => update('resources', event.target.value)}
                placeholder="Ej. Pizarra, fichas, proyector, material concreto..."
                maxLength={5000}
              />
            </FormField>
          </div>
        </Card>

        {submitError && (
          <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
            {submitError}
          </div>
        )}

        <div className="flex flex-wrap justify-end gap-2">
          <Link to={isEdit ? `/planes/${id}` : '/planes'} className={buttonClasses('secondary')}>
            Cancelar
          </Link>
          <Button type="submit" loading={saving}>
            <Save className="h-4 w-4" />
            {isEdit ? 'Guardar cambios' : 'Crear planificación'}
          </Button>
        </div>
      </form>
    </div>
  )
}
