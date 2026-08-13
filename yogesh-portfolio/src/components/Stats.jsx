import { stats } from '../data/siteData'

export default function Stats() {
  return (
    <section className="bg-brand py-10 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center text-white">
              <div className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-1">
                {stat.value}
              </div>
              <div className="text-sm sm:text-base text-white/85 font-medium">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
