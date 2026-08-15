# Hostinger Deploy Guide — React + WordPress Headless

## Architecture

| URL | Kya hai | Folder |
|-----|---------|--------|
| `https://yogeshwebdeveloper.com` | React website (public) | `public_html/` |
| `https://admin.yogeshwebdeveloper.com` | WordPress CMS | subdomain folder |

---

## PART 1 — WordPress (Backend)

### Step 1: Subdomain banao
1. Hostinger **hPanel** login
2. **Domains** → **Subdomains**
3. Subdomain: `admin` → Domain: `yogeshwebdeveloper.com`
4. Folder: `public_html/admin` (default OK)

### Step 2: WordPress install
1. hPanel → **Website** → **Auto Installer** (ya WordPress)
2. Domain select: `admin.yogeshwebdeveloper.com`
3. Admin user, password, email set karo → Install

### Step 3: SSL
1. hPanel → **SSL**
2. `admin.yogeshwebdeveloper.com` par **Free SSL** activate

### Step 4: Plugin install
1. Download: `wordpress/yogesh-headless.zip`
2. WP Admin → **Plugins → Add New → Upload**
3. Activate **Yogesh Headless CMS v1.3.2**

### Step 5: Permalinks
WP Admin → **Settings → Permalinks** → **Post name** → Save

### Step 6: Default content
WP Admin → **Tools → YG Import Defaults** → click

### Step 7: Site Settings
WP Admin → **Site Settings** → Edit:
```
React Frontend URL: https://yogeshwebdeveloper.com
Redirect to React: 1
Phone, email, social links — apna daalo
```

### Step 8: Yoast SEO (optional)
Plugins → Install **Yoast SEO** → Page SEO entries par meta set karo

### Step 9: API test
Browser mein kholo:
```
https://admin.yogeshwebdeveloper.com/wp-json/wp/v2/hero
```
JSON aana chahiye.

---

## PART 2 — React (Frontend)

### Step 1: Apne PC par build banao

`yogesh-website` folder mein `.env` file:
```env
VITE_WP_API_URL=https://admin.yogeshwebdeveloper.com
VITE_SITE_URL=https://yogeshwebdeveloper.com
```

Terminal:
```bash
cd yogesh-website
npm install
npm run build
```

`dist` folder ban jayega — ye upload karna hai.

### Step 2: Hostinger File Manager
1. hPanel → **Files** → **File Manager**
2. `public_html` kholo (main domain `yogeshwebdeveloper.com`)
3. Purani default files delete karo (`index.php`, `default.html` etc.) — **backup le lo pehle**
4. `dist` folder ke **andar ki saari files** upload karo:
   - `index.html`
   - `assets/` folder
   - `favicon.svg`
   - `robots.txt`
   - `.htaccess` (React routes ke liye — important!)

### Step 3: SSL main domain
hPanel → SSL → `yogeshwebdeveloper.com` + `www` par SSL on

### Step 4: Test
- `https://yogeshwebdeveloper.com` → React site
- `/about`, `/contact` → pages khulni chahiye (404 nahi)
- Hero par "Live from WordPress" badge

---

## PART 3 — View Site fix

WP Admin → **View Site** click → `yogeshwebdeveloper.com` khulega (plugin v1.3.2)

Agar nahi khulta → Site Settings mein Frontend URL check karo.

---

## Common problems

| Problem | Fix |
|---------|-----|
| Blank page / white screen | `.htaccess` upload kiya? `assets` folder sahi jagah? |
| `/about` = 404 | `.htaccess` missing in `public_html` |
| WP content nahi dikhta | `.env` build se pehle set tha? Dubara `npm run build` |
| CORS error | Plugin active? HTTPS dono par? |
| Mixed content | Dono URLs `https://` hon |

---

## Update kaise karein (baad mein)

**Content change:** Sirf WP Admin — code upload ki zaroorat nahi

**Design/code change:**
1. Code edit → `npm run build`
2. Naya `dist` → Hostinger `public_html` mein replace

---

## FTP (alternative upload)

hPanel → **FTP Accounts** → credentials
- FileZilla se connect
- `public_html` = React
- Subdomain folder = WordPress
