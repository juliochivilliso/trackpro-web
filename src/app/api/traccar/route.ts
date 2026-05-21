import { NextRequest, NextResponse } from 'next/server';

const TRACCAR_URL = process.env.TRACCAR_URL;
const TRACCAR_USER = process.env.TRACCAR_USER;
const TRACCAR_PASSWORD = process.env.TRACCAR_PASSWORD;

// Cache the session cookie so we don't re-login on every request
let sessionCookie: string | null = null;
let sessionExpiry = 0;

async function getSession(): Promise<string | null> {
  if (sessionCookie && Date.now() < sessionExpiry) return sessionCookie;

  const res = await fetch(`${TRACCAR_URL}/api/session`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `email=${encodeURIComponent(TRACCAR_USER!)}&password=${encodeURIComponent(TRACCAR_PASSWORD!)}`,
    cache: 'no-store',
  });

  if (!res.ok) return null;

  const cookie = res.headers.get('set-cookie');
  if (!cookie) return null;

  sessionCookie = cookie.split(';')[0]; // grab just JSESSIONID=...
  sessionExpiry = Date.now() + 30 * 60 * 1000; // 30 min
  return sessionCookie;
}

export async function GET(request: NextRequest) {
  if (!TRACCAR_URL || !TRACCAR_USER || !TRACCAR_PASSWORD) {
    return NextResponse.json({ error: 'Traccar not configured' }, { status: 503 });
  }

  const resource = request.nextUrl.searchParams.get('resource');
  if (!resource || !['devices', 'positions'].includes(resource)) {
    return NextResponse.json({ error: 'Invalid resource' }, { status: 400 });
  }

  try {
    const cookie = await getSession();
    if (!cookie) {
      return NextResponse.json({ error: 'Traccar auth failed' }, { status: 401 });
    }

    const res = await fetch(`${TRACCAR_URL}/api/${resource}`, {
      headers: { Cookie: cookie },
      cache: 'no-store',
    });

    if (res.status === 401) {
      // Session expired — clear cache and retry once
      sessionCookie = null;
      const freshCookie = await getSession();
      if (!freshCookie) return NextResponse.json({ error: 'Traccar auth failed' }, { status: 401 });

      const retry = await fetch(`${TRACCAR_URL}/api/${resource}`, {
        headers: { Cookie: freshCookie },
        cache: 'no-store',
      });
      const data = await retry.json();
      return NextResponse.json(data);
    }

    if (!res.ok) {
      return NextResponse.json({ error: `Traccar responded ${res.status}` }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: 'Cannot reach Traccar server' }, { status: 503 });
  }
}
