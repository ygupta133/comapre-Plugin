# WordPress CPT Guide — Yogesh Website

Plugin version **1.1.0** — sab website content ke liye CPTs.

## WP Admin Menu (Plugin activate ke baad)

| Menu | Website Section | Kya add karo |
|------|-----------------|--------------|
| **Blog Posts** | Blog page | Articles, tutorials |
| **Services** | Home + Services page | Title, description, icon, features |
| **Projects** | Work page | Portfolio with tech stack |
| **Testimonials** | Testimonials page | Client reviews |
| **Skills** | About page | Skill name + percentage |
| **Experience** | About page | Job history |
| **Engagement Models** | Home + Services | Hourly, Part Time, Full Time |
| **Stats** | Home + About | 14+, 250+, etc. |
| **Cities** | Home cities section | Delhi, Noida, etc. |
| **Global Regions** | Global hire section | USA, Canada, etc. |
| **Why Choose Me** | Hero sidebar | Trust points |
| **Hero Trust Items** | Hero bottom badges | On-Time Delivery, etc. |
| **Hero Section** | Homepage hero | **Sirf 1 entry** — headline, photo |
| **About Page** | About page | Bio, photo |

## Field Examples

### Service
- Title: `WordPress Development`
- Content: Description
- Icon: `wordpress`
- Features: `Custom Themes, WooCommerce, Plugin Dev, SEO`

### Hero Section (only 1)
- Featured Image: Your photo
- Badge Text: `14+ Years of Experience`
- Headline: `Best Freelance Web Developer`
- Headline Highlight: `Near Delhi`
- Subtitle: Your tagline

### Skill
- Title: `WordPress`
- Percentage: `98`
- Sort Order: `1`

### Global Region
- Title: `United States`
- Flag Emoji: `🇺🇸`
- Points: `Smooth Communication, Quality Work, On-Time Delivery`

## Sort Order
Har item mein **Sort Order** number daalo — chhota number pehle dikhega.

## Plugin Update
1. Purana plugin deactivate karo
2. Delete karo
3. Naya `yogesh-headless.zip` upload karo
4. Activate karo
5. Settings → Permalinks → Save (flush rules)

## React Connect
`.env` file:
```
VITE_WP_API_URL=https://admin.yogeshwebdeveloper.com
```
