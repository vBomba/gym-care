import { Injectable, computed, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class RestTimer {
  readonly totalSec = signal(0);
  readonly remainingSec = signal(0);
  readonly label = computed(() => {
    const seconds = this.remainingSec();
    const minutes = Math.floor(seconds / 60);
    const rest = seconds % 60;
    return `${minutes}:${String(rest).padStart(2, '0')}`;
  });
  readonly progress = computed(() => {
    const total = this.totalSec();
    if (total <= 0) {
      return 0;
    }
    return Math.round((this.remainingSec() / total) * 100);
  });

  private handle = 0;

  start(minutes: number): void {
    const seconds = Math.max(1, Math.round(minutes * 60));
    window.clearInterval(this.handle);
    this.totalSec.set(seconds);
    this.remainingSec.set(seconds);
    this.handle = window.setInterval(() => {
      const next = this.remainingSec() - 1;
      if (next <= 0) {
        this.remainingSec.set(0);
        window.clearInterval(this.handle);
        navigator.vibrate?.(180);
        return;
      }
      this.remainingSec.set(next);
    }, 1000);
  }

  skip(): void {
    window.clearInterval(this.handle);
    this.remainingSec.set(0);
    this.totalSec.set(0);
  }
}
