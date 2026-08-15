import { siteConfig } from '../config/seoDefaults'

function normalizePath(path) {
  if (!path) return '/'
  const cleaned = path.trim()
  if (cleaned === '/' || cleaned === '') return '/'
  return cleaned.startsWith('/') ? cleaned.replace(/\/$/, '') : `/${cleaned.replace(/\/$/, '')}`
}

function robotsToString(robots) {
  if (!robots) return 'index, follow'
  if (typeof robots === 'string') return robots
  const parts = []
  if (robots.index) parts.push(robots.index)
  if (robots.follow) parts.push(robots.follow)
  if (robots['max-image-preview']) parts.push(`max-image-preview:${robots['max-image-preview']}`)
  if (robots['max-snippet']) parts.push(`max-snippet:${robots['max-snippet']}`)
  if (robots['max-video-preview']) parts.push(`max-video-preview:${robots['max-video-preview']}`)
  return parts.length ? parts.join(', ') : 'index, follow'
}

function getOgImage(yoast) {
  const images = yoast?.og_image
  if (!images) return siteConfig.defaultImage
  if (typeof images === 'string') return images
  if (Array.isArray(images) && images[0]?.url) return images[0].url
  if (images?.url) return images.url
  return siteConfig.defaultImage
}

export function parseYoastHeadJson(yoast, routePath) {
  if (!yoast || typeof yoast !== 'object') return null

  const path = normalizePath(routePath)
  const fallbackCanonical = `${siteConfig.url}${path === '/' ? '' : path}`

  return {
    title: yoast.title || yoast.og_title || '',
    description: yoast.description || yoast.og_description || '',
    canonical: yoast.canonical || yoast.og_url || fallbackCanonical,
    ogType: yoast.og_type || 'website',
    ogTitle: yoast.og_title || yoast.title || '',
    ogDescription: yoast.og_description || yoast.description || '',
    ogUrl: yoast.og_url || yoast.canonical || fallbackCanonical,
    ogImage: getOgImage(yoast),
    ogSiteName: yoast.og_site_name || siteConfig.name,
    twitterCard: yoast.twitter_card || 'summary_large_image',
    twitterTitle: yoast.twitter_title || yoast.og_title || yoast.title || '',
    twitterDescription: yoast.twitter_description || yoast.og_description || yoast.description || '',
    twitterImage: yoast.twitter_image || getOgImage(yoast),
    robots: robotsToString(yoast.robots),
    schema: yoast.schema || null,
    source: 'yoast',
  }
}

export function buildSeoMapFromWpEntries(entries) {
  const map = {}
  if (!Array.isArray(entries)) return map

  entries.forEach((entry) => {
    const route = normalizePath(entry.route_path)
    const yoastSeo = parseYoastHeadJson(entry.yoast_head_json, route)
    if (yoastSeo?.title) {
      map[route] = yoastSeo
    }
  })

  return map
}

export { normalizePath }
