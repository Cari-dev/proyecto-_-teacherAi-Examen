import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api',
  timeout: 25000,
  headers: { 'Content-Type': 'application/json' },
})

interface ValidationDetail {
  msg?: string
  loc?: Array<string | number>
}

export function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const detail = (error.response?.data as { detail?: unknown } | undefined)?.detail

    if (typeof detail === 'string') return detail

    if (Array.isArray(detail)) {
      const messages = detail
        .map((item: ValidationDetail) => item?.msg)
        .filter((message): message is string => Boolean(message))
      if (messages.length > 0) return messages.join(' · ')
    }

    if (error.code === 'ECONNABORTED') {
      return 'La solicitud tardó demasiado. Inténtalo nuevamente.'
    }
    if (!error.response) {
      return 'No se pudo conectar con el servidor. Verifica que el backend esté en ejecución.'
    }
    if (error.response.status === 404) {
      return 'El recurso solicitado no existe o fue eliminado.'
    }
    if (error.response.status === 429) {
      return 'Se alcanzó el límite de solicitudes. Espera un momento e inténtalo nuevamente.'
    }
    if ([502, 503, 504].includes(error.response.status)) {
      return 'El asistente no está disponible en este momento. Inténtalo nuevamente en unos minutos.'
    }
    return 'Ocurrió un error al procesar la solicitud.'
  }

  if (error instanceof Error) return error.message
  return 'Ocurrió un error inesperado.'
}

export default api
