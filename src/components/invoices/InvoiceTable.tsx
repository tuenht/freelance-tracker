import { InvoiceTableRow } from './InvoiceTableRow';
import type { Invoice } from '@/types';

// =============================================================================
// InvoiceTable — Server Component
// Renders a full accessible table of invoices
// =============================================================================

interface InvoiceTableProps {
  invoices: Invoice[];
}

export function InvoiceTable({ invoices }: InvoiceTableProps) {
  if (invoices.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <svg
          className="mb-4 h-12 w-12 text-gray-300"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
        <h3 className="text-sm font-semibold text-gray-900">No invoices yet</h3>
        <p className="mt-1 text-sm text-gray-500">
          Get started by creating your first invoice.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {(['Client', 'Amount', 'Due Date', 'Status', 'Created'] as const).map(
              (heading) => (
                <th
                  key={heading}
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500"
                >
                  {heading}
                </th>
              ),
            )}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {invoices.map((invoice) => (
            <InvoiceTableRow key={invoice.id} invoice={invoice} />
          ))}
        </tbody>
      </table>
    </div>
  );
}
