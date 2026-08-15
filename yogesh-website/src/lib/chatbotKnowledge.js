export const chatbotFaqs = [
  {
    keywords: ['service', 'services', 'kya karte', 'what do you', 'offer'],
    answer:
      'I offer WordPress, React, Laravel, AI chatbots, payment gateways (Razorpay/HDFC), Figma to code, SEO & Core Web Vitals. See /services or message me on WhatsApp!',
    action: { label: 'View Services', href: '/services' },
  },
  {
    keywords: ['price', 'pricing', 'cost', 'kitna', 'rate', 'charge', 'budget'],
    answer:
      'Pricing depends on project scope. I work hourly, part-time & full-time. Free consultation — share your requirements and I\'ll send a quote within 24 hours.',
    action: { label: 'Get Free Quote', href: '/contact' },
  },
  {
    keywords: ['hire', 'available', 'start', 'timeline', 'kab', 'when'],
    answer:
      'Yes, I\'m available for new projects! Typical response within 24 hours. Clients in India, USA, UK, Canada & Australia — remote friendly.',
    action: { label: 'Contact Me', href: '/contact' },
  },
  {
    keywords: ['wordpress', 'wp', 'woocommerce', 'plugin'],
    answer:
      '14+ years WordPress experience — custom themes, plugins, WooCommerce, Elementor, headless WP + React. Happy to help!',
    action: { label: 'Hire on Upwork', external: true },
  },
  {
    keywords: ['react', 'laravel', 'ai', 'chatbot', 'rag'],
    answer:
      'I build React apps, Laravel backends, RAG AI chatbots & FastAPI integrations. Let\'s discuss your project!',
    action: { label: 'Send Message', href: '/contact' },
  },
  {
    keywords: ['seo', 'google', 'ranking', 'vitals', 'schema'],
    answer:
      'SEO, schema markup, Knowledge Panel, Google Image SEO & Core Web Vitals — I handle technical SEO so you rank better.',
    action: { label: 'SEO Help', href: '/contact' },
  },
  {
    keywords: ['app', 'mobile', 'ios', 'android', 'flutter', 'react native'],
    answer:
      'I develop iOS & Android apps using React Native, Flutter and native stacks. App Store & Play Store publishing included. Cross-platform MVPs from Delhi — clients worldwide.',
    action: { label: 'App Development Quote', href: '/services' },
  },
  {
    answer:
      'I integrate Razorpay, HDFC, direct bank & credit card payment gateways for Indian & international stores.',
    action: { label: 'Discuss Project', href: '/contact' },
  },
]

export const defaultWelcome =
  "Hi! I'm Yogesh's assistant 👋 Ask about services, pricing, or hiring — or chat on WhatsApp for a quick reply!"

export const quickReplies = [
  'What services do you offer?',
  'Pricing & hire me',
  'WordPress help',
  'AI chatbot',
]

export function findBotReply(text) {
  const lower = text.toLowerCase()
  const match = chatbotFaqs.find((faq) =>
    faq.keywords.some((kw) => lower.includes(kw)),
  )
  if (match) return match
  return {
    answer:
      "Thanks for your message! For detailed queries, WhatsApp me or fill the contact form — I reply within 24 hours.",
    action: { label: 'Contact Form', href: '/contact' },
  }
}
