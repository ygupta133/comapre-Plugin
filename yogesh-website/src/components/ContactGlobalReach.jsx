import { useSiteBundle } from '../hooks/useSiteSettings'
import { CheckIcon } from './Icons'

const regions = [
  { flag: '🇺🇸', name: 'USA', phoneKey: 'phoneUs', dialCode: '+1', note: 'Remote collaboration, EST/PST friendly' },
  { flag: '🇨🇦', name: 'Canada', phoneKey: 'phoneUs', dialCode: '+1', note: 'Same timezone support as US clients' },
  { flag: '🇬🇧', name: 'UK', phoneKey: 'phoneUk', dialCode: '+44', note: 'GMT/BST — smooth communication' },
  { flag: '🇪🇺', name: 'Europe', phoneKey: 'phoneUk', dialCode: '+44', note: 'EU clients — flexible hours' },
  { flag: '🇦🇺', name: 'Australia', phoneKey: 'phoneAu', dialCode: '+61', note: 'AEST friendly remote work' },
  { flag: '🇮🇳', name: 'India', phoneKey: 'phone', dialCode: '+91', note: 'Delhi NCR — local & global projects' },
]

export default function ContactGlobalReach() {
  const { settings } = useSiteBundle()

  return (
    <section className="bg-gray-50 border-y border-gray-100 py-12 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <span className="inline-flex items-center gap-2 bg-brand/10 text-brand text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-full mb-4">
            <span>🌍</span> Global Clients Welcome
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
            I Work With Clients in USA, UK, Canada, Europe &amp; Worldwide
          </h2>
          <p className="text-gray-600 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
            Based in Delhi, India — serving clients remotely across 15+ countries.
            Clear English communication, video calls, and flexible time zones for US, UK, Canadian &amp; European projects.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 mb-8">
          {regions.map((region) => {
            const phone = settings[region.phoneKey] || settings.phone
            return (
              <div
                key={region.name}
                className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm hover:border-brand/25 hover:shadow-md transition-all"
              >
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-3xl" role="img" aria-label={region.name}>{region.flag}</span>
                  <div>
                    <h3 className="font-bold text-gray-900">{region.name}</h3>
                    <p className="text-brand text-xs font-semibold">Available for Hire</p>
                  </div>
                </div>
                <p className="text-gray-600 text-xs sm:text-sm mb-3">{region.note}</p>
                <a
                  href={`tel:${phone.replace(/\s/g, '')}`}
                  className="text-sm font-semibold text-gray-900 hover:text-brand transition-colors inline-flex items-center gap-2"
                >
                  <span role="img" aria-label={region.name}>{region.flag}</span>
                  <span className="text-brand text-xs font-bold">{region.dialCode}</span>
                  {phone}
                </a>
              </div>
            )
          })}
        </div>

        <ul className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-gray-700">
          {[
            'Flexible Time Zones',
            'Video Calls & Slack/Email',
            'Upwork & Direct Hire',
            'Secure International Payments',
          ].map((item) => (
            <li key={item} className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-brand text-white flex items-center justify-center">
                <CheckIcon className="w-3 h-3" />
              </span>
              {item}
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
