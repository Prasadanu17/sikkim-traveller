# Sikkim Traveller — Phase 19 Architecture Audit

## 1. Architecture Overview

Sikkim Traveller is a full-stack, AI-powered Himalayan travel platform.

```
                    ┌──────────────────────────────────────────────┐
                    │               React 19 + Vite                │
                    │               Frontend Client                │
                    └──────────────────────┬───────────────────────┘
                                           │
                                           │ HTTPS / REST API
                                           ▼
                    ┌──────────────────────────────────────────────┐
                    │               Express Backend                │
                    │          API Gateway / Security Layer        │
                    └──────┬───────────────┬───────────────┬───────┘
                           │               │               │
            ┌──────────────┴──────┐ ┌──────┴────────┐ ┌────┴───────────────┐
            │   Prisma ORM        │ │ Razorpay HMAC │ │  Supabase Storage │
            │ Supabase PostgreSQL │ │ Webhook Auth  │ │ Private Documents │
            └─────────────────────┘ └───────────────┘ └───────────────────┘
```

---

## 2. Core Technical Stack

- **Frontend**: React 19, Vite, Tailwind CSS, Framer Motion, React Router, Lucide React icons.
- **Backend**: Node.js, Express, Prisma ORM (26-model schema), Helmet, CORS, Express Rate Limit.
- **Database**: PostgreSQL hosted on Supabase.
- **Storage**: Supabase Private Bucket with short-lived signed URLs.
- **Payments**: Razorpay Gateway (HMAC-SHA256 signature verification).
- **Authentication**: Passwordless customer tracking tokens with SHA-256 HMAC hashing. Session revocation for operational security.
- **Realtime**: Proxy service wrapping Open-Meteo for live weather & advisories.

---

## 3. Mock & Staging Toggles

- Frontend mock mode flags (`VITE_*_MOCK_MODE=true/false`) allow seamless switching between in-memory mock services and live production REST endpoints.
- Backend database client automatically falls back to an in-memory simulated database client when `DATABASE_URL` is omitted, facilitating local development and isolated CI test runs.

---

## 4. Production Environment Audit & Security Boundaries

- **Zero Secret Exposure**:
  - `src/` and `dist/` contain strictly public `VITE_*` parameters (`VITE_CUSTOMER_API_BASE_URL`, `VITE_REALTIME_API_ENDPOINT`, etc.).
  - Backend secrets (`DATABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET`, `CUSTOMER_TOKEN_HMAC_SECRET`, `SESSION_SECRET`) are restricted to server environment variables.
- **IDOR Protection**: All customer-facing endpoints resolve journey ownership from the cryptographically verified session token, discarding untrusted browser-supplied IDs.
- **Operations RBAC**: Server-enforced role checks (`ADMIN`, `OPERATIONS_MANAGER`, `TRAVEL_OPERATOR`, `SALES`, `VIEWER`).

---

## 5. Deployment Target Assumptions

- **Frontend Hosting**: Vercel / Netlify / Cloudflare Pages.
- **Backend Hosting**: Render / Railway / Fly.io / AWS ECS.
- **Database**: Supabase PostgreSQL.
- **Storage**: Supabase Storage (`sikkim-traveller-documents`).
