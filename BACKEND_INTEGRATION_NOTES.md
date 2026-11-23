# RentNest Backend Integration Notes

These changes were made after comparing the supplied backend and frontend ZIPs.

## Implemented changes

- Added `POST /api/auth/refresh-token` and `POST /api/auth/logout`.
- Login now returns `data.accessToken`, `data.refreshToken`, and `data.user`.
- Refresh validates the refresh-token signature and current user status, then
  rotates both JWTs.
- Auth middleware checks the current database role, status, and deletion state.
- Public registration only accepts `TENANT` and `LANDLORD`; it cannot create an
  `ADMIN` account.
- Added `GET /api/properties/my` for landlords/admins.
- Property update/delete now verify ownership (admins may manage all properties).
- Property responses omit landlord password fields.
- Rental creation verifies property availability and a 1–36 month duration.
- Landlord rental updates verify property ownership and enforce basic status
  transitions; a rental cannot become active without a completed payment.
- Tenant payment creation verifies rental ownership and approved status.
- Stripe checkout charges monthly rent multiplied by requested months in BDT.
- Stripe success/cancel callbacks now pass through the backend, verify/update
  payment state, and redirect to the frontend payment pages.
- Cancelled/failed checkout can be retried; the existing pending/failed payment
  record is reused instead of blocking another checkout.
- Successful payment activates the rental and marks the property unavailable.
- Error responses map common authentication, authorization, validation, and
  Prisma conflict/not-found errors to appropriate HTTP status codes.
- Added an environment-driven, idempotent `npm run seed:admin` script.

## Required environment variables

See `.env.example`. Important deployment values:

- `FRONTEND_URL`: deployed frontend origin (CORS + final redirects).
- `BACKEND_URL`: deployed backend origin (Stripe callback URLs).
- `STRIPE_SECRET_KEY`: valid Stripe test/live secret key.
- `ADMIN_NAME`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`: private values for seeding the
  administrator account.

## Run locally

```bash
npm ci
npx prisma generate
npx prisma migrate deploy
npm run dev
```

To create/update the admin account in the configured database:

```bash
npm run seed:admin
```

## Verification still required

The archives do not contain production environment secrets, and the Stripe
account/database cannot be accessed from this source review. Therefore these
items must still be tested in the user's environment:

1. Install dependencies and run `npx prisma generate` and `npm run build`.
2. Run migrations against the intended database.
3. Seed the admin using private environment values and verify deployed login.
4. Test login, refresh, logout, all three roles, and ownership restrictions.
5. Complete Stripe test-mode success, cancel, retry, and payment-history flows.
6. Verify the Stripe account can accept BDT charges for the account's country.

No live payment or deployed admin login is claimed as verified by this ZIP edit.
