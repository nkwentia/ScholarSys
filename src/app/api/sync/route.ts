// src/app/api/sync/route.ts
// Phase 4: Hybrid Sync — Accept batched offline operations from client

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import type { SyncQueueItem } from '@/types';

export async function POST(req: NextRequest) {
  try {
    const items: SyncQueueItem[] = await req.json();
    const results: { id: string; success: boolean; error?: string }[] = [];

    for (const item of items.sort((a, b) => a.created_at - b.created_at)) {
      try {
        let error;
        if (item.operation === 'insert') {
          ({ error } = await supabaseAdmin.from(item.table).insert(item.payload));
        } else if (item.operation === 'update') {
          const { id, ...rest } = item.payload as any;
          ({ error } = await supabaseAdmin.from(item.table).update(rest).eq('id', id));
        } else if (item.operation === 'delete') {
          ({ error } = await supabaseAdmin.from(item.table).delete().eq('id', (item.payload as any).id));
        }
        results.push({ id: item.id, success: !error, error: error?.message });
      } catch (err: any) {
        results.push({ id: item.id, success: false, error: err.message });
      }
    }

    return NextResponse.json({ results });
  } catch {
    return NextResponse.json({ error: 'Invalid sync payload' }, { status: 400 });
  }
}
