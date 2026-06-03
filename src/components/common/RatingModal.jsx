import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import toast from 'react-hot-toast';
import { Star, X } from 'lucide-react';
import { ratingService } from '../../services/ratingService';

const POSITIVE_TAGS = ['On-time pickup', 'Hygienic packing', 'Friendly staff', 'Accurate description', 'Easy to find'];
const NEGATIVE_TAGS = ['Late pickup', 'Communication issues', 'Hard to find', 'Description mismatch'];

// Re-usable mutual rating modal. Used by both NGO (after collect) and Restaurant (after pickup confirmed).
// Closes on overlay click, submit success, or X. Locks scroll while open.
export const RatingModal = ({ open, onClose, foodId, ratee, onSubmitted }) => {
  const [stars, setStars] = useState(5);
  const [hover, setHover] = useState(0);
  const [tags, setTags] = useState([]);
  const [comment, setComment] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      setStars(5); setHover(0); setTags([]); setComment(''); setIsPublic(true);
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = ''; };
    }
  }, [open]);

  if (!open) return null;

  const tagPool = stars >= 4 ? POSITIVE_TAGS : NEGATIVE_TAGS;
  const toggleTag = (t) => setTags((s) => (s.includes(t) ? s.filter((x) => x !== t) : [...s, t]));

  const submit = async () => {
    if (!ratee?.id) return toast.error('Missing recipient');
    setSubmitting(true);
    try {
      await ratingService.create({
        food_id: foodId,
        ratee_id: ratee.id,
        stars,
        comment: comment.trim() || undefined,
        tags: tags.length ? tags : undefined,
        is_public: isPublic,
      });
      toast.success('Thanks for rating!');
      onSubmitted?.();
      onClose();
    } catch (e) {
      const msg = e.response?.data?.error || e.message;
      if (e.response?.status === 409) toast('Already rated', { icon: 'ℹ️' });
      else toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const label = stars === 5 ? 'Excellent' : stars === 4 ? 'Very good' : stars === 3 ? 'Okay' : stars === 2 ? 'Poor' : 'Bad';

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-slide-up"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col"
        role="dialog"
        aria-modal="true"
      >
        <div className="bg-gradient-to-r from-brand-600 to-emerald-600 text-white px-6 py-5 text-center relative">
          <button
            onClick={onClose}
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center"
            aria-label="Close"
          >
            <X size={16} />
          </button>
          <div className="text-3xl">🎉</div>
          <div className="text-lg font-bold mt-1">How was your experience?</div>
          <div className="text-xs text-brand-50 mt-1">Rate {ratee?.name || 'them'} — your feedback helps everyone.</div>
        </div>

        <div className="p-6 overflow-y-auto">
          <div className="flex items-center justify-center gap-1 mt-1" onMouseLeave={() => setHover(0)}>
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setStars(n)}
                onMouseEnter={() => setHover(n)}
                className="p-1"
                aria-label={`${n} star`}
              >
                <Star
                  size={36}
                  className={`transition-colors ${
                    (hover || stars) >= n ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                  }`}
                />
              </button>
            ))}
          </div>
          <div className="text-center text-sm font-bold text-brand-700 mt-1">{label} — {stars}/5</div>

          <div className="text-xs font-semibold text-gray-700 mt-5">{stars >= 4 ? 'What went well?' : 'What could improve?'}</div>
          <div className="flex flex-wrap gap-2 mt-2">
            {tagPool.map((t) => {
              const on = tags.includes(t);
              return (
                <button
                  key={t}
                  type="button"
                  onClick={() => toggleTag(t)}
                  className={`text-xs px-3 py-1.5 rounded-full font-semibold border transition-colors ${
                    on
                      ? 'bg-brand-100 text-brand-700 border-brand-200'
                      : 'bg-gray-50 text-gray-600 border-gray-200 hover:border-brand-300'
                  }`}
                >
                  {on ? '✓ ' : ''}{t}
                </button>
              );
            })}
          </div>

          <div className="mt-4">
            <label className="label">Anything to add? <span className="text-gray-400 font-normal">(optional)</span></label>
            <textarea
              rows="3"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              maxLength={1000}
              className="input"
              placeholder="Share what made this experience memorable…"
            />
          </div>

          <label className="flex items-start gap-2 mt-4 text-xs text-gray-600 cursor-pointer">
            <input type="checkbox" checked={isPublic} onChange={(e) => setIsPublic(e.target.checked)} className="mt-0.5" />
            <span>Share this rating publicly on {ratee?.name || 'their'} profile.</span>
          </label>
        </div>

        <div className="border-t border-gray-100 p-4 flex items-center justify-between gap-2 bg-gray-50">
          <button onClick={onClose} className="btn-ghost text-sm">Skip</button>
          <button onClick={submit} disabled={submitting} className="btn-primary">
            {submitting ? 'Submitting…' : 'Submit rating'}
          </button>
        </div>
      </div>
    </div>
  );
};

RatingModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  foodId: PropTypes.string,
  ratee: PropTypes.shape({ id: PropTypes.string, name: PropTypes.string }),
  onSubmitted: PropTypes.func,
};
