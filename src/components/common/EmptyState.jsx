import PropTypes from 'prop-types';

export const EmptyState = ({ icon = '📭', title, description, action }) => (
  <div className="text-center py-12 px-6">
    <div className="text-5xl mb-3">{icon}</div>
    <div className="font-bold text-gray-900">{title}</div>
    {description && <p className="text-sm text-gray-500 mt-1 max-w-sm mx-auto">{description}</p>}
    {action && <div className="mt-5">{action}</div>}
  </div>
);

EmptyState.propTypes = {
  icon: PropTypes.string,
  title: PropTypes.string.isRequired,
  description: PropTypes.string,
  action: PropTypes.node,
};
