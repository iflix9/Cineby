import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  
  // Create a secure session cookie to verify legitimate site traffic
  let session = request.cookies.get('cineby-session')?.value;
  
  if (!session) {
    // Generate a simple UUID-like string for the session
    session = crypto.randomUUID();
    
    // Set the cookie with strict security flags
    response.cookies.set('cineby-session', session, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7, // 1 week
    });
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (we don't want to SET the cookie on API routes, only validate it)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
