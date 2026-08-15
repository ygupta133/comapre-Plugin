import { useState, useEffect } from 'react'

const REGION_MAP = {
  IN: 'india',
  US: 'us',
  CA: 'us',
  GB: 'uk',
  AU: 'au',
  NZ: 'au',
}

function guessFromTimezone() {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || ''
    if (tz === 'Asia/Kolkata') return 'india'
    if (tz.startsWith('America/')) return 'us'
    if (tz.startsWith('Australia/')) return 'au'
    if (tz === 'Europe/London') return 'uk'
  } catch {
    /* ignore */
  }
  return 'international'
}

export function useUserRegion() {
  const [region, setRegion] = useState('india')

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
    return () => { cancelled = true }
  }, [])

  return region
}

export function getRegionalContact(settings, region) {
  const contacts = {
    india: {
      label: 'India',
      phone: settings.phone,
      flag: '🇮🇳',
      whatsapp: settings.whatsappUrl,
    },
    us: {
      label: 'USA / Canada',
      phone: settings.phoneUs || settings.phone,
      flag: '🇺🇸',
      whatsapp: settings.whatsappUrl,
    },
    uk: {
      label: 'UK / Europe',
      phone: settings.phoneUk || settings.phone,
      flag: '🇬🇧',
      whatsapp: settings.whatsappUrl,
    },
    au: {
      label: 'Australia',
      phone: settings.phoneAu || settings.phone,
      flag: '🇦🇺',
      whatsapp: settings.whatsappUrl,
    },
    international: {
      label: 'International',
      phone: settings.phoneUs || settings.phone,
      flag: '🌍',
      whatsapp: settings.whatsappUrl,
    },
  }
  return contacts[region] || contacts.international
}
