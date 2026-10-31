import { useCallback, useEffect, useState } from 'react'
import api, { getErrorMessage } from '../services/api'

interface ApiResource<T> {
  data: T | null
  loading: boolean
  error: string | null
  reload: () => void
}

export function useApiResource<T>(path: string | null): ApiResource<T> {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(Boolean(path))
  const [error, setError] = useState<string | null>(null)
  const [version, setVersion] = useState(0)

  const reload = useCallback(() => {
    setVersion((current) => current + 1)
  }, [])

  useEffect(() => {
    if (!path) {
      setData(null)
      setLoading(false)
      setError(null)
      return
    }

    let cancelled = false
    setLoading(true)
    setError(null)

    api
      .get<T>(path)
      .then((response) => {
        if (!cancelled) setData(response.data)
      })
      .catch((requestError: unknown) => {
        if (!cancelled) setError(getErrorMessage(requestError))
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [path, version])

  return { data, loading, error, reload }
}
