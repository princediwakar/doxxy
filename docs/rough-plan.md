# Doxxy — Prioritized Build Plan
> Based on current product state, client clinic profile (2 doctors, pharmacy, optical, physio, tests, 2 beds), and competitive positioning vs. ekacare.

---

## Context & Core Insight

The billing modal is the central nervous system of Doxxy. The architecture is right — one place, all line items, appointment pre-filled, consultation fee auto-populated. The critical problem: the medicine search pulls from a master table, not live inventory. This one disconnection cascades into every other gap.

**The chain:** Inventory import → live stock in bills → standalone dispensing works → stock decrements correctly → unified billing becomes possible.

You cannot skip steps in this chain. Fix the foundation first.

---

## Phase 1 — Foundation
### Make the product actually usable for this clinic
> Nothing else matters until these are done. The current client cannot go fully live without all five.

---

### 1.1 Pharmacy Inventory Bulk Import

**Priority:** Blocker  
**Effort:** Medium (3–5 days)

**Problem:**  
No pharmacy has fewer than 300 SKUs. The current "Add New Stock" modal requires entering medicines one row at a time. This is why the pharmacy module is empty. Until inventory is populated, the bill screen pulls from the master table, stock can never be decremented, and the pharmacy product doesn't exist in any meaningful sense.

**What to build:**
- Accept any CSV or Excel file upload — do not require a fixed template
- Use AI to map the uploaded columns to Doxxy's schema: Medicine Name, Batch No., Expiry Date, Qty, MRP, Purchase Price
- Show a 5-row preview with the mapped columns before confirming
- Handle duplicates: if a medicine already exists in inventory, show a "merge or add new batch" choice
- On confirm, bulk-insert all rows into the pharmacy inventory

**Implementation note:**  
Build this as a generic inventory import component. The same logic applies to optical store inventory — build it once, reuse it. The column mapper is the reusable piece.

**Do not:**  
Provide a rigid template and ask them to fill it. Their supplier already gives them an invoice or Excel. Make Doxxy accept that file.

---

### 1.2 Connect Bill Medicine Search → Live Inventory

**Priority:** Blocker  
**Effort:** Medium (2–3 days)

**Problem:**  
The medicine dropdown in the bill modal pulls from the master medicines table. It needs to pull from the clinic's actual stock. Selling from the bill currently does not decrement any inventory. Stock levels are meaningless.

**What to build:**
- Medicine search in the bill modal queries the clinic's inventory, not the master table
- Each result shows: medicine name, composition, batch number, expiry date, available stock qty, MRP (from that batch)
- MRP auto-fills from the inventory batch when a medicine is selected — not from the master table
- If qty on bill exceeds available stock, show an inline warning (do not hard-block)
- Saving/confirming the bill writes a stock deduction transaction against the relevant batch
- Show "Out of Stock" label on medicines with zero qty

**What stays the same:**  
The master medicines table remains as a fallback for medicines not yet in inventory — show these separately as "Not in stock" so the pharmacist is aware.

---

### 1.3 Standalone Pharmacy Dispensing (Walk-in Sale)

**Priority:** Blocker  
**Effort:** Low (1–2 days)

**Problem:**  
A patient walks in and buys medicines with no prior doctor visit. Currently impossible — billing only works from the schedule view tied to an appointment. This is a daily occurrence in every clinic with a pharmacy.

