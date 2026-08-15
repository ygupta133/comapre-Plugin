import { useState } from 'react'
import DynamicPageBanner from '../components/DynamicPageBanner'
import ContactGlobalReach from '../components/ContactGlobalReach'
import { CheckIcon, SendIcon } from '../components/Icons'
import { useSiteBundle } from '../hooks/useSiteSettings'
import { submitContactForm } from '../lib/wordpress'

export default function Contact() {
  const { settings, inquiries } = useSiteBundle()
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    inquiryType: '',
    message: '',
  })
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')
  const [sending, setSending] = useState(false)

  const contactInfo = [
    { icon: '📞', label: 'Phone', value: settings.phone, href: `tel:${settings.phone.replace(/\s/g, '')}` },
    { icon: '✉️', label: 'Email', value: settings.email, href: `mailto:${settings.email}` },
    { icon: '📍', label: 'Location', value: settings.location, href: '#' },
    { icon: '💬', label: 'WhatsApp', value: 'Chat on WhatsApp', href: settings.whatsappUrl },
    { icon: '💼', label: 'Upwork', value: 'Hire Me on Upwork', href: settings.upworkUrl, external: true },
  ]

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSending(true)
    setError('')
    const result = await submitContactForm(form)
    setSending(false)
    if (result.success) {
      setSubmitted(true)
      setForm({ name: '', email: '', phone: '', inquiryType: '', message: '' })
      setTimeout(() => setSubmitted(false), 5000)
    } else {
      setError(result.message)
    }
  }

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  return (
    <>
      <DynamicPageBanner />

      <section className="py-14 sm:py-18 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-5 gap-10 lg:gap-12">
            <div className="lg:col-span-2 space-y-5">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3">{settings.contactHeading}</h2>
                <p className="text-gray-600 text-sm leading-relaxed">{settings.contactIntro}</p>
              </div>

              {contactInfo.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  target={item.external ? '_blank' : undefined}
                  rel={item.external ? 'noopener noreferrer' : undefined}
                  className="flex items-center gap-4 bg-gray-50 hover:bg-brand/5 border border-gray-100 hover:border-brand/20 rounded-xl p-4 transition-all group"
                >
                  <span className="text-2xl">{item.icon}</span>
                  <div>
                    <p className="text-xs text-gray-500 font-medium">{item.label}</p>
                    <p className="text-sm font-semibold text-gray-900 group-hover:text-brand transition-colors">
                      {item.value}
                    </p>
                  </div>
                </a>
              ))}

              <a
                href={settings.upworkUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full bg-[#14a800] hover:bg-[#108a00] text-white font-semibold py-3.5 px-6 rounded-xl transition-colors shadow-md"
              >
                <span className="text-lg">💼</span>
                Hire Me on Upwork
              </a>

              <div className="bg-brand/5 border border-brand/15 rounded-xl p-5">
                <p className="font-bold text-brand text-sm mb-3">Available for new projects</p>
                <ul className="space-y-2">
                  {settings.contactAvailabilityBullets.map((item) => (
                    <li key={item} className="flex items-center gap-2 text-sm text-gray-700">
                      <CheckIcon className="w-4 h-4 text-brand" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="lg:col-span-3">
              <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8">
                <h3 className="font-bold text-gray-900 text-lg mb-6">{settings.contactFormTitle}</h3>

                {submitted && (
                  <div className="bg-green-50 border border-green-200 text-green-800 rounded-lg p-4 mb-6 text-sm">
                    {settings.contactSuccessMessage}
                  </div>
                )}

                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-4 mb-6 text-sm">
                    {error}
                  </div>
                )}

                <div className="grid sm:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Your Name *</label>
                    <input
                      type="text"
                      name="name"
                      required
                      value={form.name}
                      onChange={handleChange}
                      className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand/30 transition-colors"
                      placeholder="John Doe"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Address *</label>
                    <input
                      type="email"
                      name="email"
                      required
                      value={form.email}
                      onChange={handleChange}
                      className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand/30 transition-colors"
                      placeholder="john@example.com"
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone Number</label>
                    <input
                      type="tel"
                      name="phone"
                      value={form.phone}
                      onChange={handleChange}
                      className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand/30 transition-colors"
                      placeholder={settings.phone}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      What are you looking for? *
                    </label>
                    <select
                      name="inquiryType"
                      required
                      value={form.inquiryType}
                      onChange={handleChange}
                      className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand/30 transition-colors bg-white text-gray-900"
                    >
                      <option value="" disabled>Select a service</option>
                      {inquiries.map((type) => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Your Message *</label>
                  <textarea
                    name="message"
                    required
                    rows={5}
                    value={form.message}
                    onChange={handleChange}
                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand/30 transition-colors resize-none"
                    placeholder="Tell me about your project requirements..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={sending}
                  className="btn-primary w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-brand hover:bg-brand-dark text-white font-semibold px-8 py-3.5 rounded-md disabled:opacity-60"
                >
                  {sending ? 'Sending...' : 'Send Message'}
                  <SendIcon className="w-4 h-4" />
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      <ContactGlobalReach />
    </>
  )
}
