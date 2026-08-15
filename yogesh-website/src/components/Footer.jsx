import { Link } from 'react-router-dom'
import { useSiteBundle } from '../hooks/useSiteSettings'
import { CheckIcon, SocialIcon } from './Icons'

function FooterLink({ item }) {
  const isExternal = item.href?.startsWith('http')
  const className = 'text-white/70 hover:text-brand-light text-sm transition-colors'
  if (isExternal) {
    return (
      <a href={item.href} target="_blank" rel="noopener noreferrer" className={className}>
        {item.label}
      </a>
    )
  }
  return (
    <Link to={item.href || '/'} className={className}>
      {item.label}
    </Link>
  )
}

export default function Footer() {
  const { settings, footer } = useSiteBundle()

  const socialLinks = [
    { name: 'upwork', href: settings.upworkUrl },
    { name: 'linkedin', href: settings.linkedinUrl },
    { name: 'twitter', href: settings.twitterUrl },
    { name: 'instagram', href: settings.instagramUrl },
    { name: 'whatsapp', href: settings.whatsappUrl },
  ].filter((s) => s.href && s.href !== '#')

  return (
    <footer className="bg-brand-footer text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-10">
          <div className="sm:col-span-2 lg:col-span-1">
            <h3 className="font-bold text-lg mb-4">About Me</h3>
            <p className="text-white/75 text-sm leading-relaxed mb-5">{settings.footerBio}</p>
            <div className="flex gap-2">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full bg-white/10 hover:bg-brand-light hover:text-brand-dark flex items-center justify-center transition-colors"
                  aria-label={social.name}
                >
                  <SocialIcon name={social.name} />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-bold text-base mb-4">Services</h3>
            <ul className="space-y-2">
              {footer.services.map((item) => (
                <li key={item.label}>
                  <FooterLink item={item} />
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-base mb-4">Hire Me</h3>
            <ul className="space-y-2">
              {footer.hire.map((item) => (
                <li key={item.label}>
                  <FooterLink item={item} />
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-base mb-4">Useful Links</h3>
            <ul className="space-y-2">
              {footer.useful.map((item) => (
                <li key={item.label}>
                  <FooterLink item={item} />
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-base mb-4">Contact Info</h3>
            <ul className="space-y-3 text-sm text-white/75">
              <li>
                <a href={`tel:${settings.phone.replace(/\s/g, '')}`} className="hover:text-brand-light transition-colors">
                  {settings.phone}
                </a>
              </li>
              <li>
                <a href={`mailto:${settings.email}`} className="hover:text-brand-light transition-colors">
                  {settings.email}
                </a>
              </li>
              <li>
                <a
                  href={settings.upworkUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-brand-light transition-colors"
                >
                  Hire on Upwork
                </a>
              </li>
              <li>{settings.location}</li>
            </ul>

            <div className="mt-5 bg-brand-light text-brand-dark rounded-lg p-4">
              <p className="font-bold text-sm mb-2">Available for new projects</p>
              <ul className="space-y-1">
                {settings.availabilityBullets.map((item) => (
                  <li key={item} className="flex items-center gap-2 text-xs font-medium">
                    <CheckIcon className="w-3.5 h-3.5" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-white/10">
          <h3 className="font-bold text-base mb-5 text-center sm:text-left">
            {settings.seoLocationsHeading}
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-x-4 gap-y-2">
            {footer.seo.map((item) => (
              <Link
                key={item.label}
                to={item.href || '/contact'}
                className="text-white/50 hover:text-brand-light text-xs transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-white/60">
          <p>© {new Date().getFullYear()} {settings.footerCopyright}</p>
          <div className="flex gap-4">
            <a href={settings.privacyUrl} className="hover:text-white transition-colors">Privacy Policy</a>
            <span>|</span>
            <a href={settings.termsUrl} className="hover:text-white transition-colors">Terms & Conditions</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
