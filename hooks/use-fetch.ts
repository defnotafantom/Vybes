import { useState, useEffect, useCallback, useRef } from 'react'

interface UseFetchOptions<T> {
  /** Initial data value */
  initialData?: T
  /** Whether to fetch immediately on mount */
  immediate?: boolean
  /** Callback on successful fetch */
  onSuccess?: (data: T) => void
  /** Callback on error */
  onError?: (error: Error) => void
  /** Dependencies that trigger refetch when changed */
  deps?: any[]
}

interface UseFetchReturn<T> {
  data: T | null
  loading: boolean
  error: Error | null
  refetch: () => Promise<void>
  mutate: (data: T) => void
}

/**
 * Custom hook for data fetching with loading and error states
 */
export function useFetch<T>(
  url: string | (() => string),
  options: UseFetchOptions<T> = {}
): UseFetchReturn<T> {
  const {
    initialData = null,
    immediate = true,
    onSuccess,
    onError,
    deps = [],
  } = options

  const [data, setData] = useState<T | null>(initialData)
  const [loading, setLoading] = useState(immediate)
  const [error, setError] = useState<Error | null>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

  const fetchData = useCallback(async () => {
    // Cancel any pending request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    const controller = new AbortController()
    abortControllerRef.current = controller

    setLoading(true)
    setError(null)

    try {
      const fetchUrl = typeof url === 'function' ? url() : url
      const response = await fetch(fetchUrl, {
        signal: controller.signal,
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      setData(result)
      onSuccess?.(result)
    } catch (err) {
      if (err instanceof Error && err.name !== 'AbortError') {
        setError(err)
        onError?.(err)
      }
    } finally {
      setLoading(false)
    }
  }, [url, onSuccess, onError])

  const mutate = useCallback((newData: T) => {
    setData(newData)
  }, [])

  useEffect(() => {
    if (immediate) {
      fetchData()
    }

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [immediate, ...deps])

  return { data, loading, error, refetch: fetchData, mutate }
}

interface UseMutationOptions<T, V> {
  /** Callback on successful mutation */
  onSuccess?: (data: T) => void
  /** Callback on error */
  onError?: (error: Error) => void
}

interface UseMutationReturn<T, V> {
  data: T | null
  loading: boolean
  error: Error | null
  mutate: (variables: V) => Promise<T | null>
  reset: () => void
}

/**
 * Custom hook for mutations (POST, PUT, DELETE)
 */
export function useMutation<T, V = any>(
  url: string,
  method: 'POST' | 'PUT' | 'DELETE' | 'PATCH' = 'POST',
  options: UseMutationOptions<T, V> = {}
): UseMutationReturn<T, V> {
  const { onSuccess, onError } = options

  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const mutate = useCallback(
    async (variables: V): Promise<T | null> => {
      setLoading(true)
      setError(null)

      try {
        const response = await fetch(url, {
          method,
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(variables),
        })

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
        }

        const result = await response.json()
        setData(result)
        onSuccess?.(result)
        return result
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Unknown error')
        setError(error)
        onError?.(error)
        return null
      } finally {
        setLoading(false)
      }
    },
    [url, method, onSuccess, onError]
  )

  const reset = useCallback(() => {
    setData(null)
    setError(null)
    setLoading(false)
  }, [])

  return { data, loading, error, mutate, reset }
}

/**
 * Custom hook for infinite scroll pagination
 */
export function useInfiniteScroll<T>(
  baseUrl: string,
  options: {
    limit?: number
    getItems?: (data: any) => T[]
    getHasMore?: (data: any) => boolean
  } = {}
) {
  const { limit = 20, getItems = (d) => d.data || d, getHasMore = (d) => d.pagination?.hasMore ?? false } = options

  const [items, setItems] = useState<T[]>([])
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return

    setLoading(true)
    setError(null)

    try {
      const url = `${baseUrl}${baseUrl.includes('?') ? '&' : '?'}page=${page}&limit=${limit}`
      const response = await fetch(url)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      const newItems = getItems(data)
      
      setItems((prev) => [...prev, ...newItems])
      setHasMore(getHasMore(data))
      setPage((prev) => prev + 1)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'))
    } finally {
      setLoading(false)
    }
  }, [baseUrl, page, limit, loading, hasMore, getItems, getHasMore])

  const refresh = useCallback(async () => {
    setItems([])
    setPage(1)
    setHasMore(true)
    setError(null)
    
    setLoading(true)
    try {
      const url = `${baseUrl}${baseUrl.includes('?') ? '&' : '?'}page=1&limit=${limit}`
      const response = await fetch(url)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      const newItems = getItems(data)
      
      setItems(newItems)
      setHasMore(getHasMore(data))
      setPage(2)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'))
    } finally {
      setLoading(false)
    }
  }, [baseUrl, limit, getItems, getHasMore])

  return { items, loading, hasMore, error, loadMore, refresh }
}
