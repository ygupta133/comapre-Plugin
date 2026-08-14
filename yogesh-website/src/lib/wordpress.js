const WP_API_URL = import.meta.env.VITE_WP_API_URL || ''

export const isWordPressEnabled = () => Boolean(WP_API_URL)

async function wpFetch(endpoint, options = {}) {
  if (!WP_API_URL) return null

  try {
    const url = `${WP_API_URL.replace(/\/$/, '')}/wp-json/wp/v2/${endpoint}`
    const res = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
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
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

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
  }
}

export function mapWPTestimonial(item) {
  return {
    id: item.id,
    name: stripHtml(item.title?.rendered || 'Client'),
    role: item.client_role || 'Client',
    image: item.client_image_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(item.title?.rendered || 'C')}&background=006838&color=fff`,
    rating: item.rating || 5,
    text: stripHtml(item.content?.rendered || ''),
    country: item.client_country || 'India',
  }
}

export async function getPosts() {
  const data = await wpFetch('posts?per_page=20&_fields=id,title,excerpt,date,slug,link,featured_image_url,category_name,read_time')
  if (!data) return null
  return data.map(mapWPPost)
}

export async function getProjects() {
  const data = await wpFetch('projects?per_page=50&_fields=id,title,excerpt,content,link,featured_image_url,category_name,tech_stack,project_url')
  if (!data) return null
  return data.map(mapWPProject)
}

export async function getTestimonials() {
  const data = await wpFetch('testimonials?per_page=50&_fields=id,title,content,client_role,client_country,rating,client_image_url')
  if (!data) return null
  return data.map(mapWPTestimonial)
}

export async function getWooProducts() {
  if (!WP_API_URL) return null
  const key = import.meta.env.VITE_WC_CONSUMER_KEY
  const secret = import.meta.env.VITE_WC_CONSUMER_SECRET
  if (!key || !secret) return null

  try {
    const auth = btoa(`${key}:${secret}`)
    const url = `${WP_API_URL.replace(/\/$/, '')}/wp-json/wc/v3/products?per_page=20`
    const res = await fetch(url, {
      headers: { Authorization: `Basic ${auth}` },
    })
    if (!res.ok) throw new Error('WooCommerce API error')
    return await res.json()
  } catch (err) {
    console.warn('WooCommerce fetch failed:', err.message)
    return null
  }
}
