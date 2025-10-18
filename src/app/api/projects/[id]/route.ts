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
    const url = `${backendUrl}/api/projects/${id}`;

    console.log('Fetching project details from:', url);

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
        { success: false, message: data.message || 'Failed to fetch project details' },
        { status: response.status }
      );
    }
  } catch (error) {
    console.error('Error fetching project details:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
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
    console.log('Updating project with data (incoming):', body);

    // Normalize payload to satisfy backend schema
    const normalized: any = {
      title: body.title,
      description: body.description,
      category: body.category,
      status: body.status,
      startDate: body.startDate || undefined,
      endDate: body.endDate || undefined,
      budget: typeof body.budget === 'number' ? body.budget : (body.budget ? Number(body.budget) : undefined),
      mentorId: typeof body.mentorId === 'string' ? body.mentorId : body.mentorId?.id || body.mentor?.id,
      teamLeaderId: typeof body.teamLeaderId === 'string' ? body.teamLeaderId : body.teamLeaderId?.id || body.teamLeader?.id,
      imageUrl: body.imageUrl || undefined,
      videoUrl: body.videoUrl || undefined,
      githubUrl: body.githubUrl || undefined,
      documentationUrl: body.documentationUrl || undefined,
      achievements: Array.isArray(body.achievements) ? body.achievements : (typeof body.achievements === 'string' && body.achievements ? body.achievements.split('\n').filter((s: string) => s.trim()) : undefined),
      tags: Array.isArray(body.tags) ? body.tags : (typeof body.tags === 'string' && body.tags ? body.tags.split(',').map((t: string) => t.trim()) : undefined),
      priority: body.priority,
      difficulty: body.difficulty,
      estimatedHours: typeof body.estimatedHours === 'number' ? body.estimatedHours : (body.estimatedHours ? Number(body.estimatedHours) : undefined),
      isPublic: typeof body.isPublic === 'boolean' ? body.isPublic : undefined,
      isFeatured: typeof body.isFeatured === 'boolean' ? body.isFeatured : undefined
    };
    Object.keys(normalized).forEach((k) => normalized[k] === undefined && delete normalized[k]);
    console.log('Updating project with data (normalized):', normalized);

    const response = await fetch(`${backendUrl}/api/projects/${id}`, {
      method: 'PUT',
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
      console.error('Backend failed to update project', { status: response.status, data });
      return NextResponse.json(
        { success: false, message: data.message || data.error || 'Failed to update project', details: data },
        { status: response.status }
      );
    }
  } catch (error) {
    console.error('Error updating project:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = request.headers.get('authorization');
    if (!token) {
      return NextResponse.json({ success: false, message: 'No authorization token provided' }, { status: 401 });
    }

    const { id } = await params;
    const url = `${backendUrl}/api/projects/${id}`;

    console.log('Deleting project:', url);

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
        { success: false, message: data.message || 'Failed to delete project' },
        { status: response.status }
      );
    }
  } catch (error) {
    console.error('Error deleting project:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
