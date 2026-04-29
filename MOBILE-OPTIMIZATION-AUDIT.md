# Mobile Optimization — Code Quality & Bug Assessment

Branch: `feat/mobile-optimization` | Date: 2026-04-29

## Context

The branch (5 commits, 54 files changed) added responsive layout infrastructure, mobile navigation, touch-optimized UI components, pull-to-refresh, and a floating action button. Several bugs were already fixed (PullToRefresh transform conflict, FAB on consultation page, duplicated FAB handling extracted to `useFABAction` hook, scrollbar-hide utility).

---

## CRITICAL

### 1. `maximumScale: 1.0` blocks user zoom — WCAG 1.4.4 violation

- **File:** `app/layout.tsx:44`
- **Fix:** Change to `maximumScale: 5.0` or remove the line entirely (it defaults to 10). This setting makes the app unusable for visually impaired users.

### 2. N+1 query explosion on patients page (~56 DB round-trips per page load)

- **File:** `app/(app)/patients/[[...slug]]/page.tsx:74-205`
- **What:** For each patient, separate queries run for consultations and prescriptions. For each consultation, `get_doctors_by_clinic` RPC is called again (returning identical data each time). With 8 patients and ~5 consultations each, that's ~56 round-trips.
- **Fix:** Call `get_doctors_by_clinic` once outside all loops. Use batched queries. Filter to "Completed" consultations BEFORE fetching doctors (currently all doctor data for non-completed consultations is fetched then discarded at lines 195-198).

### 3. Missing query cache invalidation when restarting existing consultations

- **File:** `hooks/useAppointments.ts:237-243`
- **What:** When an existing consultation is found for an appointment, the status is updated to `IN_PROGRESS` but the query cache is NOT invalidated. The "new consultation" path (lines 281-282) correctly invalidates both `appointments` and `clinic-billing-summary` queries. This causes stale appointment list data.
- **Fix:** Add `queryClient.invalidateQueries(...)` calls matching the new-consultation path.

### 4. Potential runtime TypeError: `total_amount.toFixed(2)` on null

- **Files:** `components/pharmacy/InventoryTab.tsx:78`, `components/pharmacy/ProcurementsHistoryTab.tsx:78`
- **What:** If `total_amount` is null in the database, calling `.toFixed(2)` throws. No null guard exists.
- **Fix:** Use optional chaining or a fallback: `proc.total_amount?.toFixed(2) ?? "0.00"`

---

## HIGH

### 5. `navItems` array duplicated between MobileNav and AppSidebar — WILL diverge

- **Files:** `components/MobileNav.tsx:35-43`, `components/AppSidebar.tsx:16-24`
- **Fix:** Extract to a shared config file (e.g., `config/navigation.ts`).

### 6. `<button>` used for navigation instead of `<Link>` — no right-click, no prefetch

- **File:** `components/MobileNav.tsx:100-118`
- **What:** Nav items use `<button onClick={() => router.push(path)}>`. This breaks right-click/open-in-new-tab, middle-click, and Next.js prefetching.
- **Fix:** Use `<Link href={path}>` with the same className, wrapped in `<DrawerClose>` for auto-close behavior.

### 7. FAB uses array index as React key

- **File:** `components/ui/floating-action-button.tsx:72`
- **What:** `[...actions].reverse().map((action, index) => <Tooltip key={index}>)` — if actions are reordered/added/removed, React reconciliation breaks.
- **Fix:** Add an `id` field to `FABAction` type in `fab-utils.tsx` and use `key={action.id}`.

### 8. `sidebarOpen` prop accepted but never used

- **File:** `components/ClinicSwitcher.tsx:11`
- **What:** The prop is passed from both AppSidebar (`true`) and MobileNav (`false`) but the component never reads it. Dead prop.
- **Fix:** Either remove the prop entirely or implement different styling for sidebar vs. drawer context.

### 9. Unused `AppHeader` import

- **File:** `app/layout.tsx:7`
- **What:** `import { AppHeader } from '@/components/AppHeader'` is imported but never referenced anywhere in the file.
- **Fix:** Remove the import.

### 10. Razorpay script tag leaks on unmount

- **File:** `components/payments/CreditPurchaseModal.tsx:90-96`
- **What:** Script appended to `document.body` on mount but never cleaned up. Repeated open/close accumulates script tags.
- **Fix:** Track the script element in a ref and remove it in the useEffect cleanup.

### 11. Pull-to-refresh missing `touch-action` CSS

- **File:** `components/ui/pull-to-refresh.tsx:75-79`
- **What:** No `touch-action: pan-y` (or similar) on the pull container. Mobile browsers may interpret downward swipes as native pull-to-refresh or scroll, competing with the JS handler.
- **Fix:** Add `style={{ touchAction: "pan-y" }}` on the container div.