**What to build:**
- "New Sale" button on the pharmacy page
- Opens the existing bill modal with the Appointment field empty (it's already marked Optional in the current UI — this is closer to done than it looks)
- Patient search by name or UHID, or option to create a quick anonymous/walk-in patient
- Medicine line items pull from live inventory (per 1.2 above)
- Saving generates a bill, decrements stock, records payment mode

**What does not change:**  
The bill modal itself. No new component needed. This is a new entry point + ensuring the modal functions correctly with no appointment selected.

---

### 1.4 Staff Queue View — Two Columns, One Per Doctor

**Priority:** Blocker  
**Effort:** Medium (2–3 days)

**Problem:**  
The current schedule shows a single list with a doctor filter dropdown. This is a doctor's view. A staff member managing a 2-doctor clinic needs to see both queues simultaneously — they cannot switch a dropdown to check who's next for each doctor. They will also confuse patients across specialties (ophthalmology vs. neurology) without visual separation.

**What to build:**

*Staff role schedule view:*
- Two columns side by side, one per active doctor for that day
- Each column shows: Token No., Patient Name, Age, Appointment Time, Status
- Status states: Waiting → In Consultation → Done (add "In Consultation" — currently missing)
- "Call Next" button at the top of each column — advances the next Waiting patient to In Consultation
- Token numbers: sequential per doctor per day, reset at midnight

*TV display URL (bonus — zero extra data work):*
- A read-only URL at `/queue/[clinic-id]` or similar
- Shows current token per room: "Dr. Prince — Now Serving: Token 07" and "Dr. Alternate — Now Serving: Token 12"
- Auto-refreshes every 10–15 seconds
- Clinics display this on a waiting room TV or monitor
- No login required for this URL (read-only, no PHI beyond token numbers)

**What stays the same for doctors:**  
Doctors continue to see "My Patients" filtered view — their own queue only.

---

### 1.5 Patient Merge + "In Consultation" Queue State

**Priority:** High  
**Effort:** Low (1 day total)

**Problem A — Dirty patient data:**  
The patients list already contains "Prince Diwakar Prince Diwakar Prince" — a doctor who accidentally registered as a patient during testing. Within weeks of go-live, a real clinic list fills with duplicates, test entries, and misspelled names. Search becomes unreliable and staff loses trust in the system.

**What to build (merge):**
- On the patient profile, a "Merge with another patient" option (accessible to admin/superadmin only)
- Search for the duplicate, preview both records side by side, select which fields to keep
- Merge bills and consultation history under the surviving UHID
- Archive (do not delete) the duplicate record

**Problem B — Missing queue state:**  
There is no "In Consultation" status between Waiting and Completed. Staff currently has no way to know whether the doctor is actively with a patient. They end up walking into the consultation room to check, or sending the next patient in too early.

**What to build:**
- Add "In Consultation" as a third queue state with a distinct colour (e.g. amber dot)
- Triggered when staff clicks "Call Next" or when the doctor opens the consultation view
- Transition: Waiting → In Consultation → Completed

---

## Phase 2 — Billing
### Make it complete, professional, and independent

> Once inventory is live (Phase 1), these features unlock the real daily workflow.

---

### 2.1 Decouple Billing from Visit Completion

**Priority:** High  
**Effort:** Low (1 day)

**Problem:**  
The schedule view shows "Complete the visit to generate a bill." In every Indian clinic, patients pay at the front desk as they leave — while the doctor is still writing notes. Gating billing on the doctor's visit completion means staff is blocked from collecting payment until the doctor acts. This will cause daily frustration.

**What to build:**
- "Create Bill" button on the patient card in the schedule view is always active regardless of visit status
- Consultation fee line item still auto-populates from the appointment
- Doctor completing the visit later (for notes/EMR) does not affect billing
- A bill can exist against an appointment that is still in "Waiting" or "In Consultation" status

---

### 2.2 Configurable Services Catalogue

**Priority:** High  
**Effort:** Low–Medium (2 days)

**Problem:**  
The current bill has a "Service description" free-text row. Every time staff types "Consultation Fee," "Eye Test," "Blood Sugar Test," they waste time and introduce inconsistencies. There is no standard pricing, no analytics, and no auto-complete. This also means optical items, test charges, and procedure fees have no structure.

**What to build:**

*Admin setup:*
- A "Services" section in Clinic Settings
- Add/edit/archive service items: Name, Default Price, Category (Consultation / Test / Procedure / Optical / Other)
- Clinic admin pre-configures all common services once

*In the bill modal:*
- The "Service description" free-text row becomes a searchable dropdown from the configured services catalogue
- Selecting a service auto-fills the price (editable)
- Staff can still add a custom free-text item if needed (for edge cases)

**This also solves optical billing:**  
"Frame — Ray-Ban 3502," "Single Vision Lens," "Anti-Reflective Coating" are just service catalogue items with prices. No separate optical billing module needed at this stage.

---

### 2.3 Payment Mode Capture + Printable Bill

**Priority:** High  
**Effort:** Low (1–2 days)

**Problem:**  
The current bill does not capture how the patient paid (Cash / UPI / Card / Pending). Without this, day-end reconciliation is impossible and the clinic cannot track outstanding dues.

**What to build:**

*On the bill modal:*
- Payment mode selector: Cash / UPI / Card / Pending (insurance or credit)
- For UPI/card, optional reference number field
- "Pending" flags the bill as an outstanding due visible on the patient's profile

*Printable bill output:*
- Patient name, UHID, date, time
- Clinic name, address, contact (from clinic settings)
- Itemised line items with qty and amount
- Subtotal, discount (optional), total
- Payment mode and reference
- Print-ready layout, A5 or thermal (58mm / 80mm) format option

**UHID on all printed documents:**  
The UHID (e.g. M26000082) should appear on printed prescriptions, bills, and any slip the patient takes home. This is what makes the clinic feel like a proper institution.

---

### 2.4 Optical — Spectacle Prescription on Patient Record

**Priority:** Medium  
**Effort:** Low–Medium (2 days)

**Problem:**  
The clinic has an optical store. Currently there is nowhere to record a patient's spectacle prescription in the EMR. Doctors are writing it on paper or in a separate system.

**What to build:**

*On the patient/consultation record:*
- An "Eye Prescription" section (visible in ophthalmology consultations)
- Fields per eye (Right / Left): SPH, CYL, AXIS, ADD, Vision (distance and near)
- Stored on the consultation, visible on the patient's history timeline
- Printable as a standalone prescription slip

*Optical inventory:*
- Same bulk import built in Phase 1.1, with an "Optical" category
- Frames and lenses tracked as inventory items
- Dispensed via the bill modal like any other inventory item (stock deducts on billing)

---

### 2.5 Day-End Summary Report

**Priority:** Medium  
**Effort:** Low (1–2 days)

**Problem:**  
At the end of the day, the clinic admin wants to know: how many patients were seen per doctor, total collections by payment mode, pharmacy sales, and outstanding dues. Currently requires manually checking multiple sections.

**What to build:**
- A "Today's Summary" view accessible from the dashboard or analytics section
- Total patients seen, broken down per doctor
- Total billing: OPD fees + pharmacy + optical + other services
- Collections by payment mode: Cash / UPI / Card
- Pending/outstanding dues count and total amount
- Pharmacy: total units dispensed, top 5 medicines sold
- No configuration needed — auto-generated for the current day

---

## Phase 3 — Polish
### Make doctors and staff love it daily

> These don't unblock anything critical but determine whether people stay.

---

### 3.1 Returning Patient — Last Visit Summary at Top of Consultation

**Priority:** Medium

Currently, all history sections are collapsed when a doctor opens a consultation. For a returning patient, the doctor must click 5 accordions to see anything useful. 

**Fix:** When the patient has a prior visit, show a compact "Last Visit" card at the top of the consultation view — date, chief complaint, diagnosis (if recorded), medicines prescribed. Everything else stays collapsed. One glance, full context.

---

### 3.2 Promote "Scan Bill" as the Primary Pharmacy Onboarding Action

**Priority:** Medium — Fast

The AI bill scanning feature is genuinely powerful but buried inside the "Add New Stock" modal as a secondary button. Most users will never find it.

**Fix:** On the main pharmacy page (when stock is empty or low), show a prominent CTA: "Got a supplier invoice? Scan it to add stock automatically." Move Scan Bill to the primary position. This is a UI change only — no new functionality.

---

### 3.3 Vitals Layout Fix + Bill Modal Responsive Issues

**Priority:** Medium — Fast (30 mins each)

Two visible bugs in current screenshots:
1. The "Resp. Rate" vitals field is cut off on the right edge of the consultation screen — the row overflows its container
2. The medicine search dropdown in the bill modal overlaps the appointment/description fields on smaller screens

Both are CSS fixes. Both signal "unfinished" to every new user.

---

### 3.4 UHID on Prescriptions and All Printed Outputs

**Priority:** Medium — Fast

The UHID system (M26000082 format) is solid. It should appear on every document the patient takes home: prescriptions, bills, referral letters. Currently unclear if it appears on printed prescriptions. Verify and add wherever missing.

---

## Phase 4 — Later
### Build for the second clinic, not the first

> Do not build these until Phase 1–2 are stable and the current clinic is using them daily without issues.

---

### 4.1 Physio Session Packages
Package billing (e.g. 10 sessions for ₹3,000), per-session attendance tracking, remaining sessions visible on patient profile. Well-defined scope, low complexity. Build when the clinic asks for it.

### 4.2 Test Order Slip + Result Attachment
Doctor orders a test → printable requisition slip → result PDF/image attached to patient record, visible in consultation history. Not a full LIS. Build when daily OPD and pharmacy workflows are stable.

### 4.3 Basic Bed / Admission Tracking
Bed occupancy view, admission and discharge dates, attending doctor, brief discharge summary. Minimal scope — not full IPD software. Build when the clinic specifically requests it.

### 4.4 Corporate / Panel Billing
Separate billing rates for empanelled companies or government schemes (ESIC, CGHS). Monthly batch invoice generation. Build when the clinic has active corporate empanelments and the billing pain becomes real.

---

## Summary Table

| # | Feature | Phase | Priority | Effort |
|---|---------|-------|----------|--------|
| 1.1 | Pharmacy inventory bulk import (AI column matching) | 1 | Blocker | 3–5 days |
| 1.2 | Connect bill medicine search → live inventory | 1 | Blocker | 2–3 days |
| 1.3 | Standalone pharmacy dispensing / walk-in sale | 1 | Blocker | 1–2 days |
| 1.4 | Staff queue view: two columns per doctor + TV URL | 1 | Blocker | 2–3 days |
| 1.5 | Patient merge + "In Consultation" queue state | 1 | High | 1 day |
| 2.1 | Decouple billing from visit completion | 2 | High | 1 day |
| 2.2 | Configurable services catalogue | 2 | High | 2 days |
| 2.3 | Payment mode capture + printable bill | 2 | High | 1–2 days |
| 2.4 | Optical spectacle prescription + inventory | 2 | Medium | 2 days |
| 2.5 | Day-end summary report | 2 | Medium | 1–2 days |
| 3.1 | Last visit summary for returning patients | 3 | Medium | 1 day |
| 3.2 | Promote Scan Bill as primary pharmacy CTA | 3 | Medium | < 1 day |
| 3.3 | Vitals layout + bill modal responsive fixes | 3 | Medium | < 1 day |
| 3.4 | UHID on all printed outputs | 3 | Medium | < 1 day |
| 4.1 | Physio session packages | 4 | Later | — |
| 4.2 | Test order slip + result attachment | 4 | Later | — |
| 4.3 | Bed / admission tracking | 4 | Later | — |
| 4.4 | Corporate / panel billing | 4 | Later | — |

---

## The Rule

> **Do not start Phase 2 until 1.1, 1.2, and 1.3 are done.**  
> The inventory chain (import → live stock in bills → dispensing → deduction) must be complete before billing polish means anything. A beautifully formatted bill that still pulls from the master table and doesn't track stock is not an improvement.

---

*Last updated: June 2026*