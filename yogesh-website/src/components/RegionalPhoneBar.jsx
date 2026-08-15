import { useRegionalContact } from '../hooks/useRegionalContact'
import RegionalPhone from './RegionalPhone'

export default function RegionalPhoneBar() {
  const { settings, contact } = useRegionalContact()

  return (
    <div className="bg-brand text-white text-xs sm:text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <p className="text-white/90 text-center sm:text-left">
          Serving clients in USA, UK, Canada, Europe, Australia &amp; India
        </p>
        <div className="flex items-center justify-center sm:justify-end gap-4 flex-wrap">
          <RegionalPhone
            contact={contact}
            showLabel
            showDialCode
            className="text-white hover:text-brand-light"
          />
          <a
            href={settings.whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-white/90 hover:text-white font-medium"
          >
            <span aria-hidden="true">💬</span>
            WhatsApp
          </a>
        </div>
      </div>
    </div>
  )
}
