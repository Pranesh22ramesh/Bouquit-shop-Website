-- Apply explicitly after a verified backup. Existing installations use db push
-- rather than Prisma migration history; this patch is idempotent.
BEGIN;
ALTER TABLE public."User" ADD COLUMN IF NOT EXISTS "authVersion" INTEGER NOT NULL DEFAULT 0;
COMMIT;
