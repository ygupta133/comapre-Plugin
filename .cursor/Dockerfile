FROM ubuntu:24.04

ENV DEBIAN_FRONTEND=noninteractive

RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        git \
        curl \
        ca-certificates \
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
        unzip \
        sudo \
    && rm -rf /var/lib/apt/lists/*

RUN curl -fsSL https://raw.githubusercontent.com/wp-cli/builds/gh-pages/phar/wp-cli.phar -o /usr/local/bin/wp \
    && chmod +x /usr/local/bin/wp
