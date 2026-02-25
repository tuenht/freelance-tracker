import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { CreateInvoiceSchema, InvoiceQuerySchema } from '@/lib/validators/invoice';
import { createApiError, createApiSuccess } from '@/lib/utils';
import type { Invoice, PaginatedResponse } from '@/types';

// =============================================================================
// /api/invoices — GET (list) & POST (create)
// Runtime: Node.js (default) — full Supabase SSR cookie support
// Security: All operations require authenticated session (enforced + RLS)
// =============================================================================

export const runtime = 'nodejs';

// ── GET /api/invoices ─────────────────────────────────────────────────────────
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(createApiError('Unauthorized', 401, 'UNAUTHORIZED'), { status: 401 });
    }

    // Parse + validate query params with Zod
    const rawParams = Object.fromEntries(request.nextUrl.searchParams.entries());
    const parseResult = InvoiceQuerySchema.safeParse(rawParams);
    if (!parseResult.success) {
      return NextResponse.json(
        createApiError('Invalid query parameters.', 400, 'VALIDATION_ERROR'),
        { status: 400 },
      );
    }

    const { page, pageSize, status } = parseResult.data;
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    let query = supabase
      .from('invoices')
      .select('*', { count: 'exact' })
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .range(from, to);

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error, count } = await query;

    if (error) {
      console.error('[GET /api/invoices] Supabase error:', error.message);
      return NextResponse.json(
        createApiError('Failed to fetch invoices.', 500, 'DB_ERROR'),
        { status: 500 },
      );
    }

    const total = count ?? 0;
    const response: PaginatedResponse<Invoice> = {
      data: (data ?? []) as Invoice[],
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };

    return NextResponse.json(createApiSuccess(response), { status: 200 });
  } catch (err) {
    console.error('[GET /api/invoices] Unexpected error:', err);
    return NextResponse.json(
      createApiError('Internal server error.', 500, 'INTERNAL_ERROR'),
      { status: 500 },
    );
  }
}

// ── POST /api/invoices ────────────────────────────────────────────────────────
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(createApiError('Unauthorized', 401, 'UNAUTHORIZED'), { status: 401 });
    }

    // Parse + validate body with Zod (Zero Trust)
    const body: unknown = await request.json();
    const parseResult = CreateInvoiceSchema.safeParse(body);
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

    const { client_name, amount, due_date, status } = parseResult.data;

    const { data, error } = await supabase
      .from('invoices')
      .insert({ user_id: user.id, client_name, amount, due_date, status })
      .select()
      .single();

    if (error) {
      console.error('[POST /api/invoices] Supabase error:', error.message);
      return NextResponse.json(
        createApiError('Failed to create invoice.', 500, 'DB_ERROR'),
        { status: 500 },
      );
    }

    console.warn(`[POST /api/invoices] Invoice created: ${data.id} by user: ${user.id}`);

    return NextResponse.json(createApiSuccess(data as Invoice), { status: 201 });
  } catch (err) {
    console.error('[POST /api/invoices] Unexpected error:', err);
    return NextResponse.json(
      createApiError('Internal server error.', 500, 'INTERNAL_ERROR'),
      { status: 500 },
    );
  }
}
