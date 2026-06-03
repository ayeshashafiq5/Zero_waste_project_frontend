import api, { unwrap } from './api';

export const ratingService = {
  create: (payload) => unwrap(api.post('/ratings', payload)),
  getForUser: (id) => unwrap(api.get(`/ratings/user/${id}`)),
  getMine: () => unwrap(api.get('/ratings/mine')),
};
