# SchoolMan — Next.js + Supabase Migration

> A modern, offline-capable school management system built with Next.js 14, Supabase, and Tailwind CSS.
> Migrated from the legacy AngularJS/Grunt codebase (nkwentia/schoolman).

---

## 5-Phase Architecture

| Phase | Focus | Key Technologies | Output |
|-------|-------|-----------------|--------|
| **Phase 1** | Database & Admin | Next.js, Supabase/PostgreSQL | Financial dashboard, student CRUD, daily payment tracking |
| **Phase 2** | Data Capture AI | Tesseract.js OCR | Automated grade parsing, class demographic metrics |
| **Phase 3** | Scheduling & I/O | CSS print styles, timetable engine | Conflict-free timetable, printable reports |
| **Phase 4** | Network Layer | Service Workers, IndexedDB, idb | Offline-first, background sync, push notifications |
| **Phase 5** | Mobile Gateway | PWA / React Native | Parent portal, Android-ready APK via Capacitor |

---

## Project Structure

```
schoolman-nextjs/
├── src/
│   ├── app/
│   │   ├── layout.tsx              # Root layout
│   │   ├── dashboard/
│   │   │   ├── page.tsx            # Phase 1: Financial dashboard
│   │   │   ├── grades/page.tsx     # Phase 2: OCR grade entry
│   │   │   └── timetable/page.tsx  # Phase 3: Timetable grid + print
│   │   └── api/
│   │       ├── students/route.ts   # Phase 1: Student CRUD
│   │       ├── payments/route.ts   # Phase 1: Payment tracking
│   │       ├── sync/route.ts       # Phase 4: Offline sync endpoint
│   │       └── portal/student/     # Phase 5: Parent portal
│   ├── lib/
│   │   ├── supabase.ts             # Supabase client
│   │   ├── grade-ocr.ts            # Phase 2: Tesseract OCR engine
│   │   └── sync-engine.ts          # Phase 4: IndexedDB sync queue
│   ├── types/index.ts              # Shared TypeScript types
│   └── styles/globals.css          # Tailwind + print CSS
├── supabase/
│   └── migrations/
│       └── 001_core_schema.sql     # Full DB schema (all phases)
├── scheduling/
│   └── timetable-engine.ts         # Phase 3: Constraint scheduler
├── public/
│   ├── sw.js                       # Phase 4: Service Worker
│   └── manifest.json               # PWA manifest
├── .env.example
├── next.config.js
├── tailwind.config.js
└── tsconfig.json
```

---

## Quick Start

### 1. Clone & Install

```bash
git clone https://github.com/nkwentia/schoolman
cd schoolman-nextjs
npm install
```

### 2. Set up Supabase

1. Create a free project at [supabase.com](https://supabase.com)
2. Copy `.env.example` → `.env.local` and fill in your keys:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
   SUPABASE_SERVICE_ROLE_KEY=eyJ...
   ```
3. Run the migration in Supabase SQL editor:
   ```sql
   -- paste contents of supabase/migrations/001_core_schema.sql
   ```

### 3. Run Development Server

```bash
npm run dev
# Open http://localhost:3000/dashboard
```

---

## Phase-by-Phase Setup Guide

### Phase 1 — Database & Admin
- Visit `/dashboard` for the financial overview
- Use `/api/students` and `/api/payments` for CRUD operations
- All data stored in Supabase PostgreSQL

### Phase 2 — Grade OCR
- Visit `/dashboard/grades`
- Upload a photo of a grade sheet — Tesseract.js parses it automatically
- Grades are classified using Cameroon GCE letter scale (A–F)

### Phase 3 — Scheduling
- Visit `/dashboard/timetable` to view the grid
- Use `scheduling/timetable-engine.ts` to generate conflict-free slots
- Print button triggers browser CSS print view

### Phase 4 — Offline / PWA
- Service Worker registered via `public/sw.js`
- IndexedDB queue via `src/lib/sync-engine.ts`
- When offline: data queued locally; synced when back online via `/api/sync`

### Phase 5 — Mobile (Android)
- The app is PWA-ready (manifest + SW)
- To build an Android APK, wrap with Capacitor:
  ```bash
  npm install @capacitor/core @capacitor/android
  npx cap init SchoolMan com.schoolman.app
  npm run build
  npx cap add android
  npx cap sync
  npx cap open android
  ```

---

## Key Features

- **Financial tracking**: per-student payment records, term summaries, receipt generation
- **OCR grade entry**: upload handwritten grade sheets, auto-parse scores
- **Conflict-free timetabling**: greedy constraint solver with teacher availability
- **Printable reports**: CSS print styles for report cards and timetables
- **Offline-first**: works without internet, syncs when reconnected
- **Parent portal**: phone + PIN login, view grades and payment history
- **PWA / Android-ready**: installable on Android via browser or Capacitor APK

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router) |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth |
| Styling | Tailwind CSS |
| OCR | Tesseract.js |
| Offline | IndexedDB (idb) + Service Workers |
| Type safety | TypeScript + Zod |
| Print | CSS @media print |
| Mobile | PWA → Capacitor (Android) |

---

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ | Public anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ | Server-side admin key |
| `NEXT_PUBLIC_APP_URL` | Optional | App URL for redirects |
