import {
  navLinks,
  footerServices,
  footerHireLocations,
  seoLocationLinks,
  inquiryTypes,
  UPWORK_URL,
} from '../data/siteData'

export const defaultSiteSettings = {
  siteName: 'Yogesh Gupta',
  siteTagline: 'Freelance Web Developer',
  ctaText: 'Hire Me',
  footerBio:
    'I am Yogesh Gupta, a freelance web developer with 14+ years of experience building websites, WordPress solutions, Laravel apps and modern React applications.',
  footerCopyright: 'Yogesh Gupta. All Rights Reserved.',
  phone: '+91 98765 43210',
  phoneUs: '+1 (555) 000-0000',
  phoneUk: '+44 20 0000 0000',
  phoneAu: '+61 2 0000 0000',
  email: 'hello@yogeshwebdeveloper.com',
  location: 'Delhi, India',
  whatsappUrl: 'https://wa.me/919876543210',
  whatsappMessage: 'Hi Yogesh, I found your website and would like to discuss a project.',
  chatWelcome: "Hi! I'm Yogesh's assistant 👋 Ask about services, pricing, or hiring — or chat on WhatsApp!",
  upworkUrl: UPWORK_URL,
  linkedinUrl: '#',
  twitterUrl: '#',
  instagramUrl: '#',
  availabilityBullets: ['Quick Response', 'Free Consultation', 'Flexible Hiring'],
  contactHeading: 'Get In Touch',
  contactIntro:
    "I'm available for freelance projects worldwide. Fill out the form or reach out directly — I typically respond within 24 hours.",
  contactFormTitle: 'Send Me a Message',
  contactSuccessMessage:
    "Thank you! Your message has been sent. I'll get back to you within 24 hours.",
  contactAvailabilityBullets: ['Free Consultation', 'Quick Response', 'Flexible Hiring Models'],
  seoLocationsHeading: 'Best Freelance Developer Near You',
  privacyUrl: '#',
  termsUrl: '#',
}

export const defaultNavLinks = navLinks

export const defaultFooterData = {
  services: footerServices.map((label) => ({ label, href: '/services', linkType: 'service' })),
  hire: footerHireLocations.map((label) => ({ label, href: '/contact', linkType: 'hire' })),
  useful: [
    { label: 'About Me', href: '/about' },
    { label: 'My Work', href: '/work' },
    { label: 'Blog', href: '/blog' },
    { label: 'Contact', href: '/contact' },
    { label: 'Privacy Policy', href: '#' },
    { label: 'Terms & Conditions', href: '#' },
  ],
  seo: seoLocationLinks.map((label) => ({ label, href: '/contact', linkType: 'seo' })),
}

export const defaultInquiryTypes = inquiryTypes

export const defaultPageBanners = {
  '/': { title: 'Home', subtitle: '', breadcrumb: 'Home' },
  '/about': {
    title: 'About Me',
    subtitle: '14+ years of experience building websites that help businesses grow online.',
    breadcrumb: 'About Me',
  },
  '/services': {
    title: 'Services I Offer',
    subtitle: 'Comprehensive web development solutions tailored to your business needs.',
    breadcrumb: 'Services',
  },
  '/work': {
    title: 'My Work',
    subtitle: 'A showcase of 250+ projects delivered for clients across the globe.',
    breadcrumb: 'Work',
  },
  '/testimonials': {
    title: 'Client Testimonials',
    subtitle: 'What my clients say about working with me — 150+ happy clients worldwide.',
    breadcrumb: 'Testimonials',
  },
  '/blog': {
    title: 'Blog',
    subtitle: 'Tips, tutorials and insights on web development, WordPress, React and more.',
    breadcrumb: 'Blog',
  },
  '/contact': {
    title: 'Contact Me',
    subtitle: "Have a project in mind? Let's discuss how I can help your business grow.",
    breadcrumb: 'Contact',
  },
}
