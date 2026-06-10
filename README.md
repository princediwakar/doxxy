# Doxxy — Clinic Management Platform

## Overview

Doxxy is a multi-tenant web application for Neurology and Ophthalmology clinics. It provides end-to-end management of appointments, patients, medical records, clinical inventory, billing, and AI-powered clinical tools — with strict data isolation and role-based access.

## Features

### Multi-Tenancy & Security
- **Clinic Isolation:** All data is partitioned by `clinic_id` with Row-Level Security (RLS) enforced at the database level.
- **Role-Based Access:** Supports `superadmin`, `staff`, and `doctor` roles, each with tailored permissions and UI.
- **Google OAuth:** Secure authentication and session management via Supabase Auth.

### User & Member Management
- **Unified Member Invitation:** Invite any user (doctor, staff, superadmin) to a clinic via the `invite-member` Edge Function. Handles user creation, clinic membership, and doctor profile setup.
- **Profile Completion:** Invited users set their password and complete their profile on first login.
- **Role & Department Management:** Assign and edit roles and departments for each member. Remove members with confirmation.

### Clinic & Department Management
- **Settings Page:** Manage clinic details, departments, and members from a unified settings interface.
- **Department Types:** Support for Neurology, Ophthalmology, and custom departments.

### Appointments & Consultations
- **Appointment Scheduling:** Book, view, and manage appointments with status tracking.
- **AI-Powered Consultation Notes:** Voice-to-text clinical note generation using Sarvam AI. Capture structured consultation notes with automatic formatting.
- **Specialty Data:** Store ophthalmology and neurology-specific clinical data linked to consultations.

### Patients & Medical Records
- **Patient Profiles:** Add, edit, and view patient information.
- **Medical Records:** Manage diagnoses, treatment plans, and clinical documentation.

### Clinical Inventory
- **Medicine Auto-complete:** Smart search across medicines by name, manufacturer, or composition with real-time debounced filtering.
- **AI-Based Stock Management:** Intelligent procurement extraction and inventory tracking with OpenAI fallback when Gemini is unavailable.
- **Inventory Management:** Track medicine stock levels and manufacturers.

### Billing & Payments
- **Bill Management:** Create, update, and track bills and payment status.
- **Razorpay Integration:** Online payment collection via Razorpay with server-side verification Edge Functions.

### Dashboards
- **Role-Specific Dashboards:** Superadmin, Staff, and Doctor dashboards with relevant stats, charts, and quick actions.
- **Analytics:** Clinic-wide analytics and insights.

### UI/UX
- **Server-First Next.js App Router:** Server Components by default. Client components only where interactivity is required. URL-driven state for filters, search, and pagination.
- **Modern Interface:** Built with React, TypeScript, Tailwind CSS, and shadcn/ui.
- **React Query:** Efficient data fetching and caching via `@tanstack/react-query`.
- **Form Validation:** All forms use `zod` schemas with `react-hook-form`.
- **Notifications:** Toast feedback via `sonner`.
- **PWA Support:** Full Progressive Web App with manifest, service worker, and app icons for installable mobile experience.

### Public Site
- **Marketing Pages:** Landing page, features, pricing, blog, FAQ, comparisons, security, privacy, terms, and contact page.
- **Contact Form:** Public contact form with server-side email delivery via Edge Function.

### Architecture
- **Server Actions:** All database mutations go through Next.js Server Actions in `actions/`. No client-side Supabase writes.
- **URL as State:** Filters, search queries, pagination, and active tabs live in the URL via `searchParams`.
- **Minimal Client State:** Zustand used only for transient cross-component UI state (e.g., dashboard date selection).

## Security: Row Level Security (RLS)

- RLS is enabled on all tenant-scoped tables.
- Policies enforce strict multi-tenancy and role-based access.
- No cross-clinic data access is possible.
- This is critical for security and compliance in a multi-tenant environment.

## Developer Guide

### Prerequisites
- Node.js 18+
- Supabase project (local or cloud)

### Setup

```sh
git clone <repo-url>
cd doxxy
npm install
cp .env.local.example .env.local  # Add your Supabase keys and other env vars
npm run dev                        # Starts custom server via tsx server.ts
```

### Environment Variables

See `.env.local` for the full set of required environment variables, including Supabase project credentials, Google OAuth keys, and AI provider API keys.

### Deployment

- **App:** Deploy on Vercel (configured for `bom1` region).
- **Database:** Use Supabase CLI for migrations (`supabase/migrations/`).
- **Edge Functions:** Deploy with `supabase functions deploy <name>`.

### Edge Functions

- `invite-member` — Handles member invitation, user creation, and clinic membership setup.
- `create-razorpay-order` — Creates Razorpay payment orders server-side.
- `verify-razorpay-payment` — Verifies payment signatures server-side.
- `send-contact-email` — Delivers contact form submissions via email.

### Code Structure

| Directory | Purpose |
|---|---|
| `actions/` | Server Actions for all database mutations |
| `app/` | Next.js App Router — `(app)` for authenticated routes, `(public)` for marketing, `api/` for route handlers |
| `components/` | UI components — server components by default, `"use client"` only for interactive leaves |
| `config/` | App configuration constants |
| `contexts/` | React Context providers |
| `hooks/` | Custom React hooks |
| `integrations/supabase/` | Supabase client, server client, and generated types |
| `lib/` | Shared utilities and helpers |
| `stores/` | Zustand stores (minimal, transient state only) |
| `styles/` | Global styles and Tailwind config |
| `types/` | TypeScript type definitions (core domain types in `types/core.ts`) |
| `utils/` | Pure utility functions |
| `content/` | Blog and static content |
| `supabase/functions/` | Deno Edge Functions |
| `supabase/migrations/` | Database migration files |

### Testing

- **Unit/Integration:** `npm test` (Jest + React Testing Library)
- **Watch mode:** `npm run test:watch`
- **Coverage:** `npm run test:coverage`
- **E2E:** `npm run test:e2e` (Playwright)

### Contributing

- Follow code style enforced by ESLint and Prettier.
- Match existing conventions — server-first architecture, Server Actions for mutations, URL-driven state.
- Update this README if adding significant new capabilities.

---

For architectural standards and code quality rules, see `CLAUDE.md`.
