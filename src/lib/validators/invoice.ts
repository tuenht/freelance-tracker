import { z } from 'zod';

// ── Shared ────────────────────────────────────────────────────────────────────

export const InvoiceStatusSchema = z.enum([
  'draft',
  'sent',
  'paid',
  'overdue',
  'cancelled',
]);

// ── Create Invoice ────────────────────────────────────────────────────────────

export const CreateInvoiceSchema = z.object({
  client_name: z
    .string()
    .min(1, 'Client name is required.')
    .max(255, 'Client name must be under 255 characters.')
    .trim(),
  amount: z
    .number({ invalid_type_error: 'Amount must be a number.' })
    .positive('Amount must be a positive number.')
    .multipleOf(0.01, 'Amount can have at most 2 decimal places.')
    .max(99_999_999.99, 'Amount is too large.'),
  due_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Due date must be in YYYY-MM-DD format.')
    .refine((d) => !isNaN(new Date(d).getTime()), 'Invalid date.'),
  status: InvoiceStatusSchema.default('draft'),
});

export type CreateInvoiceInput = z.infer<typeof CreateInvoiceSchema>;

// ── Update Invoice ────────────────────────────────────────────────────────────

export const UpdateInvoiceSchema = CreateInvoiceSchema.partial();
export type UpdateInvoiceInput = z.infer<typeof UpdateInvoiceSchema>;

// ── Query Params ──────────────────────────────────────────────────────────────

export const InvoiceQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(10),
  status: InvoiceStatusSchema.optional(),
});

export type InvoiceQuery = z.infer<typeof InvoiceQuerySchema>;
