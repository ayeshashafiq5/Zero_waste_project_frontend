import { useState } from 'react';
import PropTypes from 'prop-types';
import toast from 'react-hot-toast';
import { StatusBadge } from '../common/StatusBadge';
import { expiryLabel, relativeTime } from '../../utils/formatTime';
import { formatDistance } from '../../utils/distance';
import { foodService } from '../../services/foodService';
import { ConfirmModal } from '../common/ConfirmModal';

const TILE_COLORS = [
  'from-amber-100 to-orange-200',
  'from-emerald-100 to-green-200',
  'from-pink-100 to-red-200',
  'from-yellow-100 to-amber-200',
  'from-blue-100 to-indigo-200',
];

export const FoodCard = ({ listing, onAfterAccept }) => {
  const [busy, setBusy] = useState(false);
  const greyed = listing.status !== 'available';
  const tile = TILE_COLORS[(listing.id?.charCodeAt(0) || 0) % TILE_COLORS.length];

  const [confirmOpen, setConfirmOpen] = useState(false);

  const handleAccept = async () => {
    setConfirmOpen(false);
    setBusy(true);
    try {
      const data = await foodService.accept(listing.id);
      toast.success(`Accepted: ${data.title}`);
      onAfterAccept?.(data);
    } catch (e) {
      const msg = e.response?.data?.error || 'Could not accept';
      toast.error(msg);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className={`card overflow-hidden transition ${greyed ? 'opacity-60 grayscale' : 'hover:shadow-md'}`}>
      {listing.image_url ? (
        <div className="h-32 bg-gray-100 overflow-hidden">
          <img
            src={listing.image_url}
            alt={listing.title}
            loading="lazy"
            className="w-full h-full object-cover"
          />
        </div>
      ) : (
        <div className={`h-28 bg-gradient-to-br ${tile} flex items-center justify-center text-5xl`}>
          🍽️
        </div>
      )}
      <div className="p-4">
        <div className="flex items-center justify-between">
          <StatusBadge status={listing.status} />
          <span className="text-xs text-gray-500">{relativeTime(listing.created_at)}</span>
        </div>
        <div className="font-bold text-gray-900 mt-2 break-words">{listing.title}</div>
        <div className="text-xs text-gray-500 break-words">
          {listing.restaurant?.name || 'Restaurant'}
          {listing.distance != null && ` · ${formatDistance(listing.distance)}`}
        </div>
        <div className="flex items-center gap-3 mt-3 text-xs text-gray-600">
          <span>
            👥 <b>{listing.quantity}</b>
          </span>
          <span className="text-orange-500">{expiryLabel(listing.expiry_time)}</span>
        </div>
        <button
          onClick={() => setConfirmOpen(true)}
          disabled={busy || greyed}
          className={`mt-3 w-full ${greyed ? 'btn-secondary' : 'btn-primary'}`}
        >
          {greyed ? 'No longer available' : busy ? 'Accepting…' : 'Accept'}
        </button>
      </div>

      <ConfirmModal
        open={confirmOpen}
        title="Accept Food Listing"
        message={
          <>
            Are you sure you want to accept <strong>{listing.quantity} meals</strong> of <strong>{listing.title}</strong>? You will be responsible for picking it up before the expiry time.
          </>
        }
        confirmText="Yes, Accept Food"
        onConfirm={handleAccept}
        onCancel={() => setConfirmOpen(false)}
      />
    </div>
  );
};

FoodCard.propTypes = {
  listing: PropTypes.object.isRequired,
  onAfterAccept: PropTypes.func,
};
