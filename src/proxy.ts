import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import createMiddleware from 'next-intl/middleware';
import { routing } from '@/i18n/routing';

const intlMiddleware = createMiddleware(routing);

export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const session = request.cookies.get('shuru_session')?.value;

  // Extract path without locale prefix (e.g. /ar/profile -> /profile, /en/auth/login -> /auth/login)
  const pathWithoutLocale = pathname.replace(/^\/(ar|en)/, '');

  const isProfileRoute = pathWithoutLocale === '/profile' || pathWithoutLocale.startsWith('/profile/');
  const isAuthRoute = pathWithoutLocale === '/auth/login' || pathWithoutLocale === '/auth/signup';

  const localeMatch = pathname.match(/^\/(ar|en)/);
  const locale = localeMatch ? localeMatch[1] : routing.defaultLocale;

  if (isProfileRoute) {
    if (!session) {
      const url = request.nextUrl.clone();
      url.pathname = `/${locale}/auth/login`;
      url.searchParams.set('redirect', pathname);
      return NextResponse.redirect(url);
    }
  }

  if (isAuthRoute) {
    if (session) {
      const url = request.nextUrl.clone();
      url.pathname = `/${locale}/profile`;
      return NextResponse.redirect(url);
    }
  }

  // Handle standard localization for other routes
  return intlMiddleware(request);
}

export const config = {
  matcher: [
    '/',
    '/(ar|en)/:path*',
    '/auth/callback',
    // Exclude static and api paths
    '/((?!api|_next/static|_next/image|fonts|images|favicon.ico|manifest.json|robots.txt|sitemap.xml|.*\\..*).*)'
  ]
};
