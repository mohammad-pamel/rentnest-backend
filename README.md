# 🏠 RentNest Backend API

A RESTful Backend API for the **RentNest Property Rental Platform** built with **Node.js, Express.js, TypeScript, Prisma ORM, PostgreSQL, JWT Authentication, and Stripe Payment Gateway**.

---

## 🚀 Live API

**Base URL**

```
https://rentnest-backend-xi.vercel.app
```

---

## ✨ Features

* JWT Authentication & Authorization
* Role Based Access Control (Admin, Landlord, Tenant)
* User Registration & Login
* Category Management
* Property Management
* Rental Request Management
* Rental Approval System
* Stripe Payment Integration
* Review System
* Admin Dashboard APIs
* Global Error Handling
* Soft Delete Support
* Pagination & Filtering
* Prisma ORM
* PostgreSQL Database

---

## 🛠 Tech Stack

### Backend

* Node.js
* Express.js
* TypeScript

### Database

* PostgreSQL
* Prisma ORM

### Authentication

* JWT
* bcrypt

### Payment

* Stripe

### Deployment

* Vercel

---

## 📂 Project Structure

```
src
│
├── app
├── config
├── errors
├── interfaces
├── lib
├── middlewares
├── modules
│   ├── auth
│   ├── user
│   ├── category
│   ├── property
│   ├── rental
│   ├── payment
│   ├── review
│   └── admin
│
├── routes
├── utils
├── app.ts
└── server.ts
```

---

## ⚙️ Environment Variables

Create a `.env` file and add:

```env
PORT=5000

DATABASE_URL=YOUR_DATABASE_URL

JWT_ACCESS_SECRET=YOUR_ACCESS_SECRET
JWT_REFRESH_SECRET=YOUR_REFRESH_SECRET

JWT_ACCESS_EXPIRES_IN=7d
JWT_REFRESH_EXPIRES_IN=30d

BCRYPT_SALT_ROUNDS=10

STRIPE_SECRET_KEY=YOUR_STRIPE_SECRET_KEY
# Stripe Checkout currently charges in BDT (monthly rent multiplied by requested months)

# Frontend origin used by CORS and Stripe redirects
FRONTEND_URL=http://localhost:3000
# Keep APP_URL as a backwards-compatible alias for FRONTEND_URL if your deployment already uses it
APP_URL=http://localhost:3000
# Public backend origin used for Stripe success/cancel callbacks
BACKEND_URL=http://localhost:5000
```

---

## 📦 Installation

Clone the repository

```bash
git clone <your-github-repository-url>
```

Go to project directory

```bash
cd rentnest-backend
```

Install dependencies

```bash
npm install
```

Generate Prisma Client

```bash
npx prisma generate
```

Run Migration

```bash
npx prisma migrate dev
```

Start Development Server

```bash
npm run dev
```

---

## 📌 API Endpoints

### Authentication

| Method | Endpoint           |
| ------ | ------------------ |
| POST   | /api/auth/register |
| POST   | /api/auth/login    |
| GET    | /api/auth/me       |

---

### Category

| Method | Endpoint            |
| ------ | ------------------- |
| POST   | /api/categories     |
| GET    | /api/categories     |
| PATCH  | /api/categories/:id |
| DELETE | /api/categories/:id |

---

### Property

| Method | Endpoint            |
| ------ | ------------------- |
| POST   | /api/properties     |
| GET    | /api/properties     |
| GET    | /api/properties/:id |
| PATCH  | /api/properties/:id |
| DELETE | /api/properties/:id |

---

### Rental

| Method | Endpoint              |
| ------ | --------------------- |
| POST   | /api/rentals          |
| GET    | /api/rentals/my       |
| GET    | /api/rentals/landlord |
| PATCH  | /api/rentals/:id      |

---

### Payment

| Method | Endpoint              |
| ------ | --------------------- |
| POST   | /api/payments/create  |
| GET    | /api/payments/success |
| GET    | /api/payments/my      |

---

### Review

| Method | Endpoint                 |
| ------ | ------------------------ |
| POST   | /api/reviews             |
| GET    | /api/reviews/:propertyId |

---

### Admin

| Method | Endpoint                    |
| ------ | --------------------------- |
| GET    | /api/admin/users            |
| PATCH  | /api/admin/users/:id/status |
| PATCH  | /api/admin/users/:id/role   |
| GET    | /api/admin/dashboard        |

---

## 🔐 User Roles

### Admin

* Manage Users
* Manage Categories
* Manage Properties
* View Dashboard
* Manage Rentals

### Landlord

* Create Property
* Update Property
* Delete Property
* Approve Rental Request

### Tenant

* Browse Properties
* Request Rental
* Make Payment
* Submit Review

---

## 💳 Payment Flow

```
Tenant
   │
   ▼
Create Rental Request
   │
   ▼
Landlord Approves
   │
   ▼
Stripe Checkout
   │
   ▼
Payment Success
   │
   ▼
Rental Activated
```

---

## 👨‍💻 Author

**Mohammad Pamel**

Software Engineer

---

## 📄 License

This project is created for educational.

## Admin account setup

The repository does not contain a public/default admin password. Create the
admin account using private environment variables instead:

1. Configure `DATABASE_URL`, `BCRYPT_SALT_ROUNDS`, `ADMIN_NAME`,
   `ADMIN_EMAIL`, and a unique `ADMIN_PASSWORD` (at least 12 characters).
2. Generate Prisma Client: `npx prisma generate`.
3. Run `npm run seed:admin` against the intended database.
4. Sign in through the frontend using the `ADMIN_EMAIL` and `ADMIN_PASSWORD`
   values you supplied. Never commit a real `.env` file or publish the password.

The seed is idempotent: running it again updates the configured admin account
with the supplied credentials.

## Stripe environment configuration

- `FRONTEND_URL` is the frontend origin used by CORS and final browser redirects.
- `BACKEND_URL` is the public backend origin used as Stripe's success/cancel
  callback endpoint.
- `STRIPE_SECRET_KEY` must be a valid Stripe test or live secret key.
- Checkout uses BDT. The charged total is `property.price * rental.months`.

For local development use `FRONTEND_URL=http://localhost:3000` and
`BACKEND_URL=http://localhost:5000`. For deployment, use the deployed origins
without a trailing slash. Stripe must be tested with the matching environment
and valid credentials before claiming the payment flow is live.
