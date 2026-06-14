// src/app/dashboard/actions.ts
'use server'

import { supabase } from '@/lib/supabase';
import { revalidatePath } from 'next/cache';

export async function processVoucher(formData: FormData) {
  const studentNumber = formData.get('studentNumber') as string;
  const amountStr = formData.get('amount') as string;
  const paymentType = formData.get('paymentType') as string;

  if (!studentNumber || !amountStr || !paymentType) {
    return { error: 'All voucher fields are strictly required.' };
  }

  const amount = parseFloat(amountStr);

  // 1. Resolve the internal UUID for the student via their student_number
  const { data: student, error: studentError } = await supabase
    .from('students')
    .select('id')
    .eq('student_number', studentNumber.trim())
    .maybeSingle(); // Safer than single() as it won't throw a 406 on empty rows

  if (studentError || !student) {
    // Return a clean string instead of crashing the server
    return { error: `Student with matricule "${studentNumber}" not found in ScholarSys records.` };
  }

  // 2. Generate a structured sequential receipt identifier token
  const receiptNumber = `REC-2026-${Math.floor(100000 + Math.random() * 900000)}`;

  // 3. Write the log block directly to the Supabase payments table
  const { error: insertError } = await supabase
    .from('payments')
    .insert({
      student_id: student.id,
      amount: amount,
      payment_type: paymentType,
      term: 1, 
      academic_year: '2025/2026',
      collected_by: 'Admin Desk', 
      receipt_number: receiptNumber,
      notes: 'Logged via Fast Voucher dashboard panel terminal.'
    });

  if (insertError) {
    console.error('Database write failure:', insertError);
    return { error: 'Failed to record transaction log in database.' };
  }

  // 4. Clear the server cache and reload the visual components instantly
  revalidatePath('/dashboard');
  return { success: true };
}