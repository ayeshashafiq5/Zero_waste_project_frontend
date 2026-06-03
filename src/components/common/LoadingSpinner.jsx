import PropTypes from 'prop-types';

export const LoadingSpinner = ({ size = 'md', label, fullScreen = false }) => {
  const dim = size === 'sm' ? 'h-5 w-5 border-2' : size === 'lg' ? 'h-10 w-10 border-4' : 'h-7 w-7 border-2';
  const spinner = (
    <div className="flex flex-col items-center justify-center gap-3">
      <div className={`${dim} animate-spin rounded-full border-brand-200 border-t-brand-600`} />
      {label && <div className="text-sm text-gray-500">{label}</div>}
    </div>
  );
  if (fullScreen) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">{spinner}</div>
    );
  }
  return <div className="flex items-center justify-center p-8">{spinner}</div>;
};

LoadingSpinner.propTypes = {
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  label: PropTypes.string,
  fullScreen: PropTypes.bool,
};
