#!/usr/bin/env bash
set -euo pipefail

export NVM_DIR="$HOME/.nvm"
# shellcheck disable=SC1091
. "$NVM_DIR/nvm.sh"
nvm use 22.23.2

git config --global user.email "simeonoyekunleoyebola@gmail.com"
git config --global user.name "Simeon Oyebola"

TOKEN="${GITHUB_TOKEN:?GITHUB_TOKEN required}"
REPO_URL="https://x-access-token:${TOKEN}@github.com/oyebolasimeon/qipa-web.git"

mkdir -p /var/www
if [ -d /var/www/qipa-web/.git ]; then
  cd /var/www/qipa-web
  git remote set-url origin "$REPO_URL"
  git fetch origin
  git reset --hard origin/main
else
  git clone "$REPO_URL" /var/www/qipa-web
  cd /var/www/qipa-web
fi

# Remove token from remote after clone/pull
git remote set-url origin https://github.com/oyebolasimeon/qipa-web.git
git log -1 --oneline

printf 'NEXT_PUBLIC_API_URL=https://api.qipa.co\n' > /var/www/qipa-web/.env.local
printf 'NEXT_PUBLIC_API_URL=https://api.qipa.co\n' > /var/www/qipa-web/.env.production

npm ci || npm install
npm run build

pm2 delete qipa-web >/dev/null 2>&1 || true
# Prefer explicit next binary + port
PORT=3001 pm2 start ./node_modules/next/dist/bin/next --name qipa-web -- start -p 3001
pm2 save
pm2 status

# Nginx site for app.qipa.co
cat > /etc/nginx/sites-available/qipa-web <<'NGINX'
server {
    listen 80;
    listen [::]:80;
    server_name app.qipa.co www.app.qipa.co;

    location /.well-known/acme-challenge/ {
        root /var/www/html;
    }

    location / {
        return 301 https://app.qipa.co$request_uri;
    }
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name www.app.qipa.co;

    # Temporary self-signed until certbot; certbot will replace these lines
    ssl_certificate /etc/ssl/certs/ssl-cert-snakeoil.pem;
    ssl_certificate_key /etc/ssl/private/ssl-cert-snakeoil.key;

    return 301 https://app.qipa.co$request_uri;
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name app.qipa.co;

    # Temporary self-signed until certbot; certbot will replace these lines
    ssl_certificate /etc/ssl/certs/ssl-cert-snakeoil.pem;
    ssl_certificate_key /etc/ssl/private/ssl-cert-snakeoil.key;

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

# Issue / renew certs. Prefer app.qipa.co; include www.app if DNS exists.
if getent hosts www.app.qipa.co >/dev/null 2>&1 || dig +short www.app.qipa.co | grep -q .; then
  certbot --nginx -d app.qipa.co -d www.app.qipa.co --non-interactive --agree-tos -m simeonoyekunleoyebola@gmail.com --redirect || \
  certbot --nginx -d app.qipa.co --non-interactive --agree-tos -m simeonoyekunleoyebola@gmail.com --redirect
else
  certbot --nginx -d app.qipa.co --non-interactive --agree-tos -m simeonoyekunleoyebola@gmail.com --redirect
fi

nginx -t
systemctl reload nginx

echo "DEPLOY_OK"
curl -sI -H 'Host: app.qipa.co' http://127.0.0.1:3001 | head -5 || true
ss -tlnp | grep 3001 || true
