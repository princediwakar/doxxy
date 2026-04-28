# Mobile Optimization Plan - Doxxy

> **Status**: Phase 1 In Progress  
> **Last Updated**: 2026-04-28

---

## Executive Summary

This is a **clinic management system** with roles: superadmin, staff, doctor. Currently it's desktop-first with broken mobile layout - the sidebar (256px fixed) blocks content, tables overflow, and no touch optimization exists.

**The good news**: The app already has mobile-friendly components (Drawer from Vaul, Sheet from Radix, Collapsible from Radix), they're just not applied to navigation. Consultation page already uses collapsible sections.

---

## Phase 1: Responsive Layout Infrastructure (Priority = P1)

### 1.1 Mobile Navigation System

**Status**: ✅ Complete

**Files:**
- `components/Layout.tsx` - Main layout container - **Updated**
- `components/AppSidebar.tsx` - Existing sidebar (desktop only) - **Updated**
- `components/MobileNav.tsx` - Mobile drawer navigation - **Created**

**Strategy:**
```
Desktop (≥1024px): Fixed sidebar left (288px), content right
Mobile (<1024px): Hidden sidebar, hamburger icon in header, drawer navigation
```

**Implementation:**
1. ✅ Added `MobileNav` component using existing `Drawer` from Vaul
2. ✅ Modified `Layout` to detect screen size (CSS)
3. ✅ Hide sidebar on mobile: `hidden lg:flex`
4. ✅ Show hamburger on mobile: `lg:hidden`

### 1.2 Breakpoints & Container

**Status**: ✅ Complete

**Files:**
- `tailwind.config.ts` - Tailwind configuration - **Updated**

**Changes:**
- ✅ Container padding: `2rem` → `1rem sm:2rem` (mobile-first)

### 1.3 PWA & Viewport Meta

**Status**: ✅ Complete

**Files:**
- `app/layout.tsx` - Root layout - **Updated**
- `public/manifest.json` - PWA manifest - **Updated**

**Changes:**
- ✅ Viewport meta tag: Added `maximum-scale=1.0` to prevent zoom on mobile
- ✅ Updated manifest with `apple-touch-icon` using existing doxxy.png
- ⬜ Add service worker for offline caching (Phase 4)

---

### 1.4 Calendar Mobile Optimization

**Status**: ✅ Complete

**Files:**
- `components/ui/calendar.tsx` - **Updated**

**Changes:**
- ✅ Increased touch targets from 36px to 40px (mobile), 36px (desktop)
- ✅ Nav buttons: h-9 w-9 (mobile), h-7 w-7 (desktop)
- ✅ Day cells: h-10 w-10 (mobile), h-9 w-9 (desktop)

---

## Phase 2: Touch Optimization & Mobile Views

### 2.1 Tables → Cards

**Files:**
- `components/appointments/AppointmentsTable.tsx`
- `components/billing/page.tsx`

**Strategy:**
```tsx
// Desktop: Full table
// Mobile: Card list view
<div className="hidden md:block">
  <Table>...</Table>
</div>
<div className="md:hidden space-y-2">
  {appointments.map(apt => <AppointmentCard />)}
</div>
```

### 2.2 Patient List Stack

**Files:**
- `components/patients/PatientList.tsx` (line 40: fixed `h-[600px]`)

**Changes:**
- Remove fixed height: `h-[600px]` → `h-auto sm:h-[600px]`
- Auto-height scroll area for mobile

### 2.3 Touch Targets

**Files:**
- All modal components
- `components/ui/button.tsx`

**Minimum targets:**
- Buttons: `44px × 44px` minimum
- Form inputs: `48px` height
- Use `touch-manipulation` CSS where needed

### 2.4 Consultation Page Mobile

**Files:**
- `app/(app)/consultation/[appointmentId]/page.tsx`
- `components/consultation/PatientSidebar.tsx`

**Changes:**
- Collapsible sections already implemented (uses `Collapsible` component)
- 4-column grid (line 360) needs responsive: `grid-cols-1 lg:grid-cols-4` → mobile-first `grid-cols-1`, 2-col on tablet, 4-col on desktop
- PatientSidebar hidden on mobile (`hidden lg:block lg:col-span-1`)
- Full-width form on mobile (`w-full`)
- Larger touch targets for form fields

---

