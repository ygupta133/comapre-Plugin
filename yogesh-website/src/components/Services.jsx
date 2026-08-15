import { services as fallbackServices } from '../data/siteData'
import { getServices } from '../lib/wordpress'
import { useWordPressList } from '../hooks/useWordPressData'
import { ServiceIcon, ArrowRightIcon } from './Icons'

export default function Services() {
  const { data: services } = useWordPressList(getServices, fallbackServices)

  return (
    <section id="services" className="bg-gray-50 py-12 sm:py-16 lg:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10 sm:mb-14">
          <span className="inline-block text-brand font-semibold text-sm uppercase tracking-wider mb-2">
            What I Do
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">
            Services I Offer
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
          {services.map((service, i) => (
            <article
              key={service.id || service.title}
              className="service-card bg-white rounded-xl p-5 border border-gray-100 group cursor-default"
              style={{ animationDelay: `${i * 0.05}s` }}
            >
              <div className="mb-4 w-14 h-14 rounded-xl bg-brand/5 flex items-center justify-center group-hover:bg-brand/10 group-hover:scale-110 transition-all duration-300">
                <ServiceIcon name={service.icon} />
              </div>

              <h3 className="font-bold text-gray-900 text-sm sm:text-base mb-1.5 leading-snug group-hover:text-brand transition-colors duration-300">
                {service.title}
              </h3>

              <p className="text-gray-600 text-xs sm:text-sm leading-relaxed mb-3 line-clamp-2">
                {service.description}
              </p>

              <span className="inline-flex items-center gap-1 text-brand text-sm font-semibold opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                Learn More
                <ArrowRightIcon className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </span>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
