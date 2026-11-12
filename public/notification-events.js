self.addEventListener('push', event => {
  let payload = {};
  try { payload = event.data ? event.data.json() : {}; } catch { payload = {}; }
  const icon = new URL('icon-192.svg', self.registration.scope).href;
  event.waitUntil(self.registration.showNotification(payload.title || 'FamilyHub', {
    body: payload.body || 'Es gibt etwas Neues für deine Familie.',
    icon,
    badge: icon,
    tag: payload.tag || 'familyhub-reminders',
    data: { href: typeof payload.href === 'string' ? payload.href : '/' }
  }));
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  const href = typeof event.notification.data?.href === 'string' ? event.notification.data.href : '/';
  const requested = new URL(href, self.location.origin);
  const target = requested.origin === self.location.origin ? requested.href : self.location.origin + '/';
  event.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(async windows => {
    const existing = windows.find(client => new URL(client.url).origin === self.location.origin);
    if (existing) {
      await existing.navigate(target);
      return existing.focus();
    }
    return self.clients.openWindow(target);
  }));
});
