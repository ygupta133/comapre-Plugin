import { useState } from 'react'
import PageBanner from '../components/PageBanner'
import { projects } from '../data/pagesData'
import { ArrowRightIcon } from '../components/Icons'

const filters = ['All', 'WordPress', 'React', 'Laravel']

export default function Work() {
  const [activeFilter, setActiveFilter] = useState('All')

  const filtered = activeFilter === 'All'
    ? projects
    : projects.filter((p) => p.category === activeFilter)

  return (
    <>
      <PageBanner
        title="My Work"
        subtitle="A showcase of 250+ projects delivered for clients across the globe."
        breadcrumbs={[{ label: 'Work' }]}
      />

      <section className="py-14 sm:py-18 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap justify-center gap-3 mb-10">
            {filters.map((filter) => (
              <button
                key={filter}
                type="button"
                onClick={() => setActiveFilter(filter)}
                className={`px-5 py-2 rounded-full text-sm font-semibold transition-all ${
                  activeFilter === filter
                    ? 'bg-brand text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-brand/10 hover:text-brand'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {filtered.map((project) => (
              <article
                key={project.id}
                className="group bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-2"
              >
                <div className="relative overflow-hidden aspect-[3/2]">
                  <img
                    src={project.image}
                    alt={project.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-brand/0 group-hover:bg-brand/60 transition-all duration-300 flex items-center justify-center">
                    <span className="text-white font-semibold opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2">
                      View Project <ArrowRightIcon className="w-4 h-4" />
                    </span>
                  </div>
                  <span className="absolute top-3 left-3 bg-brand text-white text-xs font-bold px-3 py-1 rounded-full">
                    {project.category}
                  </span>
                </div>

                <div className="p-5 sm:p-6">
                  <h3 className="font-bold text-gray-900 text-lg mb-2 group-hover:text-brand transition-colors">
                    {project.title}
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed mb-4">{project.description}</p>
                  <div className="flex flex-wrap gap-2">
                    {project.tech.map((t) => (
                      <span key={t} className="text-xs font-medium bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
