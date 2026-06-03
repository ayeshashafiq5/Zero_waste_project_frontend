import { useEffect } from 'react';
import PropTypes from 'prop-types';
import { AlertTriangle, HelpCircle, X } from 'lucide-react';

export const ConfirmModal = ({
  open,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  isDestructive = false,
  onConfirm,
  onCancel,
}) => {
  // Prevent scrolling on body when modal is open
  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm sm:p-6">
      <div
        className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        <div className="p-5 sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                  isDestructive ? 'bg-red-100 text-red-600' : 'bg-brand-100 text-brand-600'
                }`}
              >
                {isDestructive ? <AlertTriangle size={20} /> : <HelpCircle size={20} />}
              </div>
              <h2 className="text-lg font-bold text-gray-900">{title}</h2>
            </div>
            <button
              onClick={onCancel}
              className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-1 rounded-full transition-colors"
              aria-label="Close"
            >
              <X size={20} />
            </button>
          </div>

          <div className="mt-4 text-sm text-gray-600 leading-relaxed pl-13 break-words">
            {message}
          </div>

          <div className="mt-6 flex flex-col-reverse sm:flex-row gap-3 sm:justify-end">
            <button
              onClick={onCancel}
              className="px-5 py-2.5 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 focus:ring-4 focus:ring-gray-100 transition-all w-full sm:w-auto"
            >
              {cancelText}
            </button>
            <button
              onClick={onConfirm}
              className={`px-5 py-2.5 text-sm font-semibold text-white rounded-xl shadow-sm transition-all w-full sm:w-auto ${
                isDestructive
                  ? 'bg-red-600 hover:bg-red-700 focus:ring-4 focus:ring-red-100'
                  : 'bg-brand-600 hover:bg-brand-700 focus:ring-4 focus:ring-brand-100'
              }`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

ConfirmModal.propTypes = {
  open: PropTypes.bool.isRequired,
  title: PropTypes.string.isRequired,
  message: PropTypes.node.isRequired,
  confirmText: PropTypes.string,
  cancelText: PropTypes.string,
  isDestructive: PropTypes.bool,
  onConfirm: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
};
