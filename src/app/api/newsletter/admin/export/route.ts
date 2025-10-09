import { NextRequest, NextResponse } from 'next/server';

const backendUrl = process.env.BACKEND_URL || 'https://newton-botics-servers-chi.vercel.app';

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('authorization');
    if (!token) {
      return NextResponse.json({ success: false, message: 'No authorization token provided' }, { status: 401 });
    }

    const body = await request.json();
    console.log('Export newsletter subscriptions:', `${backendUrl}/api/newsletter/admin/export`);
    console.log('Request body:', JSON.stringify(body, null, 2));

    const response = await fetch(`${backendUrl}/api/newsletter/admin/export`, {
      method: 'POST',
      headers: {
        'Authorization': token,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });

    if (response.ok) {
      // Handle file download response
      const contentType = response.headers.get('content-type');
      const contentDisposition = response.headers.get('content-disposition');
      
      if (contentType?.includes('application/json')) {
        const data = await response.json();
        return NextResponse.json(data);
      } else {
        // Handle file download
        const buffer = await response.arrayBuffer();
        const filename = contentDisposition?.match(/filename="(.+)"/)?.[1] || 'newsletter-subscriptions.csv';
        
        return new NextResponse(buffer, {
          headers: {
            'Content-Type': contentType || 'application/octet-stream',
            'Content-Disposition': `attachment; filename="${filename}"`
          }
        });
      }
    } else {
      const data = await response.json();
      return NextResponse.json(
        { success: false, message: data.message || data.error?.message || 'Failed to export subscriptions' },
        { status: response.status }
      );
    }
  } catch (error) {
    console.error('Error exporting newsletter subscriptions:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
