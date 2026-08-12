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

---

# MMI Amazon Price Sync Plugin

Sync **WooCommerce** product prices from **Amazon India** via **RapidAPI** — one ASIN per product, live price on the storefront.

## Features (v1.0.0)

- **Amazon ASIN field** on WooCommerce product edit screen (Product Data → Amazon Price tab)
- **Fetch Price** button — pulls live price from RapidAPI for a single product
- **Product meta storage** — ASIN, Amazon price, original price, title, delivery, last updated (does not overwrite WooCommerce price fields)
- **Frontend display** — storefront automatically shows Amazon price (with strikethrough original when on sale)
- **Settings** — WooCommerce → Settings → Amazon Price Sync (RapidAPI key, host, endpoint, country)

## Installation

1. Copy the `mmi-amazon-price-sync` folder to `wp-content/plugins/` (or upload `mmi-amazon-price-sync-v1.0.0.zip`)
2. Activate **MMI Amazon Price Sync** in WordPress admin
3. Ensure **WooCommerce** is active
4. Go to **WooCommerce → Settings → Amazon Price Sync** and enter your RapidAPI key
5. Edit a product (e.g. Moto G77 Power 5G), open **Amazon Price** tab, enter ASIN `B0H8STM6G2`, click **Fetch Price from Amazon**

## RapidAPI setup

Default configuration targets the **Real-Time E-commerce Data** API:

| Setting | Default |
|---------|---------|
| Host | `real-time-e-commerce-data.p.rapidapi.com` |
| Endpoint | `/amazon/product-details` |
| Country | `IN` |

If you use a different RapidAPI provider, update host and endpoint in settings.

Optional: define the API key in `wp-config.php` instead of storing it in the database:

```php
define( 'MMI_APS_RAPIDAPI_KEY', 'your-rapidapi-key-here' );
```

## Test flow (Moto G77 Power 5G)

1. ASIN: `B0H8STM6G2`
2. Click **Fetch Price from Amazon**
3. Expected: Amazon Price **₹25,149**, Original **₹44,999**
4. Storefront should show **₹25,149** instead of the manual WooCommerce price

## Roadmap

- [ ] WP-Cron automatic sync for all products with ASIN
- [ ] Bulk sync for 250+ product catalog
- [ ] Admin sync log and error reporting

