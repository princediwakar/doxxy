# Cursor Agent User Rules for Neurovision Clinic Management

## 1. Project Context
- This is a multi-tenant clinic management web app for Neurology and Ophthalmology clinics.
- Tech stack: Vite (React + TypeScript), Tailwind CSS, Shadcn UI, Supabase (with RLS), Google OAuth, React Query, zod, Twilio, Resend.
- All code, migrations, and policies must support strict multi-tenancy and role-based access.

---

## 2. Agent Behavior
- **Act autonomously:** When given a task, make all necessary code, config, and migration changes without waiting for further user confirmation, unless the task is ambiguous or destructive.
- **Always update all relevant files:** If a change requires updates in multiple files (e.g., types, hooks, UI, migrations), make all changes in one go.
- **Keep the project running:** After any change, ensure the project builds and runs without errors or linter issues.
- **Use the latest schema:** Always reference the latest Supabase types and schema for all backend and frontend changes.
- **Update and deploy Edge Functions as needed:** If a schema or logic change affects an Edge Function, update and redeploy it automatically.

---

## 3. Best Practices
- **TypeScript:** Use strict typing. Always update types in `src/integrations/supabase/types.ts` and related files.
- **React Query:** Use for all data fetching. Hooks must be filtered by `clinic_id` and role.
- **zod:** Use for all form validation.
- **RLS:** All data access must be protected by Row Level Security. Generate and apply SQL migrations for new/updated policies.
- **Multi-tenancy:** All tables must be filtered by `clinic_id`. Never expose data across clinics.
- **Role-based UI:** Render only the UI components allowed for the current user's role and clinic context.
- **Onboarding:** Ensure onboarding flow is robust, with no infinite loops or unnecessary network calls.
- **Edge Functions:** Use the service role key for admin actions. Always return clear, typed responses.

---

## 4. File and Naming Conventions
- **Components:** `src/components/role/RoleComponent.tsx` (PascalCase).
- **Types:** `src/integrations/supabase/types.ts` and `src/types/feature.ts`.
- **Hooks:** `src/hooks/useFeature.ts`.
- **Edge Functions:** `supabase/functions/function-name/index.ts`.
- **Migrations:** `supabase/migrations/timestamp_description.sql`.
- **Tests:** Use Vitest for all new features and bug fixes.

---

## 5. Documentation and Logging
- **Update `development-log.md`** after every significant change.
- **Update `README.md`** if setup, deployment, or environment variables change.
- **Add comments** to all non-trivial code, especially for RLS policies and onboarding logic.

---

## 6. Security
- **Never leak secrets** (service role keys, etc.) in code or logs.
- **Validate all user input** with zod before sending to Supabase or Edge Functions.
- **Enforce RLS** for all tables, especially `clinic_members`, `appointments`, `consultations`, `bills`, and `medical_records`.

---

## 7. Agent-Specific Instructions
- **If a user asks for a change, implement it directly** (unless it's ambiguous or dangerous).
- **If a change requires a migration, generate and apply it.**
- **If a change requires an Edge Function update, update and redeploy it.**
- **If a change requires new types, generate them and update all usages.**
- **If a change requires UI, backend, and RLS updates, do all in one go.**
- **If a linter or build error is introduced, fix it immediately.**
- **If a user asks for a summary, provide a concise, actionable summary.**
- **If a user asks for a test, generate a Vitest test and update the log.**
- **If a user asks for a new role, update types, RLS, and UI.**
- **If a user asks for onboarding or auth changes, update all relevant flows and policies.**

---

## 8. When in Doubt
- **Ask for clarification** only if the user's request is ambiguous or could cause data loss.
- **Otherwise, act as a full agent and complete the task end-to-end.**

---

**With these rules, Cursor's Agent will be fully optimized for your Neurovision project, ensuring safe, robust, and autonomous development.** 