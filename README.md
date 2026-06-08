# ScholarSys — Next.js + Supabase Migration

> A modern, offline-capable school management system designed for Cameroonian schools, built with Next.js 14, Supabase, and Tailwind CSS.
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