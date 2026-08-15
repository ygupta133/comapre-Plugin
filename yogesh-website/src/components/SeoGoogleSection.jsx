import { Link } from 'react-router-dom'
import { seoExpertiseTags, techExpertiseTags } from '../data/siteData'
import { CheckIcon, ArrowRightIcon } from './Icons'

const highlights = [
  'Image SEO & alt-text optimization',
  'Schema markup & JSON-LD coding',
  'Google Knowledge Panel setup',
  'Core Web Vitals pass (LCP, CLS, INP)',
  'Rich results & FAQ schema',
]

export default function SeoGoogleSection() {
  return (
    <section className="py-12 sm:py-16 bg-white border-y border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-14 items-center">
          <div>
            <span className="inline-block text-brand font-semibold text-sm uppercase tracking-wider mb-2">
              SEO & Google Visibility
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
              Want Your Images & Brand on Google?
            </h2>
            <p className="text-gray-600 text-sm sm:text-base leading-relaxed mb-6">
              I help businesses appear in Google Search, Google Images and Knowledge Panels —
              with schema coding, image SEO, Core Web Vitals optimization and structured data
              so your photos, logo and services show up where customers search.
            </p>
            <ul className="space-y-2.5 mb-6">
              {highlights.map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm text-gray-700">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-brand text-white flex items-center justify-center mt-0.5">
                    <CheckIcon className="w-3 h-3" />
                  </span>
                  {item}
                </li>
              ))}
            </ul>
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 text-brand font-semibold text-sm hover:gap-3 transition-all"
            >
              Get SEO Consultation
              <ArrowRightIcon className="w-4 h-4" />
            </Link>
          </div>

          <div className="space-y-5">
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Google & SEO</p>
              <div className="flex flex-wrap gap-2">
                {seoExpertiseTags.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs sm:text-sm font-medium px-3 py-1.5 rounded-full bg-brand/8 text-brand border border-brand/15"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Tech & Integrations</p>
              <div className="flex flex-wrap gap-2">
                {techExpertiseTags.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs sm:text-sm font-medium px-3 py-1.5 rounded-full bg-gray-100 text-gray-700 border border-gray-200"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
