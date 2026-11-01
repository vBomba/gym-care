import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TrainingStore } from '../core/training.store';
import { I18nService } from '../i18n/i18n.service';

@Component({
  selector: 'app-program',
  imports: [RouterLink],
  templateUrl: './program.page.html',
})
export class ProgramPage {
  protected readonly store = inject(TrainingStore);
  protected readonly i18n = inject(I18nService);
}
