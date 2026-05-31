
---

# Execution Plan: Unified Consultation Document Architecture

## Objective

Standardize the output of downloaded and printed consultation documents by unifying them under a single rendering engine (`@react-pdf/renderer`). Eliminate divergent codebases, enforce strict data validation to prevent UI failures on medical records, and resolve all layout inconsistencies.

## 1. Architectural Unification (Single Source of Truth)

* **Action:** Terminate the dual-engine approach. Deprecate the HTML/CSS `iframe` print path completely.
* **Implementation:** Route both "Download" and "Print" actions exclusively through `components/consultation/ConsultationPDF.tsx`. Both actions must generate from the exact same source code.

## 2. Defensive Rendering (The `[object Object]` Killswitch)

* **Tactical Fix:** Build dedicated `@react-pdf/renderer` component handlers for complex nested objects, specifically `vital_signs` and `eye_examination`.
* **Systemic Fix (Mandatory):** Implement a global type-guard wrapper in `ConsultationPDF.tsx` (`renderFieldValue`).
* *Logic:* Before rendering any dynamic value, verify its type. If an unparsed object or array attempts to render as text, it must gracefully degrade (e.g., render "Data unavailable" or safely stringify) and immediately fire a warning to your error tracking system (e.g., Sentry).
* *Rule:* No raw JSON objects will ever reach a user-facing medical document again.



## 3. Conditional Layouts & Data Enrichment

* **Clinic Header Isolation:**
* Inject a strict `showClinicHeader` boolean prop into `ConsultationPDF.tsx`.
* Download Action: Pass `showClinicHeader={true}`.
* Print Action: Pass `showClinicHeader={false}`.


* **Patient Identity Block:**
* Update both the PDF generator and the on-screen preview (`ConcisePatientInfo` in `ConsultationParts.tsx`).
* Ensure explicit formatting: `Patient Name: [Name] | Age: [Age] | Address: [Address] | Medical ID: [ID]`.


* **Typography Standardization:** Lock in the visual hierarchy (font sizes, weights for headers vs. values) exclusively within the PDF styles to guarantee 1:1 parity between what the user sees on screen and what prints.

## 4. Pagination & Signature Control

* **PDF Fix:** Remove the `fixed` prop from the signature footer in `ConsultationPDF.tsx`. It must flow naturally to the final page, not absolute-position itself on every page.
* **Preview Fix:** In `ConsultationLayout.tsx`, extract the `ConsultationSignatureFooter` from the `<tfoot>` tag. Move it to the very end of the `<tbody>` content flow so it renders as the final block of the document rather than a repeating table footer.

## 5. The Print Action Overhaul

* **Implementation:** In both `ConsultationViewModal.tsx` and `ConsultationPreviewModal.tsx`, rewrite the `handlePrint` function.
* **Flow:**
1. Generate the PDF blob via `pdf().toBlob()` with `showClinicHeader={false}`.
2. Execute `window.open(url, '_blank')` to serve the PDF to the browser's native viewer.
3. Allow the browser's native print dialog to handle the hardware routing.



## 6. QA & Edge-Case Stress Testing

* The engineering team must verify layout stability across varying document lengths.
* **Mandatory Tests:** Generate test PDFs with 1 page, 1.5 pages, and 5+ pages of consultation notes.
* **Success Criteria:** The layout does not break, the header obeys the boolean prop, and the signature *only* appears once at the absolute bottom of the final page, regardless of content length.

## 7. Merciless Cleanup (Tech Debt Removal)

* Delete `consultationPrintUtils.ts` (verify no other dependencies exist first).
* Remove the `showPrintStyles` prop from `ConsultationLayout.tsx` (it is now dead code).
* Delete the `PrintStyles` component from `ConsultationParts.tsx`.