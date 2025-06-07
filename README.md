#  Clinic Management Platform

## Overview

 is a multi-tenant web application for Neurology and Ophthalmology clinics. It provides robust management of appointments, patients, medical records, billing, and notifications, with strict data isolation and role-based access.

## Features

### Multi-Tenancy & Security
- **Clinic Isolation:** All data is partitioned by `clinic_id` with Row-Level Security (RLS) enforced at the database level.
- **Role-Based Access:** Supports `superadmin`, `staff`, and `doctor` roles, each with tailored permissions and UI.
- **Google OAuth:** Secure authentication and session management.

### User & Member Management
- **Unified Member Invitation:** Invite any user (doctor, staff, superadmin) to a clinic via the `invite-member` Edge Function. Handles user creation, clinic membership, and doctor profile setup.
- **Profile Completion:** Invited users set their password and complete their profile on first login.
- **Role & Department Management:** Assign and edit roles and departments for each member. Remove members with confirmation.

### Clinic & Department Management
- **Settings Page:** Manage clinic details, departments, and members from a unified settings interface.
- **Department Types:** Support for Neurology, Ophthalmology, and custom departments.

### Appointments & Consultations
- **Appointment Scheduling:** Book, view, and manage appointments with status tracking.
- **Consultations:** Record clinical notes and specialty data, linked to appointments.

### Patients & Medical Records
- **Patient Profiles:** Add, edit, and view patient information.
- **Medical Records:** Manage diagnoses, treatment plans, and prescriptions.

### Billing
- **Bill Management:** Create, update, and track bills and payment status.

### Dashboards
- **Role-Specific Dashboards:** Superadmin, Staff, and Doctor dashboards with relevant stats, charts, and quick actions.

### UI/UX
- **Modern Interface:** Built with Vite, React, TypeScript, Tailwind CSS, and Shadcn UI.
- **React Query:** Efficient data fetching and caching.
- **Form Validation:** All forms use zod for validation.
- **Notifications:** User feedback via toast notifications.

### Integrations
- **Supabase:** Database, authentication, and Edge Functions.
- **Twilio & Resend:** WhatsApp and email notifications (planned/partial).
- **Vitest:** Comprehensive testing for components and API.

## Security: Row Level Security (RLS)

- RLS is **enabled** on the `doctors` table.
- Policies enforce strict multi-tenancy and role-based access:
  - Users can only view/edit their own doctor profile.
  - Clinic members can view all doctors in their clinic.
  - No cross-clinic access is possible.
- See migration: `supabase/migrations/20240608_enable_rls_doctors.sql`
- This is critical for security and compliance in a multi-tenant environment.

## Developer Guide

### Setup

```sh
git clone <YOUR_GIT_URL>
cd <YOUR_PROJECT_NAME>
npm install
cp .env.example .env.local # Add your Supabase keys
npm run dev
```

### Deployment

- **Frontend:** Deploy on Vercel.
- **Backend:** Use Supabase CLI for migrations and Edge Function deployment.
- **Edge Functions:** Deploy with `supabase functions deploy invite-member`.

### Member Invitation Flow

The process for inviting and adding any member (doctor, staff, superadmin) to a clinic is handled by the `invite-member` Edge Function. The frontend calls this function directly, passing the user's email, role, department, and other details. The Edge Function is responsible for user creation/lookup, adding to `clinic_members`, and adding/updating the `doctors` table entry if the role is doctor.

### Code Structure

- `src/components/`: All UI components, including role-based dashboards, modals, and management screens.
- `src/pages/`: Main route pages (Dashboard, Appointments, Patients, Billing, Settings, etc.).
- `src/contexts/`: Context providers (e.g., AuthContext).
- `src/hooks/`: Custom React hooks for data fetching and logic.
- `src/integrations/supabase/`: Supabase client and generated types.
- `supabase/functions/`: Edge Functions (notably `invite-member`).
- `supabase/migrations/`, `supabase/migrations_2/`: Database migrations.

### Testing

- Run all tests with `npm run test`.
- Target 80%+ coverage for components, hooks, and API.

### Contributing

- Follow code style enforced by ESLint and Prettier.
- Document all major changes in `development-log.md`.
- Update `README.md` and `.env.example` as needed.

---

For more details, see the project rules in `.cursor/rules/project-rules.mdc` and the full codebase.
