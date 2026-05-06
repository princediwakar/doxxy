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

  const { data: { session } } = await supabase.auth.getSession();

  const { pathname } = request.nextUrl;
  const isProtected = PROTECTED_PATHS.some((p) => pathname.startsWith(p));

  if (isProtected && !session) {
    const redirectUrl = new URL('/auth', request.url);
    return NextResponse.redirect(redirectUrl);
  }

  // Enforce profile completion for protected paths (skip complete-profile and create-clinic)
  if (
    session?.user &&
    isProtected &&
    pathname !== '/complete-profile' &&
    pathname !== '/create-clinic'
  ) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('name, phone')
      .eq('id', session.user.id)
      .maybeSingle();

    const needsCompletion = !profile || !profile.name || !profile.phone;

    if (needsCompletion) {
      const redirectUrl = new URL('/complete-profile', request.url);
      return NextResponse.redirect(redirectUrl);
    }

    // Check for clinic membership
    const { data: members } = await supabase.rpc(
      'get_user_clinic_memberships',
      { user_id: session.user.id },
    );

    if (!members || members.length === 0) {
      const redirectUrl = new URL('/create-clinic', request.url);
      return NextResponse.redirect(redirectUrl);
    }
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
