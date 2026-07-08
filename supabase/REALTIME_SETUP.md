# Supabase Realtime setup for this project

This repo now supports safe browser-side realtime for public website data:

- `Product`
- `Review`
- `ContentSection`

That covers:

- gallery add/edit/delete sync
- review sync
- home/about/contact page sync
- category sync through product changes

## 1. Required frontend env

Create `frontend/.env` from `frontend/.env.example`:

```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_OR_PUBLISHABLE_KEY
```

## 2. Required backend env

Create `backend/.env` from `backend/.env.example`:

```env
NODE_ENV=development
PORT=5000
FRONTEND_URL=http://localhost:5173
DATABASE_URL=postgresql://postgres:YOUR_DB_PASSWORD@db.YOUR_PROJECT_REF.supabase.co:5432/postgres?schema=public&sslmode=require
SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
SUPABASE_SERVICE_ROLE_KEY=YOUR_SUPABASE_SERVICE_ROLE_KEY
SUPABASE_STORAGE_BUCKET=site-assets
JWT_ACCESS_SECRET=replace-with-very-long-access-secret
JWT_REFRESH_SECRET=replace-with-very-long-refresh-secret
JWT_RESET_SECRET=replace-with-very-long-reset-secret
ACCESS_TOKEN_TTL=15m
REFRESH_TOKEN_TTL_DAYS=30
REFRESH_COOKIE_NAME=bb_refresh_token
UPLOAD_DIR=uploads
ADMIN_EMAIL=midhunyas2012karur@gmail.com
ADMIN_PASSWORD=Sudh@2012
```

## 3. Run Prisma against Supabase Postgres

```bash
cd backend
npx prisma generate
npx prisma db push
```

## 4. Enable Realtime publication

In Supabase SQL Editor, run:

- [realtime_setup.sql](./realtime_setup.sql)

## 5. Dashboard check

In Supabase dashboard:

1. Go to Database → Replication
2. Confirm `supabase_realtime` publication exists
3. Confirm these tables are included:
   - `Product`
   - `Review`
   - `ContentSection`

## Important security note

With the current architecture, the frontend uses your own backend JWT auth, not Supabase Auth.

That means browser-side Supabase Realtime is secure for public tables, but not for private per-user tables like:

- `CartItem`
- `Order`
- `ActivityLog`
- `User`

To make private per-user realtime secure, choose one of these:

1. migrate frontend session auth to Supabase Auth
2. keep current auth and add a backend SSE/WebSocket relay
3. mint Supabase-compatible JWTs for the realtime client

Right now, public-site realtime is ready. Private user data remains persistent and API-backed, but not cross-session live-realtime in a secure way yet.
