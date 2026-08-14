import { useState, useEffect, useMemo } from 'react'
import { useLocation } from 'react-router-dom'
import { getDefaultSeoForPath } from '../config/seoDefaults'
import { buildSeoMapFromWpEntries } from '../lib/seo'
import { getSiteSeo } from '../lib/wordpress'

let seoMapCache = null
let seoMapPromise = null

function loadSeoMap() {
  if (seoMapCache) return Promise.resolve(seoMapCache)
  if (seoMapPromise) return seoMapPromise

  seoMapPromise = getSiteSeo()
    .then((entries) => {
      seoMapCache = buildSeoMapFromWpEntries(entries)
      return seoMapCache
    })
    .catch(() => {
      seoMapCache = {}
      return seoMapCache
    })

  return seoMapPromise
}

export function usePageSeo() {
  const { pathname } = useLocation()
  const [wpSeoMap, setWpSeoMap] = useState(seoMapCache || {})
  const [loaded, setLoaded] = useState(Boolean(seoMapCache))

  useEffect(() => {
    let cancelled = false
    loadSeoMap().then((map) => {
      if (cancelled) return
      setWpSeoMap(map)
      setLoaded(true)
    })
    return () => { cancelled = true }
  }, [])

  const seo = useMemo(() => {
    const path = pathname.replace(/\/$/, '') || '/'
    const wpSeo = wpSeoMap[path]
    const fallback = getDefaultSeoForPath(pathname)
    if (!wpSeo) return fallback
    return { ...fallback, ...wpSeo, source: 'yoast' }
  }, [pathname, wpSeoMap])

  return { seo, loaded }
}
