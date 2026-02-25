import { formatCurrency, formatDate } from '@/lib/utils';
import { InvoiceStatusBadge } from './InvoiceStatusBadge';
import type { Invoice } from '@/types';

// =============================================================================
// InvoiceTableRow — Server Component (no 'use client' needed — pure render)
// =============================================================================

interface InvoiceTableRowProps {
  invoice: Invoice;
}

export function InvoiceTableRow({ invoice }: InvoiceTableRowProps) {
  return (
    <tr className="group transition-colors hover:bg-gray-50">
      <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
        {invoice.client_name}
      </td>
      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">
        {formatCurrency(invoice.amount)}
      </td>
      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">
        {formatDate(invoice.due_date)}
      </td>
      <td className="whitespace-nowrap px-6 py-4">
        <InvoiceStatusBadge status={invoice.status} />
      </td>
      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
        {formatDate(invoice.created_at)}
      </td>
    </tr>
  );
}
