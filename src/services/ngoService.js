import api, { unwrap } from './api';

export const ngoService = {
  getRequests: () => unwrap(api.get('/ngo/requests')),
  getStats: () => unwrap(api.get('/ngo/stats')),
};
