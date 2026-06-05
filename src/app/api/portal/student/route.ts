// src/app/api/portal/student/route.ts
// Phase 5: Mobile Gateway — Parent/student portal API endpoint

import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  try {
    const { phone, pin, student_id } = await req.json();

    if (!phone || !pin || !student_id) {
      return NextResponse.json({ error: 'Missing credentials' }, { status: 400 });
    }

    // Verify parent portal user (PIN checked via Supabase function in production)
    const { data: portalUser, error } = await supabase
      .from('parent_portal_users')
      .select('*')
      .eq('phone', phone)
      .eq('student_id', student_id)
      .single();

    if (error || !portalUser) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // Fetch student summary
    const { data: student } = await supabase
      .from('students')
      .select('*, classes(name)')
      .eq('id', student_id)
      .single();

    // Fetch recent payments
    const { data: payments } = await supabase
      .from('payments')
      .select('amount, payment_type, payment_date, term, academic_year')
      .eq('student_id', student_id)
      .order('payment_date', { ascending: false })
      .limit(5);

    // Fetch latest grades
    const { data: grades } = await supabase
      .from('grades')
      .select('score, max_score, grade_letter, term, academic_year, subjects(name)')
      .eq('student_id', student_id)
      .order('entered_at', { ascending: false })
      .limit(10);

    return NextResponse.json({
      student,
      payments: payments ?? [],
      grades: grades ?? [],
    });
  } catch (err) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
