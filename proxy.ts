// proxy.ts — Next.js 16 middleware
//
// Only responsibility: verify authentication. Redirect to /auth if no session.
// All data-fetching (profile completion, clinic membership) lives in the App
// Router layout where it benefits from React cache(), Suspense streaming, and
// the Node.js runtime (connection pooling, closer to DB).
//
// See: https://nextjs.org/docs/app/api-reference/file-conventions/proxy

import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

const PROTECTED_PATHS = [
  '/schedule',
  '/pharmacy',
  '/profile',
  '/clinic',
  '/analytics',
  '/patients',
  '/complete-profile',
  '/create-clinic',
];

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    },
  );

  const { data: { user } } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const isProtected = PROTECTED_PATHS.some((p) => pathname.startsWith(p));

  if (isProtected && !user) {
    const redirectUrl = new URL('/auth', request.url);
    return NextResponse.redirect(redirectUrl);
  }

  // Pass pathname to layouts so they can conditionally redirect for
  // profile completion / clinic membership without blocking the middleware
  // on DB calls.
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-pathname', pathname);
  response = NextResponse.next({
    request: { headers: requestHeaders },
  });

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
