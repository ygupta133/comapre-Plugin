import { services } from '../data/siteData'
import { ServiceIcon } from './Icons'
import { ArrowRightIcon } from './Icons'

export default function Services() {
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

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
          {services.map((service, i) => (
            <article
              key={service.title}
              className="service-card bg-white rounded-xl p-6 border border-gray-100 group cursor-default"
              style={{ animationDelay: `${i * 0.05}s` }}
            >
              <div className="mb-4 w-14 h-14 rounded-xl bg-brand/5 flex items-center justify-center group-hover:bg-brand/10 group-hover:scale-110 transition-all duration-300">
                <ServiceIcon name={service.icon} />
              </div>

              <h3 className="font-bold text-gray-900 text-base sm:text-lg mb-2 leading-snug group-hover:text-brand transition-colors duration-300">
                {service.title}
              </h3>

              <p className="text-gray-600 text-sm leading-relaxed mb-4">
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
