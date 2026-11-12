export type BrowserNotificationStatus = {
  supported: boolean;
  permission: NotificationPermission | 'unsupported';
  enabled: boolean;
  deviceCount: number;
  loading: boolean;
};

export type StoredNotificationState = {
  enabled: boolean;
  lastNotifiedAt: string | null;
  notified: Record<string, string>;
};
