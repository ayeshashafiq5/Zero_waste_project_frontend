import { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { Camera, X, RotateCcw, Check, FlipHorizontal2 } from 'lucide-react';
import toast from 'react-hot-toast';

/**
 * Live camera capture modal.
 *
 * On open: requests camera permission via navigator.mediaDevices.getUserMedia.
 * Mobile: defaults to the rear camera (facingMode: 'environment').
 * Desktop: uses the default (usually the front-facing webcam).
 *
 * Flow:
 *   1. Permission request → live video preview
 *   2. User clicks Capture → snapshot drawn to canvas → preview shown
 *   3. Retake (back to live) OR Use (call onCapture with the JPEG Blob)
 *
 * Cleans up the MediaStream on close so the camera light turns off.
 */
export const CameraCapture = ({ open, onClose, onCapture }) => {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [snapshot, setSnapshot] = useState(null); // { dataUrl, blob }
  const [facingMode, setFacingMode] = useState('environment');
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState(null);

  // (Re)start camera whenever the modal opens or facingMode changes
  useEffect(() => {
    if (!open) return undefined;

    let cancelled = false;
    const start = async () => {
      setStarting(true);
      setError(null);
      // Stop any previous stream first
      streamRef.current?.getTracks?.().forEach((t) => t.stop());
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode, width: { ideal: 1280 }, height: { ideal: 720 } },
          audio: false,
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play().catch(() => {});
        }
      } catch (e) {
        const msg =
          e.name === 'NotAllowedError'
            ? 'Camera permission denied. Allow camera access in your browser and try again.'
            : e.name === 'NotFoundError'
            ? 'No camera found on this device.'
            : e.message || 'Could not open camera';
        setError(msg);
      } finally {
        setStarting(false);
      }
    };
    start();

    return () => {
      cancelled = true;
      streamRef.current?.getTracks?.().forEach((t) => t.stop());
      streamRef.current = null;
    };
  }, [open, facingMode]);

  // Hard cleanup on unmount
  useEffect(() => () => {
    streamRef.current?.getTracks?.().forEach((t) => t.stop());
  }, []);

  if (!open) return null;

  const capture = () => {
    const video = videoRef.current;
    if (!video || !video.videoWidth) return toast.error('Camera not ready yet');

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0);

    const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
    canvas.toBlob(
      (blob) => {
        if (!blob) return toast.error('Could not capture photo');
        setSnapshot({ dataUrl, blob });
      },
      'image/jpeg',
      0.85
    );
  };

  const retake = () => setSnapshot(null);
  const use = () => {
    if (snapshot?.blob) onCapture(snapshot.blob);
    close();
  };
  const flip = () => setFacingMode((m) => (m === 'environment' ? 'user' : 'environment'));
  const close = () => {
    streamRef.current?.getTracks?.().forEach((t) => t.stop());
    streamRef.current = null;
    setSnapshot(null);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-3 sm:p-6 animate-slide-up"
      onClick={close}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-gray-900 text-white w-full max-w-2xl rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[95vh]"
        role="dialog"
        aria-modal="true"
        aria-label="Camera capture"
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
          <div className="flex items-center gap-2 font-semibold">
            <Camera size={16} /> Take a photo
          </div>
          <button type="button" onClick={close} className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center" aria-label="Close">
            <X size={16} />
          </button>
        </div>

        <div className="relative bg-black flex-1 flex items-center justify-center min-h-[280px]">
          {error ? (
            <div className="p-8 text-center text-sm text-red-200">
              <div className="text-3xl mb-2">📷</div>
              <div className="font-bold mb-1">Couldn&apos;t open camera</div>
              <div className="text-red-100/80 text-xs">{error}</div>
            </div>
          ) : snapshot ? (
            <img src={snapshot.dataUrl} alt="Captured" className="max-h-[60vh] w-auto object-contain" />
          ) : (
            <>
              <video
                ref={videoRef}
                playsInline
                muted
                className="max-h-[60vh] w-auto object-contain"
              />
              {starting && (
                <div className="absolute inset-0 flex items-center justify-center text-xs text-white/70">
                  Starting camera…
                </div>
              )}
            </>
          )}
        </div>

        <div className="px-4 py-3 border-t border-white/10 flex items-center justify-between gap-2 bg-black">
          {!snapshot ? (
            <>
              <button
                type="button"
                onClick={flip}
                disabled={!!error}
                className="flex items-center gap-1.5 text-xs text-white/80 hover:text-white disabled:opacity-50"
                title="Switch camera"
              >
                <FlipHorizontal2 size={14} /> Flip
              </button>
              <button
                type="button"
                onClick={capture}
                disabled={!!error || starting}
                className="bg-white text-gray-900 hover:bg-gray-100 disabled:opacity-50 font-bold px-6 py-2.5 rounded-full inline-flex items-center gap-2"
              >
                <Camera size={16} /> Capture
              </button>
              <div className="w-12" /> {/* spacer to balance flex */}
            </>
          ) : (
            <>
              <button type="button" onClick={retake} className="flex items-center gap-1.5 text-sm text-white/90 hover:text-white">
                <RotateCcw size={14} /> Retake
              </button>
              <button
                type="button"
                onClick={use}
                className="bg-brand-600 hover:bg-brand-700 text-white font-bold px-6 py-2.5 rounded-full inline-flex items-center gap-2"
              >
                <Check size={16} /> Use photo
              </button>
              <div className="w-12" />
            </>
          )}
        </div>
      </div>
    </div>
  );
};

CameraCapture.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onCapture: PropTypes.func.isRequired, // (Blob) => void
};
