import { Link, useLocation } from 'react-router-dom'
import { ArrowRightIcon, HomeIcon } from '../components/Icons'

const quickLinks = [
  { label: 'Home', href: '/', desc: 'Back to homepage' },
  { label: 'Services', href: '/services', desc: 'Web & app development' },
  { label: 'My Work', href: '/work', desc: 'Portfolio & projects' },
  { label: 'Contact', href: '/contact', desc: 'Get a free quote' },
]

export default function NotFound() {
  const { pathname } = useLocation()

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-gray-50 to-white py-16 sm:py-24 lg:py-28">
      <div
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        aria-hidden="true"
        style={{
          backgroundImage:
            'radial-gradient(circle at 20% 20%, #006838 0%, transparent 45%), radial-gradient(circle at 80% 80%, #8cc63f 0%, transparent 40%)',
        }}
      />

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <p className="inline-flex items-center gap-2 bg-brand/10 text-brand text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-full mb-6">
          Error 404
        </p>

        <h1 className="text-[5rem] sm:text-[7rem] lg:text-[8rem] font-extrabold leading-none text-brand/15 select-none mb-2">
          404
        </h1>

        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4 -mt-8 sm:-mt-12">
          Page not found
        </h2>

        <p className="text-gray-600 text-sm sm:text-base max-w-xl mx-auto leading-relaxed mb-3">
          Sorry, the page you are looking for does not exist or may have been moved.
        </p>

        {pathname && pathname !== '/' && (
          <p className="text-xs text-gray-400 font-mono mb-8 break-all">
            {pathname}
          </p>
        )}

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-12">
          <Link
            to="/"
            className="inline-flex items-center justify-center gap-2 bg-brand hover:bg-brand-dark text-white font-semibold px-6 py-3 rounded-lg transition-colors w-full sm:w-auto"
          >
            <HomeIcon className="w-4 h-4" />
            Back to Home
          </Link>
          <Link
            to="/contact"
            className="inline-flex items-center justify-center gap-2 border-2 border-brand text-brand hover:bg-brand hover:text-white font-semibold px-6 py-3 rounded-lg transition-colors w-full sm:w-auto"
          >
            Contact Me
            <ArrowRightIcon className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-left max-w-2xl mx-auto">
          {quickLinks.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className="group flex items-center justify-between bg-white border border-gray-100 hover:border-brand/30 rounded-xl px-4 py-4 shadow-sm hover:shadow-md transition-all"
            >
              <div>
                <p className="font-semibold text-gray-900 group-hover:text-brand transition-colors">
                  {link.label}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">{link.desc}</p>
              </div>
              <ArrowRightIcon className="w-4 h-4 text-gray-300 group-hover:text-brand transition-colors flex-shrink-0" />
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
