import type { SyncBundle } from '../models';
import { isSyncBundle } from './merge';
import { loadSyncRevision, loadSyncSettings, saveSyncRevision } from './settings';

export class SyncRemoteError extends Error {
  constructor(
    message: string,
    readonly status?: number,
  ) {
    super(message);
    this.name = 'SyncRemoteError';
  }
}

function endpoint(): string {
  const { url, token } = loadSyncSettings();
  if (!url.trim()) {
    throw new SyncRemoteError('missing-url');
  }
  if (!token.trim()) {
    throw new SyncRemoteError('missing-token');
  }
  return url.replace(/\/$/, '') + '/v1/sync';
}

function authHeaders(extra?: HeadersInit): Headers {
  const { token } = loadSyncSettings();
  const headers = new Headers(extra);
  headers.set('Authorization', `Bearer ${token.trim()}`);
  return headers;
}

export interface PullResult {
  bundle: SyncBundle | null;
  revision: string | null;
}

export async function pullRemote(): Promise<PullResult> {
  const response = await fetch(endpoint(), {
    method: 'GET',
    headers: authHeaders(),
  });
  if (response.status === 404) {
    return { bundle: null, revision: null };
  }
  if (!response.ok) {
    throw new SyncRemoteError('pull-failed', response.status);
  }
  const data: unknown = await response.json();
  if (!isSyncBundle(data)) {
    throw new SyncRemoteError('invalid-bundle', response.status);
  }
  const revision = response.headers.get('ETag')?.replaceAll('"', '') ?? null;
  if (revision) {
    saveSyncRevision(revision);
  }
  return { bundle: data, revision };
}

export async function pushRemote(bundle: SyncBundle): Promise<string | null> {
  const revision = loadSyncRevision();
  const headers = authHeaders({
    'Content-Type': 'application/json',
  });
  if (revision) {
    headers.set('If-Match', `"${revision}"`);
  }

  const response = await fetch(endpoint(), {
    method: 'PUT',
    headers,
    body: JSON.stringify(bundle),
  });

  if (response.status === 412) {
    throw new SyncRemoteError('conflict', 412);
  }
  if (!response.ok) {
    throw new SyncRemoteError('push-failed', response.status);
  }

  const next = response.headers.get('ETag')?.replaceAll('"', '') ?? null;
  saveSyncRevision(next);
  return next;
}

export function downloadBundleFile(bundle: SyncBundle): void {
  const blob = new Blob([JSON.stringify(bundle, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  const stamp = bundle.exportedAt.slice(0, 10);
  anchor.href = url;
  anchor.download = `gym-care-sync-${stamp}.json`;
  anchor.click();
  URL.revokeObjectURL(url);
}

export async function readBundleFile(file: File): Promise<SyncBundle> {
  const text = await file.text();
  const data: unknown = JSON.parse(text);
  if (!isSyncBundle(data)) {
    throw new SyncRemoteError('invalid-bundle');
  }
  return data;
}
