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

## Authentication and Secrets

- User signup and login use PostgreSQL through Prisma.
- Passwords are hashed with bcryptjs.
- JWT access tokens and refresh-token cookies are used for authentication.
- Configure the administrator email and password only through `ADMIN_EMAIL` and `ADMIN_PASSWORD` in the untracked `backend/.env` file.
- Keep database credentials, API keys, tokens, and passwords out of source files, frontend environment variables, and documentation. Rotate any credential that has already been exposed.

## Notes

- Run `npx prisma db push` after setting `DATABASE_URL`.
- In development, forgot-password returns a reset URL in the API response.
- Uploaded images are stored under `backend/uploads` unless external storage is configured.