# MMI Content Sync

Fetches trending news from **My Mobile India** (English) via WordPress REST API and renders a **91mobiles-style** hero section.

## Fixes

- **Missing arrows** — circular prev/next buttons at bottom-right (desktop) and below carousel (mobile)
- **Right sidebar alignment** — thumbnail left, time + headline right, bordered rows like 91mobiles
- **Mobile carousel** — Swiper single-slide carousel instead of 3 stacked vertical news

## Installation

1. Copy `mmi-content-sync` to `wp-content/plugins/`
2. Activate **MMI Content Sync**
3. Add shortcode to homepage (TagDiv / page builder):

```
[mmi_trending_hero]
```

Optional: fetch more posts (must be multiple of 4):

```
[mmi_trending_hero count="12"]
```

## API source

Default source: `https://www.mymobileindia.com`

Override in theme `functions.php`:

```php
add_filter( 'mmi_content_sync_source_url', function () {
    return 'https://www.mymobileindia.com';
});
```

## Shortcode output

- **Desktop (768px+)**: 1 large hero + 3 side news, synced slide groups, navigation arrows
- **Mobile**: horizontal swipe carousel with one story per slide

## Author

Yogesh