### 12. Badge double-styling: both `variant` and custom CSS class applied

- **File:** `components/dashboard/UpcomingAppointmentsList.tsx:116`
- **What:** `variant={getStatusVariant(status)}` AND `className={getStatusBadgeClass(status)}` are both applied. Two separate switch statements on the same value (lines 31-59). The custom CSS classes may conflict with the variant's generated styles.
- **Fix:** Pick one mechanism. Remove the `getStatusBadgeClass` function and its associated CSS classes if the variant renders correctly, or consolidate into a single mapping object.

### 13. `flex` on SVG element should be `mx-auto`

- **File:** `components/superadmin/ClinicDepartmentsManagement.tsx:316`
- **What:** `<Building2 className="h-5 w-5 flex mb-3 opacity-50" />` — `flex` sets `display: flex` on an SVG, which does nothing for centering. The icon won't be centered. Identical empty-state patterns elsewhere (e.g., `ClinicMembersManagement.tsx:195`) use `mx-auto`.
- **Fix:** Replace `flex` with `mx-auto`.

---

## MEDIUM

### 14. Console.log statements in production code

- **Files:** 12+ files across the codebase. Heaviest in:
  - `app/(app)/consultation/[appointmentId]/page.tsx` (lines 93, 113, 142-147, 167-176, 183-198)
  - `hooks/consultation/useConsultationForm.ts` (lines 136-146, 209-234, 502-613)
  - `hooks/useClinicData.ts` (lines 42-286)
  - `hooks/useAuth.ts` (lines 29-202)
  - `app/(public)/page.tsx` (lines 802-835)
- **Impact:** Leaks PII (patient names, appointment IDs, email addresses), clutters console, adds noise.
- **Fix:** Remove or guard with `if (process.env.NODE_ENV === "development")`.

### 15. `useFABAction` handled ref never resets — one-shot only

- **File:** `hooks/useFABAction.ts:9-17`
- **What:** `handled.current` is set to `true` and never reset. On SPA navigation where the component stays mounted, a new `?action=new` param won't re-trigger. The only way to reset is full unmount/remount.
- **Fix:** Reset `handled.current` to `false` when `searchParams.get("action")` is not the target action, or use a key based on the searchParams value.

### 16. FAB missing ARIA menu pattern

- **File:** `components/ui/floating-action-button.tsx`
- **Issues:**
  - No `aria-expanded` on toggle button (line 93)
  - No `role="menu"` on action container / `role="menuitem"` on action buttons (lines 70-88)
  - No focus management on open/close (focus stays on toggle; on close, focus lost)
- **Fix:** Add `aria-expanded={isOpen}`, wrap actions in `role="menu"`, each with `role="menuitem"`, focus first item on open.

### 17. `isActiveLink` duplicated in MobileNav and AppSidebar

- **Files:** `components/MobileNav.tsx:51-63`, `components/AppSidebar.tsx:32-46`
- **Fix:** Extract to `lib/navigation.ts` or similar shared utility.

### 18. `info` color lacks alpha-value support in tailwind config

- **File:** `tailwind.config.ts:150-151`
- **What:** `DEFAULT` and `foreground` for `info` use `hsl(var(--info))` without `/ <alpha-value>`. All other base colors include it. Opacity modifiers like `bg-info/50` will fail.
- **Fix:** Add `/ <alpha-value>` suffix.

### 19. Tailwind shade color config (50–950) has no CSS variable definitions

- **Files:** `tailwind.config.ts` (declares 50–950 shades for primary, secondary, destructive, muted, accent, success, warning, info) but `globals.css` defines only base (DEFAULT, foreground) variables plus `--neutral-50/100/900`.
- **Impact:** Low currently — no code in the project uses the shade classes (verified via grep). This is dead config.
- **Fix:** Either remove the unused shade definitions from tailwind.config.ts or add the CSS variable definitions to globals.css if shades will be needed.

### 20. Unsafe type assertion on `activeClinicRole`

- **File:** `components/Layout.tsx:19`
- **What:** `activeClinicRole as "staff" | "doctor" | "superadmin" | null` — if the auth context returns an unexpected value (e.g., `undefined`, misspelled role), it passes through silently.
- **Fix:** Use a type guard or validate the value at runtime.

### 21. `location` variable name shadows `window.location`

- **Files:** `components/MobileNav.tsx:48`, `components/AppSidebar.tsx:29`, `components/AppHeader.tsx:48`
- **What:** `const location = usePathname()` shadows the global `window.location`, but `usePathname()` returns only the pathname string, not a Location object. Misleading during debugging.
- **Fix:** Rename to `pathname` (already the convention used in `Layout.tsx:16`).

