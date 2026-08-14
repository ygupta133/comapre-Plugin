const WP_API_URL = import.meta.env.VITE_WP_API_URL || ''

export const isWordPressEnabled = () => Boolean(WP_API_URL)

async function wpFetch(endpoint, options = {}) {
  if (!WP_API_URL) return null
  try {
    const url = `${WP_API_URL.replace(/\/$/, '')}/wp-json/wp/v2/${endpoint}`
    const res = await fetch(url, {
      ...options,
      headers: { 'Content-Type': 'application/json', ...options.headers },
    })
    if (!res.ok) throw new Error(`WP API error: ${res.status}`)
    return await res.json()
  } catch (err) {
    console.warn('WordPress API fetch failed:', err.message)
    return null
  }
}

function stripHtml(html) {
  if (!html) return ''
  return html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim()
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

const sortByOrder = (a, b) => (a.sort_order || 0) - (b.sort_order || 0)
const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&h=400&fit=crop'

export function mapWPPost(post) {
  return {
    id: post.id,
    title: stripHtml(post.title?.rendered || ''),
    excerpt: stripHtml(post.excerpt?.rendered || '').slice(0, 160),
    image: post.featured_image_url || FALLBACK_IMAGE,
    category: post.category_name || 'Blog',
    date: formatDate(post.date),
    readTime: post.read_time || '5 min read',
    slug: post.slug,
    link: post.link,
  }
}

export function mapWPService(item) {
  const features = item.features
    ? item.features.split(',').map((f) => f.trim()).filter(Boolean)
    : []
  return {
    id: item.id,
    title: stripHtml(item.title?.rendered || ''),
    description: stripHtml(item.excerpt?.rendered || item.content?.rendered || ''),
    icon: item.icon || 'code',
    features,
    sort_order: item.sort_order || 0,
  }
}

export function mapWPProject(project) {
  const tech = project.tech_stack
    ? project.tech_stack.split(',').map((t) => t.trim()).filter(Boolean)
    : []
  return {
    id: project.id,
    title: stripHtml(project.title?.rendered || ''),
    category: project.category_name || 'WordPress',
    image: project.featured_image_url || FALLBACK_IMAGE,
    description: stripHtml(project.excerpt?.rendered || project.content?.rendered || '').slice(0, 200),
    tech: tech.length ? tech : ['WordPress'],
    link: project.project_url || project.link || '#',
    sort_order: project.sort_order || 0,
  }
}

export function mapWPTestimonial(item) {
  const name = stripHtml(item.title?.rendered || 'Client')
  return {
    id: item.id,
    name,
    role: item.client_role || 'Client',
    image: item.client_image_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=006838&color=fff`,
    rating: item.rating || 5,
    text: stripHtml(item.content?.rendered || ''),
    country: item.client_country || 'India',
    sort_order: item.sort_order || 0,
  }
}

export function mapWPSkill(item) {
  return {
    name: stripHtml(item.title?.rendered || ''),
    level: item.percentage || 90,
    sort_order: item.sort_order || 0,
  }
}

export function mapWPExperience(item) {
  return {
    year: item.year_range || '',
    title: stripHtml(item.title?.rendered || ''),
    company: item.company || '',
    description: stripHtml(item.content?.rendered || ''),
    sort_order: item.sort_order || 0,
  }
}

export function mapWPEngagement(item) {
  return {
    title: stripHtml(item.title?.rendered || ''),
    description: stripHtml(item.content?.rendered || item.excerpt?.rendered || ''),
    icon: item.icon || 'clock',
    popular: Boolean(item.is_popular),
    sort_order: item.sort_order || 0,
  }
}

export function mapWPStat(item) {
  return {
    value: item.stat_value || '0',
    label: item.stat_label || stripHtml(item.title?.rendered || ''),
    sort_order: item.sort_order || 0,
  }
}

export function mapWPCity(item) {
  return {
    name: stripHtml(item.title?.rendered || ''),
    sort_order: item.sort_order || 0,
  }
}

export function mapWPRegion(item) {
  const points = item.points
    ? item.points.split(',').map((p) => p.trim()).filter(Boolean)
    : []
  return {
    name: stripHtml(item.title?.rendered || ''),
    flag: item.flag_emoji || '🌍',
    points: points.length ? points : ['Quality Work', 'On-Time Delivery'],
    sort_order: item.sort_order || 0,
  }
}

export function mapWPTextItem(item) {
  return {
    text: stripHtml(item.title?.rendered || ''),
    sort_order: item.sort_order || 0,
  }
}

export function mapWPHero(item) {
  return {
    badgeText: item.badge_text || '14+ Years of Experience',
    headline: item.headline || 'Best Freelance Web Developer',
    headlineHighlight: item.headline_highlight || 'Near Delhi',
    subtitle: item.subtitle || 'I build fast, secure and SEO-friendly websites that help businesses grow online.',
    ctaPrimary: item.cta_primary || 'Get Free Consultation',
    ctaSecondary: item.cta_secondary || 'View My Work',
    yearsBadge: item.years_badge || '14+ Years Experience',
    projectsCount: item.projects_count || '250+',
    clientsCount: item.clients_count || '150+',
    image: item.featured_image_url || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&h=500&fit=crop&crop=face',
  }
}

export function mapWPAbout(item) {
  return {
    title: stripHtml(item.title?.rendered || 'About Me'),
    subtitle: item.subtitle || 'Freelance Web Developer from Delhi, India',
    bio: stripHtml(item.content?.rendered || ''),
    yearsExperience: item.years_experience || '14+',
    image: item.featured_image_url || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=700&fit=crop&crop=face',
  }
}

async function fetchCPT(endpoint, mapper, perPage = 50) {
  const data = await wpFetch(`${endpoint}?per_page=${perPage}&orderby=menu_order&order=asc`)
  if (!data || !Array.isArray(data)) return null
  return data.map(mapper).sort(sortByOrder)
}

async function fetchFirst(endpoint, mapper) {
  const data = await wpFetch(`${endpoint}?per_page=1`)
  if (!data || !data.length) return null
  return mapper(data[0])
}

export const getPosts = () => fetchCPT('posts', mapWPPost)
export const getServices = () => fetchCPT('services', mapWPService)
export const getProjects = () => fetchCPT('projects', mapWPProject)
export const getTestimonials = () => fetchCPT('testimonials', mapWPTestimonial)
export const getSkills = () => fetchCPT('skills', mapWPSkill)
export const getExperience = () => fetchCPT('experience', mapWPExperience)
export const getEngagement = () => fetchCPT('engagement', mapWPEngagement)
export const getStats = () => fetchCPT('stats', mapWPStat)
export const getCities = () => fetchCPT('cities', mapWPCity, 100)
export const getRegions = () => fetchCPT('regions', mapWPRegion)
export const getWhyChoose = () => fetchCPT('why-choose', mapWPTextItem)
export const getTrustItems = () => fetchCPT('trust-items', mapWPTextItem)
export const getHero = () => fetchFirst('hero', mapWPHero)
export const getAbout = () => fetchFirst('about', mapWPAbout)

export async function getWooProducts() {
  if (!WP_API_URL) return null
  const key = import.meta.env.VITE_WC_CONSUMER_KEY
  const secret = import.meta.env.VITE_WC_CONSUMER_SECRET
  if (!key || !secret) return null
  try {
    const auth = btoa(`${key}:${secret}`)
    const url = `${WP_API_URL.replace(/\/$/, '')}/wp-json/wc/v3/products?per_page=20`
    const res = await fetch(url, { headers: { Authorization: `Basic ${auth}` } })
    if (!res.ok) throw new Error('WooCommerce API error')
    return await res.json()
  } catch (err) {
    console.warn('WooCommerce fetch failed:', err.message)
    return null
  }
}
