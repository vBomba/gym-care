import { Routes } from '@angular/router';
import { ExerciseHistoryPage } from './pages/exercise-history.page';
import { HistoryPage } from './pages/history.page';
import { ProgramDayPage } from './pages/program-day.page';
import { ProgramPage } from './pages/program.page';
import { SyncPage } from './pages/sync.page';
import { TodayPage } from './pages/today.page';
import { WorkoutPage } from './pages/workout.page';

export const routes: Routes = [
  { path: '', component: TodayPage },
  { path: 'workout/:id', component: WorkoutPage },
  { path: 'history', component: HistoryPage },
  { path: 'history/exercise/:exerciseId', component: ExerciseHistoryPage },
  { path: 'program', component: ProgramPage },
  { path: 'program/:dayId', component: ProgramDayPage },
  { path: 'sync', component: SyncPage },
];
