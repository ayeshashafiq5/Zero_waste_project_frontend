import PropTypes from 'prop-types';

export const Logo = ({ size = 'md', stacked = false }) => {
  const dims = size === 'sm' ? 'w-7 h-7 text-sm' : size === 'lg' ? 'w-12 h-12 text-2xl' : 'w-9 h-9 text-base';
  const title = size === 'lg' ? 'text-xl' : 'text-sm';
  const tag = size === 'lg' ? 'text-sm' : 'text-[10px]';

  return (
    <div className="flex items-center gap-2">
      <div className={`${dims} rounded-lg bg-brand-600 flex items-center justify-center text-white font-bold`}>
        🍽
      </div>
      {stacked ? (
        <div className="leading-tight">
          <div className={`font-bold text-gray-900 ${title}`}>Zero-Waste</div>
          <div className={`text-brand-600 font-semibold ${tag}`}>Food Connect</div>
        </div>
      ) : (
        <div className={`font-bold text-gray-900 ${title}`}>Zero-Waste Food Connect</div>
      )}
    </div>
  );
};

Logo.propTypes = { size: PropTypes.oneOf(['sm', 'md', 'lg']), stacked: PropTypes.bool };
