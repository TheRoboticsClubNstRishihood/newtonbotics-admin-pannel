import { NextRequest, NextResponse } from 'next/server';
import { getBackendUrl } from '@/config/backend';

const backendUrl = getBackendUrl();

const missingAuthResponse = NextResponse.json(
  { success: false, message: 'Authorization header required' },
  { status: 401 }
);

async function proxyRequest(
  targetUrl: string,
  init: RequestInit,
  defaultErrorMessage: string
) {
  try {
    const response = await fetch(targetUrl, {
      ...init,
      cache: 'no-store'
    });

    const text = await response.text();
    if (!text) {
      return NextResponse.json(
        { success: response.ok },
        { status: response.status }
      );
    }

    try {
      const data = JSON.parse(text);
      return NextResponse.json(data, { status: response.status });
    } catch {
      return NextResponse.json(
        { success: response.ok, message: text || defaultErrorMessage },
        { status: response.status }
      );
    }
  } catch (error) {
    console.error('[attendance] proxy error', error);
    return NextResponse.json(
      { success: false, message: defaultErrorMessage },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader) {
    return missingAuthResponse;
  }

  const searchParams = new URL(request.url).searchParams.toString();
  const targetUrl = `${backendUrl}/api/attendance${searchParams ? `?${searchParams}` : ''}`;

  return proxyRequest(
    targetUrl,
    {
      method: 'GET',
      headers: {
        Authorization: authHeader
      }
    },
    'Failed to fetch attendance records'
  );
}

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader) {
    return missingAuthResponse;
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, message: 'Invalid JSON payload' },
      { status: 400 }
    );
  }

  return proxyRequest(
    `${backendUrl}/api/attendance`,
    {
      method: 'POST',
      headers: {
        Authorization: authHeader,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    },
    'Failed to create attendance record'
  );
}

