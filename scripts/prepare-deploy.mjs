import { cp, mkdir, rm } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();
const distDir = join(root, 'dist');
const apiDir = join(root, 'api');
const deployDir = join(root, 'deploy');

if (!existsSync(distDir) || !existsSync(join(distDir, 'index.html'))) {
  throw new Error('dist/ fehlt oder ist unvollständig. Der Vite-Build muss zuerst erfolgreich sein.');
}
if (!existsSync(join(apiDir, 'index.php'))) {
  throw new Error('api/index.php fehlt.');
}

await rm(deployDir, { recursive: true, force: true });
await mkdir(deployDir, { recursive: true });
await cp(distDir, deployDir, { recursive: true });
await cp(apiDir, join(deployDir, 'api'), {
  recursive: true,
  filter: (source) => !source.endsWith(`${join('api', 'dev-router.php')}`) && !source.includes(`${join('api', 'tests')}`),
});
await mkdir(join(deployDir, 'storage'), { recursive: true });
await cp(join(root, 'storage', '.htaccess'), join(deployDir, 'storage', '.htaccess'));

console.log('Deploy-Paket erstellt: deploy/ (Frontend, API und geschützter Storage-Ordner).');