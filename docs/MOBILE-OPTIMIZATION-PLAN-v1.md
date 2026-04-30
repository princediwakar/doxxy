# Mobile Optimization Plan - Doxxy

> **Status**: Phase 3 Complete
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

**Status**: ✅ Complete

**Files:**
- `components/appointments/AppointmentsTable.tsx` - **Updated**
- `app/(app)/billing/page.tsx` - **Updated**

**Strategy:**
```
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

**Status**: ✅ Complete

**Files:**
- `components/patients/PatientList.tsx` (line 40: fixed `h-[600px]`) - **Updated**

**Changes:**
- Remove fixed height: `h-[600px]` → `h-auto sm:h-[600px]`
- Auto-height scroll area for mobile
- Larger touch targets in pagination: `min-h-[44px] min-w-[44px]`

### 2.3 Touch Targets

**Status**: ✅ Complete

**Files:**
- `components/ui/button.tsx` - **Updated**
- `components/ui/input.tsx` - **Updated**
- `components/ui/textarea.tsx` - **Updated**
- `components/ui/select.tsx` - **Updated**

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

### Role-Based Mobile Priorities

**Staff (Primary Mobile Users)**
- Appointment Scheduling
- Patient Creation/Registration
- Billing (view + create)
- Pharmacy (view + manage)

**Doctors (Secondary Mobile Users)**
- Starting/Continuing Consultations
- Creating Prescriptions
- Viewing Patient History

**Superadmins (Full Mobile - can do everything)**
- All staff actions
- All doctor actions
- Settings

### Priority Matrix

| Priority | Feature | User Role | Mobile Optimization |
|----------|---------|-----------|-------------------|
| **P1** | Today's Appointments | Staff, Doctor | Quick card list with swipe actions |
| **P1** | Start/Continue Consultation | Doctor | One-tap start button |
| **P1** | Patient Quick Search | Staff | Fast search with autocomplete |
| **P1** | New Walk-in Appointment | Staff | Quick patient search → create flow |
| **P1** | Patient Check-in | Staff | One-tap arrival mark |
| **P2** | Create Prescription | Doctor | Simplified mobile form |
| **P2** | View Patient History | Doctor, Staff | Read-only card view |
| **P2** | Billing (Full) | Staff | Quick stats + list + create |
| **P2** | Patient Registration | Staff | Simplified mobile form |
| **P3** | Pharmacy Management | Staff | Full responsive + inventory |
| **P3** | Full Consultation Form | Doctor | Expandable sections |
| **P4** | Settings/Profile | All | Low priority, desktop for superadmin |

### Mobile-First Views

Create simplified role-specific dashboards with quick actions:

**Doctor Mobile (P1 for Doctors):**
1. Start next appointment (one tap)
2. Continue current consultation
3. View today's patient list
4. Quick prescription creation

**Staff Mobile (P1 for Staff):**
1. Today's appointments (cards with swipe actions)
2. Patient quick search
3. New walk-in appointment
4. Patient check-in
5. Quick billing view

### Mobile-Specific UI Patterns

**Floating Action Button (FAB):**
- Quick-create actions from any screen
- Options: New Appointment, New Patient, New Bill

**Swipe Actions on Appointment Cards:**
- Swipe left = Check-in (mark arrived)
- Swipe right = Start consultation (doctor only)
- Tap = View details

**Pull-to-Refresh:**
- All list views

### Feature Completeness by Role

#### STAFF - Full Mobile Support (Responsive)
| Feature | Desktop | Tablet | Mobile |
|---------|---------|--------|--------|
| Today's Appointments | Full table | Cards | Cards + swipe |
| New Appointment | Full form | Streamlined | Streamlined |
| Patient Search | Full table | Cards | Cards |
| Patient Registration | Full form | Streamlined | Streamlined |
| Billing View | Full table | Cards | Cards |
| Create Bill | Full form | Streamlined | Streamlined |
| Pharmacy View | Full table | Cards | Cards |
| Pharmacy Management | Full table | Cards | Cards |

#### DOCTOR - Essential Mobile Support
| Feature | Desktop | Tablet | Mobile |
|---------|---------|--------|--------|
| Today's Patients | Full table | Cards | Cards |
| Start Consultation | Full page | Streamlined | One-tap |
| Continue Consultation | Full page | Expandable | Expandable |
| Create Prescription | Full form | Simplified | Simplified |
| Patient History | Full table | Cards | Read-only cards |

#### SUPERADMIN - Full Mobile Support (Like Staff)
| Feature | Desktop | Tablet | Mobile |
|---------|---------|--------|--------|
| Dashboard Stats | Full | Cards | Cards |
| Today's Appointments | Full table | Cards | Cards + swipe |
| New Appointment | Full form | Streamlined | Streamlined |
| Patient Search | Full table | Cards | Cards |
| Patient Registration | Full form | Streamlined | Streamlined |
| Billing View/Create | Full table | Cards | Cards |
| Pharmacy Management | Full table | Cards | Cards |
| Settings | Full | Full | Full |

---

## Phase 4: Implementation Roadmap

### Sprint 1: Foundation
- [x] Mobile navigation drawer
- [x] Responsive layout (sidebar hidden on mobile)
- [x] Container/breakpoint fixes
- [ ] PWA manifest review

### Sprint 2: Core Mobile Views
- [x] Appointments mobile cards
- [x] Patient list responsive height
- [x] Touch target fixes
- [x] Button sizes

### Sprint 3: Mobile Optimizations
- [x] Consultation collapsible sections
- [x] Mobile dashboard shortcuts
- [x] Quick-action FAB (floating action button)
- [x] Swipe actions on appointment cards
- [x] Pull-to-refresh on all lists

### Sprint 3a: Staff Full Mobile (Priority)
- [x] Appointments mobile cards + swipe check-in
- [x] Mobile patient search + registration
- [x] Billing responsive (full mobile support)
- [x] Pharmacy responsive (full mobile support)

### Sprint 3b: Doctor Mobile Essential
- [x] One-tap consultation start
- [x] Simplified prescription form
- [x] Patient history cards

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