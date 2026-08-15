import { phoneToTel } from '../hooks/useUserRegion'

export default function RegionalPhone({
  contact,
  className = '',
  showLabel = false,
  showDialCode = true,
}) {
  if (!contact?.phone) return null

  return (
    <a
      href={phoneToTel(contact.phone)}
      className={`inline-flex items-center gap-2 hover:opacity-90 transition-opacity ${className}`}
      aria-label={`Call ${contact.label}: ${contact.phone}`}
    >
      <span className="text-base leading-none" role="img" aria-hidden="true">
        {contact.flag}
      </span>
      {showLabel && (
        <span className="text-xs font-medium opacity-80">{contact.label}</span>
      )}
      {showDialCode && contact.dialCode && (
        <span className="text-xs font-semibold opacity-90">{contact.dialCode}</span>
      )}
      <span className="font-semibold">{contact.phone}</span>
    </a>
  )
}
