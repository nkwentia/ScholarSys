// src/app/api/payments/route.ts
// Phase 1: Financial Core — Payments CRUD with CRUD triggers

import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { z } from 'zod';

const PaymentSchema = z.object({
  student_id: z.string().uuid(),
  amount: z.number().positive(),
  payment_date: z.string(),
  payment_type: z.enum(['school_fees', 'exam_fees', 'pta', 'uniform', 'other']),
  term: z.union([z.literal(1), z.literal(2), z.literal(3)]),
  academic_year: z.string(),
  collected_by: z.string().min(1),
  receipt_number: z.string().min(1),
  notes: z.string().optional(),
});

// GET: list payments with optional filters
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const studentId = searchParams.get('student_id');
  const year = searchParams.get('academic_year');
  const term = searchParams.get('term');

  let query = supabase
    .from('payments')
    .select('*, students(first_name, last_name, student_number)')
    .order('payment_date', { ascending: false });

  if (studentId) query = query.eq('student_id', studentId);
  if (year) query = query.eq('academic_year', year);
  if (term) query = query.eq('term', parseInt(term));

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

// POST: record a new payment
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = PaymentSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('payments')
      .insert(parsed.data)
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }
}
