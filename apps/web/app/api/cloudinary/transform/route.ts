// apps/web/app/api/cloudinary/transform/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

export async function POST(request: NextRequest) {
  try {
    const { public_id, transformations } = await request.json();

    if (!public_id || !transformations) {
      return NextResponse.json(
        { error: 'Public ID and transformations are required' },
        { status: 400 }
      );
    }

    // Generate transformed URL
    const transformedUrl = cloudinary.url(public_id, {
      ...transformations,
      secure: true,
    });

    return NextResponse.json({
      url: transformedUrl,
      public_id,
      transformations,
    });
  } catch (error) {
    console.error('Error generating transformation:', error);
    return NextResponse.json(
      { error: 'Failed to generate transformation' },
      { status: 500 }
    );
  }
}