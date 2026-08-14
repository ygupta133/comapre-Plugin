import { Link } from 'react-router-dom'
import PageBanner from '../components/PageBanner'
import { skills, experience } from '../data/pagesData'
import { stats, whyChooseMe } from '../data/siteData'
import { CheckIcon, ArrowRightIcon } from '../components/Icons'

export default function About() {
  return (
    <>
      <PageBanner
        title="About Me"
        subtitle="14+ years of experience building websites that help businesses grow online."
        breadcrumbs={[{ label: 'About Me' }]}
      />

      <section className="py-14 sm:py-18 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
            <div className="relative">
              <div className="rounded-2xl overflow-hidden shadow-2xl">
                <img
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=700&fit=crop&crop=face"
                  alt="Yogesh Gupta"
                  className="w-full h-auto object-cover"
                />
              </div>
              <div className="absolute -bottom-4 -right-4 bg-brand text-white rounded-xl p-4 shadow-lg hidden sm:block">
                <div className="text-3xl font-bold">14+</div>
                <div className="text-sm text-white/80">Years Experience</div>
              </div>
            </div>

            <div>
              <span className="text-brand font-semibold text-sm uppercase tracking-wider">Who I Am</span>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mt-2 mb-5">
                Freelance Web Developer from Delhi, India
              </h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                Hi, I'm <strong>Yogesh Gupta</strong> — a passionate freelance web developer with over
                14 years of experience crafting digital solutions for businesses worldwide. I specialize
                in WordPress, React, Laravel and modern web technologies.
              </p>
              <p className="text-gray-600 leading-relaxed mb-6">
                From startups in Delhi NCR to enterprises in USA, UK and Australia, I've helped 150+
                clients build fast, secure and SEO-friendly websites that drive real business results.
              </p>

              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
                {whyChooseMe.slice(0, 4).map((item) => (
                  <li key={item} className="flex items-center gap-2 text-sm text-gray-700">
                    <span className="w-5 h-5 rounded-full bg-brand text-white flex items-center justify-center flex-shrink-0">
                      <CheckIcon className="w-3 h-3" />
                    </span>
                    {item}
                  </li>
                ))}
              </ul>

              <Link
                to="/contact"
                className="btn-primary inline-flex items-center gap-2 bg-brand hover:bg-brand-dark text-white font-semibold px-6 py-3 rounded-md"
              >
                Let's Work Together
                <ArrowRightIcon className="btn-arrow w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-brand py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center text-white">
                <div className="text-3xl sm:text-4xl font-bold">{stat.value}</div>
                <div className="text-sm text-white/80 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-14 sm:py-18 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <span className="text-brand font-semibold text-sm uppercase tracking-wider">My Skills</span>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mt-2">Technical Expertise</h2>
          </div>

          <div className="grid sm:grid-cols-2 gap-5 max-w-3xl mx-auto">
            {skills.map((skill) => (
              <div key={skill.name}>
                <div className="flex justify-between text-sm font-medium mb-1.5">
                  <span className="text-gray-800">{skill.name}</span>
                  <span className="text-brand">{skill.level}%</span>
                </div>
                <div className="h-2.5 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-brand to-brand-light rounded-full transition-all duration-1000"
                    style={{ width: `${skill.level}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-14 sm:py-18">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <span className="text-brand font-semibold text-sm uppercase tracking-wider">My Journey</span>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mt-2">Work Experience</h2>
          </div>

          <div className="max-w-3xl mx-auto space-y-0">
            {experience.map((item, i) => (
              <div key={item.year} className="relative pl-8 pb-10 last:pb-0 border-l-2 border-brand/20">
                <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-brand border-4 border-white shadow" />
                <span className="text-brand font-bold text-sm">{item.year}</span>
                <h3 className="font-bold text-gray-900 text-lg mt-1">{item.title}</h3>
                <p className="text-brand-light text-sm font-medium">{item.company}</p>
                <p className="text-gray-600 text-sm mt-2 leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
