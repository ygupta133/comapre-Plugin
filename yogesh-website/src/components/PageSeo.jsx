import { Helmet } from 'react-helmet-async'
import { usePageSeo } from '../hooks/usePageSeo'
import { siteConfig } from '../config/seoDefaults'

export default function PageSeo() {
  const { seo } = usePageSeo()

  const schemaJson = seo.schema
    ? JSON.stringify(seo.schema)
    : JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'Person',
        name: 'Yogesh Gupta',
        url: siteConfig.url,
        jobTitle: 'Freelance Web Developer',
        description: seo.description,
        address: {
          '@type': 'PostalAddress',
          addressLocality: 'Delhi',
          addressCountry: 'IN',
        },
        sameAs: [
          'https://www.upwork.com/freelancers/~01bba1b5cc95c508c4',
        ],
      })

  return (
    <Helmet prioritizeSeoTags>
      <html lang="en" />
      <title>{seo.title}</title>
      <meta name="description" content={seo.description} />
      <meta name="robots" content={seo.robots} />
      <link rel="canonical" href={seo.canonical} />

      <meta property="og:locale" content={siteConfig.locale} />
      <meta property="og:type" content={seo.ogType} />
      <meta property="og:title" content={seo.ogTitle || seo.title} />
      <meta property="og:description" content={seo.ogDescription || seo.description} />
      <meta property="og:url" content={seo.ogUrl || seo.canonical} />
      <meta property="og:site_name" content={seo.ogSiteName || siteConfig.name} />
      <meta property="og:image" content={seo.ogImage} />

      <meta name="twitter:card" content={seo.twitterCard} />
      <meta name="twitter:title" content={seo.twitterTitle || seo.ogTitle || seo.title} />
      <meta name="twitter:description" content={seo.twitterDescription || seo.ogDescription || seo.description} />
      <meta name="twitter:image" content={seo.twitterImage || seo.ogImage} />
      {siteConfig.twitterHandle ? (
        <meta name="twitter:site" content={siteConfig.twitterHandle} />
      ) : null}

      <script type="application/ld+json">{schemaJson}</script>
    </Helmet>
  )
}
