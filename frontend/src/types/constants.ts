import type { ContentType } from './index'

export const EDUCATION_LEVELS = [
  'Inicial',
  'Primaria',
  'Secundaria',
  'Bachillerato',
  'Técnico',
  'Universidad',
]

export const SUBJECT_SUGGESTIONS = [
  'Matemática',
  'Comunicación',
  'Ciencia y Tecnología',
  'Ciencias Sociales',
  'Inglés',
  'Arte y Cultura',
  'Educación Física',
  'Informática',
  'Formación Cívica',
]

export const ACTIVITY_TYPES = [
  'Individual',
  'Grupal',
  'Práctica',
  'Proyecto',
  'Debate',
  'Juego educativo',
  'Lectura guiada',
  'Laboratorio',
  'Salida de campo',
]

export const CONTENT_TYPES: { value: ContentType; label: string; description: string }[] = [
  {
    value: 'ideas',
    label: 'Ideas para una clase',
    description: 'Secuencia didáctica con inicio, desarrollo y cierre.',
  },
  {
    value: 'activities',
    label: 'Actividades educativas',
    description: 'Dinámicas con objetivo, materiales y duración.',
  },
  {
    value: 'questions',
    label: 'Preguntas para evaluar',
    description: 'Cuestionario con alternativas y respuestas sugeridas.',
  },
  {
    value: 'explanation',
    label: 'Explicación educativa',
    description: 'Conceptos clave, analogías y ejemplos guiados.',
  },
  {
    value: 'adaptation',
    label: 'Adaptación de contenidos',
    description: 'Ajustes por nivel, ritmo y necesidades de aprendizaje.',
  },
]
