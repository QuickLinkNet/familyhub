import { cp, mkdir, rm } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { setTimeout as delay } from 'node:timers/promises';

const root = process.cwd();
const distDir = join(root, 'dist');
const apiDir = join(root, 'api');
const deployDir = join(root, 'deploy');
const transientCodes = new Set(['EBUSY', 'ENOTEMPTY', 'ENOENT', 'EPERM']);

async function withRetry(label, operation, attempts = 12) {
  let lastError;
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      if (!(error instanceof Error) || !('code' in error) || !transientCodes.has(error.code) || attempt === attempts) {
        throw error;
      }
      await delay(attempt * 250);
    }
  }
  throw new Error(`${label} fehlgeschlagen: ${lastError instanceof Error ? lastError.message : String(lastError)}`);
}

if (!existsSync(distDir) || !existsSync(join(distDir, 'index.html'))) {
  throw new Error('dist/ fehlt oder ist unvollständig. Der Vite-Build muss zuerst erfolgreich sein.');
}
if (!existsSync(join(apiDir, 'index.php'))) {
  throw new Error('api/index.php fehlt.');
}

await withRetry('Altes Deploy-Paket entfernen', () => rm(deployDir, { recursive: true, force: true, maxRetries: 4, retryDelay: 250 }));
await delay(250);
await withRetry('Deploy-Ordner erstellen', () => mkdir(deployDir, { recursive: true }));
await withRetry('Frontend kopieren', () => cp(distDir, deployDir, { recursive: true, force: true }));
await withRetry('API kopieren', () => cp(apiDir, join(deployDir, 'api'), {
  recursive: true,
  force: true,
  filter: (source) => !source.endsWith(`${join('api', 'dev-router.php')}`) && !source.includes(`${join('api', 'tests')}`),
}));
await withRetry('Storage-Ordner erstellen', () => mkdir(join(deployDir, 'storage'), { recursive: true }));
await withRetry('Storage-Schutz kopieren', () => cp(join(root, 'storage', '.htaccess'), join(deployDir, 'storage', '.htaccess'), { force: true }));

console.log('Deploy-Paket erstellt: deploy/ (Frontend, API und geschützter Storage-Ordner).');
