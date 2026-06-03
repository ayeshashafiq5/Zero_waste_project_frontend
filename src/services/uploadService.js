import api, { unwrap } from './api';

// Uploads a File / Blob to the backend, which pipes it into Supabase Storage.
// Returns { url, path, size, type } on success.
export const uploadService = {
  async uploadFoodImage(fileOrBlob, { filename, onProgress } = {}) {
    const form = new FormData();
    // If it's a Blob (e.g. from canvas.toBlob), wrap it as a File so multer
    // sees a proper name + extension.
    if (fileOrBlob instanceof Blob && !(fileOrBlob instanceof File)) {
      const name = filename || `capture-${Date.now()}.jpg`;
      form.append('file', new File([fileOrBlob], name, { type: fileOrBlob.type || 'image/jpeg' }));
    } else {
      form.append('file', fileOrBlob);
    }

    return unwrap(
      api.post('/upload/food-image', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (e) => {
          if (onProgress && e.total) onProgress(Math.round((e.loaded / e.total) * 100));
        },
      })
    );
  },

  async deleteFoodImage(path) {
    return unwrap(api.delete('/upload/food-image', { data: { path } }));
  },
};
