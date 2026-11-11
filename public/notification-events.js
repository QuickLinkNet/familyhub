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
