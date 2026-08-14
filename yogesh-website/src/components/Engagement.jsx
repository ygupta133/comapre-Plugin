import { engagementModels } from '../data/siteData'
import { ServiceIcon } from './Icons'

export default function Engagement() {
  return (
    <section className="bg-white py-12 sm:py-16 lg:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10 sm:mb-14">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3">
            Engagement Models
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Flexible hiring options to suit your project needs and budget.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6 max-w-5xl mx-auto">
          {engagementModels.map((model) => (
            <article
              key={model.title}
              className={`relative rounded-xl p-6 sm:p-8 text-center border transition-all ${
                model.popular
                  ? 'bg-brand text-white border-brand shadow-lg scale-[1.02] md:scale-105'
                  : 'bg-white border-gray-200 hover:border-brand/30 hover:shadow-md'
              }`}
            >
              {model.popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-brand-light text-brand-dark text-xs font-bold px-4 py-1 rounded-full whitespace-nowrap">
                  Most Popular
                </span>
              )}

              <div className={`flex justify-center mb-4 ${model.popular ? 'text-white' : 'text-brand'}`}>
                <ServiceIcon name={model.icon} />
              </div>

              <h3 className={`font-bold text-lg mb-3 ${model.popular ? 'text-white' : 'text-gray-900'}`}>
                {model.title}
              </h3>

              <p className={`text-sm leading-relaxed ${model.popular ? 'text-white/90' : 'text-gray-600'}`}>
                {model.description}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
