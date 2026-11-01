import { Injectable, inject, signal } from '@angular/core';
import { TrainingStore } from '../training.store';
import { applyBundle, collectBundle } from './bundle';
import { isSyncBundle, mergeBundles } from './merge';
import {
  SyncRemoteError,
  downloadBundleFile,
  pullRemote,
  pushRemote,
  readBundleFile,
} from './remote';
import {
  loadLastSyncAt,
  loadSyncSettings,
  saveLastSyncAt,
  saveSyncSettings,
  type SyncSettings,
} from './settings';

export type SyncStatus = 'idle' | 'syncing' | 'ok' | 'offline' | 'error';

@Injectable({ providedIn: 'root' })
export class SyncService {
  private readonly store = inject(TrainingStore);
  private listening = false;
  private syncing = false;

  readonly status = signal<SyncStatus>('idle');
  readonly message = signal<string | null>(null);
  readonly lastSyncAt = signal<string | null>(loadLastSyncAt());
  readonly settings = signal<SyncSettings>(loadSyncSettings());

  startListeners(): void {
    if (this.listening || typeof window === 'undefined') {
      return;
    }
    this.listening = true;
    window.addEventListener('online', () => {
      void this.tryAutoSync();
    });
    if (!navigator.onLine) {
      this.status.set('offline');
    }
  }

  updateSettings(partial: Partial<SyncSettings>): void {
    const next = { ...this.settings(), ...partial };
    saveSyncSettings(next);
    this.settings.set(loadSyncSettings());
  }

  async exportFile(): Promise<void> {
    const local = await collectBundle();
    if (!local) {
      this.fail('no-program');
      return;
    }
    downloadBundleFile(local);
    this.status.set('ok');
    this.message.set('exported');
  }

  async importFile(file: File): Promise<void> {
    this.status.set('syncing');
    this.message.set(null);
    try {
      const remote = await readBundleFile(file);
      const local = await collectBundle();
      if (!local) {
        throw new SyncRemoteError('no-program');
      }
      const merged = mergeBundles(local, remote);
      await applyBundle(merged);
      await this.store.reloadFromDb();
      this.markOk();
      this.message.set('imported');
    } catch (error) {
      this.fail(this.errorKey(error));
    }
  }

  async syncNow(): Promise<void> {
    await this.runSync(false);
  }

  async tryAutoSync(): Promise<void> {
    if (!navigator.onLine) {
      this.status.set('offline');
      return;
    }
    const { url, token } = this.settings();
    if (!url.trim() || !token.trim()) {
      return;
    }
    if (this.store.activeSession()) {
      return;
    }
    await this.runSync(true);
  }

  private async runSync(quiet: boolean): Promise<void> {
    if (this.syncing) {
      return;
    }
    if (!navigator.onLine) {
      this.status.set('offline');
      this.message.set('offline');
      return;
    }

    this.syncing = true;
    this.status.set('syncing');
    if (!quiet) {
      this.message.set(null);
    }

    try {
      let local = await collectBundle();
      if (!local) {
        throw new SyncRemoteError('no-program');
      }

      let remote = await pullRemote();
      let merged = remote.bundle ? mergeBundles(local, remote.bundle) : local;
      await applyBundle(merged);
      await this.store.reloadFromDb();

      local = (await collectBundle()) ?? merged;
      try {
        await pushRemote(local);
      } catch (error) {
        if (error instanceof SyncRemoteError && error.status === 412) {
          remote = await pullRemote();
          if (!remote.bundle || !isSyncBundle(remote.bundle)) {
            throw error;
          }
          merged = mergeBundles(local, remote.bundle);
          await applyBundle(merged);
          await this.store.reloadFromDb();
          local = (await collectBundle()) ?? merged;
          await pushRemote(local);
        } else {
          throw error;
        }
      }

      this.markOk();
      if (!quiet) {
        this.message.set('synced');
      }
    } catch (error) {
      this.fail(this.errorKey(error));
    } finally {
      this.syncing = false;
    }
  }

  private markOk(): void {
    const now = new Date().toISOString();
    saveLastSyncAt(now);
    this.lastSyncAt.set(now);
    this.status.set('ok');
  }

  private fail(key: string): void {
    this.status.set('error');
    this.message.set(key);
  }

  private errorKey(error: unknown): string {
    if (error instanceof SyncRemoteError) {
      return error.message;
    }
    if (error instanceof SyntaxError) {
      return 'invalid-bundle';
    }
    return 'sync-failed';
  }
}
