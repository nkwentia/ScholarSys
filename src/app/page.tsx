// src/app/page.tsx
import { redirect } from 'next/navigation';

export default function RootPage() {
  // Automatically routes incoming traffic to your Phase 1 layout
  redirect('/dashboard');
}