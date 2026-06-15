import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ provider: string }> }
) {
  const { provider } = await params;
  const { searchParams } = new URL(request.url);

  // Determine current locale (fallback to 'en')
  const cookieStore = await cookies();
  const locale = cookieStore.get('locale')?.value || cookieStore.get('NEXT_LOCALE')?.value || 'en';

  // Construct the redirect URL to the localized frontend callback page
  const redirectUrl = new URL(`/${locale}/auth/callback`, request.url);
  
  // Forward all original query parameters
  redirectUrl.search = searchParams.toString();
  
  // Ensure the provider parameter is set
  redirectUrl.searchParams.set('provider', provider);

  return NextResponse.redirect(redirectUrl);
}
