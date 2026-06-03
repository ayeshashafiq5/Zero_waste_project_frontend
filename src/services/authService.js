import api, { unwrap } from './api';

export const authService = {
  getProfile: () => unwrap(api.get('/auth/profile')),
  updateProfile: (data) => unwrap(api.patch('/auth/profile', data)),
};
