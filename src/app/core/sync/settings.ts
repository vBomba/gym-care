const URL_KEY = 'gym-care.syncUrl';
const TOKEN_KEY = 'gym-care.syncToken';
const REVISION_KEY = 'gym-care.syncRevision';
const LAST_SYNC_KEY = 'gym-care.lastSyncAt';

export interface SyncSettings {
  url: string;
  token: string;
}

export function loadSyncSettings(): SyncSettings {
  try {
    return {
      url: localStorage.getItem(URL_KEY) ?? '',
      token: localStorage.getItem(TOKEN_KEY) ?? '',
    };
  } catch {
    return { url: '', token: '' };
  }
}

export function saveSyncSettings(settings: SyncSettings): void {
  localStorage.setItem(URL_KEY, settings.url.trim());
  localStorage.setItem(TOKEN_KEY, settings.token.trim());
}

export function loadSyncRevision(): string | null {
  try {
    return localStorage.getItem(REVISION_KEY);
  } catch {
    return null;
  }
}

export function saveSyncRevision(revision: string | null): void {
  if (revision) {
    localStorage.setItem(REVISION_KEY, revision);
  } else {
    localStorage.removeItem(REVISION_KEY);
  }
}

export function loadLastSyncAt(): string | null {
  try {
    return localStorage.getItem(LAST_SYNC_KEY);
  } catch {
    return null;
  }
}

export function saveLastSyncAt(iso: string): void {
  localStorage.setItem(LAST_SYNC_KEY, iso);
}
