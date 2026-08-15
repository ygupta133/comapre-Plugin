# Final Delivery — yogeshwebdeveloper.com

**Branch:** `cursor/yogesh-portfolio-homepage-1c67`  
**PR:** https://github.com/ygupta133/comapre-Plugin/pull/14

---

## Download (2 files)

| File | Use |
|------|-----|
| `wordpress/yogesh-headless.zip` | WordPress plugin v1.3.2 → `admin.yogeshwebdeveloper.com` |
| `yogesh-website-final.zip` | React source code (build on PC) |
| `yogesh-website-dist.zip` | **Ready upload** — built `dist/` for `public_html` |

GitHub direct links (same branch):
- https://github.com/ygupta133/comapre-Plugin/raw/cursor/yogesh-portfolio-homepage-1c67/wordpress/yogesh-headless.zip
- https://github.com/ygupta133/comapre-Plugin/raw/cursor/yogesh-portfolio-homepage-1c67/yogesh-website-final.zip
- https://github.com/ygupta133/comapre-Plugin/raw/cursor/yogesh-portfolio-homepage-1c67/yogesh-website-dist.zip

---

## Live URLs

| Role | URL |
|------|-----|
| Public website (React) | https://yogeshwebdeveloper.com |
| WordPress CMS | https://admin.yogeshwebdeveloper.com |

---

## Hostinger upload — step by step

### A) WordPress backend (`admin` subdomain)

1. hPanel → **Subdomains** → create `admin.yogeshwebdeveloper.com`
2. **Auto Installer** → WordPress on that subdomain
3. **SSL** on for admin subdomain
4. **Plugins → Upload** → `yogesh-headless.zip` → **Activate**
5. **Settings → Permalinks** → **Post name** → Save
6. **Tools → YG Import Defaults**
7. **Site Settings** → fill:

```
React Frontend URL:  https://yogeshwebdeveloper.com
Redirect to React:   1
Phone (India):       +91 83779 56442
WhatsApp URL:        https://wa.me/918377956442
Email:               hello@yogeshwebdeveloper.com
Phone (US):          (Zadarma +1 number — add when ready)
Phone (UK):          (optional)
Phone (AU):          (optional)
```

8. Install **Yoast SEO** plugin (optional but recommended)
9. Test API in browser:
   ```
   https://admin.yogeshwebdeveloper.com/wp-json/wp/v2/hero
   ```
   JSON aana chahiye.

---

### B) React frontend (main domain)

**Option 1 — Use pre-built ZIP (easiest)**

1. Download `yogesh-website-dist.zip`
2. hPanel → **File Manager** → `public_html`
3. Delete old default files (backup first): `index.php`, `default.html`
4. Upload ZIP → **Extract** in `public_html`
5. Confirm these files exist in `public_html`:
   - `index.html`
   - `assets/` folder
   - `robots.txt`
   - `.htaccess`
   - `favicon.svg`

**Option 2 — Build on your PC**

```env
# yogesh-website/.env
VITE_WP_API_URL=https://admin.yogeshwebdeveloper.com
VITE_SITE_URL=https://yogeshwebdeveloper.com
```

```bash
cd yogesh-website
npm install
npm run build
```

Upload everything inside `dist/` to `public_html`.

6. **SSL** on for `yogeshwebdeveloper.com` + `www`
7. Open https://yogeshwebdeveloper.com — site live!

---

## What's included (complete)

- Home, About, Services, Work, Testimonials, Blog, Contact
- 20+ services + iOS/Android app development section
- WordPress headless — edit content without touching code
- Regional phone: 🇮🇳 🇺🇸 🇨🇦 🇬🇧 🇪🇺 🇦🇺 auto-detect on load
- WhatsApp + FAQ chatbot
- Contact form → email
- Yoast SEO + JSON-LD schema
- Delhi NCR location SEO links
- Global clients section (USA, UK, Canada, Europe, Australia)

---

## After launch (you do once)

- [ ] Google Search Console — verify site + submit sitemap
- [ ] Google Business Profile (Delhi)
- [ ] Yoast — Page SEO entries for each route
- [ ] Replace placeholder photo (Hero + About in WP)
- [ ] Add real projects in Work
- [ ] Privacy Policy & Terms (real pages)
- [ ] US virtual number from Zadarma → Site Settings → Phone (US)

---

## Updates later (correct approach)

| Change type | What to do |
|-------------|------------|
| Text, services, projects, testimonials | Only WordPress admin — no code upload |
| Design / new features | Edit code → `npm run build` → upload new `dist/` |
| Plugin update | Upload new `yogesh-headless.zip` |

**Haan — pehle deploy karo, baad mein improvements karte raho. Yeh bilkul sahi approach hai.**

---

## Guides in repo

| File | Topic |
|------|-------|
| `HOSTINGER-DEPLOY.md` | Detailed Hostinger steps |
| `DEPLOY-CHECKLIST.md` | Pre-launch checklist + legal + virtual numbers |
| `FINAL-SETUP.md` | Local XAMPP setup |
| `wordpress/WORDPRESS-SETUP.md` | WP + plugin details |
| `wordpress/YOAST-SEO-GUIDE.md` | Yoast setup |

---

## Support / next improvements (optional)

- Blog posts for SEO
- US/UK virtual numbers (Zadarma)
- Prerender for faster Google indexing
- WooCommerce shop
- AI chatbot upgrade
