#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
WP_ROOT="/var/www/wordpress"
APACHE_SITE="/etc/apache2/sites-available/mobile-compare.conf"

sudo service mariadb start 2>/dev/null || sudo service mysql start 2>/dev/null || true

if [ ! -f "$APACHE_SITE" ]; then
	sudo tee "$APACHE_SITE" >/dev/null <<EOF
<VirtualHost *:8888>
	ServerName localhost
	DocumentRoot $WP_ROOT
	<Directory $WP_ROOT>
		AllowOverride All
		Require all granted
	</Directory>
</VirtualHost>
EOF
	sudo a2ensite mobile-compare.conf
	sudo a2dissite 000-default.conf 2>/dev/null || true
fi

if ! grep -Eq '^[[:space:]]*Listen[[:space:]]+8888' /etc/apache2/ports.conf 2>/dev/null; then
	echo 'Listen 8888' | sudo tee -a /etc/apache2/ports.conf >/dev/null
fi

sudo a2enmod rewrite php8.3 2>/dev/null || sudo a2enmod rewrite php8.2 2>/dev/null || sudo a2enmod rewrite
sudo apache2ctl configtest

# Avoid stale apache2 PIDs when systemd is unavailable in the VM.
sudo pkill apache2 2>/dev/null || true
sleep 1
sudo apache2ctl start

# Ensure pretty permalinks and REST routes work.
wp rewrite structure '/%postname%/' --path="$WP_ROOT" --quiet 2>/dev/null || true
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
wp rewrite flush --path="$WP_ROOT" --quiet 2>/dev/null || true

# Ensure plugin symlink and seed data exist after fresh boots from build snapshots.
if [ ! -e "$WP_ROOT/wp-content/plugins/mobile-compare" ]; then
	sudo ln -sfn "$ROOT/mobile-compare" "$WP_ROOT/wp-content/plugins/mobile-compare"
fi

bash "$ROOT/scripts/seed-wordpress.sh"

for _ in $(seq 1 30); do
	if curl -fsS "http://127.0.0.1:8888/wp-json/mobile-compare/v1/config" >/dev/null 2>&1; then
		echo "Mobile Compare REST API is ready at http://127.0.0.1:8888"
		exit 0
	fi
	sleep 2
done

echo "WordPress did not become ready within the timeout." >&2
exit 1
