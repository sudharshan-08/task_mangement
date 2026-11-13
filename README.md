# TaskFlow – Task Management Application

[![Next.js](https://img.shields.io/badge/Next.js-14.2.20-black.svg?style=flat&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6.3-blue.svg?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4.14-38B2AC.svg?style=flat&logo=tailwind-css)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL%20%26%20Auth-3ECF8E.svg?style=flat&logo=supabase)](https://supabase.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

TaskFlow is a simple, modern, and responsive task management SaaS application designed for professionals and teams who require focus, speed, and rock-solid security. Built as part of the Graduate Support Engineer Trainee Assessment, TaskFlow enables authenticated users to create tasks, organize them across a strict three-state lifecycle, and monitor real-time progress through dynamic dashboard metrics.

---

## Table of Contents

1. [Executive Summary & Features](#executive-summary--features)
2. [Technology Stack](#technology-stack)
3. [System Architecture](#system-architecture)
4. [Folder Structure](#folder-structure)
5. [Database Architecture & Security](#database-architecture--security)
6. [Prerequisites & Installation](#prerequisites--installation)
7. [Environment Variables](#environment-variables)
8. [Supabase & Google OAuth Configuration](#supabase--google-oauth-configuration)
9. [Database Migration Guide](#database-migration-guide)
10. [Local Development & Testing](#local-development--testing)
11. [Deployment Guide (Vercel)](#deployment-guide-vercel)
12. [Known Assumptions & Scope Limitations](#known-assumptions--scope-limitations)

---

## Executive Summary & Features

### Core Capabilities

- **Google Authentication with Supabase Auth**:
  - Secure Google OAuth 2.0 flow integrated via `@supabase/ssr` and Supabase Auth.
  - Automatic session hydration, token refresh, and protected route middleware.
  - Profile presentation including user's full name, email, and Google profile picture.
  - Graceful error messaging during callback failures or cancelled logins.
- **Strict 3-State Task Lifecycle**:
  - Tasks strictly transition between **Planned** (neutral grey), **In Progress** (blue), and **Complete** (green).
  - No extraneous states, ensuring strict operational alignment with assessment criteria.
- **Dynamic Real-Time Overview Metrics**:
  - Planned, In Progress, and Completed summary cards calculated dynamically from PostgreSQL records.
  - Progress percentage completion bar reflecting workspace health.
- **Task Creation & Validation**:
  - Clean modal dialog with autofocus, escape key trap, and background blur.
  - Client-side and server-side validation enforcing non-empty trimmed titles.
  - Default status automatically initialized to `Planned`.
  - Duplicate submission prevention and automatic form reset on success.
- **Instant Status Transition & Search**:
  - Inline status update dropdown with immediate UI feedback and database persistence.
  - Instant client-side search by title/description and status category filtering.
- **Enterprise Row Level Security (RLS)**:
  - Strict PostgreSQL policies ensuring users can only read, insert, and update their own tasks (`auth.uid() = user_id`).
  - Total tenant isolation at the database layer.

---

## Technology Stack

| Layer | Technology | Version | Purpose |
| :--- | :--- | :--- | :--- |
| **Framework** | Next.js (App Router) | `14.2.20` | Full-stack React framework with SSR and Route Handlers |
| **Language** | TypeScript | `^5.6.3` | End-to-end static typing and interface verification |
| **UI Library** | React | `^18.3.1` | Component-based declarative user interface |
| **Styling** | Tailwind CSS | `^3.4.14` | Utility-first responsive design system |
| **Icons** | Lucide React | `^0.454.0` | Accessible, modern iconography |
| **Backend & DB** | Supabase / PostgreSQL | `^2.46.1` | Managed PostgreSQL, Row Level Security, and Realtime |
| **Auth** | Supabase Auth (Google OAuth) | `@supabase/ssr ^0.5.2` | Cookie-based session handling and Google OAuth |
| **Hosting** | Vercel | Production | High-availability global edge deployment |

---

## System Architecture

```text
+-----------------------------------------------------------------------------------+
|                                 CLIENT BROWSER                                    |
|                                                                                   |
|   +-----------------------+     +------------------------+     +--------------+   |
|   |      Login Page       |     |   Dashboard Page       |     | Create Modal |   |
|   |  - Google OAuth Btn   |     |  - Dynamic Metrics     |     |  - Validate  |   |
|   |  - Standby Demo Mode  |     |  - Filter / Search Bar |     |  - Auto-reset|   |
|   +-----------+-----------+     |  - Task Cards & Status |     +-------+------+   |
|               |                 +-----------+------------+             |          |
+---------------|-----------------------------|--------------------------|----------+
                |                             |                          |
                v                             v                          v
+-----------------------------------------------------------------------------------+
|                           NEXT.JS APP ROUTER MIDDLEWARE                           |
|  - Validates active Supabase session cookie                                       |
|  - Guards /dashboard against unauthenticated access                               |
|  - Redirects logged-in users away from /login                                     |
+-----------------------------------------------------------------------------------+
                |                                                        |
                v                                                        v
+----------------------------------+     +------------------------------------------+
|      SUPABASE AUTH (GOOGLE)      |     |           SUPABASE POSTGRESQL            |
|  - Google OAuth 2.0 Consent      |     |  - Table: public.tasks                   |
|  - Exchange Code for Session     |     |  - Row Level Security (RLS)              |
|  - JWT with auth.uid()           |     |  - trigger_tasks_updated_at              |
+----------------------------------+     +------------------------------------------+
```

---

## Folder Structure

```text
taskflow/
├── .env.example                     # Environment template for local and production
├── .eslintrc.json                   # ESLint configuration
├── .gitignore                       # Git exclusion rules
├── next.config.mjs                  # Next.js config with remote image domains
├── package.json                     # Dependencies and scripts
├── postcss.config.mjs               # PostCSS configuration for Tailwind
├── tailwind.config.ts               # Tailwind CSS theme definitions
├── tsconfig.json                    # TypeScript compiler options
├── README.md                        # Complete technical documentation
├── USER_GUIDE.md                    # Non-technical end-user guide
├── AI_USAGE_SUMMARY.md              # Transparent AI tooling log
│
├── public/                          # Static assets and icons
│
├── src/
│   ├── app/
│   │   ├── globals.css              # Global styles, variables & scrollbars
│   │   ├── layout.tsx               # Root application layout
│   │   ├── page.tsx                 # Root redirection logic (/dashboard or /login)
│   │   ├── login/
│   │   │   └── page.tsx             # Login view with Google OAuth and Demo preview
│   │   ├── auth/
│   │   │   └── callback/
│   │   │       └── route.ts         # OAuth code exchange route handler
│   │   └── dashboard/
│   │       └── page.tsx             # Main task management dashboard
│   │
│   ├── components/
│   │   ├── Header.tsx               # App header with user profile & logout
│   │   ├── TaskSummary.tsx          # 3 dynamic status counter cards & progress bar
│   │   ├── TaskCard.tsx             # Individual task display card
│   │   ├── TaskList.tsx             # Filterable task grid, loading & empty states
│   │   ├── CreateTaskModal.tsx      # Modal form with validation and autofocus
│   │   ├── StatusBadge.tsx          # Visual badges (Planned, In Progress, Complete)
│   │   ├── StatusDropdown.tsx       # Interactive status transition selector
│   │   └── NotificationToast.tsx    # Accessible floating notification toasts
│   │
│   ├── lib/
│   │   ├── auth.ts                  # Client authentication operations & demo user
│   │   ├── tasks.ts                 # Database task CRUD operations & local sync
│   │   └── supabase/
│   │       ├── client.ts            # Browser Supabase client helper
│   │       ├── server.ts            # Server-side Supabase client helper
│   │       └── middleware.ts        # Session refresh & route guard logic
│   │
│   ├── types/
│   │   └── task.ts                  # TypeScript interfaces and TaskStatus unions
│   │
│   └── middleware.ts                # Next.js Edge Middleware route matcher
│
└── supabase/
    └── migrations/
        └── 20261113000000_create_tasks_table.sql # Complete SQL schema and RLS policies
```

---

## Database Architecture & Security

### `public.tasks` Table Definition

```sql
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

All operations are isolated strictly to the authenticated user owning the row (`auth.uid() = user_id`):

```sql
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- Select policy
CREATE POLICY "Users can view their own tasks"
    ON public.tasks FOR SELECT
    USING (auth.uid() = user_id);

-- Insert policy
CREATE POLICY "Users can create their own tasks"
    ON public.tasks FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Update policy
CREATE POLICY "Users can update their own tasks"
    ON public.tasks FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Delete policy
CREATE POLICY "Users can delete their own tasks"
    ON public.tasks FOR DELETE
    USING (auth.uid() = user_id);
```

---

## Prerequisites & Installation

### Prerequisites

- **Node.js**: v18.18.0 or higher (v20+ recommended).
- **npm** (v9+) or **pnpm** (v8+).
- **Git** version 2.30+.

### Installation

1. Clone or download the repository:
   ```bash
   git clone <repository-url>
   cd taskflow
   ```
2. Install npm dependencies:
   ```bash
   npm install
   ```
3. Copy the environment template:
   ```bash
   cp .env.example .env.local
   ```

---

## Environment Variables

Configure your credentials in `.env.local`:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.your-anon-key-here

# Optional: Set to 'true' to allow simulated demo mode for local UI evaluation
NEXT_PUBLIC_ENABLE_DEMO_MODE=true
```

> **Security Note**: Never expose your `SUPABASE_SERVICE_ROLE_KEY` in frontend code or in public git repositories. Only the public anon key (`NEXT_PUBLIC_SUPABASE_ANON_KEY`) is client-safe.

---

## Supabase & Google OAuth Configuration

Follow these step-by-step instructions to configure Google OAuth in Supabase:

### Step 1: Create Supabase Project
1. Log in to [Supabase](https://supabase.com/).
2. Create a new organization and project (e.g., `taskflow-prod`).
3. Note your **Project URL** and **Anon Public Key** from **Project Settings -> API**.

### Step 2: Configure Google Cloud Platform (GCP)
1. Navigate to the [Google Cloud Console](https://console.cloud.google.com/).
2. Create a new project named `TaskFlow`.
3. Configure the **OAuth Consent Screen**:
   - User Type: **External**.
   - App Name: `TaskFlow`.
   - User Support Email: Your email.
   - Authorized Domains: Add `supabase.co`.
4. Create Credentials:
   - Click **Create Credentials** -> **OAuth Client ID**.
   - Application Type: **Web application**.
   - Name: `TaskFlow Web Client`.
   - **Authorized redirect URIs**:
     Enter your Supabase callback URI:
     `https://<YOUR_SUPABASE_PROJECT_ID>.supabase.co/auth/v1/callback`
5. Copy your **Client ID** and **Client Secret**.

### Step 3: Enable Google Provider in Supabase
1. In your Supabase dashboard, go to **Authentication** -> **Providers**.
2. Locate **Google** and toggle it **Enabled**.
3. Paste the **Client ID** and **Client Secret** obtained from Google Cloud.
4. Go to **Authentication** -> **URL Configuration**:
   - Set **Site URL** to your local or production URL (e.g. `http://localhost:3000` or `https://taskflow.vercel.app`).
   - In **Redirect URLs**, add:
     - `http://localhost:3000/auth/callback`
     - `https://your-deployment-domain.vercel.app/auth/callback`

---

## Database Migration Guide

Execute the migration file directly in your Supabase SQL Editor:

1. Open your Supabase Dashboard.
2. Click **SQL Editor** from the left navigation bar.
3. Open `supabase/migrations/20261113000000_create_tasks_table.sql` from this repository.
4. Paste the SQL contents into the query editor and click **Run**.
5. Verify in the **Table Editor** that `tasks` exists with RLS enabled and 4 active policies.

---

## Local Development & Testing

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser.

### Quality Assurance & Linting Commands

```bash
# TypeScript compilation check
npm run typecheck

# ESLint verification
npm run lint

# Production build verification
npm run build
```

---

## Deployment Guide (Vercel)

Deploying TaskFlow to Vercel requires under 5 minutes:

1. Push your repository to GitHub:
   ```bash
   git add .
   git commit -m "feat: complete TaskFlow implementation with Supabase Auth and RLS"
   git remote add origin https://github.com/<your-username>/taskflow.git
   git push -u origin main
   ```
2. Log in to [Vercel](https://vercel.com/) and click **Add New...** -> **Project**.
3. Select your `taskflow` repository.
4. Under **Environment Variables**, add:
   - `NEXT_PUBLIC_SUPABASE_URL`: `https://your-project-id.supabase.co`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: `<your-supabase-anon-key>`
5. Click **Deploy**.
6. Once deployed, copy your production domain (e.g., `https://taskflow-kovai.vercel.app`) and add `https://taskflow-kovai.vercel.app/auth/callback` to both **Supabase Redirect URLs** and **Google Cloud Authorized Redirect URIs**.

---

## Known Assumptions & Scope Limitations

1. **Authentication Provider**: Authentication is strictly handled via Google OAuth as specified.
2. **Three Fixed Task States**: Tasks strictly support `Planned`, `In Progress`, and `Complete`.
3. **Tenant Boundary**: Each user strictly manages their own tasks; multi-tenant collaboration, workspace teams, and role hierarchies were intentionally excluded to align with assessment scope.
4. **Mandatory vs Optional Fields**: Title is mandatory and validated; description is optional.
5. **No Destructive Deletion in Mandatory Scope**: Task deletion and editing were kept outside mandatory scope per Section 10 guidelines.
