import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { SUPABASE_ANON_KEY, SUPABASE_URL, hasSupabaseEnv } from "@/lib/supabase/env";

/**
 * Proxy — Next 16's renamed Middleware (same functionality, file must be
 * `src/proxy.ts` exporting `proxy`). Two jobs, and only on /admin routes:
 *   1. Keep the Supabase auth session cookie fresh (calls auth.getUser()).
 *   2. Optimistically bounce signed-out visitors to /admin/login.
 *
 * This is an optimistic gate only — the real authorization check lives in the
 * admin layout's requireAdmin() (see src/lib/admin/auth.ts), close to the data.
 */
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isLogin = pathname === "/admin/login";

  // Backend not configured yet: let the request through and let the login page /
  // layout explain. Never trap the user in a redirect loop.
  if (!hasSupabaseEnv) return NextResponse.next({ request });

  let response = NextResponse.next({ request });

  const supabase = createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        );
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user && !isLogin) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: ["/admin/:path*"],
};
