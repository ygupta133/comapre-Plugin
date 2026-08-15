import { useLocation } from 'react-router-dom'
import PageBanner from './PageBanner'
import { usePageBanner } from '../hooks/usePageSeo'

export default function DynamicPageBanner() {
  const banner = usePageBanner()
  if (!banner.title) return null
  return (
    <PageBanner
      title={banner.title}
      subtitle={banner.subtitle}
      breadcrumbs={[{ label: banner.breadcrumb }]}
    />
  )
}
