import { NextRequest, NextResponse } from 'next/server';
import { getBackendUrl } from '@/config/backend';

const backendUrl = getBackendUrl();

interface ProjectMediaUpdatePayload {
  imageUrl?: string | null;
  videoUrl?: string | null;
  githubUrl?: string | null;
  documentationUrl?: string | null;
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = request.headers.get('authorization');
    if (!token) {
      return NextResponse.json(
        { success: false, message: 'No authorization token provided' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await request.json() as ProjectMediaUpdatePayload;
    
    console.log('Updating project media with data:', body);

    // Validate that at least one field is provided
    const hasFields = Object.keys(body).some(
      key => body[key as keyof ProjectMediaUpdatePayload] !== undefined && 
             body[key as keyof ProjectMediaUpdatePayload] !== null
    );

    if (!hasFields) {
      return NextResponse.json(
        { success: false, message: 'No media fields provided for update' },
        { status: 400 }
      );
    }

    // Normalize payload - convert empty strings to null for clearing fields
    const normalized: ProjectMediaUpdatePayload = {
      imageUrl: body.imageUrl === '' ? null : (body.imageUrl || undefined),
      videoUrl: body.videoUrl === '' ? null : (body.videoUrl || undefined),
      githubUrl: body.githubUrl === '' ? null : (body.githubUrl || undefined),
      documentationUrl: body.documentationUrl === '' ? null : (body.documentationUrl || undefined),
    };

    // Remove undefined fields
    Object.keys(normalized).forEach((k) => {
      if (normalized[k as keyof ProjectMediaUpdatePayload] === undefined) {
        delete normalized[k as keyof ProjectMediaUpdatePayload];
      }
    });

    console.log('Updating project media with normalized data:', normalized);

    const response = await fetch(`${backendUrl}/api/projects/${id}/media`, {
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
      console.error('Backend failed to update project media', { status: response.status, data });
      return NextResponse.json(
        {
          success: false,
          message: data.message || data.error?.message || 'Failed to update project media',
          error: data.error,
          details: data
        },
        { status: response.status }
      );
    }
  } catch (error) {
    console.error('Error updating project media:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}



