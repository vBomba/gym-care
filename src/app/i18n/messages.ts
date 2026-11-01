import type { AppLocale } from './locale';

export type MessageKey =
  | 'brandSub'
  | 'language'
  | 'loading'
  | 'rest'
  | 'skip'
  | 'navToday'
  | 'navHistory'
  | 'navProgram'
  | 'navSync'
  | 'syncTitle'
  | 'syncHeading'
  | 'syncHint'
  | 'syncStatusIdle'
  | 'syncStatusSyncing'
  | 'syncStatusOk'
  | 'syncStatusOffline'
  | 'syncStatusError'
  | 'syncNever'
  | 'syncLastAt'
  | 'syncServerUrl'
  | 'syncServerPlaceholder'
  | 'syncToken'
  | 'syncNow'
  | 'syncFileHint'
  | 'syncExport'
  | 'syncImport'
  | 'syncDone'
  | 'syncExported'
  | 'syncImported'
  | 'syncNeedUrl'
  | 'syncNeedToken'
  | 'syncNoProgram'
  | 'syncInvalidFile'
  | 'syncConflict'
  | 'syncFailed'
  | 'ongoing'
  | 'today'
  | 'continue'
  | 'cancelWorkout'
  | 'cancelSetsGone'
  | 'yesCancel'
  | 'keep'
  | 'startWorkout'
  | 'logLater'
  | 'switchTo'
  | 'fromMemory'
  | 'recallHint'
  | 'date'
  | 'startTime'
  | 'openRecord'
  | 'lastTime'
  | 'neverDone'
  | 'needDateTime'
  | 'workout'
  | 'done'
  | 'inGym'
  | 'byMemory'
  | 'firstLog'
  | 'insteadOf'
  | 'allTimes'
  | 'changeExercise'
  | 'pickExercise'
  | 'restorePlan'
  | 'name'
  | 'saveName'
  | 'weightKg'
  | 'reps'
  | 'lessBy'
  | 'moreBy'
  | 'lessReps'
  | 'moreReps'
  | 'removeSet'
  | 'logSet'
  | 'needOneSet'
  | 'finishConfirm'
  | 'yesFinish'
  | 'back'
  | 'cancelConfirm'
  | 'finishWorkout'
  | 'cancel'
  | 'toHistory'
  | 'workoutMissing'
  | 'toToday'
  | 'historyTitle'
  | 'workouts'
  | 'historyEmpty'
  | 'calendar'
  | 'trends'
  | 'trendVolume'
  | 'trendMax'
  | 'trendSets'
  | 'noTrends'
  | 'allDays'
  | 'sessionsOnDay'
  | 'prevMonth'
  | 'nextMonth'
  | 'programTitle'
  | 'programHint'
  | 'exerciseCount'
  | 'editor'
  | 'editLanguage'
  | 'autoTranslate'
  | 'translating'
  | 'translateDone'
  | 'translateFail'
  | 'translateHint'
  | 'day'
  | 'focus'
  | 'up'
  | 'down'
  | 'remove'
  | 'exercise'
  | 'setsFrom'
  | 'setsTo'
  | 'repsFrom'
  | 'repsTo'
  | 'restFrom'
  | 'restTo'
  | 'weightStep'
  | 'note'
  | 'addExercise'
  | 'saved'
  | 'saveDay'
  | 'dayMissing'
  | 'toProgram'
  | 'needDayName'
  | 'needExerciseNames'
  | 'checkSets'
  | 'checkReps'
  | 'checkRest'
  | 'checkStep'
  | 'exerciseFallback'
  | 'noSetsYet'
  | 'dbError'
  | 'min'
  | 'kg'
  | 'newExercise'
  | 'sets_one'
  | 'sets_few'
  | 'sets_many';

type Dict = Record<MessageKey, string>;

