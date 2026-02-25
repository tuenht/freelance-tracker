import { cn } from '@/lib/utils';
import type { InvoiceStatus } from '@/types';

// =============================================================================
// InvoiceStatusBadge — Pure display component, zero side-effects
// =============================================================================

const statusConfig: Record<
  InvoiceStatus,
  { label: string; className: string }
> = {
  draft:     { label: 'Draft',     className: 'bg-gray-100 text-gray-700 ring-gray-200' },
  sent:      { label: 'Sent',      className: 'bg-blue-50 text-blue-700 ring-blue-200' },
  paid:      { label: 'Paid',      className: 'bg-green-50 text-green-700 ring-green-200' },
  overdue:   { label: 'Overdue',   className: 'bg-red-50 text-red-700 ring-red-200' },
  cancelled: { label: 'Cancelled', className: 'bg-yellow-50 text-yellow-700 ring-yellow-200' },
};

interface InvoiceStatusBadgeProps {
  status: InvoiceStatus;
  className?: string;
}

export function InvoiceStatusBadge({ status, className }: InvoiceStatusBadgeProps) {
  const config = statusConfig[status];
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset',
        config.className,
        className,
      )}
    >
      {config.label}
    </span>
  );
}
