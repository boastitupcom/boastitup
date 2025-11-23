/**
 * DELETE /api/integrations/[id]
 * Delete (disconnect) an integration
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@boastitup/supabase/server';

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

/**
 * DELETE /api/integrations/[id]
 * Disconnects an integration (RLS ensures user owns it)
 */
export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      return NextResponse.json(
        { error: 'Invalid integration ID format' },
        { status: 400 }
      );
    }

    // Delete integration (RLS policy ensures user owns it)
    const { error: deleteError, count } = await supabase
      .from('tenant_integrations')
      .delete()
      .eq('id', id)
      .eq('tenant_id', user.id); // Extra safety check

    if (deleteError) {
      console.error('Delete error:', deleteError);
      return NextResponse.json(
        { error: 'Failed to delete integration' },
        { status: 500 }
      );
    }

    // Check if row was actually deleted
    if (count === 0) {
      return NextResponse.json(
        { error: 'Integration not found or access denied' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: 'Integration disconnected successfully' },
      { status: 200 }
    );

  } catch (error) {
    console.error('DELETE /api/integrations/[id] error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
