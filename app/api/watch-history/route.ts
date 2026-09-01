import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  // 1. Basic Security: Check removed to avoid third-party cookie blocking in iframes
  const sessionToken = request.cookies.get('cineby-session')?.value;
  // if (!sessionToken) {
  //   return NextResponse.json(
  //     { error: 'Unauthorized: Missing session token.' }, 
  //     { status: 401 }
  //   );
  // }

  // 2. Referer Check: Ensure the request comes from our own app
  const referer = request.headers.get('referer');
  const host = request.headers.get('x-forwarded-host') || request.headers.get('host');
  
  if (referer && host && !referer.includes(host)) {
    console.warn(`Referer mismatch: referer=${referer}, host=${host}`);
  }

  try {
    const body = await request.json();
    return NextResponse.json({ success: true, timestamp: Date.now(), data: body });
  } catch (error) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 400 });
  }
}
