'use client';

// =============================================================================
// Supabase Browser Client
// - Uses NEXT_PUBLIC_ env vars (safe for client exposure)
// - Uses @supabase/ssr createBrowserClient for cookie-based auth
// =============================================================================

import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
