import { NextRequest, NextResponse } from 'next/server';
import { getBackendUrl } from '@/config/backend';

const backendUrl = getBackendUrl();

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = request.headers.get('authorization');
    if (!token) {
      return NextResponse.json({ success: false, message: 'Authorization header required' }, { status: 401 });
    }
    const { id } = await params;
    const body = await request.json();
    const response = await fetch(`${backendUrl}/api/media/categories/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': token,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });
    const data = await response.json();
    if (response.ok) {
      return NextResponse.json(data);
    }
    return NextResponse.json(
      { success: false, message: data.message || 'Failed to update category' },
      { status: response.status }
    );
  } catch (error) {
    console.error('Error updating category:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = request.headers.get('authorization');
    if (!token) {
      return NextResponse.json({ success: false, message: 'Authorization header required' }, { status: 401 });
    }
    const { id } = await params;
    const response = await fetch(`${backendUrl}/api/media/categories/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': token,
        'Content-Type': 'application/json'
      }
    });
    const data = await response.json();
    if (response.ok) {
      return NextResponse.json(data);
    }
    return NextResponse.json(
      { success: false, message: data.message || 'Failed to delete category' },
      { status: response.status }
    );
  } catch (error) {
    console.error('Error deleting category:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}


