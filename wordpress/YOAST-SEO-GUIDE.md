# Yoast SEO + Headless React Setup

React frontend (`yogeshwebdeveloper.com`) + WordPress backend (`admin.yogeshwebdeveloper.com`) + **Yoast SEO**.

## Step 1: Install Yoast on WordPress

1. WP Admin → **Plugins → Add New**
2. Search **Yoast SEO** → Install → Activate
3. Run Yoast setup wizard (site name, organization/person schema)

## Step 2: Update Yogesh Headless Plugin (v1.2.0+)

Upload latest `yogesh-headless.zip` and activate.

New in v1.2.0:
- **Page SEO** CPT — one entry per React route
- Yoast REST API enabled for all custom post types

## Step 3: Enable Yoast for Custom Post Types

1. WP Admin → **Yoast SEO → Settings → Content types**
2. Turn **ON** SEO for:
   - Blog Posts
   - Page SEO
   - Hero Section (optional)
   - Projects, Services, etc. (as needed)

## Step 4: Add SEO for Each React Page

WP Admin → **Page SEO → Add New**

Create one entry per route:

| Admin Title (internal) | Route Path | Yoast SEO Title Example |
|------------------------|------------|-------------------------|
| Home SEO | `/` | Yogesh Gupta \| Best Freelance Web Developer Near Delhi |
| About SEO | `/about` | About Yogesh Gupta \| Freelance Web Developer |
| Services SEO | `/services` | Web Development Services \| Yogesh Gupta |
| Work SEO | `/work` | Portfolio \| Yogesh Gupta |
| Testimonials SEO | `/testimonials` | Client Testimonials \| Yogesh Gupta |
| Blog SEO | `/blog` | Web Development Blog \| Yogesh Gupta |
| Contact SEO | `/contact` | Contact \| Hire Yogesh Gupta |

For each entry:
1. Set **Route Path** in the meta box (exact match, e.g. `/about`)
2. Scroll to **Yoast SEO** panel:
   - **SEO title** — 50–60 characters
   - **Meta description** — 150–160 characters
   - **Focus keyphrase** — e.g. "freelance web developer delhi"
3. **Social** tab → upload OG image (1200×630 px)
4. **Advanced** → Canonical URL = `https://yogeshwebdeveloper.com/about` (your live frontend URL, NOT admin subdomain)

> **Important:** Canonical and OG URL must point to **yogeshwebdeveloper.com**, not admin.yogeshwebdeveloper.com.

## Step 5: Blog Post SEO

For each **Blog Post** in WordPress:
- Use Yoast panel as normal
- Set canonical to frontend if you add single blog pages later
- Currently blog cards link to WordPress post URL

## Step 6: React `.env` Config

```bash
cd yogesh-website
cp .env.example .env
```

```env
VITE_WP_API_URL=https://admin.yogeshwebdeveloper.com
VITE_SITE_URL=https://yogeshwebdeveloper.com
```

```bash
npm install
npm run dev
```

Open `http://localhost:5173` → View Page Source or DevTools → `<head>`:
- `<title>` from Yoast (if Page SEO entry exists) or static fallback
- `meta description`, `og:*`, `twitter:*`, JSON-LD schema

## Step 7: Verify API

Test Yoast data in browser:

```
https://admin.yogeshwebdeveloper.com/wp-json/wp/v2/site-seo
```

Each item should include `route_path` and `yoast_head_json` (after Yoast is active).

## Sitemap Strategy (Headless)

| What | Where |
|------|-------|
| Yoast XML sitemap | `admin.yogeshwebdeveloper.com/sitemap_index.xml` |
| Public robots.txt | React `public/robots.txt` |

**Option A (simple):** Point `sitemap.xml` on frontend to Yoast sitemap via redirect in hosting (Vercel/Cloudflare).

**Option B (recommended later):** Use prerender/SSR (Vite SSR or Vercel prerender) so Google sees full HTML without JavaScript.

## Hero Content — WordPress se Frontend par kaise dekhein

1. WP Admin → **Hero Section** → Add/Edit (sirf **1 entry**)
2. Fill Hero Content meta box + set **Featured Image**
3. **Publish** karo
4. React `.env` mein `VITE_WP_API_URL` set karo
5. `npm run dev` → `http://localhost:5173`
6. Homepage hero par **"Live from WordPress"** badge dikhega

API test:
```
https://admin.yogeshwebdeveloper.com/wp-json/wp/v2/hero
```

## Checklist (SEO Proof)

- [ ] Yoast SEO installed & activated
- [ ] Plugin v1.2.0+ active
- [ ] Page SEO entries for all 7 routes
- [ ] Canonical URLs = frontend domain
- [ ] OG images uploaded (1200×630)
- [ ] Focus keyphrases set per page
- [ ] Permalinks = Post name
- [ ] `VITE_SITE_URL` set in React `.env`
- [ ] Google Search Console verified on frontend domain
- [ ] Submit sitemap in Search Console
