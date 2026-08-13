import { heroTrustItems, whyChooseMe } from '../data/siteData'
import { CheckIcon, ArrowRightIcon, EyeIcon } from './Icons'

export default function Hero() {
  return (
    <section id="home" className="bg-white py-10 sm:py-14 lg:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-12 gap-8 lg:gap-10 items-start">
          <div className="lg:col-span-7">
            <span className="inline-block bg-gray-100 text-gray-600 text-xs sm:text-sm font-semibold tracking-wider uppercase px-4 py-1.5 rounded-full mb-5">
              14+ Years of Experience
            </span>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-[2.75rem] font-bold text-gray-900 leading-tight mb-4">
              Best Freelance Web Developer Near Delhi
            </h1>

            <p className="text-gray-600 text-base sm:text-lg leading-relaxed mb-7 max-w-xl">
              I build fast, secure and SEO-friendly websites that help businesses grow online.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-8">
              <a
                href="#contact"
                className="inline-flex items-center justify-center gap-2 bg-brand hover:bg-brand-dark text-white font-semibold px-6 py-3 rounded transition-colors"
              >
                Get Free Consultation
                <ArrowRightIcon />
              </a>
              <a
                href="#work"
                className="inline-flex items-center justify-center gap-2 border-2 border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white font-semibold px-6 py-3 rounded transition-colors"
              >
                <EyeIcon />
                View My Work
              </a>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
              {heroTrustItems.map((item) => (
                <div key={item} className="flex items-center gap-2">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-brand-light/20 text-brand flex items-center justify-center">
                    <CheckIcon className="w-3 h-3" />
                  </span>
                  <span className="text-xs sm:text-sm text-gray-700 font-medium">{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-5 flex flex-col gap-6">
            <div className="flex justify-center lg:justify-end">
              <div className="relative">
                <div className="w-56 h-56 sm:w-64 sm:h-64 lg:w-72 lg:h-72 rounded-full overflow-hidden border-4 border-brand/20 shadow-xl">
                  <img
                    src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face"
                    alt="Yogesh Gupta - Freelance Web Developer"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute -bottom-2 -right-2 bg-brand text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
                  14+ Yrs
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-xl p-5 sm:p-6 border border-gray-100">
              <h3 className="font-bold text-gray-900 text-base sm:text-lg mb-4">
                Why Clients Choose Me?
              </h3>
              <ul className="space-y-2.5">
                {whyChooseMe.map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-sm text-gray-700">
                    <span className="flex-shrink-0 w-5 h-5 rounded-full bg-brand text-white flex items-center justify-center mt-0.5">
                      <CheckIcon className="w-3 h-3" />
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
