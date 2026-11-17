# Wedding Flower Store

Wedding Flower Store is a React + Express application for managing a wedding flower catalog, customer accounts, orders, reviews, and admin workflows.

## Current Stack

- Frontend: React, Vite, Tailwind CSS, React Router, Axios, React Hook Form, Zod, React Query, React Hot Toast
- Backend: Node.js, Express, Prisma ORM, PostgreSQL, JWT auth, bcryptjs, Multer, Helmet, CORS, Morgan
- Database: PostgreSQL
- Authentication: access token + refresh token, role-based authorization

MongoDB is not used in the current implementation.

## Project Structure

```text
shop_web/
├── backend/
│   ├── prisma/
│   │   └── schema.prisma
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── repositories/
│   │   ├── routes/
│   │   ├── services/
│   │   └── utils/
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   ├── components/
│   │   ├── context/
│   │   ├── lib/
│   │   └── pages/
│   └── package.json
└── package.json
```

## Setup

### 1. Backend

Create `backend/.env` from `backend/.env.example`, then run:

```bash
cd backend
npm install
npx prisma generate
npx prisma db push
npm run dev
```

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend runs on `http://localhost:5173` and proxies API traffic to `http://localhost:5000`.

## Environment Variables

Use `backend/.env.example` as the source of truth. The key values are:

- `DATABASE_URL`
- `JWT_ACCESS_SECRET`
- `JWT_REFRESH_SECRET`
- `JWT_RESET_SECRET`
- `FRONTEND_URL`
- `ADMIN_EMAIL`
- `ADMIN_PASSWORD`

Use unique random JWT secrets with at least 32 characters in production. Do not use the placeholder values in `backend/.env.example`. There are no default administrator credentials: a new admin is created only during an explicit bootstrap with `BOOTSTRAP_ADMIN=true`, `ADMIN_EMAIL` and `ADMIN_PASSWORD` configured. Existing non-admin accounts are never promoted automatically. Disable bootstrap after setup.

## Auth Highlights

- User signup and login are stored in PostgreSQL
- Passwords are hashed with `bcryptjs`
- Refresh tokens are stored server-side and sent via `httpOnly` cookies
- Only active accounts with the ADMIN role can access admin routes. SUBADMIN cannot manage accounts.
- Order totals are calculated from the current product prices and the authenticated user's saved cart on the server
- Likes, wishlist, cart items, reviews, ratings, orders, and profile data persist across sessions

## Useful Commands

See [the security review](./SECURITY_REVIEW.md) for rate-limit settings, audit results, repeatable security/database/browser tests, and the remaining administrator credential rotation step.

```bash
cd backend && npx prisma generate
cd backend && npx prisma db push
cd backend && npm run dev
cd frontend && npm run dev
cd frontend && npm run build
```

Review branch release requirements: [LAUNCH_CHECKLIST.md](./LAUNCH_CHECKLIST.md). Do not merge or deploy until its blockers are resolved.
