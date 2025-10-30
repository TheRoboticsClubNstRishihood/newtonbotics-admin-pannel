import { NextRequest, NextResponse } from 'next/server';
import { getBackendUrl } from '@/config/backend';

const backendUrl = getBackendUrl();

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; memberId: string }> }
) {
  try {
    const token = request.headers.get('authorization');
    if (!token) {
      return NextResponse.json({ success: false, message: 'No authorization token provided' }, { status: 401 });
    }

    const { id, memberId } = await params;
    const url = `${backendUrl}/api/projects/${id}/members/${memberId}`;

    console.log('Removing team member:', url);

    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Authorization': token,
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();

    if (response.ok) {
      return NextResponse.json(data);
    } else {
      return NextResponse.json(
        { success: false, message: data.message || 'Failed to remove team member' },
        { status: response.status }
      );
    }
  } catch (error) {
    console.error('Error removing team member:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; memberId: string }> }
) {
  try {
    const token = request.headers.get('authorization');
    if (!token) {
      return NextResponse.json({ success: false, message: 'No authorization token provided' }, { status: 401 });
    }

    const { id, memberId } = await params;
    const body = await request.json();
    const url = `${backendUrl}/api/projects/${id}/members/${memberId}`;

    console.log('Updating team member:', url, body);

    let response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Authorization': token,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });

    let data = await response.json();

    // Fallback 1: try PATCH on the same endpoint
    if (response.status === 404 || response.status === 405) {
      const patchResp = await fetch(url, {
        method: 'PATCH',
        headers: {
          'Authorization': token,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      });
      if (patchResp.ok) {
        try { data = await patchResp.json(); } catch { data = {}; }
        return NextResponse.json(data);
      }
    }

    // Fallback 2: some backends update by userId via collection endpoint
    if (response.status === 404) {
      const fallbackBody = { userId: memberId, ...(body || {}) };
      const fallbackUrl = `${backendUrl}/api/projects/${id}/members`;
      console.warn('Primary member update returned 404. Retrying via collection endpoint with userId...', { url: fallbackUrl, body: fallbackBody });
      response = await fetch(fallbackUrl, {
        method: 'PUT',
        headers: {
          'Authorization': token,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(fallbackBody)
      });
      try { data = await response.json(); } catch { data = {}; }

      // Fallback 3: try PATCH collection endpoint
      if (!response.ok) {
        const patchColl = await fetch(fallbackUrl, {
          method: 'PATCH',
          headers: {
            'Authorization': token,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(fallbackBody)
        });
        if (patchColl.ok) {
          try { data = await patchColl.json(); } catch { data = {}; }
          return NextResponse.json(data);
        }
        try { data = await patchColl.json(); } catch {}
        return NextResponse.json(
          { success: false, message: data?.message || 'Failed to update team member' },
          { status: patchColl.status }
        );
      }
    }

    if (response.ok) {
      return NextResponse.json(data);
    } else {
      return NextResponse.json(
        { success: false, message: data.message || 'Failed to update team member' },
        { status: response.status }
      );
    }
  } catch (error) {
    console.error('Error updating team member:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
