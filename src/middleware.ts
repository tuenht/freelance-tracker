import { type NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';

// =============================================================================
// Next.js Edge Middleware
// - Runs on every matched request BEFORE it reaches the page/route handler
// - Handles session refresh + route-level auth guard
// =============================================================================

export async function middleware(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Match all request paths EXCEPT:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     * - Public assets
     */
    '/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
