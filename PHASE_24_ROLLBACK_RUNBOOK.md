# Sikkim Traveller — Phase 24 Production Rollback Runbook

## 1. Scope & Purpose

This runbook defines the standardized procedures for rolling back application deployments, database migrations, configuration changes, and third-party integrations in the event of an incident or deployment anomaly in production.

---

## 2. Frontend Rollback Procedures (Vercel / Netlify)

### Immediate Rollback (Instant Instantaneous Revert)
1. Navigate to the hosting provider dashboard (e.g., Vercel Deployments or Netlify Deploys).
2. Select the previous known healthy deployment (e.g., Phase 23 Production Release).
3. Click **"Promote to Production"** / **"Publish Deploy"**.
4. Propagation time: **< 15 seconds** globally via Edge CDN.

### Environment Reversion (Emergency Mock Fallback)
If the backend or database undergoes an outage, the frontend can be reverted to graceful client-side mode by setting:
```env
VITE_CUSTOMER_API_MOCK_MODE=true
VITE_CUSTOMER_PORTAL_MOCK_MODE=true
VITE_OPERATIONS_MOCK_MODE=true
VITE_PAYMENT_MOCK_MODE=true
VITE_NOTIFICATIONS_MOCK_MODE=true
```
Then trigger a fast redeploy. This allows customers to continue exploring itineraries without hitting failed backend endpoints.

---

## 3. Backend Rollback Procedures (Render / Railway / Fly.io)

### Container Version Reversion
1. Open the backend service dashboard.
2. In the deployment history, select the previous stable build commit.
3. Click **"Rollback"** / **"Redeploy previous build"**.
4. Verify health checks:
   - `curl -f https://api.sikkimtraveller.com/health`
   - `curl -f https://api.sikkimtraveller.com/ready`

### Traffic Drain & Maintenance Mode
If the backend requires immediate isolation:
1. Set environment variable `MAINTENANCE_MODE=true`.
2. Ensure health endpoint responds with `503 Service Temporarily Unavailable` to trigger cloud load balancer draining.

---

## 4. Database Migration Safety & Rollback

> [!CAUTION]
> **Data Preservation First**: Never run destructive SQL (`DROP TABLE`, `DROP COLUMN`) on active production databases without an audited snapshot.

### Safe Migration Reversion
1. Check migration status:
   ```bash
   npx prisma migrate status
   ```
2. If a migration added non-breaking nullable columns or new tables, do NOT roll back the database schema immediately. The old backend version can safely ignore new columns.
3. If an emergency schema rollback is required:
   - Create a manual point-in-time recovery backup in the Supabase Dashboard (`Database` → `Backups`).
   - Run targeted down-migration scripts in the Supabase SQL editor rather than destructive resets.

---

## 5. Razorpay Webhook & Payment Gateway Rollback

### Webhook Rerouting / Temporary Disable
1. Log in to [Razorpay Dashboard](https://dashboard.razorpay.com).
2. Navigate to **Settings** → **Webhooks**.
3. To disable webhook processing during an outage:
   - Toggle webhook status to **Inactive** or modify endpoint to staging URL.
   - Razorpay will queue webhook retry deliveries for up to 24 hours.

### Replay Webhook Events
Once the backend is restored, trigger webhook replays from the Razorpay Dashboard to settle any pending payments without customer interaction.

---

## 6. DNS & CDN Emergency Procedures

1. **DNS Provider**: Cloudflare / Route53.
2. **TTL Setting**: Keep DNS record TTL at 300 seconds (5 minutes) during release windows.
3. **Emergency Failover**: If the production domain (`sikkimtraveller.com`) experiences edge failures, update CNAME record to the secondary backup host or static maintenance page.

---

## 7. Subsystem Verification Checklist Post-Rollback

- [ ] `GET /health` returns `{"status":"HEALTHY"}` (HTTP 200)
- [ ] `GET /ready` returns `{"status":"READY"}` (HTTP 200)
- [ ] Customer token verification responds with HTTP 401 for invalid tokens (No 500 error)
- [ ] CORS headers allow `https://sikkimtraveller.com`
- [ ] No unhandled runtime exceptions in container logs