const uk: Dict = {
  brandSub: 'Журнал підходів',
  language: 'Мова',
  loading: 'Завантаження…',
  rest: 'Відпочинок',
  skip: 'Пропустити',
  navToday: 'Сьогодні',
  navHistory: 'Історія',
  navProgram: 'Програма',
  navSync: 'Синк',
  syncTitle: 'Синхронізація',
  syncHeading: 'Між пристроями',
  syncHint:
    'Локальна база лишається робочою. Сервер або JSON-файл лише зливає завершені тренування і програму.',
  syncStatusIdle: 'Готово до синхронізації',
  syncStatusSyncing: 'Синхронізую…',
  syncStatusOk: 'Синхронізовано',
  syncStatusOffline: 'Немає мережі',
  syncStatusError: 'Помилка синхронізації',
  syncNever: 'Ще не синхронізовано',
  syncLastAt: 'Останній раз: {time}',
  syncServerUrl: 'URL сервера',
  syncServerPlaceholder: 'https://example.com',
  syncToken: 'Секретний токен',
  syncNow: 'Синхронізувати',
  syncFileHint: 'Без сервера: експортуй JSON і імпортуй на іншому пристрої.',
  syncExport: 'Експорт JSON',
  syncImport: 'Імпорт JSON',
  syncDone: 'Дані злито з сервером.',
  syncExported: 'Файл збережено.',
  syncImported: 'Файл імпортовано й злито.',
  syncNeedUrl: 'Вкажи URL сервера.',
  syncNeedToken: 'Вкажи токен.',
  syncNoProgram: 'Немає локальної програми для синку.',
  syncInvalidFile: 'Файл не схожий на Gym Care sync.',
  syncConflict: 'Конфлікт версій. Спробуй ще раз.',
  syncFailed: 'Не вдалося синхронізувати. Перевір URL, токен і мережу.',
  ongoing: 'Триває',
  today: 'Сьогодні',
  continue: 'Продовжити',
  cancelWorkout: 'Скасувати тренування',
  cancelSetsGone: 'Записані підходи цього тренування зникнуть.',
  yesCancel: 'Так, скасувати',
  keep: 'Лишити',
  startWorkout: 'Почати тренування',
  logLater: 'Записати пізніше',
  switchTo: 'Перемкнути на {name}',
  fromMemory: 'По пам’яті',
  recallHint: 'Дата, коли тренування було. Час підходів не вигадується.',
  date: 'Дата',
  startTime: 'Початок',
  openRecord: 'Відкрити запис',
  lastTime: 'Минулий раз: {value}',
  neverDone: 'Ще не було',
  needDateTime: 'Вкажи дату і час тренування.',
  workout: 'Тренування',
  done: 'Завершено',
  inGym: 'у залі',
  byMemory: 'по пам’яті',
  firstLog: 'Перший запис цієї вправи.',
  insteadOf: 'Замість: {name}',
  allTimes: 'Усі рази',
  changeExercise: 'Змінити вправу',
  pickExercise: 'Обери з картинок',
  restorePlan: 'Повернути план',
  name: 'Назва',
  saveName: 'Зберегти назву',
  weightKg: 'Вага, кг',
  reps: 'Повтори',
  lessBy: 'Менше на {n} кг',
  moreBy: 'Більше на {n} кг',
  lessReps: 'Менше повторів',
  moreReps: 'Більше повторів',
  removeSet: 'Прибрати підхід',
  logSet: 'Записати підхід {n}',
  needOneSet: 'Спочатку запиши хоча б один підхід.',
  finishConfirm: 'Завершити цей день? Наступним запропонується інший.',
  yesFinish: 'Так, завершити',
  back: 'Назад',
  cancelConfirm: 'Скасувати тренування і прибрати його підходи?',
  finishWorkout: 'Завершити тренування',
  cancel: 'Скасувати',
  toHistory: 'До історії',
  workoutMissing: 'Тренування не знайдено',
  toToday: 'На сьогодні',
  historyTitle: 'Історія',
  workouts: 'Тренування',
  historyEmpty: 'Ще немає завершених днів. Запис з’явиться тут після кнопки «Завершити».',
  calendar: 'Календар',
  trends: 'Тенденції',
  trendVolume: 'Тоннаж',
  trendMax: 'Макс. вага',
  trendSets: 'Підходи',
  noTrends: 'Після двох тренувань тут з’явиться графік.',
  allDays: 'Усі дні',
  sessionsOnDay: 'Тренування цього дня',
  prevMonth: 'Попередній місяць',
  nextMonth: 'Наступний місяць',
  programTitle: 'Програма',
  programHint: 'Зміни діятимуть на наступні тренування. Вже записані сесії лишаються зі своїм планом.',
  exerciseCount: '{n} вправ',
  editor: 'Редактор',
  editLanguage: 'Мова тексту',
  autoTranslate: 'Автопереклад на інші',
  translating: 'Перекладаю…',
  translateDone: 'Переклад готовий. Перевір інші мови.',
  translateFail: 'Не вдалося перекласти. Спробуй ще або впиши вручну.',
  translateHint: 'Зміни текст для обраної мови. Автопереклад заповнить дві інші з поточної.',
  day: 'День',
  focus: 'Фокус',
  up: 'Вгору',
  down: 'Вниз',
  remove: 'Прибрати',
  exercise: 'Вправа',
  setsFrom: 'Підходи від',
  setsTo: 'Підходи до',
  repsFrom: 'Повтори від',
  repsTo: 'Повтори до',
  restFrom: 'Відпочинок від, хв',
  restTo: 'Відпочинок до, хв',
  weightStep: 'Крок ваги, кг',
  note: 'Примітка',
  addExercise: 'Додати вправу',
  saved: 'Збережено. Нові тренування візьмуть цей план.',
  saveDay: 'Зберегти день',
  dayMissing: 'День не знайдено',
  toProgram: 'До програми',
  needDayName: 'Дай назву дню.',
  needExerciseNames: 'У кожної вправи має бути назва.',
  checkSets: 'Перевір підходи: {name}.',
  checkReps: 'Перевір повтори: {name}.',
  checkRest: 'Перевір відпочинок: {name}.',
  checkStep: 'Крок ваги має бути більшим за нуль: {name}.',
  exerciseFallback: 'Вправа',
  noSetsYet: 'Ще немає збережених підходів.',
  dbError: 'Не вдалося відкрити локальну базу або програму.',
  min: 'хв',
  kg: 'кг',
  newExercise: 'Нова вправа',
  sets_one: '{n} підхід',
  sets_few: '{n} підходи',
  sets_many: '{n} підходів',
};

