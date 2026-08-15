import { useState, useEffect } from 'react'
import { getSiteSettings, getNavItems, getFooterItems, getInquiryTypes } from '../lib/wordpress'
import {
  defaultSiteSettings,
  defaultNavLinks,
  defaultFooterData,
  defaultInquiryTypes,
} from '../config/siteDefaults'

let settingsCache = null
let settingsPromise = null

function loadSiteBundle() {
  if (settingsCache) return Promise.resolve(settingsCache)
  if (settingsPromise) return settingsPromise

  settingsPromise = Promise.all([
    getSiteSettings(),
    getNavItems(),
    getFooterItems(),
    getInquiryTypes(),
  ]).then(([settings, nav, footer, inquiries]) => {
    const footerItems = footer || []
    settingsCache = {
      settings: settings || defaultSiteSettings,
      nav: nav?.length ? nav : defaultNavLinks,
      footer: {
        services: footerItems.filter((i) => i.linkType === 'service').length
          ? footerItems.filter((i) => i.linkType === 'service')
          : defaultFooterData.services,
        hire: footerItems.filter((i) => i.linkType === 'hire').length
          ? footerItems.filter((i) => i.linkType === 'hire')
          : defaultFooterData.hire,
        useful: footerItems.filter((i) => i.linkType === 'useful').length
          ? footerItems.filter((i) => i.linkType === 'useful')
          : defaultFooterData.useful,
        seo: footerItems.filter((i) => i.linkType === 'seo').length
          ? footerItems.filter((i) => i.linkType === 'seo')
          : defaultFooterData.seo,
      },
      inquiries: inquiries?.length
        ? inquiries.map((i) => i.label)
        : defaultInquiryTypes,
      source: settings ? 'wordpress' : 'static',
    }
    return settingsCache
  }).catch(() => {
    settingsCache = {
      settings: defaultSiteSettings,
      nav: defaultNavLinks,
      footer: defaultFooterData,
      inquiries: defaultInquiryTypes,
      source: 'static',
    }
    return settingsCache
  })

  return settingsPromise
}

export function useSiteBundle() {
  const [bundle, setBundle] = useState(settingsCache || {
    settings: defaultSiteSettings,
    nav: defaultNavLinks,
    footer: defaultFooterData,
    inquiries: defaultInquiryTypes,
    source: 'static',
  })

  useEffect(() => {
    let cancelled = false
    loadSiteBundle().then((data) => {
      if (!cancelled) setBundle(data)
    })
    return () => { cancelled = true }
  }, [])

  return bundle
}
