import { NextResponse } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const errorParam = searchParams.get('error');
  const errorDescription = searchParams.get('error_description');
  const next = searchParams.get('next') || '/dashboard';

  // If OAuth provider returned an explicit error (e.g. access denied, redirect uri mismatch)
  if (errorParam || errorDescription) {
    const reason = encodeURIComponent(errorDescription || errorParam || 'OAuth provider error');
    return NextResponse.redirect(`${origin}/login?error=${reason}`);
  }

  if (code) {
    try {
      const cookieStore = cookies();
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
      const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

      let response = NextResponse.redirect(`${origin}${next}`);

      const supabase = createServerClient(url, anonKey, {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
          set(name: string, value: string, options: CookieOptions) {
            cookieStore.set({ name, value, ...options });
            response.cookies.set({ name, value, ...options });
          },
          remove(name: string, options: CookieOptions) {
            cookieStore.set({ name, value: '', ...options });
            response.cookies.set({ name, value: '', ...options });
          },
        },
      });

      const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

      if (!exchangeError && data.session) {
        // Also set explicit auth cookie
        response.cookies.set('sb-access-token', data.session.access_token, {
          path: '/',
          maxAge: 86400,
          sameSite: 'lax',
        });
        return response;
      }

      if (exchangeError) {
        console.error('exchangeCodeForSession error:', exchangeError.message);
        return NextResponse.redirect(
          `${origin}/login?error=${encodeURIComponent(exchangeError.message)}`
        );
      }
    } catch (err: any) {
      console.error('OAuth callback execution error:', err);
      return NextResponse.redirect(
        `${origin}/login?error=${encodeURIComponent(err.message || 'Callback error')}`
      );
    }
  }

  return NextResponse.redirect(`${origin}/login?error=no_auth_code_received`);
}