const pl: Dict = {
  brandSub: 'Dziennik serii',
  language: 'Język',
  loading: 'Ładowanie…',
  rest: 'Odpoczynek',
  skip: 'Pomiń',
  navToday: 'Dziś',
  navHistory: 'Historia',
  navProgram: 'Program',
  navSync: 'Sync',
  syncTitle: 'Synchronizacja',
  syncHeading: 'Między urządzeniami',
  syncHint:
    'Lokalna baza zostaje robocza. Serwer lub plik JSON tylko scala ukończone treningi i program.',
  syncStatusIdle: 'Gotowe do synchronizacji',
  syncStatusSyncing: 'Synchronizuję…',
  syncStatusOk: 'Zsynchronizowano',
  syncStatusOffline: 'Brak sieci',
  syncStatusError: 'Błąd synchronizacji',
  syncNever: 'Jeszcze nie synchronizowano',
  syncLastAt: 'Ostatnio: {time}',
  syncServerUrl: 'URL serwera',
  syncServerPlaceholder: 'https://example.com',
  syncToken: 'Tajny token',
  syncNow: 'Synchronizuj',
  syncFileHint: 'Bez serwera: eksportuj JSON i zaimportuj na drugim urządzeniu.',
  syncExport: 'Eksport JSON',
  syncImport: 'Import JSON',
  syncDone: 'Dane scalone z serwerem.',
  syncExported: 'Plik zapisany.',
  syncImported: 'Plik zaimportowany i scalony.',
  syncNeedUrl: 'Podaj URL serwera.',
  syncNeedToken: 'Podaj token.',
  syncNoProgram: 'Brak lokalnego programu do sync.',
  syncInvalidFile: 'Plik nie wygląda na Gym Care sync.',
  syncConflict: 'Konflikt wersji. Spróbuj ponownie.',
  syncFailed: 'Synchronizacja nieudana. Sprawdź URL, token i sieć.',
  ongoing: 'W toku',
  today: 'Dziś',
  continue: 'Kontynuuj',
  cancelWorkout: 'Anuluj trening',
  cancelSetsGone: 'Zapisane serie z tego treningu znikną.',
  yesCancel: 'Tak, anuluj',
  keep: 'Zostaw',
  startWorkout: 'Rozpocznij trening',
  logLater: 'Zapisz później',
  switchTo: 'Przełącz na {name}',
  fromMemory: 'Z pamięci',
  recallHint: 'Data treningu. Czas serii nie jest wymyślany.',
  date: 'Data',
  startTime: 'Start',
  openRecord: 'Otwórz zapis',
  lastTime: 'Ostatnio: {value}',
  neverDone: 'Jeszcze nie było',
  needDateTime: 'Podaj datę i godzinę treningu.',
  workout: 'Trening',
  done: 'Zakończono',
  inGym: 'na siłowni',
  byMemory: 'z pamięci',
  firstLog: 'Pierwszy zapis tego ćwiczenia.',
  insteadOf: 'Zamiast: {name}',
  allTimes: 'Wszystkie razy',
  changeExercise: 'Zmień ćwiczenie',
  pickExercise: 'Wybierz z obrazków',
  restorePlan: 'Przywróć plan',
  name: 'Nazwa',
  saveName: 'Zapisz nazwę',
  weightKg: 'Ciężar, kg',
  reps: 'Powtórzenia',
  lessBy: 'Mniej o {n} kg',
  moreBy: 'Więcej o {n} kg',
  lessReps: 'Mniej powtórzeń',
  moreReps: 'Więcej powtórzeń',
  removeSet: 'Usuń serię',
  logSet: 'Zapisz serię {n}',
  needOneSet: 'Najpierw zapisz przynajmniej jedną serię.',
  finishConfirm: 'Zakończyć ten dzień? Następny będzie inny.',
  yesFinish: 'Tak, zakończ',
  back: 'Wstecz',
  cancelConfirm: 'Anulować trening i usunąć jego serie?',
  finishWorkout: 'Zakończ trening',
  cancel: 'Anuluj',
  toHistory: 'Do historii',
  workoutMissing: 'Nie znaleziono treningu',
  toToday: 'Na dziś',
  historyTitle: 'Historia',
  workouts: 'Treningi',
  historyEmpty: 'Brak ukończonych dni. Wpis pojawi się po przycisku «Zakończ».',
  calendar: 'Kalendarz',
  trends: 'Tendencje',
  trendVolume: 'Tonaż',
  trendMax: 'Max ciężar',
  trendSets: 'Serie',
  noTrends: 'Po dwóch treningach pojawi się tu wykres.',
  allDays: 'Wszystkie dni',
  sessionsOnDay: 'Treningi tego dnia',
  prevMonth: 'Poprzedni miesiąc',
  nextMonth: 'Następny miesiąc',
  programTitle: 'Program',
  programHint: 'Zmiany dotyczą kolejnych treningów. Zapisane sesje zostają przy swoim planie.',
  exerciseCount: '{n} ćwiczeń',
  editor: 'Edytor',
  editLanguage: 'Język tekstu',
  autoTranslate: 'Autotłumacz na inne',
  translating: 'Tłumaczę…',
  translateDone: 'Tłumaczenie gotowe. Sprawdź inne języki.',
  translateFail: 'Nie udało się przetłumaczyć. Spróbuj ponownie lub wpisz ręcznie.',
  translateHint: 'Edytuj tekst w wybranym języku. Autotłumaczenie uzupełni dwa pozostałe z bieżącego.',
  day: 'Dzień',
  focus: 'Fokus',
  up: 'W górę',
  down: 'W dół',
  remove: 'Usuń',
  exercise: 'Ćwiczenie',
  setsFrom: 'Serie od',
  setsTo: 'Serie do',
  repsFrom: 'Powtórzenia od',
  repsTo: 'Powtórzenia do',
  restFrom: 'Odpoczynek od, min',
  restTo: 'Odpoczynek do, min',
  weightStep: 'Krok ciężaru, kg',
  note: 'Notatka',
  addExercise: 'Dodaj ćwiczenie',
  saved: 'Zapisano. Nowe treningi wezmą ten plan.',
  saveDay: 'Zapisz dzień',
  dayMissing: 'Nie znaleziono dnia',
  toProgram: 'Do programu',
  needDayName: 'Podaj nazwę dnia.',
  needExerciseNames: 'Każde ćwiczenie musi mieć nazwę.',
  checkSets: 'Sprawdź serie: {name}.',
  checkReps: 'Sprawdź powtórzenia: {name}.',
  checkRest: 'Sprawdź odpoczynek: {name}.',
  checkStep: 'Krok ciężaru musi być większy od zera: {name}.',
  exerciseFallback: 'Ćwiczenie',
  noSetsYet: 'Brak zapisanych serii.',
  dbError: 'Nie udało się otworzyć lokalnej bazy lub programu.',
  min: 'min',
  kg: 'kg',
  newExercise: 'Nowe ćwiczenie',
  sets_one: '{n} seria',
  sets_few: '{n} serie',
  sets_many: '{n} serii',
};

