import { Component, computed, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { loggedCount, nowTimeInputValue, todayInputValue } from '../core/format';
import { TrainingStore } from '../core/training.store';
import { I18nService } from '../i18n/i18n.service';
import { ExerciseArt } from '../shared/exercise-art';

@Component({
  selector: 'app-today',
  imports: [RouterLink, ExerciseArt],
  templateUrl: './today.page.html',
})
export class TodayPage {
  protected readonly store = inject(TrainingStore);
  protected readonly i18n = inject(I18nService);
  protected readonly loggedCount = loggedCount;
  private readonly router = inject(Router);

  protected readonly pickedDayId = signal<string | null>(null);
  protected readonly recallOpen = signal(false);
  protected readonly confirmCancel = signal(false);
  protected readonly recallDate = signal(todayInputValue());
  protected readonly recallTime = signal(nowTimeInputValue());
  protected readonly recallError = signal('');

  protected readonly day = computed(() => {
    const program = this.store.program();
    if (!program) {
      return null;
    }
    const id = this.pickedDayId() ?? this.store.nextDay()?.id;
    return program.days.find((item) => item.id === id) ?? program.days[0] ?? null;
  });

  protected readonly otherDay = computed(() => {
    const program = this.store.program();
    const current = this.day();
    if (!program || !current) {
      return null;
    }
    return program.days.find((item) => item.id !== current.id) ?? null;
  });

  protected switchDay(): void {
    const other = this.otherDay();
    if (other) {
      this.pickedDayId.set(other.id);
    }
  }

  protected async startLive(): Promise<void> {
    const day = this.day();
    if (!day) {
      return;
    }
    const id = await this.store.startSession(day.id, 'live');
    if (id) {
      await this.router.navigate(['/workout', id]);
    }
  }

  protected async startRecalled(): Promise<void> {
    const day = this.day();
    if (!day) {
      return;
    }
    const performedAt = new Date(`${this.recallDate()}T${this.recallTime()}`).toISOString();
    if (Number.isNaN(Date.parse(performedAt))) {
      this.recallError.set(this.i18n.t('needDateTime'));
      return;
    }
    this.recallError.set('');
    const id = await this.store.startSession(day.id, 'recalled', performedAt);
    if (id) {
      await this.router.navigate(['/workout', id]);
    }
  }

  protected onDate(event: Event): void {
    this.recallDate.set((event.target as HTMLInputElement).value);
  }

  protected onTime(event: Event): void {
    this.recallTime.set((event.target as HTMLInputElement).value);
  }

  protected async cancelActive(): Promise<void> {
    const active = this.store.activeSession();
    if (!active) {
      return;
    }
    await this.store.cancelSession(active.id);
    this.confirmCancel.set(false);
  }
}
