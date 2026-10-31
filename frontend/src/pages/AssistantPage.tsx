import {
  AlertTriangle,
  BookOpen,
  Bot,
  Check,
  ClipboardCopy,
  Lightbulb,
  ListChecks,
  Puzzle,
  SlidersHorizontal,
  Sparkles,
} from 'lucide-react'
import { useState, type FormEvent } from 'react'
import type { LucideIcon } from 'lucide-react'
import { Badge } from '../components/Badge'
import { Button } from '../components/Button'
import { Card, CardHeader } from '../components/Card'
import { FormField, inputClassName } from '../components/FormField'
import { PageHeader } from '../components/PageHeader'
import { RichText } from '../components/RichText'
import { Spinner } from '../components/Spinner'
import { useToast } from '../components/ToastProvider'
import { useApiResource } from '../hooks/useApiResource'
import { generateAssistantContent } from '../services/assistant'
import { getErrorMessage } from '../services/api'
import type { AssistantResponse, ContentType, HealthResponse } from '../types'
import { CONTENT_TYPES, EDUCATION_LEVELS, SUBJECT_SUGGESTIONS } from '../types/constants'
import { copyText } from '../utils/clipboard'
import { cn, formatDateTime } from '../utils/format'

const contentTypeIcons: Record<ContentType, LucideIcon> = {
  ideas: Lightbulb,
  activities: Puzzle,
  questions: ListChecks,
  explanation: BookOpen,
  adaptation: SlidersHorizontal,
}

