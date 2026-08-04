# Mobile Compare Plugin

Fast **91mobiles-style** product comparison for **WooCommerce** — built as a standalone plugin, independent of ReHub's slow compare module.

## Features (v1.0.0)

- **Page 1 — Selection**: Search up to 3 products, suggested mobiles, popular comparisons
- **Page 2 — Compare**: Product cards, full spec table from WooCommerce attributes
- **Toggles**: Show only differences, highlight better specs
- **Pretty URLs**: `/compare/slug-1/vs/slug-2/`
- **REST API**: Batched product fetch (one request for compare page)
- **Performance**: Assets load only on compare pages; cart fragments disabled there

## Installation

1. Copy the `mobile-compare` folder to `wp-content/plugins/`
2. Activate **Mobile Compare** in WordPress admin
3. Ensure **WooCommerce** is active
4. Visit **Settings → Mobile Compare** or go to `/compare/`
5. In ReHub: disable the theme's compare module in Theme Options

## Attribute mapping

Default attribute slugs (edit in `includes/class-compare-data.php` or extend admin):

| Slug | Label | Compare rule |
|------|-------|--------------|
| `pa_display` | Display | text |
| `pa_processor` | Processor | text |
| `pa_ram` | RAM | higher |
| `pa_storage` | Storage | higher |
| `pa_battery` | Battery | higher |
| `pa_weight` | Weight | lower |
| `pa_5g` | 5G | boolean |

Update slugs to match your WooCommerce product attributes.

## REST endpoints

- `GET /wp-json/mobile-compare/v1/search?q=galaxy`
- `GET /wp-json/mobile-compare/v1/products?ids=12,45,89`
- `GET /wp-json/mobile-compare/v1/products-by-slugs?path=phone-a/vs/phone-b`
- `GET /wp-json/mobile-compare/v1/popular`
- `GET /wp-json/mobile-compare/v1/suggested`

## Shortcode

```
[mobile_compare]
```

## Roadmap

- [ ] Admin UI to edit attribute map without code
- [ ] "Add to Compare" button on shop/product pages
- [ ] Vue build pipeline for richer UI
- [ ] Object cache / transient layer for 250+ catalog

## Author

Yogesh
