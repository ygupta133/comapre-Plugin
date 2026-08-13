import { services } from '../data/siteData'
import { ServiceIcon } from './Icons'

export default function Services() {
  return (
    <section id="services" className="bg-gray-50 py-12 sm:py-16 lg:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-center text-gray-900 mb-10 sm:mb-14">
          Services I Offer
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
          {services.map((service) => (
            <article
              key={service.title}
              className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md hover:border-brand/20 transition-all group"
            >
              <div className="mb-4 group-hover:scale-110 transition-transform origin-left">
                <ServiceIcon name={service.icon} />
              </div>
              <h3 className="font-bold text-gray-900 text-base sm:text-lg mb-2 leading-snug">
                {service.title}
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                {service.description}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
