import assert from 'node:assert/strict';
import test from 'node:test';
import {
  normalizeRemoteBaseDir,
  parseFtpPort,
  parseFtpSecure,
  parsePublicAppUrl,
  requireDeploymentValues,
} from './deploy-config.mjs';

test('accepts provider-neutral deployment values', () => {
  assert.doesNotThrow(() => requireDeploymentValues({
    FTP_HOST: 'ftp.example.org',
    FTP_USER: 'family',
    FTP_PASSWORD: 'secret',
    REMOTE_BASE_DIR: '/familyhub',
  }));
  assert.equal(normalizeRemoteBaseDir('/domains/family.example.org/public_html/'), '/domains/family.example.org/public_html');
  assert.equal(parseFtpPort('21'), 21);
  assert.equal(parseFtpSecure('true'), true);
  assert.equal(parsePublicAppUrl('https://family.example.org'), 'https://family.example.org/');
});

test('rejects missing credentials and unsafe remote paths', () => {
  assert.throws(() => requireDeploymentValues({}), /FTP_HOST/);
  for (const path of ['', '/', 'familyhub', '/../familyhub', '/sites/../familyhub', '/sites\\familyhub']) {
    assert.throws(() => normalizeRemoteBaseDir(path));
  }
});

test('rejects invalid ports, flags and public URLs', () => {
  assert.throws(() => parseFtpPort('0'));
  assert.throws(() => parseFtpPort('not-a-port'));
  assert.throws(() => parseFtpSecure('yes'));
  assert.throws(() => parsePublicAppUrl('ftp://example.org'));
});
