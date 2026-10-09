# La Taifas – Restaurant Online Store

Online store for **La Taifas**, a local restaurant in Suceava: customers order food for home delivery and browse the restaurant's wine collection, while the owner manages everything from an **admin dashboard**.

🌐 **Live:** [lataifas-suceava.ro](https://lataifas-suceava.ro)

> This is a public showcase copy of a real client project, without credentials, deployment configuration, one-off maintenance scripts or customer data.

## Features

### Customer website
- Restaurant menu and online ordering, organized by category
- Wine collection with dedicated wine pages
- Shopping cart and checkout with delivery address and **delivery zones**
- **Online card payments through ING WebPay**, integrated in collaboration with ING Bank
- Order confirmation and payment status pages
- Events page with photo gallery, location gallery, reviews and contact form
- Legal pages (terms, privacy policy, cookies, complaints / ANPC)
- Responsive design for mobile and desktop

### Admin dashboard
- Protected dashboard with login and role-based admin accounts
- **Orders** – live order list with a **continuous sound alarm for new orders**, so the staff never misses an order while busy in the kitchen
- **Menu and products** – manage menu items, prices, discounts, images and featured products
- **Wines** – manage the wine collection and custom wine categories
- **Categories** and **delivery zones**
- **Events**, **event gallery** and **location gallery**
- **Banners**, **blog posts**, **reviews**, **customers** and **messages**

### Notifications
- Automatic email notifications for new orders

## Tech stack

| Layer | Technologies |
|---|---|
| **Frontend** | Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS, Radix UI / shadcn/ui, React Hook Form, Zod, Lucide icons |
| **Backend** | Next.js API Routes, Next.js middleware for protected routes, bcrypt |
| **Database & storage** | Supabase (PostgreSQL + Storage) |
| **Payments** | ING WebPay |
| **Email** | Nodemailer (SMTP) |
| **Images** | Sharp for image optimization |

## Project structure

```
app/(frontend)/     Customer-facing pages (menu, wines, cart, checkout, events…)
app/(dashboard)/    Admin dashboard pages
app/api/            API routes (orders, products, wines, payments, auth…)
components/         Reusable UI components
lib/                Supabase client, email service, helpers
migrations/         SQL migrations for the database schema
```

## Running locally

```bash
npm install
cp .env.example .env.local   # then fill in the values
npm run dev
```

Environment variables are listed in `.env.example` (Supabase URL and keys, ING WebPay credentials, SMTP settings). No real credentials are included in this repository.

## Author

**Alexandru Știrbu** – Junior Frontend Developer, [WebLift Digital](https://webliftdigital.ro)
