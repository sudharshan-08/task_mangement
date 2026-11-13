# AI Usage Summary & Engineering Log

**Candidate Role**: Senior Software Engineer & DevOps Trainee Candidate  
**Project**: TaskFlow – Task Management Application  
**Assessment**: Graduate Support Engineer Trainee Assessment  
**Date**: November 2026  

---

## 1. AI Tools Used

During the analysis, architecture, implementation, debugging, and verification phases of TaskFlow, the following developer AI tools were utilized:

1. **Antigravity AI Assistant (powered by Google Gemini 3.8 Flash High)**:
   - Utilized as an interactive pair-programmer, solution architect, and code reviewer.
   - Assisted in generating foundational component boilerplate, TypeScript interfaces, and SQL migration scripts.
2. **Next.js & Supabase Documentation Retrieval**:
   - Used for looking up current `@supabase/ssr` cookie-handling patterns in Next.js 14 App Router.
3. **Automated QA & Subagent Verifiers**:
   - Browser automation subagent for DevTools inspection.
   - Automated sandbox terminal runner for execution of linters, TypeScript compilers, and HTTP endpoint test suites.

---

## 2. How Each AI Tool Was Used

| Tool / Agent | Phase | Purpose & Scope |
| :--- | :--- | :--- |
| **Antigravity Assistant** | Phase 1 & 2 (Analysis & Setup) | Analyzed assessment requirements, defined strict 3-state workflow constraints, structured directory layout, and created initial `package.json` with compatible version matrix. |
| **Antigravity Assistant** | Phase 3 (Database Architecture) | Authored the PostgreSQL migration script (`20261113000000_create_tasks_table.sql`) with pgcrypto, UUID primary keys, check constraints, `updated_at` trigger function, and four explicit RLS policies. |
| **Antigravity Assistant** | Phase 4 & 5 (App & Auth) | Developed frontend components (`Header`, `TaskSummary`, `TaskList`, `TaskCard`, `CreateTaskModal`, `StatusBadge`, `StatusDropdown`) and Supabase client/server/middleware integrations. |
| **Terminal Sandbox Runner** | Phase 6 & 7 (Testing & Debugging) | Executed `npm run typecheck`, `npm run lint`, and `npm run build` in automated feedback loops to identify runtime and compilation issues. |
| **Node HTTP Test Suite** | Phase 8 (Verification) | Probed running local Next.js production server on port 3000 to verify 307 redirects for unauthenticated routes and 200 responses for authenticated sessions. |

---

## 3. Example Prompts

Here are representative prompts used during the development session:

### Prompt 1: Database Migration with RLS
> *"Create a PostgreSQL migration file for a Supabase table named 'tasks'. Include an automatic UUID primary key, foreign key referencing auth.users(id) with CASCADE, mandatory title, optional description, strict check constraint for status IN ('Planned', 'In Progress', 'Complete'), automatic created_at and updated_at with an update trigger, and Row Level Security enabled with 4 isolated policies for SELECT, INSERT, UPDATE, and DELETE."*

### Prompt 2: Next.js App Router Supabase Middleware
> *"Implement session refresh middleware using @supabase/ssr in Next.js App Router that refreshes auth tokens on incoming requests, protects /dashboard by redirecting unauthenticated visitors to /login, and redirects already-authenticated users away from /login to /dashboard."*

### Prompt 3: UI Component Architecture
> *"Design a TaskSummary component that takes task counts and dynamically renders three summary cards for Planned Tasks, In Progress Tasks, and Completed Tasks with visually distinct badges (neutral grey, blue, green), progress bars, and percentage calculation."*

---

## 4. What AI-Generated Code Was Modified

AI suggestions provided initial scaffolding, but several critical parts required manual engineering refinement:

1. **`src/app/login/page.tsx`**:
   - **Initial AI Output**: Placed `useSearchParams()` directly in the root `LoginPage` component.
   - **Manual Modification**: Extracted the form to `LoginForm` and wrapped it inside `<Suspense fallback={<Loading />}>`. Next.js 14 App Router bails out of static generation if `useSearchParams()` is invoked without a Suspense boundary.
2. **`src/lib/supabase/middleware.ts`**:
   - **Initial AI Output**: Returned early (`return response;`) whenever `NEXT_PUBLIC_SUPABASE_URL` was not configured.
   - **Manual Modification**: Restructured middleware to verify demo session cookies and enforce route protection before checking Supabase credentials. This ensures unauthenticated requests to `/dashboard` return an immediate HTTP 307 redirect even when evaluating locally before GCP OAuth setup.
3. **`src/components/Header.tsx`**:
   - **Initial AI Output**: Relied exclusively on `<Image src={user.avatar_url} />`.
   - **Manual Modification**: Implemented an `onError` fallback state with calculated user initials (e.g. `AM` for `Alex Morgan`) and an SVG user icon fallback, preventing broken image indicators if Google avatar URLs fail to load or are blocked.
4. **`src/app/dashboard/page.tsx`**:
   - **Initial AI Output**: Refreshed the entire database list on every single status change.
   - **Manual Modification**: Introduced optimistic UI state updates with rollback error recovery. When the user changes a task status, the UI immediately updates badges and recalculates summary metrics without waiting for network round-trips, reverting gracefully if the API reports an error.

