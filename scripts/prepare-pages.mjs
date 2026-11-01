import { copyFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const out = join('dist', 'gym-care', 'browser');
await copyFile(join(out, 'index.html'), join(out, '404.html'));
await writeFile(join(out, '.nojekyll'), '');
console.log('Prepared GitHub Pages assets in', out);
