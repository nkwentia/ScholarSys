// src/app/api/students/route.ts
// Phase 1: Student CRUD

import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { z } from 'zod';

const StudentSchema = z.object({
  student_number: z.string().min(1),
  first_name: z.string().min(1),
  last_name: z.string().min(1),
  date_of_birth: z.string().optional(),
  class_id: z.string().uuid(),
  parent_name: z.string().min(1),
  parent_phone: z.string().min(1),
  parent_email: z.string().email().optional(),
  photo_url: z.string().url().optional(),
});

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const classId = searchParams.get('class_id');
  const search = searchParams.get('q');

  let query = supabase
    .from('students')
    .select('*, classes(name, level)')
    .eq('is_active', true)
    .order('last_name');

  if (classId) query = query.eq('class_id', classId);
  if (search) {
    query = query.or(
      `first_name.ilike.%${search}%,last_name.ilike.%${search}%,student_number.ilike.%${search}%`
    );
  }

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = StudentSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }
    const { data, error } = await supabase
      .from('students')
      .insert(parsed.data)
      .select()
      .single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
