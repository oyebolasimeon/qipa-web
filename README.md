# Ocupai web

Responsive Next.js app for the same Ocupai backend as the mobile app (`https://api.qipa.co`).

## Setup

```bash
nvm use 22
cp .env.example .env.local
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Sign in with your Ocupai account, or use the demo shortcut on the login screen.

Workspace modes (short-let, flatshares, maintenance, supported accommodation) follow the organization kind from the API, matching mobile.
