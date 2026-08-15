import { useState, useEffect } from 'react'

export function useWordPressData(fetchFn, fallback) {
  const [data, setData] = useState(fallback)
  const [loading, setLoading] = useState(true)
  const [source, setSource] = useState('static')

  useEffect(() => {
    let cancelled = false

    fetchFn().then((result) => {
      if (cancelled) return
      if (result && (Array.isArray(result) ? result.length > 0 : Object.keys(result).length > 0)) {
        setData(result)
        setSource('wordpress')
      }
      setLoading(false)
    })

    return () => { cancelled = true }
  }, [fetchFn])

  return { data, loading, source }
}

export function useWordPressList(fetchFn, fallback = []) {
  return useWordPressData(fetchFn, fallback)
}

export function useWordPressObject(fetchFn, fallback = {}) {
  return useWordPressData(fetchFn, fallback)
}
