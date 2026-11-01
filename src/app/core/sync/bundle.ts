import { db } from '../db';
import { getDeviceId } from '../device-id';
import type { SyncBundle } from '../models';

/** Build a sync snapshot: program + completed sessions + tombstones. */
export async function collectBundle(): Promise<SyncBundle | null> {
  const program = await db.program.get('main');
  if (!program) {
    return null;
  }
  const [sessions, deletions] = await Promise.all([
    db.sessions.where('status').equals('completed').toArray(),
    db.deletions.toArray(),
  ]);
  return {
    schemaVersion: 1,
    exportedAt: new Date().toISOString(),
    program,
    sessions,
    deletions,
    deviceId: getDeviceId(),
  };
}

/**
 * Replace synced data with the merged bundle.
 * Local active sessions are preserved and never overwritten by remote.
 */
export async function applyBundle(bundle: SyncBundle): Promise<void> {
  const active = await db.sessions.where('status').equals('active').toArray();
  const activeIds = new Set(active.map((session) => session.id));

  await db.transaction('rw', db.program, db.sessions, db.deletions, async () => {
    await db.program.put(bundle.program);

    const completed = await db.sessions.where('status').equals('completed').toArray();
    const keepIds = new Set(bundle.sessions.map((session) => session.id));
    for (const session of completed) {
      if (!keepIds.has(session.id) && !activeIds.has(session.id)) {
        await db.sessions.delete(session.id);
      }
    }
    for (const session of bundle.sessions) {
      if (activeIds.has(session.id)) {
        continue;
      }
      await db.sessions.put({ ...session, status: 'completed' });
    }

    await db.deletions.clear();
    if (bundle.deletions.length > 0) {
      await db.deletions.bulkPut(bundle.deletions);
    }
  });
}
