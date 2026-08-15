import { Link } from 'react-router-dom'
import DynamicPageBanner from '../components/DynamicPageBanner'
import WpDataBadge from '../components/WpDataBadge'
import LoadingSpinner from '../components/LoadingSpinner'
import { skills as fallbackSkills, experience as fallbackExperience } from '../data/pagesData'
import { stats as fallbackStats, whyChooseMe as fallbackWhyChoose } from '../data/siteData'
import { getSkills, getExperience, getAbout, getStats, getWhyChoose } from '../lib/wordpress'
import { useWordPressList, useWordPressObject } from '../hooks/useWordPressData'
import { CheckIcon, ArrowRightIcon } from '../components/Icons'

const defaultAbout = {
  title: 'About Me',
  subtitle: 'Freelance Web Developer from Delhi, India',
  bio: "I'm Yogesh Gupta — 14+ years building React, WordPress, Laravel & AI solutions for clients worldwide. Clean code, fast delivery, SEO that ranks.",
  yearsExperience: '14+',
  image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=700&fit=crop&crop=face',
}

export default function About() {
  const { data: about, source: aboutSource } = useWordPressObject(getAbout, defaultAbout)
  const { data: skills } = useWordPressList(getSkills, fallbackSkills)
  const { data: experience } = useWordPressList(getExperience, fallbackExperience)
  const { data: stats } = useWordPressList(getStats, fallbackStats)
  const { data: whyItems } = useWordPressList(getWhyChoose, fallbackWhyChoose.map((t) => ({ text: t })))
  const whyChooseList = whyItems[0]?.text ? whyItems.map((i) => i.text) : fallbackWhyChoose

  return (
    <>
      <DynamicPageBanner />

      <section className="py-14 sm:py-18 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <WpDataBadge source={aboutSource} />

          <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
            <div className="relative">
              <div className="rounded-2xl overflow-hidden shadow-2xl">
                <img src={about.image} alt="Yogesh Gupta" className="w-full h-auto object-cover" />
              </div>
              <div className="absolute -bottom-4 -right-4 bg-brand text-white rounded-xl p-4 shadow-lg hidden sm:block">
                <div className="text-3xl font-bold">{about.yearsExperience}</div>
                <div className="text-sm text-white/80">Years Experience</div>
              </div>
            </div>

            <div>
              <span className="text-brand font-semibold text-sm uppercase tracking-wider">Who I Am</span>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mt-2 mb-5">{about.subtitle}</h2>
              {about.bio && (
                <p className="text-gray-600 leading-relaxed mb-6">{about.bio}</p>
              )}

              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
                {whyChooseList.slice(0, 4).map((item) => (
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
                    className="h-full bg-gradient-to-r from-brand to-brand-light rounded-full"
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
            {experience.map((item) => (
              <div key={item.title + item.year} className="relative pl-8 pb-10 last:pb-0 border-l-2 border-brand/20">
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
