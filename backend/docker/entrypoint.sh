#!/usr/bin/env sh
set -eu

PORT="${PORT:-8080}"

# Bind Apache to Render's dynamic PORT
sed -i "s/Listen 80/Listen ${PORT}/g" /etc/apache2/ports.conf
sed -i "s/<VirtualHost \*:80>/<VirtualHost *:${PORT}>/g" /etc/apache2/sites-available/000-default.conf

# Ensure writable directories exist with proper ownership
mkdir -p storage/framework/cache/data \
    storage/framework/sessions \
    storage/framework/views \
    storage/logs \
    bootstrap/cache
chown -R www-data:www-data storage bootstrap/cache
chmod -R 775 storage bootstrap/cache

# Clear file-based caches first (safe before database tables exist)
php artisan config:clear
php artisan route:clear
php artisan view:clear

# Run migrations and seeders before caching or flushing DB-backed caches
if [ "${RUN_MIGRATIONS:-false}" = "true" ]; then
    echo "Running database migrations..."
    php artisan migrate --force
fi

if [ "${RUN_SEEDERS:-false}" = "true" ]; then
    echo "Running database seeders..."
    php artisan db:seed --force
fi

# Rebuild production caches from runtime environment variables
php artisan config:cache
php artisan route:cache
php artisan view:cache

exec apache2-foreground
