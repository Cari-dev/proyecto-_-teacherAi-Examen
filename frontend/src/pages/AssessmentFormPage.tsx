import { CheckCircle2, Plus, Save, Trash2, X } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Badge } from '../components/Badge'
import { Button, buttonClasses } from '../components/Button'
import { Card, CardHeader } from '../components/Card'
import { FormField, inputClassName } from '../components/FormField'
import { PageHeader } from '../components/PageHeader'
import { useToast } from '../components/ToastProvider'
import { getErrorMessage } from '../services/api'
import { createAssessment } from '../services/assessments'
import type { AssessmentPayload } from '../types'
import { EDUCATION_LEVELS, SUBJECT_SUGGESTIONS } from '../types/constants'

interface DraftQuestion {
  text: string
  options: string[]
  correctIndex: number
}

const newQuestion = (): DraftQuestion => ({ text: '', options: ['', ''], correctIndex: 0 })

export function AssessmentFormPage() {
  const navigate = useNavigate()
  const { notify } = useToast()
  const [title, setTitle] = useState('')
  const [subject, setSubject] = useState('')
  const [educationLevel, setEducationLevel] = useState('Secundaria')
  const [instructions, setInstructions] = useState('')
  const [questions, setQuestions] = useState<DraftQuestion[]>([newQuestion()])
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const updateQuestion = (index: number, patch: Partial<DraftQuestion>) => {
    setQuestions((current) =>
      current.map((question, questionIndex) =>
        questionIndex === index ? { ...question, ...patch } : question,
      ),
    )
    setErrors((current) => {
      const next = { ...current }
      delete next[`question-${index}`]
      delete next[`options-${index}`]
      return next
    })
  }

  const updateOption = (questionIndex: number, optionIndex: number, value: string) => {
    setQuestions((current) =>
      current.map((question, currentIndex) =>
        currentIndex === questionIndex
          ? {
              ...question,
              options: question.options.map((option, currentOptionIndex) =>
                currentOptionIndex === optionIndex ? value : option,
              ),
            }
          : question,
      ),
    )
    setErrors((current) => {
      if (!current[`options-${questionIndex}`]) return current
      const next = { ...current }
      delete next[`options-${questionIndex}`]
      return next
    })
  }

  const addOption = (questionIndex: number) => {
    setQuestions((current) =>
      current.map((question, index) =>
        index === questionIndex && question.options.length < 6
          ? { ...question, options: [...question.options, ''] }
          : question,
      ),
    )
  }

  const removeOption = (questionIndex: number, optionIndex: number) => {
    setQuestions((current) =>
      current.map((question, index) => {
        if (index !== questionIndex || question.options.length <= 2) return question
        const options = question.options.filter((_, currentIndex) => currentIndex !== optionIndex)
        let correctIndex = question.correctIndex
        if (correctIndex === optionIndex) correctIndex = 0
        else if (correctIndex > optionIndex) correctIndex -= 1
        return { ...question, options, correctIndex }
      }),
    )
  }

  const addQuestion = () => {
    setQuestions((current) => [...current, newQuestion()])
  }

  const removeQuestion = (questionIndex: number) => {
    setQuestions((current) => current.filter((_, index) => index !== questionIndex))
  }

  const validate = (): Record<string, string> => {
    const validationErrors: Record<string, string> = {}
    if (!title.trim()) validationErrors.title = 'El título es obligatorio'
    if (!subject.trim()) validationErrors.subject = 'La asignatura es obligatoria'
    if (!instructions.trim()) validationErrors.instructions = 'Las instrucciones son obligatorias'

    questions.forEach((question, index) => {
      if (question.text.trim().length < 3) {
        validationErrors[`question-${index}`] = 'Escribe el enunciado de la pregunta.'
      }
      const options = question.options.map((option) => option.trim())
      if (options.some((option) => !option)) {
        validationErrors[`options-${index}`] = 'Completa todas las opciones de respuesta.'
      } else if (new Set(options).size !== options.length) {
        validationErrors[`options-${index}`] = 'Las opciones no pueden repetirse.'
      }
      if (question.correctIndex >= options.length) {
        validationErrors[`options-${index}`] = 'Marca una respuesta correcta válida.'
      }
    })

    return validationErrors
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const validationErrors = validate()
    setErrors(validationErrors)
    if (Object.keys(validationErrors).length > 0) {
      setSubmitError('Revisa los campos marcados antes de guardar la evaluación.')
      return
    }

    const payload: AssessmentPayload = {
      title: title.trim(),
      subject: subject.trim(),
      education_level: educationLevel,
      instructions: instructions.trim(),
      questions: questions.map((question) => ({
        text: question.text.trim(),
        options: question.options.map((option) => option.trim()),
        correct_option_index: question.correctIndex,
      })),
    }

    setSaving(true)
    setSubmitError(null)
    try {
      const created = await createAssessment(payload)
      notify('Evaluación creada correctamente.')
      navigate(`/evaluaciones/${created.id}`)
    } catch (requestError) {
      setSubmitError(getErrorMessage(requestError))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Nueva evaluación"
        description="Construye un cuestionario con preguntas de opción múltiple y marca la respuesta correcta."
        backTo="/evaluaciones"
      />

      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        <Card>
          <CardHeader title="Datos de la evaluación" />
          <div className="grid gap-5 p-5 sm:grid-cols-2">
            <FormField label="Título" htmlFor="title" required error={errors.title} className="sm:col-span-2">
              <input
                id="title"
                className={inputClassName}
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Ej. Evaluación diagnóstica de fracciones"
                maxLength={200}
              />
            </FormField>

            <FormField label="Asignatura" htmlFor="subject" required error={errors.subject}>
              <input
                id="subject"
                className={inputClassName}
                list="assessment-subjects"
                value={subject}
                onChange={(event) => setSubject(event.target.value)}
                placeholder="Ej. Matemática"
                maxLength={100}
              />
              <datalist id="assessment-subjects">
                {SUBJECT_SUGGESTIONS.map((option) => (
                  <option key={option} value={option} />
                ))}
              </datalist>
            </FormField>

            <FormField label="Nivel educativo" htmlFor="education_level" required>
              <select
                id="education_level"
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

            <FormField
              label="Instrucciones"
              htmlFor="instructions"
              required
              error={errors.instructions}
              hint="Indica cómo debe responder el estudiante."
              className="sm:col-span-2"
            >
              <textarea
                id="instructions"
                className={inputClassName}
                rows={3}
                value={instructions}
                onChange={(event) => setInstructions(event.target.value)}
                placeholder="Ej. Lee cada pregunta y marca una sola respuesta correcta."
                maxLength={5000}
              />
            </FormField>
          </div>
        </Card>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-brand-950">Preguntas</h2>
            <p className="text-xs text-slate-500">
              {questions.length} {questions.length === 1 ? 'pregunta agregada' : 'preguntas agregadas'}
            </p>
          </div>
          <Button variant="secondary" onClick={addQuestion}>
            <Plus className="h-4 w-4" />
            Agregar pregunta
          </Button>
        </div>

        <div className="space-y-4">
          {questions.map((question, questionIndex) => (
            <Card key={questionIndex}>
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
                <div className="flex items-center gap-2">
                  <Badge variant="blue">Pregunta {questionIndex + 1}</Badge>
                  <span className="text-xs text-slate-400">Marca la opción correcta</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-rose-600 hover:bg-rose-50"
                  onClick={() => removeQuestion(questionIndex)}
                  disabled={questions.length === 1}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Quitar
                </Button>
              </div>

              <div className="space-y-4 p-5">
                <FormField
                  label="Enunciado"
                  htmlFor={`question-${questionIndex}`}
                  required
                  error={errors[`question-${questionIndex}`]}
                >
                  <textarea
                    id={`question-${questionIndex}`}
                    className={inputClassName}
                    rows={2}
                    value={question.text}
                    onChange={(event) => updateQuestion(questionIndex, { text: event.target.value })}
                    placeholder="Escribe la pregunta..."
                    maxLength={2000}
                  />
                </FormField>

                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <p className="text-sm font-medium text-slate-700">Opciones de respuesta</p>
                    <span className="text-xs text-slate-400">{question.options.length} de 6</span>
                  </div>
                  <div className="space-y-2">
                    {question.options.map((option, optionIndex) => (
                      <div key={optionIndex} className="flex items-center gap-2">
                        <input
                          type="radio"
                          name={`correct-${questionIndex}`}
                          checked={question.correctIndex === optionIndex}
                          onChange={() => updateQuestion(questionIndex, { correctIndex: optionIndex })}
                          className="h-4 w-4 shrink-0 accent-brand-700"
                          aria-label={`Marcar opción ${String.fromCharCode(65 + optionIndex)} como correcta`}
                        />
                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-[11px] font-bold text-slate-600">
                          {String.fromCharCode(65 + optionIndex)}
                        </span>
                        <input
                          className={inputClassName}
                          value={option}
                          onChange={(event) =>
                            updateOption(questionIndex, optionIndex, event.target.value)
                          }
                          placeholder={`Opción ${String.fromCharCode(65 + optionIndex)}`}
                          maxLength={500}
                          aria-label={`Opción ${String.fromCharCode(65 + optionIndex)}`}
                        />
                        {question.options.length > 2 && (
                          <button
                            type="button"
                            onClick={() => removeOption(questionIndex, optionIndex)}
                            className="rounded-lg p-2 text-slate-400 transition hover:bg-rose-50 hover:text-rose-600"
                            aria-label={`Quitar opción ${String.fromCharCode(65 + optionIndex)}`}
                          >
                            <X className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                  {errors[`options-${questionIndex}`] && (
                    <p className="mt-2 text-xs font-medium text-rose-600">
                      {errors[`options-${questionIndex}`]}
                    </p>
                  )}
                  <div className="mt-3 flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => addOption(questionIndex)}
                      disabled={question.options.length >= 6}
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Agregar opción
                    </Button>
                    <span className="inline-flex items-center gap-1 text-xs text-emerald-700">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Correcta: {String.fromCharCode(65 + question.correctIndex)}
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {submitError && (
          <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
            {submitError}
          </div>
        )}

        <div className="flex flex-wrap justify-end gap-2">
          <Link to="/evaluaciones" className={buttonClasses('secondary')}>
            Cancelar
          </Link>
          <Button type="submit" loading={saving}>
            <Save className="h-4 w-4" />
            Guardar evaluación
          </Button>
        </div>
      </form>
    </div>
  )
}
