import { useRef, useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import toast from 'react-hot-toast';
import { Camera, Upload, X, Loader2, ImagePlus } from 'lucide-react';
import { uploadService } from '../../services/uploadService';
import { CameraCapture } from './CameraCapture';

const MAX_BYTES = 5 * 1024 * 1024; // 5 MB
const ALLOWED = ['image/jpeg', 'image/png', 'image/webp'];

/**
 * Image picker with three input methods:
 *   1. Drag & drop a file onto the dropzone
 *   2. Click to open the native file picker (mobile shows camera option via accept+capture)
 *   3. Click "Take photo" to open the live in-browser camera (works on desktop too)
 *
 * Files are uploaded via the backend (`POST /api/upload/food-image`, multer →
 * Supabase Storage). The bucket / path / RLS is handled server-side; the
 * caller only receives the final public URL via `onChange(url)`.
 *
 * Props:
 *  - value     Current public URL (controlled)
 *  - onChange  fn(url|null)
 *  - aspect    'video' (16/9, default) | 'square'
 */
export const ImageUpload = ({ value, onChange, aspect = 'video' }) => {
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [previewLocal, setPreviewLocal] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [cameraOpen, setCameraOpen] = useState(false);

  const aspectClass = aspect === 'square' ? 'aspect-square' : 'aspect-video';

  const validateClientSide = (file) => {
    if (!ALLOWED.includes(file.type)) {
      toast.error('Only JPG, PNG or WebP images are allowed');
      return false;
    }
    if (file.size > MAX_BYTES) {
      toast.error(`Image too large (max ${MAX_BYTES / 1024 / 1024} MB)`);
      return false;
    }
    return true;
  };

  const upload = useCallback(
    async (fileOrBlob, filename) => {
      if (!fileOrBlob) return;
      if (fileOrBlob instanceof File && !validateClientSide(fileOrBlob)) return;
      if (fileOrBlob instanceof Blob && !(fileOrBlob instanceof File)) {
        if (fileOrBlob.size > MAX_BYTES) {
          return toast.error(`Image too large (max ${MAX_BYTES / 1024 / 1024} MB)`);
        }
      }

      // Local preview while uploading
      const reader = new FileReader();
      reader.onload = (e) => setPreviewLocal(e.target.result);
      reader.readAsDataURL(fileOrBlob);

      setUploading(true);
      setProgress(0);
      try {
        const { url } = await uploadService.uploadFoodImage(fileOrBlob, {
          filename,
          onProgress: setProgress,
        });
        onChange?.(url);
        setPreviewLocal(null);
        toast.success('Image uploaded');
      } catch (e) {
        setPreviewLocal(null);
        const msg = e.response?.data?.error || e.message || 'Upload failed';
        toast.error(msg);
      } finally {
        setUploading(false);
        setProgress(0);
      }
    },
    [onChange]
  );

  const onPick = (e) => upload(e.target.files?.[0]);

  const onDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    upload(e.dataTransfer?.files?.[0]);
  };

  const remove = () => {
    onChange?.(null);
    setPreviewLocal(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const displayed = previewLocal || value;

  return (
    <>
      {displayed ? (
        // ──────────── Filled state ────────────
        <div className={`relative ${aspectClass} rounded-lg overflow-hidden bg-gray-100 border border-gray-200`}>
          <img src={displayed} alt="Preview" className="w-full h-full object-cover" />

          {uploading && (
            <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-white">
              <Loader2 className="animate-spin mb-2" size={22} />
              <div className="text-sm font-semibold">Uploading… {progress}%</div>
              <div className="w-2/3 h-1.5 bg-white/20 rounded-full mt-2 overflow-hidden">
                <div className="h-full bg-brand-500 transition-all" style={{ width: `${progress}%` }} />
              </div>
            </div>
          )}

          {!uploading && (
            <>
              <button
                type="button"
                onClick={remove}
                className="absolute top-2 right-2 w-9 h-9 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center transition-colors"
                aria-label="Remove image"
              >
                <X size={16} />
              </button>
              <div className="absolute bottom-2 left-2 right-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex-1 bg-white/90 hover:bg-white text-gray-900 text-xs font-semibold py-1.5 rounded-md flex items-center justify-center gap-1"
                >
                  <ImagePlus size={12} /> Replace
                </button>
                <button
                  type="button"
                  onClick={() => setCameraOpen(true)}
                  className="flex-1 bg-white/90 hover:bg-white text-gray-900 text-xs font-semibold py-1.5 rounded-md flex items-center justify-center gap-1"
                >
                  <Camera size={12} /> Retake
                </button>
              </div>
            </>
          )}
        </div>
      ) : (
        // ──────────── Empty state ────────────
        <div
          onDrop={onDrop}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          className={`${aspectClass} max-h-64 border-2 border-dashed rounded-lg p-4 text-center transition-colors ${
            dragOver ? 'border-brand-500 bg-brand-50' : 'border-gray-300 bg-gray-50'
          }`}
        >
          <div className="h-full flex flex-col items-center justify-center text-gray-500 gap-2">
            <div className="w-12 h-12 rounded-full bg-white border border-gray-200 flex items-center justify-center">
              <ImagePlus size={20} className="text-gray-400" />
            </div>
            <div className="text-sm font-semibold text-gray-700">Drop image here</div>
            <div className="text-[11px] text-gray-500">JPG, PNG or WebP · up to 5 MB</div>

            <div className="flex flex-col sm:flex-row gap-2 mt-2 w-full max-w-xs">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="btn-secondary text-xs flex-1"
              >
                <Upload size={12} /> Choose file
              </button>
              <button
                type="button"
                onClick={() => setCameraOpen(true)}
                className="btn-primary text-xs flex-1"
              >
                <Camera size={12} /> Take photo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hidden file input — also handles mobile camera via `capture` attr */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        capture="environment"
        onChange={onPick}
        className="hidden"
      />

      {/* Camera modal */}
      <CameraCapture
        open={cameraOpen}
        onClose={() => setCameraOpen(false)}
        onCapture={(blob) => upload(blob, `capture-${Date.now()}.jpg`)}
      />
    </>
  );
};

ImageUpload.propTypes = {
  value: PropTypes.string,
  onChange: PropTypes.func,
  aspect: PropTypes.oneOf(['video', 'square']),
};
