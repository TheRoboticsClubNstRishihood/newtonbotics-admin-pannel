import { NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { publicId, resourceType = 'image' } = body;

    console.log('Cloudinary delete request:', { publicId, resourceType });

    if (!publicId) {
      console.error('Cloudinary delete failed: No public ID provided');
      return NextResponse.json({ error: 'Public ID is required' }, { status: 400 });
    }

    // Configure Cloudinary with environment variables
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    console.log('Cloudinary config check:', {
      cloudName: cloudName ? 'present' : 'missing',
      apiKey: apiKey ? 'present' : 'missing',
      apiSecret: apiSecret ? 'present' : 'missing'
    });

    if (!cloudName || !apiKey || !apiSecret) {
      console.error('Cloudinary credentials not properly configured');
      return NextResponse.json({ 
        error: 'Cloudinary credentials not properly configured',
        details: `Missing: ${!cloudName ? 'cloudName' : ''} ${!apiKey ? 'apiKey' : ''} ${!apiSecret ? 'apiSecret' : ''}`.trim()
      }, { status: 500 });
    }

    // Configure Cloudinary
    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret
    });

    // Delete from Cloudinary
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
      invalidate: true // Invalidate CDN cache
    });

    console.log('Cloudinary destroy result:', result);

    if (result.result === 'ok') {
      return NextResponse.json({ 
        success: true, 
        message: 'File deleted from Cloudinary successfully',
        result 
      });
    } else if (result.result === 'not found') {
      return NextResponse.json({ 
        success: true, 
        message: 'File not found in Cloudinary (may have been already deleted)',
        result 
      });
    } else {
      return NextResponse.json({ 
        error: 'Failed to delete file from Cloudinary',
        result 
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    return NextResponse.json({ 
      error: 'Failed to delete file from Cloudinary',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
