import { useState, useEffect } from 'react'

const REGION_MAP = {
  IN: 'india',
  US: 'us',
  CA: 'canada',
  GB: 'uk',
  AU: 'au',
  NZ: 'au',
  IE: 'europe',
  DE: 'europe',
  FR: 'europe',
  IT: 'europe',
  ES: 'europe',
  NL: 'europe',
  BE: 'europe',
  AT: 'europe',
  CH: 'europe',
  SE: 'europe',
  NO: 'europe',
  DK: 'europe',
  FI: 'europe',
  PT: 'europe',
  PL: 'europe',
}

function guessFromTimezone() {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || ''
    if (tz === 'Asia/Kolkata') return 'india'
    if (tz.startsWith('America/Toronto') || tz.startsWith('America/Vancouver') || tz.startsWith('America/Edmonton')) {
      return 'canada'
    }
    if (tz.startsWith('America/')) return 'us'
    if (tz.startsWith('Australia/')) return 'au'
    if (tz === 'Europe/London') return 'uk'
    if (tz.startsWith('Europe/')) return 'europe'
  } catch {
    /* ignore */
  }
  return 'us'
}

export function useUserRegion() {
  const [region, setRegion] = useState(guessFromTimezone)

  useEffect(() => {
    let cancelled = false

    async function detect() {
      try {
        const res = await fetch('https://ipapi.co/json/', { signal: AbortSignal.timeout(3000) })
        if (res.ok) {
          const data = await res.json()
          const code = data.country_code
          if (!cancelled && code && REGION_MAP[code]) {
            setRegion(REGION_MAP[code])
            return
          }
        }
      } catch {
        /* fallback below */
      }
      if (!cancelled) setRegion(guessFromTimezone())
    }

    detect()
    return () => {
      cancelled = true
    }
  }, [])

  return region
}

export function phoneToTel(phone = '') {
  return `tel:${phone.replace(/[^\d+]/g, '')}`
}

export function getRegionalContact(settings, region) {
  const indiaPhone = settings.phone
  const usPhone = settings.phoneUs || settings.phone
  const ukPhone = settings.phoneUk || settings.phone
  const auPhone = settings.phoneAu || settings.phone

  const contacts = {
    india: {
      label: 'India',
      phone: indiaPhone,
      flag: '🇮🇳',
      dialCode: '+91',
      whatsapp: settings.whatsappUrl,
    },
    us: {
      label: 'USA',
      phone: usPhone,
      flag: '🇺🇸',
      dialCode: '+1',
      whatsapp: settings.whatsappUrl,
    },
    canada: {
      label: 'Canada',
      phone: usPhone,
      flag: '🇨🇦',
      dialCode: '+1',
      whatsapp: settings.whatsappUrl,
    },
    uk: {
      label: 'UK',
      phone: ukPhone,
      flag: '🇬🇧',
      dialCode: '+44',
      whatsapp: settings.whatsappUrl,
    },
    europe: {
      label: 'Europe',
      phone: ukPhone,
      flag: '🇪🇺',
      dialCode: '+44',
      whatsapp: settings.whatsappUrl,
    },
    au: {
      label: 'Australia',
      phone: auPhone,
      flag: '🇦🇺',
      dialCode: '+61',
      whatsapp: settings.whatsappUrl,
    },
  }

  return contacts[region] || contacts.us
}
