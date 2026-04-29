# SYSTEM DIRECTIVE: DOXXY ENGINEERING STANDARD

**CURRENT STATE MANDATE:** We are in a strict technical debt eradication and architectural stabilization phase. Do not generate code for new features unless explicitly overridden by the user. Prioritize decoupling, type safety, and error visibility.

---

## TIER 1: BEHAVIORAL CORE (How You Operate)

### 1. Think Before Coding
**Don't assume. Don't hide confusion. Surface tradeoffs.**
- State your assumptions explicitly. If uncertain, STOP and ask.
- If multiple interpretations exist, present them. Do not pick silently.
- If a simpler approach exists, push back and suggest it.

### 2. Simplicity First
**Minimum code that solves the problem. Nothing speculative.**
- No abstractions for single-use code.
- No "flexibility" or "configurability" that wasn't requested.
- If you write 200 lines and it could be 50, rewrite it before outputting.

### 3. Surgical Precision
**Touch only what you must. Clean up only your own mess.**
- Do not "improve" adjacent code, comments, or formatting.
- Match existing style perfectly, even if you disagree with it.
- Remove imports/variables/functions that YOUR changes made unused. Do not touch pre-existing dead code unless explicitly asked.
- Every changed line must trace directly to the user's prompt.

### 4. Goal-Driven Execution
**Define success criteria. Loop until verified.**
- Transform tasks into verifiable goals (e.g., "Add validation" → "Write tests for invalid inputs, then make them pass").
- For multi-step tasks, state a brief checklist before executing.

---

## TIER 2: ARCHITECTURAL INVARIANTS (The Hard Boundaries)
*Violating these rules introduces catastrophic technical debt. Do not bypass them under any circumstances.*

### A. Size & Scope Limits
- **Hooks:** Maximum 200 lines. Max 5 `useState`/`useEffect` combinations. If larger, split by domain concern (e.g., fetching, state, autosave).
- **Pages:** Maximum 200 lines. Pages are orchestrators. Extract UI into components and data fetching into hooks. No inline DB queries in page files.

### B. The Data-Access Layer
- **No UI DB Calls:** `getSupabase()` is strictly forbidden in components or page files.
- **Hook Encapsulation:** All Supabase interactions (`.from()`, `.rpc()`) must live inside custom hooks within the `hooks/` directory.

### C. Type Safety (Single Source of Truth)
- **Central Hub:** `types/core.ts` is the master file. Domain types (`Consultation`, `PrescriptionMedication`, `DbJson`) live here or are re-exported from here.
- **No Raw Imports:** Never import `Tables`, `Enums`, or `Json` directly from `@/integrations/supabase/types` in UI files. Use the typed aliases from `types/core.ts`.
- **No `any`:** The `@typescript-eslint/no-explicit-any` rule is enforced. Use `unknown` and narrow, or properly type the interface. No new `any` casts are allowed.

### D. UI & Error Handling Standardization
- **Toasts:** Strictly use `sonner` (`toast.success()`, `toast.error()`). Do not use shadcn/custom toasts.
- **Spinners:** Use the existing `<Spinner />` from `components/ui/loading.tsx`. Do not write new spinner JSX.
- **Error Visibility:** Use `showErrorToast()` from `lib/error-utils.ts` for all catch blocks. 
- **No Silent Failures:** Never use `.catch(() => ({}))` or `.catch(console.error)`.
- **Logs:** No `console.log` in contexts, layouts, or production-facing components.

---

## TIER 3: THE PRE-FLIGHT PROTOCOL
Before outputting any code block modifying the system, you MUST output a brief, 3-point compliance check proving you have read the invariants. 

*Example format:*
`> Pre-flight Check: 1. Component is <200 lines. 2. Supabase call extracted to hook. 3. Using sonner for errors.`