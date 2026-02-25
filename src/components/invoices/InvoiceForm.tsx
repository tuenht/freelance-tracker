'use client';

import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CreateInvoiceSchema, type CreateInvoiceInput } from '@/lib/validators/invoice';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/Card';
import type { InvoiceStatus } from '@/types';

// =============================================================================
// InvoiceForm — Client Component
// Uses React Hook Form + Zod for client-side validation before API call
// =============================================================================

const STATUS_OPTIONS: { value: InvoiceStatus; label: string }[] = [
  { value: 'draft',     label: 'Draft' },
  { value: 'sent',      label: 'Sent' },
  { value: 'paid',      label: 'Paid' },
  { value: 'overdue',   label: 'Overdue' },
  { value: 'cancelled', label: 'Cancelled' },
];

export function InvoiceForm() {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<CreateInvoiceInput>({
    resolver: zodResolver(CreateInvoiceSchema),
    defaultValues: {
      client_name: '',
      amount: 0,
      due_date: '',
      status: 'draft',
    },
  });

  const onSubmit = async (data: CreateInvoiceInput) => {
    try {
      const response = await fetch('/api/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result: unknown = await response.json();

      if (!response.ok) {
        // Narrow the unknown result safely
        if (
          typeof result === 'object' &&
          result !== null &&
          'error' in result &&
          typeof (result as { error: unknown }).error === 'object'
        ) {
          const errObj = (result as { error: { message?: string } }).error;
          setError('root', {
            message: errObj.message ?? 'Failed to create invoice.',
          });
        } else {
          setError('root', { message: 'An unexpected error occurred.' });
        }
        return;
      }

      // Success — navigate back to dashboard
      router.push('/dashboard');
      router.refresh(); // Invalidate RSC cache so new invoice appears immediately
    } catch {
      setError('root', { message: 'Network error. Please try again.' });
    }
  };

  return (
    <Card className="mx-auto max-w-lg">
      <CardHeader>
        <h2 className="text-lg font-semibold text-gray-900">New Invoice</h2>
        <p className="mt-1 text-sm text-gray-500">
          Fill in the details below to create a new invoice.
        </p>
      </CardHeader>

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <CardContent className="space-y-5">
          {/* Root-level error */}
          {errors.root && (
            <div
              role="alert"
              className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"
            >
              {errors.root.message}
            </div>
          )}

          {/* Client Name */}
          <div className="space-y-1.5">
            <Label htmlFor="client_name" required>
              Client Name
            </Label>
            <Input
              id="client_name"
              type="text"
              placeholder="Acme Corporation"
              autoComplete="organization"
              error={errors.client_name?.message}
              {...register('client_name')}
            />
          </div>

          {/* Amount */}
          <div className="space-y-1.5">
            <Label htmlFor="amount" required>
              Amount (USD)
            </Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0.01"
              placeholder="0.00"
              error={errors.amount?.message}
              {...register('amount', { valueAsNumber: true })}
            />
          </div>

          {/* Due Date */}
          <div className="space-y-1.5">
            <Label htmlFor="due_date" required>
              Due Date
            </Label>
            <Input
              id="due_date"
              type="date"
              error={errors.due_date?.message}
              {...register('due_date')}
            />
          </div>

          {/* Status */}
          <div className="space-y-1.5">
            <Label htmlFor="status">Status</Label>
            <select
              id="status"
              className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
              {...register('status')}
            >
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            {errors.status && (
              <p role="alert" className="text-xs text-red-600">
                {errors.status.message}
              </p>
            )}
          </div>
        </CardContent>

        <CardFooter className="flex items-center justify-end gap-3">
          <Button
            type="button"
            variant="secondary"
            onClick={() => router.back()}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button type="submit" isLoading={isSubmitting}>
            {isSubmitting ? 'Creating…' : 'Create Invoice'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
