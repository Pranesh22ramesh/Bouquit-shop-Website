# Wedding Store Backend Setup

This project uses a Node.js/Express backend with Prisma ORM and PostgreSQL.
MongoDB is not used anywhere in the current backend stack.

## Prerequisites

1. Node.js 18+
2. A PostgreSQL database connection string
   - Supabase PostgreSQL works well for this project
3. A `backend/.env` file created from `backend/.env.example`

## Backend Setup

```bash
cd backend
npm install
npx prisma generate
npx prisma db push
npm run dev
```

The API runs on `http://localhost:5000`.

## Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The frontend runs on `http://localhost:5173` and proxies API requests to the backend.

## Current Auth Rules

- User signup/login uses PostgreSQL through Prisma
- Passwords are hashed with `bcryptjs`
- JWT access tokens plus refresh-token cookies are used for auth
- Only this admin account is allowed admin access:
  - Email: `midhunyas2012karur@gmail.com`
  - Password: `Sudh@2012`

## Notes

- Run `npx prisma db push` after setting `DATABASE_URL`
- In development, forgot-password returns a reset URL in the API response
- Uploaded images are stored in `backend/uploads` unless you later wire in external storage
