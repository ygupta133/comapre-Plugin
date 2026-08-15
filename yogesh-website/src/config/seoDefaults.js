const SITE_NAME = 'Yogesh Gupta | Freelance Web Developer'
const SITE_URL = import.meta.env.VITE_SITE_URL || 'https://yogeshwebdeveloper.com'
const DEFAULT_IMAGE = `${SITE_URL}/og-default.jpg`
const DEFAULT_DESCRIPTION =
  'Yogesh Gupta — Best freelance web developer near Delhi with 14+ years experience in React, WordPress, Laravel, WooCommerce and SEO-friendly websites.'

export const siteConfig = {
  name: SITE_NAME,
  url: SITE_URL.replace(/\/$/, ''),
  defaultImage: DEFAULT_IMAGE,
  defaultDescription: DEFAULT_DESCRIPTION,
  twitterHandle: '@yogeshwebdev',
  locale: 'en_IN',
}

export const routeSeoDefaults = {
  '/': {
    title: 'Yogesh Gupta | Best Freelance Web Developer Near Delhi',
    description: DEFAULT_DESCRIPTION,
    ogType: 'website',
  },
  '/about': {
    title: 'About Yogesh Gupta | Freelance Web Developer Delhi',
    description:
      'Learn about Yogesh Gupta — 14+ years freelance web developer from Delhi specializing in React, WordPress, Laravel and custom web solutions.',
    ogType: 'profile',
  },
  '/services': {
    title: 'Web & App Development Services | React, WordPress, iOS, Android | Yogesh Gupta',
    description:
      'Web development, iOS & Android app development, WordPress, React, Laravel, AI chatbots & SEO. Freelance developer in Delhi serving India, USA, UK, Canada & Europe.',
    ogType: 'website',
  },
  '/work': {
    title: 'Portfolio & Projects | Yogesh Gupta Web Developer',
    description:
      'View web development projects by Yogesh Gupta — WordPress, React, Laravel and e-commerce websites delivered for clients worldwide.',
    ogType: 'website',
  },
  '/testimonials': {
    title: 'Client Testimonials | Yogesh Gupta Freelance Developer',
    description:
      'Read reviews from clients who hired Yogesh Gupta for WordPress, React and custom web development projects.',
    ogType: 'website',
  },
  '/blog': {
    title: 'Web Development Blog | Tips & Tutorials | Yogesh Gupta',
    description:
      'Blog on web development, WordPress, React, SEO and freelancing tips by Yogesh Gupta — freelance developer near Delhi.',
    ogType: 'website',
  },
  '/contact': {
    title: 'Contact Yogesh Gupta | Hire Freelance Web Developer',
    description:
      'Get a free consultation with Yogesh Gupta — freelance web developer near Delhi. React, WordPress, Laravel and WooCommerce projects.',
    ogType: 'website',
  },
}

export const validAppRoutes = Object.keys(routeSeoDefaults)

export function getNotFoundSeo() {
  return {
    title: 'Page Not Found (404) | Yogesh Gupta — Freelance Web Developer',
    description:
      'The page you requested was not found. Browse services, portfolio or contact Yogesh Gupta — freelance web developer in Delhi.',
    canonical: `${siteConfig.url}/404`,
    ogType: 'website',
    ogTitle: 'Page Not Found | Yogesh Gupta',
    ogDescription: 'This page does not exist. Return to the homepage or contact for web development services.',
    ogUrl: `${siteConfig.url}/404`,
    ogImage: siteConfig.defaultImage,
    twitterCard: 'summary_large_image',
    robots: 'noindex, follow',
    schema: null,
    source: 'static',
  }
}

export function getDefaultSeoForPath(pathname) {
  const path = pathname === '' ? '/' : pathname.replace(/\/$/, '') || '/'
  if (!validAppRoutes.includes(path)) {
    return getNotFoundSeo()
  }
  const defaults = routeSeoDefaults[path] || routeSeoDefaults['/']
  const canonical = `${siteConfig.url}${path === '/' ? '' : path}`

  return {
    title: defaults.title,
    description: defaults.description,
    canonical,
    ogType: defaults.ogType || 'website',
    ogTitle: defaults.title,
    ogDescription: defaults.description,
    ogUrl: canonical,
    ogImage: siteConfig.defaultImage,
    twitterCard: 'summary_large_image',
    robots: 'index, follow',
    schema: null,
    source: 'static',
  }
}
