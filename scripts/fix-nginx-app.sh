#!/usr/bin/env bash
set -euo pipefail

cat > /etc/nginx/sites-available/qipa-web <<'NGINX'
# HTTP: serve the app (and still reachable at http://app.qipa.co)
server {
    listen 80;
    listen [::]:80;
    server_name app.qipa.co www.app.qipa.co;

    location /.well-known/acme-challenge/ {
        root /var/www/html;
    }

    location / {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 120s;
        client_max_body_size 25m;
    }
}

# HTTPS
server {
    listen 443 ssl;
    listen [::]:443 ssl;
    server_name app.qipa.co;

    ssl_certificate /etc/letsencrypt/live/app.qipa.co/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/app.qipa.co/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

    client_max_body_size 25m;

    location / {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 120s;
    }
}
NGINX

ln -sfn /etc/nginx/sites-available/qipa-web /etc/nginx/sites-enabled/qipa-web
nginx -t
systemctl reload nginx
echo NGINX_FIXED
