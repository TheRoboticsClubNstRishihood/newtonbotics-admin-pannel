import { NextRequest, NextResponse } from 'next/server';
import { getBackendUrl } from '@/config/backend';

const backendUrl = getBackendUrl();

const missingAuthResponse = NextResponse.json(
  { success: false, message: 'Authorization header required' },
  { status: 401 }
);

const missingIdResponse = NextResponse.json(
  { success: false, message: 'Attendance record ID is required' },
  { status: 400 }
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
    console.error('[attendance:id] proxy error', error);
    return NextResponse.json(
      { success: false, message: defaultErrorMessage },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id?: string } }
) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader) {
    return missingAuthResponse;
  }
  const recordId = params?.id;
  if (!recordId) {
    return missingIdResponse;
  }

  const targetUrl = `${backendUrl}/api/attendance/${encodeURIComponent(recordId)}`;
  return proxyRequest(
    targetUrl,
    {
      method: 'GET',
      headers: {
        Authorization: authHeader
      }
    },
    'Failed to fetch attendance record'
  );
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id?: string } }
) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader) {
    return missingAuthResponse;
  }
  const recordId = params?.id;
  if (!recordId) {
    return missingIdResponse;
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
    `${backendUrl}/api/attendance/${encodeURIComponent(recordId)}`,
    {
      method: 'PUT',
      headers: {
        Authorization: authHeader,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    },
    'Failed to update attendance record'
  );
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id?: string } }
) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader) {
    return missingAuthResponse;
  }
  const recordId = params?.id;
  if (!recordId) {
    return missingIdResponse;
  }

  return proxyRequest(
    `${backendUrl}/api/attendance/${encodeURIComponent(recordId)}`,
    {
      method: 'DELETE',
      headers: {
        Authorization: authHeader
      }
    },
    'Failed to delete attendance record'
  );
}

