import { Component, computed, input } from '@angular/core';
import { exerciseArt } from '../core/exercise-art';

@Component({
  selector: 'app-exercise-art',
  template: `
    @if (src(); as url) {
      <span class="art" [class.hero]="hero()" [class.tile]="tile()">
        <img [src]="url" [alt]="name()" decoding="async" />
      </span>
    } @else if (tile() || hero()) {
      <span class="art empty" [class.hero]="hero()" [class.tile]="tile()" aria-hidden="true"></span>
    }
  `,
})
export class ExerciseArt {
  readonly exerciseId = input('');
  readonly name = input('');
  readonly hero = input(false);
  readonly tile = input(false);
  protected readonly src = computed(() => exerciseArt(this.exerciseId(), this.name()));
}