export function AssistantPage() {
  const { notify } = useToast()
  const health = useApiResource<HealthResponse>('/health')
  const [topic, setTopic] = useState('')
  const [subject, setSubject] = useState('')
  const [educationLevel, setEducationLevel] = useState('Secundaria')
  const [contentType, setContentType] = useState<ContentType>('ideas')
  const [additionalInstructions, setAdditionalInstructions] = useState('')
  const [result, setResult] = useState<AssistantResponse | null>(null)
  const [generating, setGenerating] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const assistantMode = health.data?.assistant_mode

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (topic.trim().length < 3 || !subject.trim()) {
      setFormError('Indica un tema y una asignatura para generar el contenido.')
      return
    }

    setGenerating(true)
    setFormError(null)
    setCopied(false)
    try {
      const response = await generateAssistantContent({
        topic: topic.trim(),
        subject: subject.trim(),
        education_level: educationLevel,
        content_type: contentType,
        additional_instructions: additionalInstructions.trim() || null,
      })
      setResult(response)
      notify(
        response.source === 'gemini'
          ? 'Contenido generado con Gemini.'
          : 'Contenido de demostración generado con plantilla local.',
        response.source === 'gemini' ? 'success' : 'info',
      )
    } catch (requestError) {
      setFormError(getErrorMessage(requestError))
    } finally {
      setGenerating(false)
    }
  }

  const handleCopy = async () => {
    if (!result) return
    const success = await copyText(result.content)
    if (success) {
      setCopied(true)
      notify('Contenido copiado al portapapeles.')
      window.setTimeout(() => setCopied(false), 2000)
    } else {
      notify('No se pudo copiar el contenido.', 'error')
    }
  }

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Asistente TeacherAI"
        description="Genera ideas, actividades, preguntas y adaptaciones para tus clases."
        actions={
          assistantMode && (
            <Badge variant={assistantMode === 'gemini' ? 'green' : 'amber'}>
              <Sparkles className="h-3 w-3" />
              {assistantMode === 'gemini' ? 'Gemini conectado' : 'Modo demostración'}
            </Badge>
          )
        }
      />

      {assistantMode === 'demo' && (
        <div className="mb-5 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <p className="leading-6">
            No hay una API Key de Gemini configurada. Las respuestas se crean con plantillas locales
            y se identifican como <strong>demostración</strong>; no se simula una conexión real.
          </p>
        </div>
      )}

      <div className="grid gap-5 xl:grid-cols-[430px_1fr]">
        <Card className="h-fit">
          <CardHeader
            title="Configura tu solicitud"
            description="Cuéntale al asistente qué necesitas preparar."
          />
          <form onSubmit={handleSubmit} noValidate className="space-y-5 p-5">
            <FormField label="Tema" htmlFor="assistant-topic" required>
              <input
                id="assistant-topic"
                className={inputClassName}
                value={topic}
                onChange={(event) => setTopic(event.target.value)}
                placeholder="Ej. Fracciones equivalentes"
                maxLength={300}
              />
            </FormField>

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField label="Asignatura" htmlFor="assistant-subject" required>
                <input
                  id="assistant-subject"
                  className={inputClassName}
                  list="assistant-subjects"
                  value={subject}
                  onChange={(event) => setSubject(event.target.value)}
                  placeholder="Ej. Matemática"
                  maxLength={100}
                />
                <datalist id="assistant-subjects">
                  {SUBJECT_SUGGESTIONS.map((option) => (
                    <option key={option} value={option} />
                  ))}
                </datalist>
              </FormField>

              <FormField label="Nivel educativo" htmlFor="assistant-level" required>
                <select
                  id="assistant-level"
                  className={inputClassName}
                  value={educationLevel}
                  onChange={(event) => setEducationLevel(event.target.value)}
                >
                  {EDUCATION_LEVELS.map((level) => (
                    <option key={level} value={level}>
                      {level}
                    </option>
                  ))}
                </select>
              </FormField>
            </div>

            <fieldset>
              <legend className="mb-2 text-sm font-medium text-slate-700">¿Qué deseas generar?</legend>
              <div className="space-y-2">
                {CONTENT_TYPES.map((content) => {
                  const Icon = contentTypeIcons[content.value]
                  const active = contentType === content.value
                  return (
                    <label
                      key={content.value}
                      className={cn(
                        'flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition',
                        active
                          ? 'border-brand-300 bg-brand-50/70 ring-1 ring-brand-200'
                          : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50',
                      )}
                    >
                      <input
                        type="radio"
                        name="content-type"
                        value={content.value}
                        checked={active}
                        onChange={() => setContentType(content.value)}
                        className="sr-only"
                      />
                      <span
                        className={cn(
                          'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg',
                          active ? 'bg-brand-700 text-white' : 'bg-slate-100 text-slate-500',
                        )}
                      >
                        <Icon className="h-4 w-4" />
                      </span>
                      <span>
                        <span className="block text-sm font-semibold text-slate-900">{content.label}</span>
                        <span className="mt-0.5 block text-xs leading-5 text-slate-500">
                          {content.description}
                        </span>
                      </span>
                    </label>
                  )
                })}
              </div>
            </fieldset>

            <FormField
              label="Indicaciones adicionales"
              htmlFor="assistant-extra"
              hint="Opcional: contexto del grupo, tiempo disponible, enfoque inclusivo..."
            >
              <textarea
                id="assistant-extra"
                className={inputClassName}
                rows={3}
                value={additionalInstructions}
                onChange={(event) => setAdditionalInstructions(event.target.value)}
                placeholder="Ej. Trabajar en parejas durante 20 minutos."
                maxLength={1500}
              />
            </FormField>

            {formError && (
              <div className="rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-sm font-medium text-rose-700">
                {formError}
              </div>
            )}

            <Button type="submit" loading={generating} className="w-full">
              <Sparkles className="h-4 w-4" />
              {generating ? 'Generando contenido...' : 'Generar contenido'}
            </Button>
          </form>
        </Card>

        <Card className="flex min-h-[540px] flex-col">
          <CardHeader
            title="Respuesta del asistente"
            description="Revisa, adapta y copia el material generado."
            action={
              result && (
                <Button variant="secondary" size="sm" onClick={handleCopy}>
                  {copied ? <Check className="h-3.5 w-3.5" /> : <ClipboardCopy className="h-3.5 w-3.5" />}
                  {copied ? 'Copiado' : 'Copiar'}
                </Button>
              )
            }
          />

          <div className="flex-1 p-5">
            {generating && (
              <div className="flex h-full min-h-[360px] flex-col items-center justify-center gap-3 text-slate-500">
                <Spinner className="h-8 w-8" />
                <p className="text-sm font-medium">Preparando el material educativo...</p>
                <p className="text-xs">La respuesta aparecerá aquí en unos segundos.</p>
              </div>
            )}

            {!generating && !result && (
              <div className="flex h-full min-h-[360px] flex-col items-center justify-center text-center">
                <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-100 to-sky-100 text-brand-700">
                  <Bot className="h-8 w-8" />
                </span>
                <h3 className="mt-4 text-sm font-semibold text-slate-900">Tu material aparecerá aquí</h3>
                <p className="mt-1 max-w-sm text-sm leading-6 text-slate-500">
                  Completa el tema, la asignatura y el tipo de contenido. TeacherAI organizará una
                  propuesta lista para adaptar a tu clase.
                </p>
              </div>
            )}

            {!generating && result && (
              <div className="animate-fade-in">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant={result.source === 'gemini' ? 'green' : 'amber'}>
                    <Sparkles className="h-3 w-3" />
                    {result.source === 'gemini' ? 'Generado con Gemini' : 'Demostración · NO es Gemini'}
                  </Badge>
                  <Badge>{result.model ?? 'Plantilla local'}</Badge>
                  <span className="text-xs text-slate-400">{formatDateTime(result.generated_at)}</span>
                </div>

                <div
                  className={cn(
                    'mt-3 rounded-xl border px-3.5 py-2.5 text-xs leading-5',
                    result.source === 'gemini'
                      ? 'border-emerald-200 bg-emerald-50 text-emerald-900'
                      : 'border-amber-200 bg-amber-50 text-amber-900',
                  )}
                >
                  {result.notice}
                </div>

                <article className="mt-5 rounded-xl border border-slate-100 bg-slate-50/40 p-5">
                  <RichText text={result.content} />
                </article>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}
