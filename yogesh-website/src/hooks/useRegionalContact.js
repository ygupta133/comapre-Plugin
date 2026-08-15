import { useSiteBundle } from './useSiteSettings'
import { useUserRegion, getRegionalContact } from './useUserRegion'

export function useRegionalContact() {
  const { settings } = useSiteBundle()
  const region = useUserRegion()
  const contact = getRegionalContact(settings, region)
  return { settings, region, contact }
}
