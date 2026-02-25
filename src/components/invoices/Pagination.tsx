import Link from 'next/link';
import { cn } from '@/lib/utils';

// =============================================================================
// Pagination — Server Component
// URL-driven pagination (no client state needed)
// =============================================================================

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  basePath: string;
  searchParams?: Record<string, string>;
}

export function Pagination({
  currentPage,
  totalPages,
  basePath,
  searchParams = {},
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const buildUrl = (page: number) => {
    const params = new URLSearchParams({ ...searchParams, page: String(page) });
    return `${basePath}?${params.toString()}`;
  };

  const hasPrev = currentPage > 1;
  const hasNext = currentPage < totalPages;

  // Show a window of 5 pages centered around current
  const pageRange = Array.from({ length: totalPages }, (_, i) => i + 1).filter(
    (p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 2,
  );

  return (
    <nav aria-label="Pagination" className="flex items-center justify-between">
      <p className="text-sm text-gray-700">
        Page <span className="font-semibold">{currentPage}</span> of{' '}
        <span className="font-semibold">{totalPages}</span>
      </p>

      <div className="flex items-center gap-1">
        <Link
          href={buildUrl(currentPage - 1)}
          aria-disabled={!hasPrev}
          aria-label="Previous page"
          className={cn(
            'rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700',
            'transition-colors hover:bg-gray-50',
            !hasPrev && 'pointer-events-none opacity-40',
          )}
        >
          &larr; Prev
        </Link>

        {pageRange.map((p, idx) => {
          const prev = pageRange[idx - 1];
          const showEllipsis = prev !== undefined && p - prev > 1;
          return (
            <span key={p} className="flex items-center gap-1">
              {showEllipsis && (
                <span className="px-2 text-gray-400">…</span>
              )}
              <Link
                href={buildUrl(p)}
                aria-current={p === currentPage ? 'page' : undefined}
                className={cn(
                  'rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors',
                  p === currentPage
                    ? 'border-brand-600 bg-brand-600 text-white pointer-events-none'
                    : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50',
                )}
              >
                {p}
              </Link>
            </span>
          );
        })}

        <Link
          href={buildUrl(currentPage + 1)}
          aria-disabled={!hasNext}
          aria-label="Next page"
          className={cn(
            'rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700',
            'transition-colors hover:bg-gray-50',
            !hasNext && 'pointer-events-none opacity-40',
          )}
        >
          Next &rarr;
        </Link>
      </div>
    </nav>
  );
}
