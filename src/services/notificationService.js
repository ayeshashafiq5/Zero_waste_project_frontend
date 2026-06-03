import api, { unwrap } from './api';

export const notificationService = {
  getVapidPublicKey: () => unwrap(api.get('/notifications/vapid-key')),
  subscribe: (subscription) =>
    unwrap(
      api.post('/notifications/subscribe', {
        endpoint: subscription.endpoint,
        keys: subscription.toJSON().keys,
        user_agent: navigator.userAgent,
      })
    ),
  unsubscribe: (endpoint) =>
    unwrap(api.delete('/notifications/unsubscribe', { params: { endpoint } })),
};
