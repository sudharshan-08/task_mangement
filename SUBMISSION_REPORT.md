# Kovai.co – Graduate Support Engineer Trainee Assessment
## Official Project Submission & Technical Delivery Report

---

### Candidate & Submission Overview

| Field | Details |
| :--- | :--- |
| **Candidate Name** | Sudharshan B |
| **Candidate Email** | sudharshanbalasundaram8@gmail.com |
| **Assessment Title** | Graduate Support Engineer Trainee Assessment |
| **Project Name** | **TaskFlow – Task Management Application** |
| **GitHub Repository** | [https://github.com/sudharshan-08/task_mangement](https://github.com/sudharshan-08/task_mangement) |
| **Primary Branch** | `main` (clean commit history, zero committed secrets) |
| **Database Host** | Supabase (PostgreSQL 15 with Row Level Security) |
| **Supabase Project URL**| `https://pphirugfxkjwqtvbbapc.supabase.co` |
| **Local Verified Server**| `http://localhost:3000` |
| **Submission Date** | November 13, 2026 |

---

## 1. Quick Submission Links

- **GitHub Source Code Repository**:  
  👉 [https://github.com/sudharshan-08/task_mangement](https://github.com/sudharshan-08/task_mangement)

- **Technical README Documentation**:  
  👉 [https://github.com/sudharshan-08/task_mangement/blob/main/README.md](https://github.com/sudharshan-08/task_mangement/blob/main/README.md)

- **End-User Guide (Non-Technical)**:  
  👉 [https://github.com/sudharshan-08/task_mangement/blob/main/USER_GUIDE.md](https://github.com/sudharshan-08/task_mangement/blob/main/USER_GUIDE.md)

- **Company-Required AI Usage Summary**:  
  👉 [https://github.com/sudharshan-08/task_mangement/blob/main/AI_USAGE_SUMMARY.md](https://github.com/sudharshan-08/task_mangement/blob/main/AI_USAGE_SUMMARY.md)

- **Database SQL Migration & RLS File**:  
  👉 [https://github.com/sudharshan-08/task_mangement/blob/main/supabase/migrations/20261113000000_create_tasks_table.sql](https://github.com/sudharshan-08/task_mangement/blob/main/supabase/migrations/20261113000000_create_tasks_table.sql)

- **1-Click Vercel Deployment Link**:  
  👉 [https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fsudharshan-08%2Ftask_mangement&env=NEXT_PUBLIC_SUPABASE_URL,NEXT_PUBLIC_SUPABASE_ANON_KEY&project-name=taskflow](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fsudharshan-08%2Ftask_mangement&env=NEXT_PUBLIC_SUPABASE_URL,NEXT_PUBLIC_SUPABASE_ANON_KEY&project-name=taskflow)

---

## 2. Core Functional Requirements Checklist

| Requirement | Assessment Specification | Implementation Status | Verification Details |
| :--- | :--- | :--- | :--- |
| **Feature 1** | **Google Authentication** | **COMPLETED & VERIFIED** | Implemented with `@supabase/ssr` OAuth redirect flow, `/auth/callback` code exchange, session persistence, automatic token refresh, and route guarding. Displays user name, email, and avatar with fallback initials. |
| **Feature 2** | **Create Tasks** | **COMPLETED & VERIFIED** | Modal dialog with focus management; empty-title validation; default status `Planned`; duplicate submission lock; automatic modal reset and success toast feedback. |
| **Feature 3** | **View Tasks & Real-Time Stats** | **COMPLETED & VERIFIED** | Dynamically calculates and renders **Planned Tasks**, **In Progress Tasks**, and **Completed Tasks** summary cards with completion percentage. Features live search, status category filter tabs, loading skeletons, and empty state handlers. |
| **Feature 4** | **3-State Status Workflow** | **COMPLETED & VERIFIED** | Tasks strictly transition between `Planned`, `In Progress`, and `Complete`. Status dropdown on each card performs optimistic UI updates with immediate feedback and database persistence. Color-coded badges: Neutral grey (Planned), Blue (In Progress), Green (Complete). |
| **Security** | **Database Row Level Security** | **COMPLETED & VERIFIED** | Enabled RLS on PostgreSQL `tasks` table. 4 tenant-isolated policies strictly enforce `auth.uid() = user_id` for SELECT, INSERT, UPDATE, and DELETE. |
| **Quality** | **Production Build & Linting** | **COMPLETED & VERIFIED** | Strict TypeScript compilation (`tsc --noEmit`) passes with 0 errors; ESLint passes with 0 warnings; Next.js 14 production build succeeds with code 0 (7/7 static pages). |

---

## 3. Technology Stack

- **Frontend Framework**: Next.js 14.2.20 (React 18, App Router architecture)
- **Language**: TypeScript 5.6.3 (strict mode enabled)
- **Styling & UI**: Tailwind CSS 3.4.14, Lucide React icons
- **Backend & Database**: Supabase (PostgreSQL 15 managed engine)
- **Database Security**: Supabase Row Level Security (RLS) with cascading foreign keys
- **Authentication**: Supabase Auth (Google OAuth 2.0 PKCE flow) via `@supabase/ssr`
- **Version Control**: Git / GitHub (`https://github.com/sudharshan-08/task_mangement`)
- **Hosting Target**: Vercel (Edge-optimized serverless runtime)

---

## 4. Database Architecture & Policies

The PostgreSQL migration script is located at `supabase/migrations/20261113000000_create_tasks_table.sql`.

### Table Schema

```sql
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS public.tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL CHECK (char_length(trim(title)) > 0),
    description TEXT,
    status TEXT NOT NULL DEFAULT 'Planned' CHECK (status IN ('Planned', 'In Progress', 'Complete')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);
```

### Automatic Timestamp Trigger

```sql
CREATE OR REPLACE FUNCTION public.handle_tasks_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_tasks_updated_at
    BEFORE UPDATE ON public.tasks
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_tasks_updated_at();
```

### Row Level Security (RLS) Policies

```sql
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own tasks"
    ON public.tasks FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own tasks"
    ON public.tasks FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tasks"
    ON public.tasks FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own tasks"
    ON public.tasks FOR DELETE USING (auth.uid() = user_id);
```

---

## 5. Security Architecture

1. **Client Isolation**: Only the public publishable anon key (`NEXT_PUBLIC_SUPABASE_ANON_KEY`) is accessible to frontend code. The `SUPABASE_SERVICE_ROLE_KEY` is completely excluded from client bundles and Git history.
2. **Environment Variable Protection**: `.env.local` is strictly ignored in `.gitignore` to prevent secret leakage.
3. **Route Guarding**: Next.js Middleware inspects session cookies and immediately issues an HTTP 307 redirect to `/login` for unauthenticated requests to `/dashboard`.
4. **Data Integrity**: Enforced through PostgreSQL `CHECK (status IN ('Planned', 'In Progress', 'Complete'))` and title length validation, ensuring invalid values cannot be injected even via direct API calls.

---

## 6. Testing & Quality Assurance Summary

Every mandatory test scenario from the assessment was executed and validated:

| Test Case | Execution Command / Method | Expected Result | Actual Result |
| :--- | :--- | :--- | :--- |
| **Static Type Checking** | `npm run typecheck` | 0 TypeScript errors | **PASS** (Code 0) |
| **Code Quality & Lint** | `npm run lint` | 0 ESLint warnings/errors | **PASS** (Code 0) |
| **Production Compilation**| `npm run build` | All routes optimized & built | **PASS** (7/7 pages generated) |
| **Route Protection** | `GET /dashboard` without cookie | Redirect to `/login` | **PASS** (HTTP 307) |
| **Empty Title Validation** | Submit modal with blank title | Inline error prompt | **PASS** (Submission blocked) |
| **Task Creation** | Submit title + optional details | Created with status `Planned` | **PASS** (Database row inserted) |
| **Dynamic Summary Cards** | Create & transition tasks | Planned, In Progress, Complete counts update | **PASS** (Dynamic recalculation) |
| **Strict 3-State Transitions**| Dropdown status change | Planned ➔ In Progress ➔ Complete | **PASS** (Optimistic UI & DB updated) |
| **Search & Filtering** | Query input + category tabs | Real-time filtered task view | **PASS** (Instant match) |
| **Sign Out Workflow** | Click Sign out in header | Clears session & returns to `/login` | **PASS** (Cookie deleted & redirected) |

---

## 7. AI Tooling & Independent Engineering Disclosure

In compliance with the company's transparency guidelines:

1. **AI Tools Used**: Google Gemini 3.8 Flash High assistant in Antigravity IDE, automated terminal sandbox, and Chrome DevTools subagent.
2. **Key Manual Engineering Interventions**:
   - Resolved Next.js 14 App Router CSR prerender bailout on `/login` by extracting the form component into a `<Suspense>` boundary.
   - Restructured session refresh middleware to evaluate route protection before remote service checks, guaranteeing instant HTTP 307 redirects for unauthenticated visitors.
   - Implemented optimistic UI updates with rollback state snapshots in `src/app/dashboard/page.tsx` for immediate status feedback without network lag.
   - Built a dual-mode database adapter that supports live Supabase operations while providing a zero-setup local demo workspace for rapid reviewer evaluation.

---

## 8. Verification Instructions for the Evaluator

To review the project locally or live:

1. **Local Evaluation**:
   ```bash
   git clone https://github.com/sudharshan-08/task_mangement.git
   cd task_mangement
   npm install
   npm run build
   npm run start
   ```
   Open `http://localhost:3000` in any browser.
2. **Reviewing Code & Commits**:
   Visit [https://github.com/sudharshan-08/task_mangement](https://github.com/sudharshan-08/task_mangement) to inspect the commit log, TypeScript types, and SQL migrations.
3. **Database Verification**:
   All database tables, constraints, and Row Level Security policies can be reviewed in the provided SQL file:  
   `supabase/migrations/20261113000000_create_tasks_table.sql`.
