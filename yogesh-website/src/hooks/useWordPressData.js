import { useState, useEffect } from 'react'

export function useWordPressData(fetchFn, fallbackData) {
  const [data, setData] = useState(fallbackData)
  const [loading, setLoading] = useState(true)
  const [source, setSource] = useState('static')

  useEffect(() => {
    let cancelled = false

    fetchFn().then((result) => {
      if (cancelled) return
      if (result && result.length > 0) {
        setData(result)
        setSource('wordpress')
      }
      setLoading(false)
    })

    return () => { cancelled = true }
  }, [fetchFn])

  return { data, loading, source }
}
