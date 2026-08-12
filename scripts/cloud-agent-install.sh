#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
WP_ROOT="/var/www/wordpress"
WP_CLI_BIN="${WP_CLI_BIN:-/usr/local/bin/wp}"

export DEBIAN_FRONTEND=noninteractive

if ! command -v wp >/dev/null 2>&1; then
	sudo apt-get update -qq
	sudo apt-get install -y -qq \
		mariadb-server \
		php-cli \
		php-mysql \
		php-xml \
		php-curl \
		php-gd \
		php-mbstring \
		php-zip \
		php-intl \
		apache2 \
		libapache2-mod-php \
		curl \
		unzip

	curl -fsSL https://raw.githubusercontent.com/wp-cli/builds/gh-pages/phar/wp-cli.phar -o /tmp/wp-cli.phar
	sudo install -m 0755 /tmp/wp-cli.phar "$WP_CLI_BIN"
fi

sudo mkdir -p /run/lock/apache2
sudo chmod 1777 /run/lock 2>/dev/null || true

sudo service mariadb start 2>/dev/null || sudo service mysql start 2>/dev/null || true
sudo mariadb -e "CREATE DATABASE IF NOT EXISTS wordpress CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
sudo mariadb -e "CREATE USER IF NOT EXISTS 'wordpress'@'localhost' IDENTIFIED BY 'wordpress';"
sudo mariadb -e "GRANT ALL PRIVILEGES ON wordpress.* TO 'wordpress'@'localhost'; FLUSH PRIVILEGES;"

if [ ! -f "$WP_ROOT/wp-config.php" ]; then
	sudo mkdir -p "$WP_ROOT"
	sudo chown -R "$USER:$USER" "$WP_ROOT"
	wp core download --path="$WP_ROOT" --quiet
	wp config create \
		--path="$WP_ROOT" \
		--dbname=wordpress \
		--dbuser=wordpress \
		--dbpass=wordpress \
		--dbhost=127.0.0.1 \
		--skip-check
fi

sudo mkdir -p "$WP_ROOT/wp-content/plugins"
if [ ! -e "$WP_ROOT/wp-content/plugins/mobile-compare" ]; then
	sudo ln -sfn "$ROOT/mobile-compare" "$WP_ROOT/wp-content/plugins/mobile-compare"
fi

if [ ! -d "$WP_ROOT/wp-content/plugins/woocommerce" ]; then
	wp plugin install woocommerce --path="$WP_ROOT" --quiet
fi

if [ ! -f "$WP_ROOT/.htaccess" ]; then
	sudo tee "$WP_ROOT/.htaccess" >/dev/null <<'EOF'
# BEGIN WordPress
<IfModule mod_rewrite.c>
RewriteEngine On
RewriteRule .* - [E=HTTP_AUTHORIZATION:%{HTTP:Authorization}]
RewriteBase /
RewriteRule ^index\.php$ - [L]
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.php [L]
</IfModule>
# END WordPress
EOF
fi

bash "$ROOT/scripts/seed-wordpress.sh"
