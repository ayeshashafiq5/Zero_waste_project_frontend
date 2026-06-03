import PropTypes from 'prop-types';
import { STATUS_STYLES } from '../../utils/constants';

const LABEL_OVERRIDES = {
  picked_up: 'Picked up',
};

const titleCase = (status) =>
  LABEL_OVERRIDES[status] ||
  (status || '')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());

export const StatusBadge = ({ status, size = 'sm' }) => {
  const cls = STATUS_STYLES[status] || 'bg-gray-100 text-gray-600 border-gray-200';
  const pad = size === 'md' ? 'px-3 py-1 text-xs' : 'px-2 py-0.5 text-[11px]';
  return (
    <span className={`inline-flex items-center gap-1 ${pad} font-semibold rounded-full border ${cls}`}>
      {titleCase(status)}
    </span>
  );
};

StatusBadge.propTypes = {
  status: PropTypes.oneOf(['available', 'accepted', 'collected', 'expired', 'cancelled', 'picked_up']).isRequired,
  size: PropTypes.oneOf(['sm', 'md']),
};
