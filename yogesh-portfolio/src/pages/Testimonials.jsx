import { Link } from 'react-router-dom'
import PageBanner from '../components/PageBanner'
import { testimonials } from '../data/pagesData'
import { ArrowRightIcon } from '../components/Icons'

function StarRating({ rating }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg
          key={i}
          className={`w-4 h-4 ${i < rating ? 'text-yellow-400' : 'text-gray-300'}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  )
}

export default function Testimonials() {
  return (
    <>
      <PageBanner
        title="Client Testimonials"
        subtitle="What my clients say about working with me — 150+ happy clients worldwide."
        breadcrumbs={[{ label: 'Testimonials' }]}
      />

      <section className="py-14 sm:py-18 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {testimonials.map((item) => (
              <article
                key={item.id}
                className="bg-white rounded-2xl p-6 sm:p-7 border border-gray-100 shadow-sm hover:shadow-lg hover:border-brand/20 transition-all duration-300 flex flex-col"
              >
                <StarRating rating={item.rating} />

                <p className="text-gray-600 text-sm leading-relaxed my-5 flex-grow">
                  "{item.text}"
                </p>

                <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-12 h-12 rounded-full object-cover border-2 border-brand/20"
                  />
                  <div>
                    <h4 className="font-bold text-gray-900 text-sm">{item.name}</h4>
                    <p className="text-gray-500 text-xs">{item.role}</p>
                    <p className="text-brand text-xs font-medium">{item.country}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>

          <div className="mt-14 text-center">
            <p className="text-gray-600 mb-5">Ready to join 150+ happy clients?</p>
            <Link
              to="/contact"
              className="btn-primary inline-flex items-center gap-2 bg-brand hover:bg-brand-dark text-white font-semibold px-7 py-3.5 rounded-md"
            >
              Start Your Project
              <ArrowRightIcon className="btn-arrow w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
