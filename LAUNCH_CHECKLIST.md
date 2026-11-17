# Launch readiness

Review date: 17 November 2026. **Do not deploy this branch yet.**

The changes are on `security-launch-readiness`. Vercel Git deployments are disabled in both configuration files and Render's blueprint sets `autoDeployTrigger: 'off'`. Existing hosting dashboard settings must also be checked before merging. No production deployment or live database write was performed during this review.

## Required before release

1. **Restore the production database connection.** `node backend/scripts/check-database.cjs` currently returns P1000 for both configured URLs. Correct the password/connection settings in ignored `backend/.env` and the Render secret environment, never in chat or Git. Require TLS on both PostgreSQL URLs with `sslmode=require` or `verify-full`. Confirm backups and restore access.
2. **Apply the reviewed database changes explicitly.** After a backup, run `backend/prisma/security-upgrade.sql`, then `supabase/private-table-security.sql` as the database owner. Re-run the read-only check. Check existing Supabase storage policies and public table policies against `supabase/realtime_setup.sql`. Private tables must have no anonymous or Supabase-authenticated grants. The backend uses custom authentication and owns private access.
3. **Rotate the previously exposed administrator password.** After the schema update, use `npm run security:rotate-admin --prefix backend -- --apply`. The generated credential stays in ignored `backend/.env`. Update Render's ADMIN_PASSWORD securely. This revokes access, refresh and reset sessions. Verify production JWT secrets are unique random values; local `.env` changes do not update hosting secrets.
4. **Connect an owned custom domain.** `karurflowershop.vercel.app` is the provided hosting URL, not an owned custom domain. Add the real domain to Vercel, configure its DNS and TLS, update `FRONTEND_URL`, the exact CORS allowlist, public SEO site URL and `launch-readiness.json`. Never add wildcard credentialed CORS.
5. **Approve the legal pages.** `/privacy` and `/terms` are clearly marked drafts. Confirm legal business name/address, support and privacy email, cancellation deadlines, refunds, delivery commitments, retention periods and request handling. Update the text to the actual business policy and remove the draft notice only after review. The prior answer “yes” did not provide these details. Legal compliance has not been certified.
6. **Configure and test reset emails.** Set server-only `RESEND_API_KEY` and `MAIL_FROM` using a verified sender domain. Test an actual delivery, link expiry and reuse rejection. No email was sent by the local tests. Missing configuration returns an error instead of a false delivery success. Keep NODE_ENV=production; `npm start` enforces it.
7. **Verify the deployment environment.** `TRUST_PROXY_HOPS` must match the actual proxy chain. Rate limits and event-stream state are process-local: keep one backend instance or implement a shared store before horizontal scaling. Configure a persistent upload disk or the isolated Supabase storage bucket. Review log access and retention.
8. **Complete the launch check and release deliberately.** The favicon is present and no AI attribution tag is rendered. Mark only verified flags in `launch-readiness.json`, run `node scripts/check-launch.cjs`, then enable deployment as a separate release action. The check validates DNS, HTTPS and site identity. Ordinary local builds remain available for review.

## Local verification

Use an isolated PostgreSQL database whose name starts with `security_test` on loopback. The test refuses a remote or ordinary application database. Apply the Prisma schema and private-table SQL; create NOLOGIN `anon` and `authenticated` roles in the isolated cluster for permission tests. Then set `TEST_DATABASE_URL` in the process environment and run `npm run test:db --prefix backend`.

For browser checks run `node backend/scripts/test-checkout.cjs --serve`, build the frontend with `VITE_API_BASE_URL=/api`, and run Vite preview on 127.0.0.1:4173. `npm run test:browser` uses headless Edge, synthetic credentials outside Git, and the actual local database. It does not send WhatsApp messages or email. Stop the owned servers and dispose of the test database afterward.

Run `npm test`, audits in root/backend/frontend, `npm run security:secrets -- --history`, and `git diff --check` before release. Rebuild and stage the tracked `frontend/dist` directory, including new hashed assets.
