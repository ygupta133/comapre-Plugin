import { Link } from 'react-router-dom'
import { CheckIcon, ArrowRightIcon } from './Icons'

const platforms = [
  {
    name: 'iOS App Development',
    icon: '🍎',
    stack: 'Swift, React Native, Flutter',
    features: ['App Store submission', 'Push notifications', 'In-app payments', 'API integration'],
    description: 'Native & cross-platform iOS apps — polished UI, smooth performance, App Store ready.',
  },
  {
    name: 'Android App Development',
    icon: '🤖',
    stack: 'Kotlin, React Native, Flutter',
    features: ['Play Store publishing', 'Material Design UI', 'Firebase backend', 'Payment gateways'],
    description: 'Android apps for phones & tablets — scalable, secure and Google Play compliant.',
  },
  {
    name: 'Cross-Platform Apps',
    icon: '📱',
    stack: 'React Native, Flutter, PWA',
    features: ['One codebase iOS + Android', 'Faster launch', 'Lower cost', 'Easy updates'],
    description: 'Build once, deploy on both iOS & Android — ideal for startups & MVPs.',
  },
]

export default function AppDevelopmentSection() {
  return (
    <section className="bg-gray-900 text-white py-14 sm:py-18">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10 sm:mb-12">
          <span className="inline-block text-brand-light font-semibold text-sm uppercase tracking-wider mb-2">
            Mobile App Development
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4">
            iOS &amp; Android Application Development
          </h2>
          <p className="text-gray-400 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
            Custom mobile apps for startups &amp; businesses — Delhi, India and clients worldwide.
            From idea to App Store &amp; Play Store launch with backend API, payments &amp; push notifications.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-5 sm:gap-6 mb-10">
          {platforms.map((app) => (
            <article
              key={app.name}
              className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:border-brand-light/40 hover:bg-white/8 transition-all"
            >
              <div className="text-4xl mb-3" role="img" aria-label={app.name}>{app.icon}</div>
              <h3 className="font-bold text-lg mb-1">{app.name}</h3>
              <p className="text-brand-light text-xs font-medium mb-3">{app.stack}</p>
              <p className="text-gray-400 text-sm mb-4 leading-relaxed">{app.description}</p>
              <ul className="space-y-2">
                {app.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-xs text-gray-300">
                    <CheckIcon className="w-3.5 h-3.5 text-brand-light flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>

        <div className="text-center">
          <Link
            to="/contact"
            className="inline-flex items-center gap-2 bg-brand hover:bg-brand-dark text-white font-semibold px-7 py-3.5 rounded-md transition-colors"
          >
            Get App Development Quote
            <ArrowRightIcon className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  )
}
