import { Component, computed, inject } from '@angular/core';
import { SyncService } from '../core/sync/sync.service';
import { I18nService } from '../i18n/i18n.service';

@Component({
  selector: 'app-sync',
  templateUrl: './sync.page.html',
})
export class SyncPage {
  protected readonly sync = inject(SyncService);
  protected readonly i18n = inject(I18nService);

  protected readonly statusLabel = computed(() => {
    switch (this.sync.status()) {
      case 'syncing':
        return this.i18n.t('syncStatusSyncing');
      case 'ok':
        return this.i18n.t('syncStatusOk');
      case 'offline':
        return this.i18n.t('syncStatusOffline');
      case 'error':
        return this.i18n.t('syncStatusError');
      default:
        return this.i18n.t('syncStatusIdle');
    }
  });

  protected readonly feedback = computed(() => {
    const key = this.sync.message();
    if (!key) {
      return '';
    }
    switch (key) {
      case 'synced':
        return this.i18n.t('syncDone');
      case 'exported':
        return this.i18n.t('syncExported');
      case 'imported':
        return this.i18n.t('syncImported');
      case 'offline':
        return this.i18n.t('syncStatusOffline');
      case 'missing-url':
        return this.i18n.t('syncNeedUrl');
      case 'missing-token':
        return this.i18n.t('syncNeedToken');
      case 'no-program':
        return this.i18n.t('syncNoProgram');
      case 'invalid-bundle':
        return this.i18n.t('syncInvalidFile');
      case 'conflict':
        return this.i18n.t('syncConflict');
      case 'pull-failed':
      case 'push-failed':
      case 'sync-failed':
        return this.i18n.t('syncFailed');
      default:
        return this.i18n.t('syncFailed');
    }
  });

  protected readonly lastSyncLabel = computed(() => {
    const at = this.sync.lastSyncAt();
    if (!at) {
      return this.i18n.t('syncNever');
    }
    const date = new Date(at);
    if (Number.isNaN(date.getTime())) {
      return this.i18n.t('syncNever');
    }
    return this.i18n.t('syncLastAt', {
      time: date.toLocaleString(this.i18n.locale(), {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
      }),
    });
  });

  protected onUrl(event: Event): void {
    this.sync.updateSettings({ url: (event.target as HTMLInputElement).value });
  }

  protected onToken(event: Event): void {
    this.sync.updateSettings({ token: (event.target as HTMLInputElement).value });
  }

  protected async onImport(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';
    if (!file) {
      return;
    }
    await this.sync.importFile(file);
  }
}
