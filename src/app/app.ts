import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { RestTimer } from './core/rest-timer';
import { SyncService } from './core/sync/sync.service';
import { TrainingStore } from './core/training.store';
import { I18nService } from './i18n/i18n.service';
import type { AppLocale } from './i18n/locale';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app.html',
})
export class App {
  protected readonly store = inject(TrainingStore);
  protected readonly timer = inject(RestTimer);
  protected readonly i18n = inject(I18nService);
  private readonly sync = inject(SyncService);

  constructor() {
    void this.store.init();
    this.sync.startListeners();
  }

  protected setLocale(locale: AppLocale): void {
    this.i18n.setLocale(locale);
  }
}
