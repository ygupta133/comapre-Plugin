import { globalRegions } from '../data/siteData'
import { CheckIcon, ArrowRightIcon } from './Icons'

export default function GlobalHire() {
  return (
    <section className="bg-gray-50 py-12 sm:py-16 lg:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          <div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-5 leading-tight">
              Hire Me From Anywhere in the World
            </h2>
            <p className="text-gray-600 mb-7 leading-relaxed">
              I work with clients globally — USA, Canada, Australia, Europe and beyond.
              Remote collaboration with clear communication and on-time delivery.
            </p>
            <a
              href="#contact"
              className="inline-flex items-center gap-2 bg-brand hover:bg-brand-dark text-white font-semibold px-6 py-3 rounded transition-colors"
            >
              Hire Me Internationally
              <ArrowRightIcon />
            </a>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
            {globalRegions.map((region) => (
              <div
                key={region.name}
                className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm"
              >
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-3xl" role="img" aria-label={region.name}>
                    {region.flag}
                  </span>
                  <h3 className="font-bold text-gray-900">{region.name}</h3>
                </div>
                <ul className="space-y-2">
                  {region.points.map((point) => (
                    <li key={point} className="flex items-center gap-2 text-sm text-gray-600">
                      <span className="text-brand">
                        <CheckIcon className="w-3.5 h-3.5" />
                      </span>
                      {point}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
