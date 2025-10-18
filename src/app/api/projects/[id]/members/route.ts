import { NextRequest, NextResponse } from 'next/server';
import { getBackendUrl } from '@/config/backend';

const backendUrl = getBackendUrl();

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = request.headers.get('authorization');
    if (!token) {
      return NextResponse.json({ success: false, message: 'No authorization token provided' }, { status: 401 });
    }

    const { id } = await params;
    const url = `${backendUrl}/api/projects/${id}/members`;

    console.log('Fetching project members from:', url);

    const response = await fetch(url, {
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
        { success: false, message: data.message || 'Failed to fetch project members' },
        { status: response.status }
      );
    }
  } catch (error) {
    console.error('Error fetching project members:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = request.headers.get('authorization');
    if (!token) {
      return NextResponse.json({ success: false, message: 'No authorization token provided' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    console.log('Adding team member with data (incoming):', body);

    // Normalize payload to match backend expectations
    const normalized: any = {
      userId: body.userId || body.memberId,
      memberId: body.memberId || body.userId, // send both just in case backend expects memberId
      role: body.role,
      skills: Array.isArray(body.skills) ? body.skills : (typeof body.skills === 'string' && body.skills ? body.skills.split(',').map((s: string) => s.trim()) : undefined),
      responsibilities: Array.isArray(body.responsibilities) ? body.responsibilities : (typeof body.responsibilities === 'string' && body.responsibilities ? body.responsibilities.split(',').map((r: string) => r.trim()) : undefined),
      timeCommitment: body.timeCommitment && typeof body.timeCommitment.hoursPerWeek !== 'undefined' ? { hoursPerWeek: Number(body.timeCommitment.hoursPerWeek) } : undefined,
      hoursPerWeek: typeof body.hoursPerWeek !== 'undefined' ? Number(body.hoursPerWeek) : (body.timeCommitment?.hoursPerWeek != null ? Number(body.timeCommitment.hoursPerWeek) : undefined),
      contribution: body.contribution || undefined
    };
    // Remove undefined keys
    Object.keys(normalized).forEach((k) => normalized[k] === undefined && delete normalized[k]);
    console.log('Adding team member with data (normalized):', normalized);

    const response = await fetch(`${backendUrl}/api/projects/${id}/members`, {
      method: 'POST',
      headers: {
        'Authorization': token,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(normalized)
    });

    const data = await response.json();

    if (response.ok) {
      return NextResponse.json(data);
    } else {
      console.error('Backend failed to add team member', { status: response.status, data });
      const message = (data && (data.message || data.error?.message || data.error)) || 'Failed to add team member';
      return NextResponse.json(
        { success: false, message, details: data },
        { status: response.status }
      );
    }
  } catch (error) {
    console.error('Error adding team member:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
