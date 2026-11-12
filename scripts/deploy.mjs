import { Client } from 'basic-ftp';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import {
  normalizeRemoteBaseDir,
  parseFtpPort,
  parseFtpSecure,
  parsePublicAppUrl,
  requireDeploymentValues,
} from './deploy-config.mjs';

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
const deployDir = join(root, 'deploy');

let ftpPort;
let ftpSecure;
let remoteBaseDir;
let publicAppUrl;
try {
  requireDeploymentValues(process.env);
  ftpPort = parseFtpPort(process.env.FTP_PORT);
  ftpSecure = parseFtpSecure(process.env.FTP_SECURE);
  remoteBaseDir = normalizeRemoteBaseDir(process.env.REMOTE_BASE_DIR);
  publicAppUrl = parsePublicAppUrl(process.env.PUBLIC_APP_URL);
} catch (error) {
  fail(error instanceof Error ? error.message : String(error));
}
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
