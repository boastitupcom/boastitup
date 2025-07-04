// apps/web/app/api/cloudinary/tags/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const folder = searchParams.get('folder') || 'content-spark-gallery';

    const result = await cloudinary.api.resources({
      type: 'upload',
      prefix: folder,
      max_results: 500,
    });

    // Extract all unique tags
    const allTags = new Set<string>();
    result.resources.forEach((resource: any) => {
      if (resource.tags) {
        resource.tags.forEach((tag: string) => allTags.add(tag));
      }
    });

    return NextResponse.json({
      tags: Array.from(allTags).sort(),
    });
  } catch (error) {
    console.error('Error fetching tags:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tags' },
      { status: 500 }
    );
  }
}