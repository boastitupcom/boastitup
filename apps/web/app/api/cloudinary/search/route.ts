// apps/web/app/api/cloudinary/search/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const folder = searchParams.get('folder') || 'content-spark-gallery';
    const maxResults = parseInt(searchParams.get('max_results') || '50');

    if (!query) {
      return NextResponse.json(
        { error: 'Search query is required' },
        { status: 400 }
      );
    }

    // Build search expression
    let expression = `folder:${folder}`;
    
    // Add search conditions
    const searchConditions = [
      `filename:*${query}*`,
      `tags:*${query}*`,
      `context.alt:*${query}*`,
      `context.caption:*${query}*`,
    ];
    
    expression += ` AND (${searchConditions.join(' OR ')})`;

    const result = await cloudinary.search
      .expression(expression)
      .sort_by([['created_at', 'desc']])
      .max_results(maxResults)
      .with_field('context')
      .with_field('tags')
      .execute();

    return NextResponse.json({
      images: result.resources,
      total_count: result.total_count,
    });
  } catch (error) {
    console.error('Error searching images:', error);
    return NextResponse.json(
      { error: 'Failed to search images' },
      { status: 500 }
    );
  }
}