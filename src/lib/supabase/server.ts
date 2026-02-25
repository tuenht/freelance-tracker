import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

// =============================================================================
// Supabase Server Client
// - Must ONLY be called from Server Components, Route Handlers, or Server Actions
// - Reads cookies for session; uses anon key (RLS enforced in DB)
// - Service role key is NEVER used here — add a separate admin-only module if needed
// =============================================================================

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // Called from Server Component — mutations ignored safely.
            // The middleware is responsible for refreshing the session cookie.
          }
        },
      },
    },
  );
}
