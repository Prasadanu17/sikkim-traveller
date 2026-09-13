# Sikkim Traveller — Phase 24 Deployment Audit

## 1. Executive Summary & Verification State

- **Current State**: `CODE VERIFIED` & `BUILD READY`
- **Objective**: Full production configuration audit for live deployment across cloud infrastructure providers (Supabase, Razorpay, Render/Railway, Vercel/Netlify).

The application codebase, database schemas, security middleware, IDOR authorization policies, and cryptographic validation routines have passed all automated validation suites:
- **Prisma Schema**: 26 models validated (`npx prisma validate` 🚀 PASS)
- **Frontend Linting**: 0 errors (`oxlint` PASS)
- **Frontend Production Build**: Clean bundle compilation (`vite build` PASS in 13.84s)
- **Backend Integration Tests**: 23/23 passing suites (`vitest run` PASS)
- **Secret Isolation**: 0 private tokens/keys detected in client bundle (`dist/`)

---

## 2. Environment Variable Separation & Security Architecture

### Public Frontend Variables (Client-Safe)
These variables are exposed in the compiled browser bundle and must never contain private secrets:

| Variable | Target Production Value | Purpose |
|---|---|---|
| `VITE_CUSTOMER_API_MOCK_MODE` | `false` | Disables localStorage mock mode; routes calls to live Express backend |
| `VITE_CUSTOMER_PORTAL_MOCK_MODE` | `false` | Routes portal data retrieval directly to server |
| `VITE_OPERATIONS_MOCK_MODE` | `false` | Enables server-side RBAC operational controls |
| `VITE_PAYMENT_MOCK_MODE` | `false` | Enables real Razorpay checkout initialization |
| `VITE_NOTIFICATIONS_MOCK_MODE` | `false` | Uses live notification channels |
| `VITE_CUSTOMER_API_BASE_URL` | `https://api.sikkimtraveller.com/api/customer` | Production backend customer API gateway |
| `VITE_REALTIME_API_ENDPOINT` | `https://api.sikkimtraveller.com/api/realtime` | Live weather & operational advisory endpoint |
| `VITE_WEB3FORMS_ACCESS_KEY` | *(Public Web3Forms key)* | Fallback contact form submissions |

### Private Backend Variables (Host Dashboard Only)
These variables are restricted to the backend container runtime and must NEVER be committed to Git or exposed via `VITE_`:

| Variable | Format / Description | Hosting Provider Dashboard |
|---|---|---|
| `DATABASE_URL` | `postgresql://postgres:[PASSWORD]@db.[REF].supabase.co:5432/postgres` | Supabase PostgreSQL Connection String |
| `SUPABASE_URL` | `https://[REF].supabase.co` | Supabase Project API URL |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJhbGciOiJIUzI1Ni...` | Supabase Service Role Secret (Admin/Storage) |
| `SUPABASE_STORAGE_BUCKET` | `sikkim-traveller-documents` | Private document storage bucket |
| `CUSTOMER_TOKEN_PEPPER` | 64-character random hex string | High-entropy server salt for token hashing |
| `OPS_SESSION_SECRET` | 64-character random hex string | Staff RBAC session signing key |
| `RAZORPAY_KEY_ID` | `rzp_live_...` (or `rzp_test_...` for staging) | Public API identifier |
| `RAZORPAY_KEY_SECRET` | Secure string from Razorpay dashboard | Private HMAC API key |
| `RAZORPAY_WEBHOOK_SECRET` | Secure string from Razorpay webhook settings | Webhook HMAC-SHA256 verification secret |
| `CORS_ORIGIN` | `https://sikkimtraveller.com` | Allowed origin for frontend requests |
| `NODE_ENV` | `production` | Production environment flag |
| `PORT` | `3001` (or host assigned `$PORT`) | Server listening port |

> [!IMPORTANT]
> **Credential Safety Rule**: Sensitive values (passwords, HMAC secrets, Razorpay secrets, Supabase service role keys) must be entered directly into the hosting provider's secure dashboard (e.g., Render/Railway Environment Settings) and never shared in chat or committed to repository files.

---

## 3. Subsystem Readiness Matrix

| Subsystem | Code Status | Cloud Configuration Required |
|---|:---:|---|
| **Prisma ORM** | 🟢 PASS | Run `npx prisma migrate deploy` with production `DATABASE_URL` |
| **Supabase Storage** | 🟢 PASS | Create private bucket `sikkim-traveller-documents` in Supabase dashboard |
| **Razorpay Payments** | 🟢 PASS | Set `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET` |
| **Razorpay Webhook** | 🟢 PASS | Register endpoint `https://api.sikkimtraveller.com/api/customer/payments/webhook` |
| **Backend Express API** | 🟢 PASS | Deploy to Render/Railway with production environment variables |
| **Frontend SPA** | 🟢 PASS | Deploy `dist/` to Vercel/Netlify with `VITE_*_MOCK_MODE=false` |
| **DNS / SSL** | 🟢 PASS | Point `sikkimtraveller.com` & `api.sikkimtraveller.com` CNAME records |

---

## 4. Architectural Safeguards Verified

1. **IDOR Prevention**: Server resolves customer identity exclusively from authenticated journey token hash. Browser query/body parameters (`journeyId`, `customerId`) are ignored.
2. **Authoritative Webhook Processing**: Payment completion is only registered via server-side HMAC-SHA256 signature verification on the raw body buffer (`req.rawBody`).
3. **Private File Storage**: Customer permits and identity documents are stored in a private Supabase bucket, accessible solely via backend-generated short-lived signed URLs.
4. **RBAC Staff Controls**: Staff actions are enforced with server-side role hierarchy (`ADMIN` > `OPERATIONS_MANAGER` > `TRAVEL_OPERATOR` > `SALES` > `VIEWER`). Mutations by `VIEWER` produce HTTP 403 Forbidden.
5. **Realtime Weather Normalization**: Telemetry from Open-Meteo proxy normalizes temperature, precipitation, wind speed, and visibility for Gangtok, Pelling, Lachung, Lachen, and Ravangla.
