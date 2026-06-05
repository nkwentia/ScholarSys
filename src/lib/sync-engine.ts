// src/lib/sync-engine.ts
// Phase 4: Hybrid Sync — IndexedDB queue + Supabase background merge

import { openDB, IDBPDatabase } from 'idb';
import { supabase } from './supabase';
import type { SyncQueueItem } from '@/types';

const DB_NAME = 'schoolman-offline';
const DB_VERSION = 1;
const STORE = 'sync_queue';

let db: IDBPDatabase | null = null;

async function getDB(): Promise<IDBPDatabase> {
  if (db) return db;
  db = await openDB(DB_NAME, DB_VERSION, {
    upgrade(database) {
      if (!database.objectStoreNames.contains(STORE)) {
        database.createObjectStore(STORE, { keyPath: 'id' });
      }
    },
  });
  return db;
}

/**
 * Queue an operation for later sync when offline.
 */
export async function queueOperation(
  table: string,
  operation: SyncQueueItem['operation'],
  payload: Record<string, unknown>
): Promise<void> {
  const db = await getDB();
  const item: SyncQueueItem = {
    id: crypto.randomUUID(),
    table,
    operation,
    payload,
    created_at: Date.now(),
    retries: 0,
  };
  await db.put(STORE, item);

  // Register background sync if SW available
  if ('serviceWorker' in navigator && 'SyncManager' in window) {
    const reg = await navigator.serviceWorker.ready;
    await (reg as any).sync.register('sync-queue');
  }
}

/**
 * Flush all queued operations to Supabase.
 * Call this when coming back online.
 */
export async function flushSyncQueue(): Promise<{ success: number; failed: number }> {
  const db = await getDB();
  const items: SyncQueueItem[] = await db.getAll(STORE);
  let success = 0;
  let failed = 0;

  for (const item of items.sort((a, b) => a.created_at - b.created_at)) {
    try {
      let error;

      if (item.operation === 'insert') {
        ({ error } = await supabase.from(item.table).insert(item.payload));
      } else if (item.operation === 'update') {
        const { id, ...rest } = item.payload as any;
        ({ error } = await supabase.from(item.table).update(rest).eq('id', id));
      } else if (item.operation === 'delete') {
        ({ error } = await supabase.from(item.table).delete().eq('id', (item.payload as any).id));
      }

      if (error) throw error;
      await db.delete(STORE, item.id);
      success++;
    } catch {
      await db.put(STORE, { ...item, retries: item.retries + 1 });
      failed++;
    }
  }

  return { success, failed };
}

/**
 * Get count of pending items in the sync queue.
 */
export async function getPendingCount(): Promise<number> {
  const db = await getDB();
  return (await db.count(STORE));
}

/**
 * Listen for SW messages to flush the queue.
 */
export function registerSyncListener() {
  if (typeof window === 'undefined') return;
  navigator.serviceWorker?.addEventListener('message', (event) => {
    if (event.data?.type === 'FLUSH_SYNC_QUEUE') {
      flushSyncQueue();
    }
  });
}
