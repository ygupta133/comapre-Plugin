import { Link } from 'react-router-dom'
import DynamicPageBanner from '../components/DynamicPageBanner'
import WpDataBadge from '../components/WpDataBadge'
import LoadingSpinner from '../components/LoadingSpinner'
import { serviceDetails as fallbackServices } from '../data/pagesData'
import { getServices } from '../lib/wordpress'
import { useWordPressList } from '../hooks/useWordPressData'
import { ServiceIcon, CheckIcon, ArrowRightIcon } from '../components/Icons'
import Engagement from '../components/Engagement'
import AppDevelopmentSection from '../components/AppDevelopmentSection'

export default function ServicesPage() {
  const { data: services, loading, source } = useWordPressList(getServices, fallbackServices)

  return (
    <>
      <DynamicPageBanner />

      <section className="py-14 sm:py-18 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <WpDataBadge source={source} />

          {loading ? (
            <LoadingSpinner text="Loading services..." />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
              {services.map((service) => (
                <article
                  key={service.id || service.title}
                  className="service-card bg-white rounded-2xl p-6 sm:p-8 border border-gray-100 group"
                >
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-14 h-14 rounded-xl bg-brand/5 flex items-center justify-center flex-shrink-0 group-hover:bg-brand/10 group-hover:scale-110 transition-all">
                      <ServiceIcon name={service.icon} />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 text-lg sm:text-xl group-hover:text-brand transition-colors">
                        {service.title}
                      </h3>
                      <p className="text-gray-600 text-sm mt-1 leading-relaxed">{service.description}</p>
                    </div>
                  </div>

                  {service.features?.length > 0 && (
                    <div className="grid grid-cols-2 gap-2 mt-4">
                      {service.features.map((feature) => (
                        <span
                          key={feature}
                          className="flex items-center gap-1.5 text-xs sm:text-sm text-gray-600"
                        >
                          <CheckIcon className="w-3.5 h-3.5 text-brand flex-shrink-0" />
                          {feature}
                        </span>
                      ))}
                    </div>
                  )}
                </article>
              ))}
            </div>
          )}

          <div className="mt-14 text-center bg-brand/5 border border-brand/15 rounded-2xl p-8 sm:p-10">
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3">
              Need a Custom Solution?
            </h3>
            <p className="text-gray-600 mb-6 max-w-xl mx-auto">
              Every project is unique. Let's discuss your requirements and I'll create a tailored plan for you.
            </p>
            <Link
              to="/contact"
              className="btn-primary inline-flex items-center gap-2 bg-brand hover:bg-brand-dark text-white font-semibold px-7 py-3.5 rounded-md"
            >
              Get Free Consultation
              <ArrowRightIcon className="btn-arrow w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      <AppDevelopmentSection />
      <Engagement />
    </>
  )
}
