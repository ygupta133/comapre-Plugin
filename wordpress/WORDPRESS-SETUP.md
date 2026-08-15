# WordPress Backend Setup Guide

Phase 1: Connect React frontend to WordPress headless CMS.

## Step 1: WordPress Install

1. Create subdomain: **admin.yogeshwebdeveloper.com**
2. Install WordPress (Hostinger one-click or manual)
3. Login to WP Admin

## Step 2: Install Plugin

1. Zip the `wordpress/yogesh-headless/` folder
2. WP Admin → Plugins → Add New → Upload Plugin
3. Activate **Yogesh Headless CMS**

This plugin adds:
- **Projects** custom post type (`/wp-json/wp/v2/projects`)
- **Testimonials** custom post type (`/wp-json/wp/v2/testimonials`)
- **CORS** for React frontend
- **REST API fields** (tech stack, ratings, images, etc.)

## Step 3: Add Content

### Hero Section (Homepage)
WP Admin → **Hero Section** → Add New (only ONE entry)
- Fill all Hero Content fields (badge, headline, subtitle, CTAs, counts)
- Set **Featured Image** for your photo
- Publish

Also add **Why Choose Me** and **Hero Trust Items** entries for the right-side boxes.

### Page SEO (Yoast — see YOAST-SEO-GUIDE.md)
WP Admin → **Page SEO** → one entry per React route (`/`, `/about`, etc.)

### Blog Posts
WP Admin → Posts → Add New (normal WordPress posts)

### Projects
WP Admin → Projects → Add New
- Title: Project name
- Content/Excerpt: Description
- Featured Image: Screenshot
- Project Category: WordPress / React / Laravel
- Meta box: Tech Stack = `React, Tailwind, REST API`
- Meta box: Project URL = live site link

### Testimonials
WP Admin → Testimonials → Add New
- Title: Client name
- Content: Review text
- Meta: Client Role, Country, Rating (1-5)
- Meta: Client Photo URL (optional)

## Step 4: Permalinks

WP Admin → Settings → Permalinks → **Post name** → Save

## Step 5: Connect React

In `yogesh-website/` folder:

```bash
cp .env.example .env
```

Edit `.env`:
```
VITE_WP_API_URL=https://admin.yogeshwebdeveloper.com
VITE_SITE_URL=https://yogeshwebdeveloper.com
```

```bash
npm run dev
```

Open `http://localhost:5173`:
- **Homepage Hero** — if WordPress hero is published, you'll see **"Live from WordPress"** badge
- **Blog, Work, Testimonials** — same badge when WP content loads
- **SEO** — Yoast data from Page SEO entries appears in `<head>` (see YOAST-SEO-GUIDE.md)

Without `.env` or if WP is down → static fallback data shows automatically.

## Step 6: Test API

Open in browser:
```
https://admin.yogeshwebdeveloper.com/wp-json/wp/v2/posts
https://admin.yogeshwebdeveloper.com/wp-json/wp/v2/projects
https://admin.yogeshwebdeveloper.com/wp-json/wp/v2/testimonials
```

Should return JSON data.

## Phase 2: WooCommerce (Next)

1. Install WooCommerce plugin
2. Add plugins as **Digital Products**
3. Install Razorpay gateway
4. WooCommerce → Settings → Advanced → REST API → Create keys
5. Add to React `.env`:
   ```
   VITE_WC_CONSUMER_KEY=ck_xxxxx
   VITE_WC_CONSUMER_SECRET=cs_xxxxx
   ```

## Phase 3: User Login (Next)

1. Install JWT Authentication for WP REST API
2. React login/register pages
3. Phone OTP via Digits plugin (optional)

## CORS Allowed Origins

Default allowed:
- `http://localhost:5173`
- `https://yogeshwebdeveloper.com`
- `https://www.yogeshwebdeveloper.com`

Add more in `functions.php` or via filter `yg_headless_allowed_origins`.
