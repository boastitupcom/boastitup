// apps/web/app/api/cloudinary/images/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const folder = searchParams.get('folder') || 'content-spark-gallery';
    const maxResults = parseInt(searchParams.get('max_results') || '50');
    const nextCursor = searchParams.get('next_cursor');
    const tags = searchParams.get('tags')?.split(',').filter(Boolean);

    // Build search expression
    let expression = `folder:${folder}`;
    if (tags && tags.length > 0) {
      expression += ` AND tags:(${tags.join(' OR ')})`;
    }

    const result = await cloudinary.search
      .expression(expression)
      .sort_by([['created_at', 'desc']])
      .max_results(maxResults)
      .next_cursor(nextCursor)
      .with_field('context')
      .with_field('tags')
      .execute();

    return NextResponse.json({
      images: result.resources,
      next_cursor: result.next_cursor,
      total_count: result.total_count,
    });
  } catch (error) {
    console.error('Error fetching images:', error);
    return NextResponse.json(
      { error: 'Failed to fetch images' },
      { status: 500 }
    );
  }
}

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

// apps/web/app/api/cloudinary/delete/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

export async function DELETE(request: NextRequest) {
  try {
    const { public_id } = await request.json();

    if (!public_id) {
      return NextResponse.json(
        { error: 'Public ID is required' },
        { status: 400 }
      );
    }

    const result = await cloudinary.uploader.destroy(public_id);

    if (result.result === 'ok') {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json(
        { error: 'Failed to delete image' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Error deleting image:', error);
    return NextResponse.json(
      { error: 'Failed to delete image' },
      { status: 500 }
    );
  }
}

// apps/web/app/api/cloudinary/upload/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const folder = formData.get('folder') as string || 'content-spark-gallery';
    const tags = formData.get('tags') as string;
    const context = formData.get('context') as string;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload to Cloudinary
    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          resource_type: 'auto',
          folder: folder,
          tags: tags ? tags.split(',') : undefined,
          context: context ? context : undefined,
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      ).end(buffer);
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error uploading image:', error);
    return NextResponse.json(
      { error: 'Failed to upload image' },
      { status: 500 }
    );
  }
}

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

// apps/web/app/api/cloudinary/metadata/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const publicId = searchParams.get('public_id');

    if (!publicId) {
      return NextResponse.json(
        { error: 'Public ID is required' },
        { status: 400 }
      );
    }

    const result = await cloudinary.api.resource(publicId, {
      image_metadata: true,
      colors: true,
      faces: true,
      quality_analysis: true,
      accessibility_analysis: true,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching metadata:', error);
    return NextResponse.json(
      { error: 'Failed to fetch metadata' },
      { status: 500 }
    );
  }
}

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

// apps/web/app/api/cloudinary/folders/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

export async function GET() {
  try {
    const result = await cloudinary.api.root_folders();
    
    return NextResponse.json({
      folders: result.folders,
    });
  } catch (error) {
    console.error('Error fetching folders:', error);
    return NextResponse.json(
      { error: 'Failed to fetch folders' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { folder_name } = await request.json();

    if (!folder_name) {
      return NextResponse.json(
        { error: 'Folder name is required' },
        { status: 400 }
      );
    }

    const result = await cloudinary.api.create_folder(folder_name);
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error creating folder:', error);
    return NextResponse.json(
      { error: 'Failed to create folder' },
      { status: 500 }
    );
  }
}