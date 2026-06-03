import api, { unwrap } from './api';

export const foodService = {
  listAvailable: () => unwrap(api.get('/food')),
  getNearby: (lat, lng, radius) =>
    unwrap(api.get('/food/nearby', { params: { lat, lng, radius } })),
  getMine: () => unwrap(api.get('/food/mine')),
  getStats: () => unwrap(api.get('/food/stats')),
  getOne: (id) => unwrap(api.get(`/food/${id}`)),
  create: (payload) => unwrap(api.post('/food', payload)),
  accept: (id) => unwrap(api.patch(`/food/${id}/accept`)),
  release: (id) => unwrap(api.patch(`/food/${id}/release`)),
  collect: (id) => unwrap(api.patch(`/food/${id}/collect`)),
  cancel: (id) => unwrap(api.delete(`/food/${id}`)),
};