### 22. Patient list items missing keyboard accessibility

- **File:** `components/patients/PatientList.tsx:54`
- **What:** Clickable patient `<div>` elements have `onClick` and `cursor-pointer` but no `role="button"`, `tabIndex={0}`, or keyboard handlers. Keyboard-only users cannot interact.
- **Fix:** Add `role="button"`, `tabIndex={0}`, and `onKeyDown` handler.

### 23. Missing Space key handler in UpcomingAppointmentsList

- **File:** `components/dashboard/UpcomingAppointmentsList.tsx:112`
- **What:** Only Enter key is handled; Space (required by WAI-ARIA for elements with `role="button"`) is missing.
- **Fix:** Add `e.key === ' '` to the key handler condition.

### 24. Calendar navigation chevrons lack `aria-label`

- **File:** `components/ui/calendar.tsx:56-57`
- **What:** Previous/next month buttons have no accessible labels. Screen readers announce generic "button".
- **Fix:** Add `aria-label="Previous month"` and `aria-label="Next month"`.

### 25. Empty `<main>` top margin on mobile

- **File:** `components/Layout.tsx:35`
- **What:** `mt-14` (3.5rem) creates empty whitespace above content on mobile. The only sibling at the top is the MobileNav hamburger button (fixed positioned at `top-0`), so there's nothing occupying that 56px gap.
- **Fix:** Reduce to `mt-12` or verify whether the space is needed.

---

## LOW / NICE-TO-HAVE

- **Commented-out Tawk.to script** (`app/layout.tsx:60-77`) — remove dead code; git history preserves it.
- **`import React` instead of `import type { ReactNode }`** (`components/ui/fab-utils.tsx:1`) — produces smaller bundles with type-only import.
- **Manual `<div>` separator instead of `<Separator>`** (`components/ClinicSwitcher.tsx:76`) — inconsistent with MobileNav and AppSidebar which use the shadcn/ui `<Separator>`.
- **Missing empty state in PatientList** (`components/patients/PatientList.tsx:41-80`) — when array is empty and not loading, renders blank space with no message.
- **PWA manifest missing 512x512 icon** (`public/manifest.json`) — some browsers require it for PWA installation.
- **Trailing whitespace in button variant** (`components/ui/button.tsx:15`) — `"border  hover:..."` has double space.
- **Textarea uses `bg-card`, input uses no explicit bg** — inconsistent between sibling components.
- **No `prefers-reduced-motion` support** (`app/globals.css`) — WCAG 2.3.3; animations should respect system preference.
- **`window.innerWidth < 1024` used for mobile detection** (`pull-to-refresh.tsx:29`, `floating-action-button.tsx:34`) — fails on touch-enabled laptops/desktops. Prefer `matchMedia('(pointer: coarse)')`.
- **`transition-all` on pull indicator is overly broad** (`pull-to-refresh.tsx:84`) — should scope to specific properties like `transition-[height,top]`.
- **`parseInt` without radix** (`CreditPurchaseModal.tsx:125`) — should be `parseInt(customAmount, 10)`.
- **Mutation loading state replaces entire list with skeletons** (`ClinicDepartmentsManagement.tsx:173-174`) — `isLoading` combines query loading with mutation pending, causing jarring flash when toggling a department.
- **Labels missing `htmlFor` and inputs missing `id`** (`ClinicDetailsManagement.tsx:249-263`) — clicking label text doesn't focus the associated input.
- **`itemsPerPage` in useMemo deps** (`billing/page.tsx:230`) — module-level constant that never changes; unnecessary dependency.
- **`useRouter` imported but unused** (`billing/page.tsx:4`).
- **Hardcoded Tailwind colors** (`ProcurementsHistoryTab.tsx:64,122` — `bg-green-500`) — should use theme tokens like `bg-success`.
- **No server-side pagination on appointments** (`hooks/useAppointments.ts:61-103`) — fetches ALL appointments then paginates client-side. For clinics with thousands of appointments, this is a scalability concern.
- **Loading skeleton shows 4 items, but page size is 5** (`UpcomingAppointmentsList.tsx:89`) — mismatch.
- **`onOpenChange` inline arrow in appointments page** (`appointments/page.tsx:181-183`) — new reference on every render.
- **`handleCancelAppointment` creates new arrow each render** (`hooks/useAppointments.ts:308`) — fresh reference per render for every consumer.
- **`CreditPurchaseModal` useEffect may overwrite user selection** (lines 99-107) — if credit packages load while modal is open, effect fires and overwrites the user's current custom amount selection.
