import { Save } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button, buttonClasses } from '../components/Button'
import { Card, CardHeader } from '../components/Card'
import { FormField, inputClassName } from '../components/FormField'
import { PageHeader } from '../components/PageHeader'
import { useToast } from '../components/ToastProvider'
import { getErrorMessage } from '../services/api'
import { createActivity } from '../services/activities'
import type { ActivityPayload } from '../types'
import { ACTIVITY_TYPES, EDUCATION_LEVELS, SUBJECT_SUGGESTIONS } from '../types/constants'

interface FormState {
  title: string
  subject: string
  education_level: string
  topic: string
  description: string
  activity_type: string
  estimated_duration_minutes: string
}

const emptyForm: FormState = {
  title: '',
  subject: '',
  education_level: 'Secundaria',
  topic: '',
  description: '',
  activity_type: 'Grupal',
  estimated_duration_minutes: '45',
}

function validate(form: FormState): Record<string, string> {
  const errors: Record<string, string> = {}
  if (!form.title.trim()) errors.title = 'El título es obligatorio'
  if (!form.subject.trim()) errors.subject = 'La asignatura es obligatoria'
  if (!form.topic.trim()) errors.topic = 'El tema es obligatorio'
  if (!form.description.trim()) errors.description = 'La descripción es obligatoria'
  if (form.description.trim() && form.description.trim().length < 10) {
    errors.description = 'Describe la actividad con al menos 10 caracteres'
  }
  const duration = Number(form.estimated_duration_minutes)
  if (!Number.isFinite(duration) || duration < 5 || duration > 600) {
    errors.estimated_duration_minutes = 'La duración debe estar entre 5 y 600 minutos'
  }
  return errors
}

export function ActivityFormPage() {
  const navigate = useNavigate()
  const { notify } = useToast()
  const [form, setForm] = useState<FormState>(emptyForm)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

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

    const payload: ActivityPayload = {
      title: form.title.trim(),
      subject: form.subject.trim(),
      education_level: form.education_level,
      topic: form.topic.trim(),
      description: form.description.trim(),
      activity_type: form.activity_type,
      estimated_duration_minutes: Number(form.estimated_duration_minutes),
    }

    setSaving(true)
    setSubmitError(null)
    try {
      const created = await createActivity(payload)
      notify('Actividad creada correctamente.')
      navigate(`/actividades/${created.id}`)
    } catch (requestError) {
      setSubmitError(getErrorMessage(requestError))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Nueva actividad"
        description="Registra una dinámica educativa para reutilizarla en tus clases."
        backTo="/actividades"
      />

      <form onSubmit={handleSubmit} noValidate>
        <Card>
          <CardHeader title="Datos de la actividad" description="Información para identificarla y clasificarla." />
          <div className="grid gap-5 p-5 sm:grid-cols-2">
            <FormField label="Título" htmlFor="title" required error={errors.title} className="sm:col-span-2">
              <input
                id="title"
                className={inputClassName}
                value={form.title}
                onChange={(event) => update('title', event.target.value)}
                placeholder="Ej. Bingo de fracciones equivalentes"
                maxLength={200}
              />
            </FormField>

            <FormField label="Asignatura" htmlFor="subject" required error={errors.subject}>
              <input
                id="subject"
                className={inputClassName}
                list="activity-subjects"
                value={form.subject}
                onChange={(event) => update('subject', event.target.value)}
                placeholder="Ej. Matemática"
                maxLength={100}
              />
              <datalist id="activity-subjects">
                {SUBJECT_SUGGESTIONS.map((subject) => (
                  <option key={subject} value={subject} />
                ))}
              </datalist>
            </FormField>

            <FormField label="Nivel educativo" htmlFor="education_level" required>
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

            <FormField label="Tema" htmlFor="topic" required error={errors.topic}>
              <input
                id="topic"
                className={inputClassName}
                value={form.topic}
                onChange={(event) => update('topic', event.target.value)}
                placeholder="Ej. Fracciones equivalentes"
                maxLength={200}
              />
            </FormField>

            <FormField label="Tipo de actividad" htmlFor="activity_type" required>
              <select
                id="activity_type"
                className={inputClassName}
                value={form.activity_type}
                onChange={(event) => update('activity_type', event.target.value)}
              >
                {ACTIVITY_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </FormField>

            <FormField
              label="Duración estimada (minutos)"
              htmlFor="estimated_duration_minutes"
              required
              error={errors.estimated_duration_minutes}
              hint="Entre 5 y 600 minutos."
              className="sm:col-span-2 sm:max-w-xs"
            >
              <input
                id="estimated_duration_minutes"
                type="number"
                min={5}
                max={600}
                className={inputClassName}
                value={form.estimated_duration_minutes}
                onChange={(event) => update('estimated_duration_minutes', event.target.value)}
              />
            </FormField>

            <FormField
              label="Descripción"
              htmlFor="description"
              required
              error={errors.description}
              hint="Explica el objetivo, los pasos y la forma de participación."
              className="sm:col-span-2"
            >
              <textarea
                id="description"
                className={inputClassName}
                rows={6}
                value={form.description}
                onChange={(event) => update('description', event.target.value)}
                placeholder="Describe la actividad, su propósito y cómo se desarrollará..."
                maxLength={5000}
              />
            </FormField>
          </div>
        </Card>

        {submitError && (
          <div className="mt-5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
            {submitError}
          </div>
        )}

        <div className="mt-5 flex flex-wrap justify-end gap-2">
          <Link to="/actividades" className={buttonClasses('secondary')}>
            Cancelar
          </Link>
          <Button type="submit" loading={saving}>
            <Save className="h-4 w-4" />
            Crear actividad
          </Button>
        </div>
      </form>
    </div>
  )
}
