import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only redirect if they are at the absolute root "/"
  if (pathname === '/') {
    // Basic detection via Cloudflare/Vercel standard headers
    const country = request.headers.get('x-vercel-ip-country') || request.headers.get('cf-ipcountry');
    const acceptLanguage = request.headers.get('accept-language') || '';

    let defaultLocale = 'global';

    if (country === 'IN' || acceptLanguage.includes('en-IN') || acceptLanguage.includes('hi')) {
      defaultLocale = 'in';
    } else if (country === 'US' || acceptLanguage.includes('en-US')) {
      defaultLocale = 'us';
    }

    return NextResponse.redirect(new URL(`/${defaultLocale}`, request.url));
  }
}

export const config = {
  matcher: ['/'],
};
