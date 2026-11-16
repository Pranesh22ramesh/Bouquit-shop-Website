# Security review — 16 November 2026

## Implemented controls

| Area | Changes |
| --- | --- |
| Authentication throttling | Per-IP and HMAC-keyed per-account counters, synchronous admission before expensive work, exponential retry delays, IPv6 subnet grouping, canonical email identities, verified token subjects for resets/refreshes. Login aliases share counters. Successful attempts do not erase IP counters. |
| Other endpoint limits | Public reads have a lower budget than verified user actions; uploads have an additional budget. Product/admin mutations no longer consume the public browsing budget. |
| Input validation | Reject unknown body/query/path fields, arrays used as scalars, incorrect JSON booleans/numbers, invalid dates/URLs, unsupported nested content/customization fields, malformed session cookies and JWTs. Bound strings, lists, payload depth and password byte length. Multipart numeric fields remain explicitly typed strings. |
| Secrets | Remove the remaining password from setup instructions and reachable branch history. Scan working files, staged blobs, frontend build output, and optionally branch/tag history without printing matches. Frontend builds allow only reviewed public environment variables and reject private Supabase keys. |
| Error responses | Server faults (including internal ApiError 500 messages) produce generic JSON plus a correlation ID. Database failures during authentication reach server logging instead of becoming misleading 401 responses. Error responses discard public cache headers. |
| Uploads | Enforce byte/file/field/pixel limits, MIME + extension + decoded format agreement, static JPEG/PNG/WebP only. Fully decode/re-encode to WebP before writing, strip original metadata/appended payloads, generate collision-resistant filenames, use exclusive writes and constrain paths/deletions. |

Local uploads are stored in `backend/uploads`, outside the frontend public directory. The backend serves only WebP paths with `image/webp`, `nosniff`, a sandboxed CSP, and no executable handlers. Supabase storage, when enabled, receives only the re-encoded WebP bytes. Sharp's metadata API only reads headers; full decoding occurs during the encoding step before storage. [Sharp documentation](https://sharp.pixelplumbing.com/api-input/)

## Rate-limit configuration

All budgets, windows, backoff thresholds/delays, state capacity and IPv6 prefix size are configurable in `backend/.env.example`.

| Default | Budget / behavior |
| --- | --- |
| Public browsing | 200 requests / 15 minutes per IP/subnet |
| Authenticated actions | 500 requests / 15 minutes per verified user |
| Uploads | 30 requests / 15 minutes per IP/subnet |
| General perimeter | 3,000 requests / 15 minutes per IP/subnet; auth endpoints use progressive limits instead |
| Authentication IP | First 10 admitted attempts before a delay, shared across auth endpoints |
| Authentication account | First 3 admitted attempts per purpose; signup starts after 2 |
| Backoff | 1.5 seconds, then doubles to a 60-second cap; inactive counters expire after 15 minutes |

Attempts count even when successful or when an account does not exist. Denied requests do not extend their own delay. The first request after the delay is allowed, so there is no permanent account lockout. At state capacity, new identities receive a temporary 503 instead of evicting active protection.

**Deployment requirement:** these counters are process-local, appropriate for the current single-instance setup. Multiple instances/workers need shared counters or equivalent gateway controls before scaling. Restarts reset counters. The stock rate limiter also uses process-local memory. [express-rate-limit store documentation](https://express-rate-limit.mintlify.app/overview)

`TRUST_PROXY_HOPS` must match the actual trusted proxy path; local default is 0. Old fixed-window authentication variables (`RATE_LIMIT_AUTH_MAX`, `RATE_LIMIT_SIGNUP_MAX/WINDOW_MS`, and `*_FAILURE_MAX`) have been replaced by the `*_ATTEMPT_MAX` settings in the example file.

## Dependency audit

`npm audit --json` was run separately in the root, backend and frontend, including development dependencies.

| Workspace | Critical | High | Moderate | Low |
| --- | ---: | ---: | ---: | ---: |
| Root | 0 | 0 | 0 | 0 |
| Backend | 0 | 0 | 0 | 0 |
| Frontend | 0 | 0 | 0 | 0 |

The previous root findings (critical `shell-quote`, high `concurrently`) were already patched. This review upgrades `express-rate-limit` from 7.x to 8.7.4 for current IP handling and adds Playwright as a development-only browser test dependency. No known advisories remain in the audited dependency trees; this is not a guarantee against undiscovered vulnerabilities.

## Verification

- `npm test`: 13 security regression scenarios, with real HTTP requests, JWT verification, multipart parsing and image processing; database services are isolated for deterministic boundary tests.
- `npm run test:db --prefix backend`: real PostgreSQL 18 signup/login/profile/cart/checkout, trusted price calculation, duplicate checkout rejection, cross-account order denial, stored image review, password reset and refresh-token revocation.
- `npm run test:browser`: headless Edge reviewed home/gallery/login/signup/about/contact/reviews at 1440px and 390px; completed login → product customization → cart → checkout without a delivery date → confirmation → persisted order history. No uncaught page errors or horizontal overflow in those checks.
- Frontend production build succeeds without the previous Zod annotation warnings. A narrowly scoped transform removes misleading annotation text from two upstream documentation comments; actual optimization annotations are retained.
- The checkout confirmation now states that the order was received and includes a **View my orders** action alongside WhatsApp.
- `npm run security:secrets -- --history` checks repository files/index/history and the built frontend. Enable the included push guard with `git config core.hooksPath .githooks`.

### Reproduce database and browser checks

Create an empty local PostgreSQL database named `security_test` (or `security_test_<suffix>`). Set both `DATABASE_URL` and `DIRECT_URL` to that local database for `npx prisma db push --skip-generate` in `backend`. Do not use the deployment database for these tests.

Set `TEST_DATABASE_URL` to the same URL, then run `npm run test:db --prefix backend -- --serve`. This creates synthetic fixtures and serves the API on loopback port 5000. Build the frontend with `VITE_API_BASE_URL=/api`, start Vite preview on `127.0.0.1:4173`, then run `npm run test:browser` from the root. Edge must be installed (or set `PLAYWRIGHT_CHANNEL` to another installed Chromium channel). Screenshots and synthetic login fixtures are written to the OS temporary directory, outside Git. Stop the test server and remove the disposable test database afterward.

## Remaining deployment action

**The exposed administrator password must be rotated in the existing database account.** Deleting Git history does not invalidate a credential, and changing `ADMIN_PASSWORD` alone does not reset an existing account. The configured Supabase connections initially failed on both ports; a later retry reached the server but was rejected for invalid database credentials. Live administrator credential validity, live checkout and credential rotation could not be confirmed. Local PostgreSQL checkout verification passed. Three weak signing secrets in ignored local `backend/.env` were replaced with unique random values; hosting secrets must be managed in the hosting environment.

`npm run security:rotate-admin --prefix backend` performs a read-only account/password check. Once database access is restored and the login change is coordinated, add `-- --apply` to generate a new password, update the administrator's hash, revoke refresh/reset tokens, and save the generated value only in ignored `backend/.env`. Update the hosting environment to match. Existing access tokens expire according to their configured TTL. Never paste the credential into a PR, issue or chat.

History cleanup changes commit IDs. Refresh existing clones from the cleaned branches; do not merge old history back. Previously downloaded clones, forks and GitHub cached views may retain the exposed value, which is another reason rotation is required.
