# Final Delivery — Yogesh Portfolio (React + WordPress Headless)

## Download ZIPs (GitHub branch)

| File | What |
|------|------|
| [yogesh-headless.zip](https://github.com/ygupta133/comapre-Plugin/raw/cursor/yogesh-portfolio-homepage-1c67/wordpress/yogesh-headless.zip) | WordPress plugin v1.3.1 |
| [yogesh-website-final.zip](https://github.com/ygupta133/comapre-Plugin/raw/cursor/yogesh-portfolio-homepage-1c67/yogesh-website-final.zip) | React frontend (no node_modules) |

Or clone branch: `cursor/yogesh-portfolio-homepage-1c67`

---

## Quick Setup (Local XAMPP)

### 1. WordPress
- Install WordPress at `http://localhost/yogesh-website`
- Upload **yogesh-headless.zip** → Plugins → Activate
- **Tools → YG Import Defaults** (fills all default content)
- **Site Settings** → set **React Frontend URL** = `http://localhost:5173`

### 2. React
```bash
cd yogesh-website
cp .env.example .env
```
Edit `.env`:
```env
VITE_WP_API_URL=http://localhost/yogesh-website
VITE_SITE_URL=http://localhost:5173
```
```bash
npm install
npm run dev
```
Open: **http://localhost:5173**

---

## View Site → React (Headless)

Plugin v1.3.1+ does this automatically:

| Action | Result |
|--------|--------|
| WP Admin → **View Site** (top bar) | Opens React URL |
| Visit `localhost/yogesh-website` in browser | Redirects to React |
| REST API `/wp-json/...` | Still works (no redirect) |
| `wp-admin`, `wp-login` | Still works |

**Configure:** WP Admin → **Site Settings** → Edit the one entry:
- **React Frontend URL** — local: `http://localhost:5173` | live: `https://yogeshwebdeveloper.com`
- **Redirect to React** — `1` = yes, `0` = no

---

## Default Content — Manual work needed?

**No** — plugin imports everything on activate / Import Defaults:
- Hero, Services (18), Footer, Nav, Contact, About, Stats, Banners, SEO entries, etc.

**You only replace** when ready:
- Your photo (Featured Image on Hero + About)
- Real phone/email (Site Settings)
- Real projects/testimonials
- Yoast SEO titles (optional)

---

## Live Production

| Role | URL |
|------|-----|
| WordPress (CMS) | `https://admin.yogeshwebdeveloper.com` |
| React (public site) | `https://yogeshwebdeveloper.com` |

Site Settings → Frontend URL = `https://yogeshwebdeveloper.com`

Deploy React build (`npm run build`) to Vercel/Netlify/Hostinger.

---

## Folder Structure (recommended)

```
C:\xampp\htdocs\yogesh-wp\     ← WordPress only
C:\Projects\yogesh-website\    ← React only (from yogesh-website-final.zip)
```

Don't mix WP + React in one folder (causes confusion).
