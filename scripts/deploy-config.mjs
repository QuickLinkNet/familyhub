const requiredNames = ['FTP_HOST', 'FTP_USER', 'FTP_PASSWORD', 'REMOTE_BASE_DIR'];

export function requireDeploymentValues(environment) {
  const missing = requiredNames.filter((name) => (environment[name] ?? '').trim() === '');
  if (missing.length > 0) {
    throw new Error(`${missing.join(', ')} ${missing.length === 1 ? 'muss' : 'müssen'} gesetzt sein.`);
  }
}

export function parseFtpPort(value = '21') {
  const port = Number(value);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error('FTP_PORT ist ungültig.');
  }
  return port;
}

export function parseFtpSecure(value = 'true') {
  if (value !== 'true' && value !== 'false') {
    throw new Error('FTP_SECURE muss "true" oder "false" sein.');
  }
  return value === 'true';
}

export function normalizeRemoteBaseDir(value) {
  const candidate = value.trim().replace(/\/+$/, '');
  if (candidate === '' || candidate === '/') {
    throw new Error('REMOTE_BASE_DIR darf nicht leer oder das Server-Stammverzeichnis sein.');
  }
  if (!candidate.startsWith('/') || candidate.includes('\\')) {
    throw new Error('REMOTE_BASE_DIR muss ein absoluter FTP-Pfad mit Schrägstrichen sein.');
  }

  const segments = candidate.slice(1).split('/');
  if (segments.some((segment) => segment === '' || segment === '.' || segment === '..' || /[\u0000-\u001f\u007f]/.test(segment))) {
    throw new Error('REMOTE_BASE_DIR enthält einen unsicheren Pfadbestandteil.');
  }
  return `/${segments.join('/')}`;
}

export function parsePublicAppUrl(value = '') {
  const candidate = value.trim();
  if (candidate === '') return '';

  let url;
  try {
    url = new URL(candidate);
  } catch {
    throw new Error('PUBLIC_APP_URL ist keine gültige URL.');
  }
  if (!['http:', 'https:'].includes(url.protocol)) {
    throw new Error('PUBLIC_APP_URL muss http oder https verwenden.');
  }
  return url.toString();
}
