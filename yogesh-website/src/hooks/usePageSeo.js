import { useState, useEffect, useMemo } from 'react'
import { useLocation } from 'react-router-dom'
import { getDefaultSeoForPath } from '../config/seoDefaults'
import { defaultPageBanners } from '../config/siteDefaults'
import { buildSeoMapFromWpEntries, normalizePath } from '../lib/seo'
import { getSiteSeo } from '../lib/wordpress'

let pageContentCache = null
let pageContentPromise = null

function loadPageContent() {
  if (pageContentCache) return Promise.resolve(pageContentCache)
  if (pageContentPromise) return pageContentPromise

  pageContentPromise = getSiteSeo()
    .then((entries) => {
      const bannerMap = {}
      if (Array.isArray(entries)) {
        entries.forEach((entry) => {
          const path = normalizePath(entry.route_path)
          if (entry.banner_title) {
            bannerMap[path] = {
              title: entry.banner_title,
              subtitle: entry.banner_subtitle || '',
              breadcrumb: entry.breadcrumb_label || entry.banner_title,
            }
          }
        })
      }
      pageContentCache = {
        seoMap: buildSeoMapFromWpEntries(entries),
        bannerMap,
      }
      return pageContentCache
    })
    .catch(() => {
      pageContentCache = { seoMap: {}, bannerMap: {} }
      return pageContentCache
    })

  return pageContentPromise
}

export function usePageSeo() {
  const { pathname } = useLocation()
  const [wpSeoMap, setWpSeoMap] = useState(pageContentCache?.seoMap || {})
  const [loaded, setLoaded] = useState(Boolean(pageContentCache))

  useEffect(() => {
    let cancelled = false
    loadPageContent().then((content) => {
      if (cancelled) return
      setWpSeoMap(content.seoMap)
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

export function usePageBanner() {
  const { pathname } = useLocation()
  const [bannerMap, setBannerMap] = useState(pageContentCache?.bannerMap || {})

  useEffect(() => {
    let cancelled = false
    loadPageContent().then((content) => {
      if (cancelled) return
      setBannerMap(content.bannerMap)
    })
    return () => { cancelled = true }
  }, [])

  return useMemo(() => {
    const path = pathname.replace(/\/$/, '') || '/'
    const wp = bannerMap[path]
    const fallback = defaultPageBanners[path] || defaultPageBanners['/about']
    return {
      title: wp?.title || fallback.title,
      subtitle: wp?.subtitle ?? fallback.subtitle,
      breadcrumb: wp?.breadcrumb || fallback.breadcrumb,
    }
  }, [pathname, bannerMap])
}
