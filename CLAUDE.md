# CLAUDE.md

# SYSTEM DIRECTIVE: DOXXY ARCHITECTURAL STANDARD (SERVER-FIRST)

**CURRENT STATE MANDATE:** We are executing a strict migration to a Server-First, Next.js App Router architecture. Eradicate client-side waterfalls, heavy global state, and prop-drilling. Prioritize server components, URL-driven state, and strict decoupling. Do not generate code for new features unless explicitly overridden by the user.

---

## TIER 1: BEHAVIORAL CORE (How You Operate)

### 1. Think Like a Systems Architect
**Don't just write code; design the data flow.**
- State your assumptions explicitly. If uncertain, STOP and ask.
- Always ask: "Can this be done on the server instead of the client?"
- If a simpler, less abstract approach exists, push back and suggest it.

### 2. Simplicity & Deletion
**Code is a liability. The best PR is a negative line count.**
- No abstractions for single-use code.
- If you see `useEffect` being used to sync data or mirror state, delete it and refactor to a single source of truth.
- Match existing style perfectly, even if you disagree with it, but mercilessly delete dead code, unused imports, and orphaned functions that *your* changes create.

### 3. Goal-Driven Execution
**Define success criteria. Loop until verified.**
- Transform tasks into verifiable goals (e.g., "Move fetching to server" → "Remove 'use client', fetch in page component, pass static props to child").
- For multi-step tasks, state a brief checklist before executing.

---

## TIER 2: ARCHITECTURE & DATA FLOW (The Hard Boundaries)
*Violating these rules introduces catastrophic performance degradation. Do not bypass them under any circumstances.*

### A. The Server-First Mandate
- **Pages are Server Components:** `page.tsx` files MUST NOT have `"use client"`. Pages are orchestrators. They fetch data securely on the server and pass minimal, serializable JSON down to client components.
- **Client Components are Leaves, Not Roots:** `"use client"` is strictly reserved for components that require interactivity (e.g., `onClick`, `useState`, browser APIs like `window`). Push client boundaries as far down the component tree as possible.
- **No Client-Side Waterfalls:** Do not fetch initial data in `useEffect` or client-side React Query hooks unless explicitly required for polling or high-frequency updates. 

### B. Mutations via Server Actions
- **No Client-Side Supabase Mutations:** Stop writing database `insert`/`update` logic in React components.
- **Action Layer:** All database mutations must happen via Next.js Server Actions in an `actions/` directory. Client components should call these actions, which handle the DB logic, revalidate the path (`revalidatePath`), and return typed results.

### C. State Management Hierarchy
- **Level 1: The URL (Single Source of Truth):** Filters, search queries, pagination, and active tabs MUST live in the URL (`searchParams`). Read them on the server or use `useSearchParams`. Do not sync URL params to Zustand.
- **Level 2: React State (`useState`):** Use for strictly local, ephemeral component state (e.g., open/close a specific dropdown).
- **Level 3: Zustand:** Use ONLY for complex, cross-component transient UI state that cannot live in the URL (e.g., a complex multi-step form wizard, drag-and-drop state, or audio dictation status).

---

## TIER 3: CODE QUALITY & ERROR HANDLING

### A. Component Design
- **Stop Prop Drilling:** If you are passing more than 4 props down multiple levels, stop. Use React Context, or better yet, use Component Composition (pass `<Child/>` as `children` to `<Parent/>`).
- **Hook Limits:** Maximum 5 `useState`/`useEffect` combinations per file. If larger, the component is doing too much. Split it.

### B. Type Safety (Strict Adherence)
- **Central Hub:** `types/core.ts` is the master file. Domain types live here.
- **No `any`:** The `@typescript-eslint/no-explicit-any` rule is enforced. Use `unknown` and narrow. No new `any` casts are allowed.

### C. Error & Loading UI Standardization
- **Toasts:** Strictly use `sonner` (`toast.success()`, `toast.error()`).
- **Spinners:** Use `<Spinner/>` from `components/ui/loading.tsx`.
- **Error Visibility:** Use `showErrorToast()` from `lib/error-utils.ts` for all catch blocks in client code. Return standard error objects `{ error: string }` from Server Actions.
- **No Silent Failures:** Never use `.catch(() => ({}))`.

---

## TIER 4: THE PRE-FLIGHT PROTOCOL
Before outputting any code block modifying the system, you MUST output a brief, 3-point compliance check proving you have read the invariants. 

*Example format:*
`> Pre-flight Check: 1. Component moved to Server. 2. URL used as state instead of Zustand. 3. Mutation extracted to Server Action.`