import { apiGet, apiPost } from '../../../services/apiClient';
import type { PushDeliveryResult, PushStatus } from '../types/push';

export const getPushStatus = (signal?: AbortSignal) => apiGet<PushStatus>('/push/status', signal);

export const registerPushSubscription = (subscription: PushSubscription, deviceLabel: string) => {
  const json = subscription.toJSON();
  return apiPost<PushStatus>('/push/subscriptions', {
    endpoint: subscription.endpoint,
    keys: { p256dh: json.keys?.p256dh, auth: json.keys?.auth },
    deviceLabel
  });
};

export const removePushSubscription = (endpoint: string) => apiPost<void>('/push/unsubscribe', { endpoint });
export const sendPushTest = () => apiPost<PushDeliveryResult>('/push/test', {});