const en: Dict = {
  brandSub: 'Set log',
  language: 'Language',
  loading: 'Loading…',
  rest: 'Rest',
  skip: 'Skip',
  navToday: 'Today',
  navHistory: 'History',
  navProgram: 'Program',
  navSync: 'Sync',
  syncTitle: 'Sync',
  syncHeading: 'Across devices',
  syncHint:
    'The local database stays the working copy. The server or a JSON file only merges completed workouts and the program.',
  syncStatusIdle: 'Ready to sync',
  syncStatusSyncing: 'Syncing…',
  syncStatusOk: 'Synced',
  syncStatusOffline: 'Offline',
  syncStatusError: 'Sync error',
  syncNever: 'Not synced yet',
  syncLastAt: 'Last sync: {time}',
  syncServerUrl: 'Server URL',
  syncServerPlaceholder: 'https://example.com',
  syncToken: 'Secret token',
  syncNow: 'Sync now',
  syncFileHint: 'Without a server: export JSON and import it on the other device.',
  syncExport: 'Export JSON',
  syncImport: 'Import JSON',
  syncDone: 'Merged with the server.',
  syncExported: 'File saved.',
  syncImported: 'File imported and merged.',
  syncNeedUrl: 'Enter the server URL.',
  syncNeedToken: 'Enter the token.',
  syncNoProgram: 'No local program to sync.',
  syncInvalidFile: 'This file is not a Gym Care sync bundle.',
  syncConflict: 'Version conflict. Try again.',
  syncFailed: 'Sync failed. Check URL, token, and network.',
  ongoing: 'In progress',
  today: 'Today',
  continue: 'Continue',
  cancelWorkout: 'Cancel workout',
  cancelSetsGone: 'Logged sets from this workout will be removed.',
  yesCancel: 'Yes, cancel',
  keep: 'Keep',
  startWorkout: 'Start workout',
  logLater: 'Log later',
  switchTo: 'Switch to {name}',
  fromMemory: 'From memory',
  recallHint: 'Date when the workout happened. Set times are not invented.',
  date: 'Date',
  startTime: 'Start',
  openRecord: 'Open log',
  lastTime: 'Last time: {value}',
  neverDone: 'Not yet',
  needDateTime: 'Enter the workout date and time.',
  workout: 'Workout',
  done: 'Completed',
  inGym: 'in the gym',
  byMemory: 'from memory',
  firstLog: 'First log for this exercise.',
  insteadOf: 'Instead of: {name}',
  allTimes: 'All times',
  changeExercise: 'Change exercise',
  pickExercise: 'Pick from pictures',
  restorePlan: 'Restore plan',
  name: 'Name',
  saveName: 'Save name',
  weightKg: 'Weight, kg',
  reps: 'Reps',
  lessBy: 'Less by {n} kg',
  moreBy: 'More by {n} kg',
  lessReps: 'Fewer reps',
  moreReps: 'More reps',
  removeSet: 'Remove set',
  logSet: 'Log set {n}',
  needOneSet: 'Log at least one set first.',
  finishConfirm: 'Finish this day? The next suggested day will be the other one.',
  yesFinish: 'Yes, finish',
  back: 'Back',
  cancelConfirm: 'Cancel the workout and remove its sets?',
  finishWorkout: 'Finish workout',
  cancel: 'Cancel',
  toHistory: 'To history',
  workoutMissing: 'Workout not found',
  toToday: 'To today',
  historyTitle: 'History',
  workouts: 'Workouts',
  historyEmpty: 'No completed days yet. An entry appears here after Finish.',
  calendar: 'Calendar',
  trends: 'Trends',
  trendVolume: 'Volume',
  trendMax: 'Max weight',
  trendSets: 'Sets',
  noTrends: 'A chart appears here after two workouts.',
  allDays: 'All days',
  sessionsOnDay: 'Workouts on this day',
  prevMonth: 'Previous month',
  nextMonth: 'Next month',
  programTitle: 'Program',
  programHint: 'Changes apply to future workouts. Logged sessions keep their own plan.',
  exerciseCount: '{n} exercises',
  editor: 'Editor',
  editLanguage: 'Text language',
  autoTranslate: 'Auto-translate to others',
  translating: 'Translating…',
  translateDone: 'Translation ready. Check the other languages.',
  translateFail: 'Could not translate. Try again or type it manually.',
  translateHint: 'Edit text for the selected language. Auto-translate fills the other two from the current one.',
  day: 'Day',
  focus: 'Focus',
  up: 'Up',
  down: 'Down',
  remove: 'Remove',
  exercise: 'Exercise',
  setsFrom: 'Sets from',
  setsTo: 'Sets to',
  repsFrom: 'Reps from',
  repsTo: 'Reps to',
  restFrom: 'Rest from, min',
  restTo: 'Rest to, min',
  weightStep: 'Weight step, kg',
  note: 'Note',
  addExercise: 'Add exercise',
  saved: 'Saved. New workouts will use this plan.',
  saveDay: 'Save day',
  dayMissing: 'Day not found',
  toProgram: 'To program',
  needDayName: 'Give the day a name.',
  needExerciseNames: 'Every exercise needs a name.',
  checkSets: 'Check sets: {name}.',
  checkReps: 'Check reps: {name}.',
  checkRest: 'Check rest: {name}.',
  checkStep: 'Weight step must be greater than zero: {name}.',
  exerciseFallback: 'Exercise',
  noSetsYet: 'No logged sets yet.',
  dbError: 'Could not open the local database or program.',
  min: 'min',
  kg: 'kg',
  newExercise: 'New exercise',
  sets_one: '{n} set',
  sets_few: '{n} sets',
  sets_many: '{n} sets',
};

export const MESSAGES: Record<AppLocale, Dict> = { uk, pl, en };
