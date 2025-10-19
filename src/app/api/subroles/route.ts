import { NextRequest, NextResponse } from 'next/server';

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3005';

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization');
    if (!token) {
      return NextResponse.json({ success: false, message: 'No authorization token provided' }, { status: 401 });
    }

    const searchParams = new URL(request.url).searchParams;
    const qp = new URLSearchParams();
    if (searchParams.get('q')) qp.set('q', searchParams.get('q')!);
    // clamp limit between 1 and 100, default 50
    const rawLimit = searchParams.get('limit');
    if (rawLimit) {
      const n = Math.max(1, Math.min(100, parseInt(rawLimit, 10) || 50));
      qp.set('limit', String(n));
    } else {
      qp.set('limit', '50');
    }
    if (searchParams.get('skip')) qp.set('skip', searchParams.get('skip')!);
    if (searchParams.get('isActive')) qp.set('isActive', searchParams.get('isActive')!);

    const res = await fetch(`${backendUrl}/api/subroles${qp.toString() ? `?${qp.toString()}` : ''}`, {
      headers: { 'Authorization': token, 'Content-Type': 'application/json' }
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (e) {
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('authorization');
    if (!token) {
      return NextResponse.json({ success: false, message: 'No authorization token provided' }, { status: 401 });
    }
    const body = await request.json();
    const res = await fetch(`${backendUrl}/api/subroles`, {
      method: 'POST',
      headers: { 'Authorization': token, 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (e) {
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}


