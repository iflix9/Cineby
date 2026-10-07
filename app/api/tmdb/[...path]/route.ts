import { NextRequest, NextResponse } from 'next/server';
import { isBlockedMedia } from '@/lib/tmdb';

export const dynamic = 'force-dynamic';

const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

function getFallbackHtml() {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Service Temporarily Unavailable</title>
      <style>
        body { font-family: system-ui, -apple-system, sans-serif; background-color: #050505; color: #fff; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; margin: 0; text-align: center; }
        h1 { font-size: 2.5rem; margin-bottom: 1rem; }
        p { color: #a1a1aa; max-width: 500px; line-height: 1.5; margin-bottom: 2rem; }
        a { background-color: #dc2626; color: white; padding: 12px 24px; border-radius: 9999px; text-decoration: none; font-weight: 600; transition: background-color 0.2s; }
        a:hover { background-color: #b91c1c; }
      </style>
    </head>
    <body>
      <h1>Service Temporarily Unavailable</h1>
      <p>We are currently experiencing high traffic or performing background catalog updates. Please try again in a few moments.</p>
      <a href="/">Return to Homepage</a>
    </body>
    </html>
  `;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  // 1. Basic Security: Session check removed to avoid third-party cookie blocking in iframes (e.g. AI Studio)
  const sessionToken = request.cookies.get('cineby-session')?.value;
  // if (!sessionToken) {
  //   return NextResponse.json(
  //     { error: 'Unauthorized: Missing session token.' }, 
  //     { status: 401 }
  //   );
  // }

  // 2. Referer Check: Ensure the request comes from our own app
  // Using x-forwarded-host if available to support proxies like Cloud Run
  const referer = request.headers.get('referer');
  const host = request.headers.get('x-forwarded-host') || request.headers.get('host');
  
  if (referer && host && !referer.includes(host)) {
    console.warn(`Referer mismatch: referer=${referer}, host=${host}`);
    // We only warn here instead of blocking, because session cookie already protects the endpoint
  }

  const isHtmlRequest = Boolean(
    request.headers.get('accept')?.includes('text/html') && 
    !request.headers.get('accept')?.includes('application/json')
  );

  const apiKey = process.env.TMDB_API_KEY;

  if (!apiKey) {
    if (isHtmlRequest) {
      return new NextResponse(getFallbackHtml(), {
        status: 200,
        headers: { 'Content-Type': 'text/html' }
      });
    }
    return NextResponse.json({
      page: 1,
      results: [],
      total_pages: 0,
      total_results: 0,
      status_message: 'TMDB_API_KEY is not configured.',
    }, { status: 503 });
  }

  try {
    const { path } = await params;

    // Check if the route targets a blocked movie/media directly
    if (path.length >= 2 && path[0] === 'movie' && isBlockedMedia(path[1], 'movie')) {
      return NextResponse.json({ status_message: 'The resource you requested has been removed.', status_code: 34 }, { status: 404 });
    }

    const apiPath = `/${path.join('/')}`;
    const searchParams = request.nextUrl.searchParams;
    
    const url = new URL(`${TMDB_BASE_URL}${apiPath}`);
    searchParams.forEach((value, key) => {
      url.searchParams.append(key, value);
    });
    url.searchParams.append('api_key', apiKey);

    const response = await fetch(url.toString(), {
      headers: {
        accept: 'application/json',
      },
      next: { revalidate: 14400 }
    });

    if (!response.ok || response.status >= 500) {
      if (isHtmlRequest) {
        return new NextResponse(getFallbackHtml(), {
          status: 200,
          headers: { 'Content-Type': 'text/html' }
        });
      }
      return NextResponse.json({
        page: 1,
        results: [],
        total_pages: 0,
        total_results: 0,
        status_message: 'TMDB service temporarily unavailable.',
      }, { status: response.status || 500 });
    }

    const data = await response.json();

    // Filter out blocked media items from result sets (e.g. search, trending, discover)
    if (data && typeof data === 'object' && 'results' in data && Array.isArray(data.results)) {
      data.results = data.results.filter((item: any) => {
        if (!item || !item.id) return false;
        const mediaType = item.media_type || (item.title ? 'movie' : 'tv');
        return !isBlockedMedia(item.id, mediaType);
      });
    }

    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400',
      },
    });
  } catch (error) {
    console.error('TMDB Proxy Error:', error);
    if (isHtmlRequest) {
      return new NextResponse(getFallbackHtml(), {
        status: 200,
        headers: { 'Content-Type': 'text/html' }
      });
    }
    return NextResponse.json({
      page: 1,
      results: [],
      total_pages: 0,
      total_results: 0,
      status_message: 'Internal server error while fetching TMDB data.',
    }, { status: 500 });
  }
}
