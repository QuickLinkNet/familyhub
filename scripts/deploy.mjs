import { Client } from 'basic-ftp';
import { existsSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();
const envPath = join(root, '.env.deploy');

function fail(message) {
  console.error(`Deployment abgebrochen: ${message}`);
  process.exit(1);
}

if (!existsSync(envPath)) {
  fail('.env.deploy fehlt. Bitte .env.deploy.example kopieren und die FTP-Zugangsdaten eintragen.');
}

process.loadEnvFile(envPath);
const ftpHost = process.env.FTP_HOST ?? '';
const ftpUser = process.env.FTP_USER ?? '';
const ftpPassword = process.env.FTP_PASSWORD ?? '';
const ftpPort = Number(process.env.FTP_PORT ?? '21');
const ftpSecure = (process.env.FTP_SECURE ?? 'false') === 'true';
const remoteBaseDir = process.env.REMOTE_BASE_DIR ?? '';
const publicAppUrl = process.env.PUBLIC_APP_URL ?? '';
const deployDir = join(root, 'deploy');

if (ftpHost === '' || ftpUser === '' || ftpPassword === '') fail('FTP_HOST, FTP_USER und FTP_PASSWORD müssen gesetzt sein.');
if (!Number.isInteger(ftpPort) || ftpPort < 1 || ftpPort > 65535) fail('FTP_PORT ist ungültig.');
if (remoteBaseDir !== '/familyhub') fail('REMOTE_BASE_DIR muss exakt "/familyhub" sein.');
if (!existsSync(join(deployDir, 'index.html')) || !existsSync(join(deployDir, 'api', 'index.php'))) fail('deploy/ ist unvollständig. Führe zuerst npm run build aus.');

console.log(`Ziel: ${ftpHost}:${ftpPort}${remoteBaseDir} (FTPS: ${ftpSecure ? 'ja' : 'nein'})`);
const client = new Client();
client.ftp.verbose = false;

try {
  await client.access({ host: ftpHost, user: ftpUser, password: ftpPassword, port: ftpPort, secure: ftpSecure });
  await client.ensureDir(remoteBaseDir);
  console.log('Lade Frontend und API hoch …');
  await client.uploadFromDir(deployDir);
  console.log('Deployment abgeschlossen. Bestehende Laufzeitdaten unter storage/ wurden nicht gelöscht.');
  if (publicAppUrl !== '') console.log(`Öffentliche URL: ${publicAppUrl}`);
} catch (error) {
  console.error('Deployment fehlgeschlagen:', error instanceof Error ? error.message : error);
  process.exitCode = 1;
} finally {
  client.close();
}