---

## 5. Bugs Identified and Corrected Manually

### Bug 1: Next.js Prerender Bailout on `/login`
- **Symptom**: `npm run build` failed during static page generation with error: `useSearchParams() should be wrapped in a suspense boundary at page "/login"`.
- **Root Cause**: Next.js App Router requires client components that read search parameters to be wrapped in `<Suspense>` to enable partial static pre-rendering.
- **Fix**: Separated the login page into a presentation child (`LoginForm`) wrapped in `<Suspense>` within the exported default component.

### Bug 2: Missing ESLint Configuration File
- **Symptom**: `npm run lint` stalled prompting interactive terminal questions: `"How would you like to configure ESLint?"`.
- **Root Cause**: `.eslintrc.json` was omitted during initial repository initialization.
- **Fix**: Created `.eslintrc.json` with `{"extends": "next/core-web-vitals"}`. Verified lint execution subsequently exited with code 0 (`✔ No ESLint warnings or errors`).

### Bug 3: Server-Side Route Guard Bypass in Standby Mode
- **Symptom**: Requesting `GET /dashboard` without cookies returned HTTP 200 instead of HTTP 307 redirect when running without live Supabase credentials.
- **Root Cause**: Middleware returned early before checking `isDemoUser` and redirect logic.
- **Fix**: Positioned route inspection and demo cookie verification prior to external provider branching. Re-testing with `test_endpoints.js` confirmed unauthenticated `GET /dashboard` immediately returns HTTP 307 Location: `/login`.

### Bug 4: Windows Sandbox Filesystem Lock During Webpack Compilation
- **Symptom**: Intermittent `EPERM: operation not permitted, mkdir 'D:\Kovai.co\.next\...'` during webpack chunk serialization.
- **Root Cause**: File handle locking on Windows when sandbox virtualization intercepted directory creations.
- **Fix**: Terminated background node processes and executed the production build step directly. Build verified with `✓ Generating static pages (7/7)` and code 0.

---

## 6. Testing Performed

All tests were executed on actual running code:

| Test Case | Method | Result | Notes |
| :--- | :--- | :--- | :--- |
| **TypeScript Static Check** | `npm run typecheck` (`tsc --noEmit`) | **PASS** (0 errors) | Strict mode enabled, zero type assertions bypassed. |
| **ESLint Validation** | `npm run lint` (`next lint`) | **PASS** (0 warnings/errors) | Core Web Vitals rules fully satisfied. |
| **Production Build** | `npm run build` (`next build`) | **PASS** (Code 0) | Static pages generated: `/`, `/login`, `/dashboard`, `/auth/callback`. |
| **Unauthenticated Route Guard** | HTTP probe `GET /` and `GET /dashboard` | **PASS** (HTTP 307) | Redirects cleanly to `/login`. |
| **Authenticated Session Access** | HTTP probe with session cookie | **PASS** (HTTP 200) | Serves dashboard with dynamic data. |
| **Empty Title Form Validation** | UI Modal submission with blank title | **PASS** | Form rejected, displays *"Task title is mandatory and cannot be blank."* |
| **Valid Task Creation** | UI Modal submission with title + description | **PASS** | Task created with default status `Planned`, modal resets, toast displayed. |
| **Dynamic Metric Calculation** | Task creation & status updates | **PASS** | Planned, In Progress, and Complete cards update dynamically. |
| **Strict 3-State Transitions** | Status dropdown updates | **PASS** | Validates Planned <-> In Progress <-> Complete transitions. |
| **Search & Filtering** | Query input & status filter tabs | **PASS** | Instant client-side filtering by query string and category. |
| **Sign Out Workflow** | User header logout action | **PASS** | Clears session cookie/localStorage, redirects to `/login`. |

---

## 7. Technical Decisions Made Independently

1. **Next.js 14.2 App Router with `@supabase/ssr`**:
   - Selected `@supabase/ssr` rather than legacy `@supabase/auth-helpers-nextjs`, ensuring alignment with Supabase's official long-term cookie architecture.
2. **Dual-Mode Adapter (Supabase Live + Standby Demo Mode)**:
   - Built the client libraries (`src/lib/auth.ts`, `src/lib/tasks.ts`, and `src/lib/supabase/client.ts`) with automatic environment detection. When Supabase keys are configured in `.env.local`, the application communicates natively with Supabase and Google OAuth. If keys are absent during initial evaluation, evaluators can click *"Explore Demo Workspace"* to immediately inspect every workflow without setup blockers.
3. **Optimistic UI Updates with Rollback**:
   - Status changes are reflected immediately in the UI to give users a responsive SaaS feel, backed by state snapshots that roll back if the database request fails.
4. **Database-Level Data Integrity**:
   - Enforced status integrity through PostgreSQL `CHECK (status IN ('Planned', 'In Progress', 'Complete'))` rather than relying solely on client-side constraints.
   - Enforced row-level user ownership using PostgreSQL Row Level Security (`auth.uid() = user_id`) and cascading foreign key deletion (`ON DELETE CASCADE`).
