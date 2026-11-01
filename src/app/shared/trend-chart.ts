import { Component, computed, input } from '@angular/core';

export interface TrendPoint {
  label: string;
  value: number;
  href?: string;
}

@Component({
  selector: 'app-trend-chart',
  template: `
    @if (points().length < 2) {
      <p class="muted chart-empty">{{ emptyText() }}</p>
    } @else {
      <div class="chart">
        <svg viewBox="0 0 320 168" role="img" [attr.aria-label]="title()">
          @for (grid of grids(); track grid) {
            <line class="chart-grid" x1="36" [attr.y1]="grid" x2="308" [attr.y2]="grid" />
          }
          <polygon class="chart-area" [attr.points]="areaPoints()" />
          <polyline class="chart-line" fill="none" [attr.points]="linePoints()" />
          @for (dot of dots(); track $index) {
            @if (dot.href) {
              <a [attr.href]="dot.href">
                <circle class="chart-dot" [attr.cx]="dot.x" [attr.cy]="dot.y" r="5" />
              </a>
            } @else {
              <circle class="chart-dot" [attr.cx]="dot.x" [attr.cy]="dot.y" r="5" />
            }
          }
          <text class="chart-axis" x="8" y="22">{{ maxLabel() }}</text>
          <text class="chart-axis" x="8" y="156">{{ minLabel() }}</text>
        </svg>
        <div class="chart-labels">
          <span>{{ firstLabel() }}</span>
          <span>{{ lastLabel() }}</span>
        </div>
      </div>
    }
  `,
})
export class TrendChart {
  readonly points = input<TrendPoint[]>([]);
  readonly title = input('');
  readonly emptyText = input('');
  readonly formatValue = input<(value: number) => string>((value) => String(value));

  protected readonly values = computed(() => this.points().map((point) => point.value));
  protected readonly min = computed(() => Math.min(...this.values(), 0));
  protected readonly max = computed(() => {
    const peak = Math.max(...this.values(), 1);
    return peak === this.min() ? peak + 1 : peak;
  });
  protected readonly minLabel = computed(() => this.formatValue()(this.min()));
  protected readonly maxLabel = computed(() => this.formatValue()(this.max()));
  protected readonly firstLabel = computed(() => this.points()[0]?.label ?? '');
  protected readonly lastLabel = computed(() => this.points().at(-1)?.label ?? '');
  protected readonly grids = computed(() => [24, 66, 108, 150]);

  protected readonly dots = computed(() => {
    const points = this.points();
    if (points.length === 0) {
      return [];
    }
    const min = this.min();
    const span = this.max() - min || 1;
    return points.map((point, index) => {
      const x = points.length === 1 ? 172 : 36 + (index / (points.length - 1)) * 272;
      const y = 150 - ((point.value - min) / span) * 126;
      return { x, y, href: point.href };
    });
  });

  protected readonly linePoints = computed(() =>
    this.dots()
      .map((dot) => `${dot.x},${dot.y}`)
      .join(' '),
  );

  protected readonly areaPoints = computed(() => {
    const dots = this.dots();
    if (dots.length === 0) {
      return '';
    }
    const first = dots[0]!;
    const last = dots.at(-1)!;
    return [`${first.x},150`, ...dots.map((dot) => `${dot.x},${dot.y}`), `${last.x},150`].join(' ');
  });
}
