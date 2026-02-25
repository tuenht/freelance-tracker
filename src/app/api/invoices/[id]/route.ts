import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { UpdateInvoiceSchema } from '@/lib/validators/invoice';
import { createApiError, createApiSuccess } from '@/lib/utils';
import type { Invoice } from '@/types';
import { z } from 'zod';

export const runtime = 'nodejs';

const UUIDSchema = z.string().uuid('Invalid invoice ID.');

type RouteContext = { params: Promise<{ id: string }> };

// ── PATCH /api/invoices/[id] ──────────────────────────────────────────────────
export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const idParse = UUIDSchema.safeParse(id);
    if (!idParse.success) {
      return NextResponse.json(createApiError('Invalid invoice ID.', 400, 'INVALID_ID'), { status: 400 });
    }

    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(createApiError('Unauthorized', 401, 'UNAUTHORIZED'), { status: 401 });
    }

    const body: unknown = await request.json();
    const parseResult = UpdateInvoiceSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: 'Validation failed.',
            status: 422,
            code: 'VALIDATION_ERROR',
            issues: parseResult.error.flatten().fieldErrors,
          },
        },
        { status: 422 },
      );
    }

    // RLS enforces user_id ownership — double-checking here for clarity
    const { data, error } = await supabase
      .from('invoices')
      .update(parseResult.data)
      .eq('id', idParse.data)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      console.error(`[PATCH /api/invoices/${id}] Supabase error:`, error.message);
      return NextResponse.json(createApiError('Failed to update invoice.', 500, 'DB_ERROR'), { status: 500 });
    }

    if (!data) {
      return NextResponse.json(createApiError('Invoice not found.', 404, 'NOT_FOUND'), { status: 404 });
    }

    return NextResponse.json(createApiSuccess(data as Invoice), { status: 200 });
  } catch (err) {
    console.error('[PATCH /api/invoices/[id]] Unexpected error:', err);
    return NextResponse.json(createApiError('Internal server error.', 500, 'INTERNAL_ERROR'), { status: 500 });
  }
}

// ── DELETE /api/invoices/[id] ─────────────────────────────────────────────────
export async function DELETE(_request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const idParse = UUIDSchema.safeParse(id);
    if (!idParse.success) {
      return NextResponse.json(createApiError('Invalid invoice ID.', 400, 'INVALID_ID'), { status: 400 });
    }

    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(createApiError('Unauthorized', 401, 'UNAUTHORIZED'), { status: 401 });
    }

    const { error } = await supabase
      .from('invoices')
      .delete()
      .eq('id', idParse.data)
      .eq('user_id', user.id);

    if (error) {
      console.error(`[DELETE /api/invoices/${id}] Supabase error:`, error.message);
      return NextResponse.json(createApiError('Failed to delete invoice.', 500, 'DB_ERROR'), { status: 500 });
    }

    return new NextResponse(null, { status: 204 });
  } catch (err) {
    console.error('[DELETE /api/invoices/[id]] Unexpected error:', err);
    return NextResponse.json(createApiError('Internal server error.', 500, 'INTERNAL_ERROR'), { status: 500 });
  }
}
