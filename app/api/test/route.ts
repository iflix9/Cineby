import { NextRequest, NextResponse } from 'next/server';
export async function GET(request: NextRequest) {
  return NextResponse.json({
    referer: request.headers.get('referer'),
    host: request.headers.get('host'),
    xForwardedHost: request.headers.get('x-forwarded-host'),
    headers: Object.fromEntries(request.headers.entries())
  });
}
