import { useState } from 'react';
import PropTypes from 'prop-types';
import { StatusBadge } from '../common/StatusBadge';
import { expiryLabel, relativeTime } from '../../utils/formatTime';
import { ConfirmModal } from '../common/ConfirmModal';

export const ListingCard = ({ listing, onCancel, busy }) => {
  const [confirmOpen, setConfirmOpen] = useState(false);

  const handleConfirm = () => {
    setConfirmOpen(false);
    onCancel(listing.id);
  };

  return (
    <div className="card p-4 flex flex-col sm:flex-row sm:items-center gap-4">
      <div className="w-12 h-12 rounded-lg bg-brand-100 flex items-center justify-center text-2xl shrink-0 overflow-hidden">
        {listing.image_url ? (
          <img src={listing.image_url} alt={listing.title} className="w-full h-full object-cover" />
        ) : (
          <span>🍽️</span>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="font-bold text-gray-900 truncate">{listing.title}</div>
          <StatusBadge status={listing.status} />
        </div>
        <div className="text-xs text-gray-500 mt-1 truncate">
          {listing.quantity} meals · {listing.food_type || 'mixed'} · posted {relativeTime(listing.created_at)}
        </div>
      </div>
      <div className="text-xs text-orange-500 sm:w-32 sm:text-right font-semibold">
        {listing.status === 'available' || listing.status === 'accepted' ? expiryLabel(listing.expiry_time) : '—'}
      </div>
      {(listing.status === 'available' || listing.status === 'accepted') && onCancel && (
        <button onClick={() => setConfirmOpen(true)} disabled={busy} className="btn-secondary text-xs">
          Cancel
        </button>
      )}

      <ConfirmModal
        open={confirmOpen}
        title="Cancel Listing"
        message={
          <>
            Are you sure you want to cancel <strong>{listing.title}</strong>? This action cannot be undone.
          </>
        }
        confirmText="Yes, Cancel it"
        isDestructive={true}
        onConfirm={handleConfirm}
        onCancel={() => setConfirmOpen(false)}
      />
    </div>
  );
};

ListingCard.propTypes = {
  listing: PropTypes.object.isRequired,
  onCancel: PropTypes.func,
  busy: PropTypes.bool,
};
