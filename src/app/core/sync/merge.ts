import type { DeletionRecord, Program, Session, SyncBundle } from '../models';

function newerIso(a: string, b: string): boolean {
  return a > b;
}

export function pickNewerProgram(a: Program, b: Program): Program {
  return newerIso(a.updatedAt, b.updatedAt) ? a : b;
}

export function mergeDeletions(
  local: DeletionRecord[],
  remote: DeletionRecord[],
): DeletionRecord[] {
  const byId = new Map<string, DeletionRecord>();
  for (const item of [...local, ...remote]) {
    const existing = byId.get(item.id);
    if (!existing || newerIso(item.deletedAt, existing.deletedAt)) {
      byId.set(item.id, item);
    }
  }
  return [...byId.values()].sort((a, b) => a.id.localeCompare(b.id));
}

export function mergeSessions(
  local: Session[],
  remote: Session[],
  deletions: DeletionRecord[],
): Session[] {
  const deletedAt = new Map(deletions.map((item) => [item.id, item.deletedAt]));
  const byId = new Map<string, Session>();

  for (const session of [...local, ...remote]) {
    if (session.status !== 'completed') {
      continue;
    }
    const existing = byId.get(session.id);
    if (!existing || newerIso(session.updatedAt, existing.updatedAt)) {
      byId.set(session.id, session);
    }
  }

  return [...byId.values()]
    .filter((session) => {
      const tombstone = deletedAt.get(session.id);
      return !tombstone || newerIso(session.updatedAt, tombstone);
    })
    .sort((a, b) => b.performedAt.localeCompare(a.performedAt));
}

/** Last-write-wins merge. Active sessions never enter bundles. */
export function mergeBundles(local: SyncBundle, remote: SyncBundle): SyncBundle {
  const deletions = mergeDeletions(local.deletions, remote.deletions);
  return {
    schemaVersion: 1,
    exportedAt: new Date().toISOString(),
    program: pickNewerProgram(local.program, remote.program),
    sessions: mergeSessions(local.sessions, remote.sessions, deletions),
    deletions,
    deviceId: local.deviceId,
  };
}

export function isSyncBundle(value: unknown): value is SyncBundle {
  if (!value || typeof value !== 'object') {
    return false;
  }
  const bundle = value as SyncBundle;
  return (
    bundle.schemaVersion === 1 &&
    typeof bundle.exportedAt === 'string' &&
    typeof bundle.deviceId === 'string' &&
    !!bundle.program &&
    bundle.program.id === 'main' &&
    Array.isArray(bundle.sessions) &&
    Array.isArray(bundle.deletions)
  );
}