## Phase 3: Feature Prioritization (Mobile-First)

### Priority Matrix

| Priority | Feature | User Role | Mobile Optimization |
|----------|---------|-----------|-------------------|
| **P1** | View Today's Appointments | Staff, Doctor | Quick card list, swipe actions |
| **P1** | Start/Continue Consultation | Doctor | One-tap start button |
| **P1** | New Appointment (walk-in) | Staff | Quick patient search → one-tap create |
| **P2** | View Patient History | Doctor | Read-only, optimized for scrolling |
| **P2** | Create Prescription | Doctor | Simplified form |
| **P2** | View Billing | Staff | Quick stats + list |
| **P3** | Full Consultation Form | Doctor | Expandable sections |
| **P3** | Pharmacy Management | Staff | View-only |
| **P4** | Settings/Profile | All | Low priority |

### Mobile-First Views

Create simplified "Doctor Dashboard Mobile" and "Staff Dashboard Mobile":

**Doctor Mobile quick actions:**
1. Start next appointment (one tap)
2. Continue current consultation
3. View today's patient list

**Staff Mobile quick actions:**
1. Quick new appointment (patient search + create)
2. Today's appointments list

---

## Phase 4: Implementation Roadmap

### Sprint 1: Foundation
- [x] Mobile navigation drawer
- [x] Responsive layout (sidebar hidden on mobile)
- [x] Container/breakpoint fixes
- [ ] PWA manifest review

### Sprint 2: Core Mobile Views
- [ ] Appointments mobile cards
- [ ] Patient list responsive height
- [ ] Touch target fixes
- [ ] Button sizes

### Sprint 3: Mobile Optimizations
- [ ] Consultation collapsible sections
- [ ] Mobile dashboard shortcuts
- [ ] Quick-action FAB (floating action button)

### Sprint 4: Polish
- [ ] Offline support (service worker)
  - Implement caching strategy for static assets
  - Consider network-first for API calls (patient data needs to be fresh)
  - Cache-only for static images/icons
- [ ] Loading & error states mobile-optimized
  - Skeleton screens for lists
  - Inline error messages (not toast-heavy on mobile)
- [ ] Performance optimization
  - Bundle analysis for mobile
  - Lazy load consultation components
- [ ] Testing on real devices

---

## Technical Notes

### Existing Components to Leverage
- `components/ui/drawer.tsx` - Already exists, from Vaul
- `components/ui/sheet.tsx` - Already exists, from Radix (side sheets for modals)
- `components/ui/collapsible.tsx` - Already used in consultation page
- Responsive grid: Most pages already use `md:grid-cols-X`
- Tailwind Breakpoints used: `sm:`, `md:`, `lg:`

### Code Patterns to Change
```tsx
// Before (broken)
<div className="flex flex-col h-screen sticky top-0 left-0 w-64">
  <AppSidebar />
</div>

// After (responsive)
<div className="hidden lg:flex lg:flex-col lg:w-72 fixed left-0 top-0 h-screen">
  <AppSidebar />
</div>
// Plus mobile drawer trigger in header
```

## Appendix

### Key Files to Review
- `components/Layout.tsx` - Main layout container (flex layout)
- `components/AppSidebar.tsx` - Existing sidebar (needs responsive hiding)
- `components/patients/PatientList.tsx` - Line 40: fixed `h-[600px]`
- `components/appointments/AppointmentsTable.tsx` - Needs card view on mobile
- `app/(app)/consultation/[appointmentId]/page.tsx` - Uses Collapsible, 4-col grid layout
- `components/consultation/PatientSidebar.tsx` - Hidden on mobile
- `components/ui/calendar.tsx` - react-day-picker mobile issues
- `components/ui/button.tsx` - `h-10` (40px) default, needs 44px minimum

### Tailwind Breakpoints Reference
```ts
// tailwind.config.ts
screens: {
  'sm': '640px',
  'md': '768px',  // Tablet
  'lg': '1024px', // Desktop
  'xl': '1280px',
  '2xl': '1400px',
}
```

### Role-Based Routes
```
/dashboard      - superadmin, staff, doctor
/appointments  - staff, doctor, superadmin
/patients      - staff, doctor, superadmin
/billing       - staff, doctor, superadmin
/pharmacy      - staff, superadmin
/profile      - all
/settings     - superadmin
```