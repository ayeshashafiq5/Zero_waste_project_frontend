import PropTypes from 'prop-types';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export const PAGE_SIZE = 10;

/**
 * Reusable page-navigation bar.
 * Renders nothing when total items fit on one page.
 * Shows first/last page + a sliding window around the current page.
 */
export const Pagination = ({ total, page, pageSize = PAGE_SIZE, onPageChange }) => {
  const totalPages = Math.ceil(total / pageSize);
  if (totalPages <= 1) return null;

  const from = Math.min((page - 1) * pageSize + 1, total);
  const to   = Math.min(page * pageSize, total);

  // Build visible page numbers: always include 1, totalPages, and a ±1 window around current.
  const visible = [];
  for (let p = 1; p <= totalPages; p++) {
    if (p === 1 || p === totalPages || Math.abs(p - page) <= 1) {
      visible.push(p);
    }
  }
  // Insert ellipsis markers between gaps
  const withGaps = visible.reduce((acc, p, i) => {
    if (i > 0 && p - visible[i - 1] > 1) acc.push('gap');
    acc.push(p);
    return acc;
  }, []);

  return (
    <div className="flex items-center justify-between mt-5 px-1">
      <p className="text-xs text-gray-500 hidden sm:block">
        Showing {from}–{to} of {total}
      </p>
      <p className="text-xs text-gray-500 sm:hidden">
        Page {page} / {totalPages}
      </p>

      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1}
          className="inline-flex items-center justify-center w-8 h-8 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed text-xs"
          aria-label="Previous page"
        >
          <ChevronLeft size={14} />
        </button>

        {withGaps.map((p, i) =>
          p === 'gap' ? (
            <span key={`gap-${i}`} className="text-xs text-gray-400 px-1 select-none">
              …
            </span>
          ) : (
            <button
              key={p}
              onClick={() => onPageChange(p)}
              className={`inline-flex items-center justify-center w-8 h-8 rounded-lg text-xs font-semibold transition-colors ${
                p === page
                  ? 'bg-brand-600 text-white'
                  : 'border border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
              aria-current={p === page ? 'page' : undefined}
            >
              {p}
            </button>
          )
        )}

        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page === totalPages}
          className="inline-flex items-center justify-center w-8 h-8 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed text-xs"
          aria-label="Next page"
        >
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
};

Pagination.propTypes = {
  total:        PropTypes.number.isRequired,
  page:         PropTypes.number.isRequired,
  pageSize:     PropTypes.number,
  onPageChange: PropTypes.func.isRequired,
};
