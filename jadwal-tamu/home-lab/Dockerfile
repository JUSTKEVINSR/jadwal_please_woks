# Stage 1: Build Assets
FROM node:20 AS node_builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
# Note: You might need to pass VITE_ env vars here if they are dynamic.
# For now, we assume standard build or that they are provided via ARG.
RUN npm run build

# Stage 2: PHP Application
FROM php:8.2-fpm

# Install system dependencies
RUN apt-get update && apt-get install -y \
    git \
    curl \
    libpng-dev \
    libonig-dev \
    libxml2-dev \
    zip \
    unzip \
    nginx \
    supervisor \
    libzip-dev \
    && docker-php-ext-install pdo_mysql mbstring exif pcntl bcmath gd zip

# Clear cache
RUN apt-get clean && rm -rf /var/lib/apt/lists/*

# Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Set working directory
WORKDIR /var/www/html

# Copy application code
COPY . .

# Copy built assets from node_builder
COPY --from=node_builder /app/public/build public/build
# Copy manifest
COPY --from=node_builder /app/public/build/manifest.json public/build/manifest.json

# Copy config files
COPY home-lab/nginx.conf /etc/nginx/sites-available/default
COPY home-lab/supervisord.conf /etc/supervisor/conf.d/supervisord.conf

# Permissions
RUN chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache

# Expose ports
EXPOSE 80 8080

# Start Supervisor
CMD ["/usr/bin/supervisord"]
