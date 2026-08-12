#!/usr/bin/env bash
# Provision WordPress, WooCommerce, and demo products for Mobile Compare.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
WP_ROOT="${WP_ROOT:-/var/www/wordpress}"

if ! command -v wp >/dev/null 2>&1; then
	echo "wp-cli is required" >&2
	exit 1
fi

cd "$WP_ROOT"

wp core is-installed --quiet 2>/dev/null || wp core install \
	--url="http://127.0.0.1:8888" \
	--title="Mobile Compare Dev" \
	--admin_user="admin" \
	--admin_password="password" \
	--admin_email="admin@example.org" \
	--skip-email

if ! wp plugin is-installed woocommerce --quiet 2>/dev/null; then
	wp plugin install woocommerce --activate
else
	wp plugin activate woocommerce --quiet 2>/dev/null || wp plugin activate woocommerce
fi

wp plugin activate mobile-compare --quiet 2>/dev/null || true

wp option update woocommerce_onboarding_opt_in 'no' --quiet 2>/dev/null || true
wp option update woocommerce_store_address '123 Demo Street' --quiet 2>/dev/null || true
wp option update woocommerce_store_city 'Demo City' --quiet 2>/dev/null || true
wp option update woocommerce_default_country 'US:CA' --quiet 2>/dev/null || true
wp option update woocommerce_store_postcode '90001' --quiet 2>/dev/null || true
wp wc tool run install_pages --user=1 --quiet 2>/dev/null || true

wp eval-file "$ROOT/mobile-compare/scripts/seed-data.php"
