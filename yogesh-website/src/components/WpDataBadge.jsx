export default function WpDataBadge({ source }) {
  if (source !== 'wordpress') return null

  return (
    <div className="flex justify-center mb-6">
      <span className="inline-flex items-center gap-2 bg-brand/10 text-brand text-xs font-semibold px-4 py-1.5 rounded-full">
        <span className="w-2 h-2 bg-brand rounded-full animate-pulse" />
        Live from WordPress
      </span>
    </div>
  )
}
