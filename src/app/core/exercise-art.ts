const byId: Record<string, string> = {
  'day-a-1': 'bench-press.jpg',
  'day-a-2': 'pull-up.jpg',
  'day-a-3': 'seated-press.jpg',
  'day-a-4': 'lateral-raise.jpg',
  'day-a-5': 'barbell-curl.jpg',
  'day-a-6': 'squat.jpg',
  'day-a-7': 'cable-crunch.jpg',
  'day-b-1': 'deadlift.jpg',
  'day-b-2': 'incline-press.jpg',
  'day-b-3': 'bent-row.jpg',
  'day-b-4': 'dips.jpg',
  'day-b-5': 'reverse-fly.jpg',
  'day-b-6': 'hanging-leg-raise.jpg',
};

const byName: Array<[RegExp, string]> = [
  [/задн(я|ю) дельт|зворотно-похил|tylny bark|reverse fly|rear delt/i, 'reverse-fly.jpg'],
  [/похил|sko[sś]n|incline/i, 'incline-press.jpg'],
  [/лежачи|le[zż][aą]c|bench press/i, 'bench-press.jpg'],
  [/підтягуван|верхнього блоку|podci[aą]gan|lat pull|pull-?up/i, 'pull-up.jpg'],
  [/стоячи|stoj[aą]c|standing.*press|overhead press/i, 'seated-press.jpg'],
  [/сидячи|siedz[aą]c|seated.*press/i, 'seated-press.jpg'],
  [/махи|unoszenie hantli bokiem|lateral raise/i, 'lateral-raise.jpg'],
  [/біцепс|згинання рук|uginanie|biceps curl/i, 'barbell-curl.jpg'],
  [/прис[іi]д|przysiad|squat/i, 'squat.jpg'],
  [/ногами|nogami|leg press/i, 'leg-press.jpg'],
  [/молитва|скручування|modlitwa|spi[eę]cia|cable crunch|prayer/i, 'cable-crunch.jpg'],
  [/станова|martwy ci[aą]g|deadlift/i, 'deadlift.jpg'],
  [/тяга штанги|до пояса|wios[łl]owanie|bent-?over row|barbell row/i, 'bent-row.jpg'],
  [/брус|por[eę]cz|dip/i, 'dips.jpg'],
  [/підйом ніг|ніг у висі|unoszenie n[oó]g|hanging leg/i, 'hanging-leg-raise.jpg'],
];

export function exerciseArt(id: string, name: string): string | null {
  const file = byId[id] ?? byName.find(([pattern]) => pattern.test(name))?.[1];
  return file ? `exercises/${file}` : null;
}
