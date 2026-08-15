# Deploy Checklist — Ready to Go Live?

## ✅ Site features (done in code)

- [x] React frontend — all pages dynamic from WordPress
- [x] Hero typing animation, 20+ services, SEO section
- [x] iOS & Android app development (Services page)
- [x] Global clients — USA, UK, Canada, Europe, Australia, India
- [x] Contact form → WordPress email
- [x] WhatsApp + FAQ chatbot
- [x] Yoast SEO integration
- [x] Footer location SEO links (Delhi areas)
- [x] View Site → React redirect

## 📋 Before deploy (you do once)

### Hostinger
- [ ] Subdomain `admin.yogeshwebdeveloper.com` + WordPress
- [ ] Plugin v1.3.2 upload + activate
- [ ] Tools → YG Import Defaults
- [ ] Permalinks → Post name
- [ ] SSL both domains

### Virtual phone numbers (USA, UK, Canada, Australia)

Add numbers in **WordPress → Site Settings** after buying from a provider:

| Region | Dial code | Where to buy (cheap) |
|--------|-----------|----------------------|
| India | +91 | Your real number (already set) |
| USA / Canada | +1 | [Zadarma](https://zadarma.com), Twilio, OpenPhone |
| UK / Europe | +44 | Zadarma, Twilio |
| Australia | +61 | Zadarma, Twilio |

**Recommended start:** Buy one **US (+1)** number on Zadarma (~$2–5/month), forward calls to your India mobile. Paste it in Site Settings → **Phone (US)**.

Site auto-detects visitor country and shows the matching flag + number on load.
- [ ] Frontend URL = `https://yogeshwebdeveloper.com`
- [ ] US/UK/AU virtual numbers (optional)

### React build
```env
VITE_WP_API_URL=https://admin.yogeshwebdeveloper.com
VITE_SITE_URL=https://yogeshwebdeveloper.com
```
```bash
npm run build
```
Upload `dist/` → `public_html` + `.htaccess`

### SEO (after deploy)
- [ ] Yoast SEO plugin install
- [ ] Page SEO — all 7 routes + focus keywords
- [ ] Google Search Console verify
- [ ] Submit sitemap
- [ ] Google Business Profile (Delhi) — free, big for local SEO

### Content (replace placeholders)
- [ ] Your photo (Hero + About)
- [ ] Real projects in Work
- [ ] Privacy Policy & Terms pages (real URLs)

## 🔮 Optional later (not required for launch)

- Blog posts (helps SEO over time)
- Prerender/SSR for faster Google indexing
- Virtual US phone (Zadarma ~$2/mo)
- WooCommerce shop (Phase 2)
- AI RAG chatbot (paid API)

## ⚖️ Legal — is this OK?

| Topic | Status |
|-------|--------|
| Freelance from India for global clients | ✅ Legal (declare income, GST if applicable) |
| "Freelance developer in Saket/Delhi" SEO | ✅ OK if you **serve** those areas remotely |
| "Best developer" marketing claims | ✅ Common; avoid false guarantees |
| Footer city links | ✅ OK — "serving clients in X" not "office in X" |
| Upwork + direct clients | ✅ OK |
| GDPR / privacy policy | Add real Privacy Policy before EU clients |

**Tip:** Say **"Serving clients in Delhi NCR, USA, UK..."** not **"Office in every city"** — honest & SEO-safe.

## Google ranking — realistic expectations

| Timeline | What happens |
|----------|--------------|
| Week 1–2 | Site indexed (if Search Console done) |
| Month 1–3 | Long-tail keywords start ranking |
| Month 3–6 | "Freelance developer Delhi" type keywords improve |
| Ongoing | Blog posts + backlinks help most |

SEO is **marathon, not sprint**. Site is technically ready — ranking needs content + time + Search Console.
