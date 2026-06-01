# Invoice Number Generation: Server-Atomic, No Client Fetch

## Context

Invoice number generation (`generateInvoiceNumber`) is a public server action called from the client on modal open. The number is burned before persistence — if the user cancels, the sequence gap is permanent. A "Generate" button in the UI lets users burn more numbers manually. This is the exact anti-pattern the UHID system was designed to avoid.

`saveBill` and `generateInvoiceNumber` are two separate server round-trips with a time gap between them, reintroducing the race condition the advisory-lock RPC was meant to solve.

Pattern: generation must happen atomically inside `saveBill` — no client-side fetching, no regenerate button, no modal-open pre-generation.

## Current State (Broken)

```
Modal opens
  └─→ useBilling calls generateInvoiceNumber (public server action)   ← number burned
      ... user fills form ...
      ... user might click "Generate" button ...                       ← another number burned
      ... user cancels ...                                             ← sequence gap forever
Save
  └─→ Client calls saveBill (separate server action)                   ← uses pre-fetched number
```

Affected files:

| File | Role |
|---|---|
| `actions/billing.ts:63` | `generateInvoiceNumber` — public, exported server action |
| `hooks/useBilling.ts:73-87` | `fetchInvoiceNumber` — client fetches number on modal open |
| `hooks/useBilling.ts:89-93` | `useEffect` triggers fetch on mount in create mode |
| `components/billing/BillingModal.tsx:457-467` | "Generate" button — regenerates invoice number |
| `components/billing/BillingModal.tsx:441-468` | Invoice number form field — editable in create mode |

## Target State (Fixed)

```
saveBill (single server action)
  ├── generateInvoiceNumber() — private, not exported
  ├── INSERT into bills with generated number
  └── return bill (including invoice_number)
```

Single atomic call. Client never fetches a number. Invoice field is read-only with placeholder `"Auto-generated on save"`. No "Generate" button.

## What Changes

### 1. `actions/billing.ts` — inline generation into saveBill

- Remove `export` from `generateInvoiceNumber`. Make it a private `async function generateInvoiceNumber(...)`.
- In `saveBill` create mode: call `generateInvoiceNumber(clinicId)` internally, use the result as `invoice_number` on the insert.
- `saveBill` returns `{ success: true, data: bill }` where `bill.invoice_number` holds the generated value.

### 2. `hooks/useBilling.ts` — delete client-side fetching

- Delete `fetchInvoiceNumber` callback (lines 73-87).
- Delete the `useEffect` that triggers it on mount (lines 89-93).
- Delete `invoiceNumber`, `isLoadingInvoiceNumber` state (lines 69-70).
- Remove `generateInvoiceNumber` import from `@/actions/billing`.
- `handleSave`: after successful save, read the returned bill's `invoice_number` and set it on the form (so the modal can display it for download/print/view).
- Remove `refetchInvoiceNumber` from the return value.

### 3. `components/billing/BillingModal.tsx` — lock UI, remove button

- Invoice number field: always disabled in create mode. Placeholder `"Auto-generated on save"`.
- Remove the "Generate" button (lines 457-467).
- Remove `isLoadingInvoiceNumber`, `refetchInvoiceNumber` from hook destructuring.
- Download/Print/WhatsApp buttons: only show after save (i.e., when a `bill.id` exists from the save response). Currently they require `bill` to be truthy (line 287, 314, 328) — after create-mode save, the modal should have the saved bill with its id.

### 4. `hooks/useBillingFormEffects.ts` — no change needed

The reset effect already handles loading existing bills. Invoice number comes from `bill.invoice_number` on edit/view, or is empty on create.

### 5. Remove `generateInvoiceNumber` from test exports

- `tests/unit/actions/billing.test.ts`: `generateInvoiceNumber` is no longer exported. Tests for it must either:
  - Be deleted (it's an implementation detail of `saveBill`), or
  - Test through `saveBill` in create mode, asserting the returned `invoice_number` follows the expected format.

## What Does NOT Change

- The RPC `generate_invoice_number` in the database (advisory lock, format, fallback logic).
- The `unique_invoice_number_per_clinic` constraint.
- `BillingPDF.tsx` — still reads `billData.invoice_number`.
- `generateBillFilename` — still uses `billData.invoice_number`.
- Edit mode — existing bill's `invoice_number` is preserved, never regenerated.

## Verification

1. `tsc --noEmit` — zero errors
2. Open create bill modal — invoice field is disabled with "Auto-generated on save" placeholder. No "Generate" button.
3. Fill form, click Create — bill saves, invoice number appears in the field, Download/Print/WhatsApp buttons become available.
4. Open create bill modal, fill form, cancel — no invoice number burned (check `bills` table for gaps).
5. Open create bill modal, cancel without filling — no invoice number burned.
6. Edit existing bill — invoice number is read-only (existing behavior, unchanged).
7. Run unit tests — `saveBill` tests pass (updated to verify generated invoice number format).
