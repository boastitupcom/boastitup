/**
 * GET /api/integrations
 * Fetch all integration definitions and user's connected integrations
 *
 * POST /api/integrations
 * Create new integration with encrypted credentials
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@boastitup/supabase/server';
import { encryptCredentials } from '@/lib/integrations/encryption';
import type {
  IntegrationsResponse,
  CreateIntegrationRequest,
  TenantIntegration,
  IntegrationDefinition
} from '@/types/integrations';

/**
 * GET /api/integrations
 * Returns all platform definitions and user's integrations
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Fetch all active integration definitions
    const { data: definitions, error: defsError } = await supabase
      .from('integration_definitions')
      .select('*')
      .eq('is_active', true)
      .order('display_name');

    if (defsError) {
      console.error('Error fetching definitions:', defsError);
      return NextResponse.json(
        { error: 'Failed to fetch platform definitions' },
        { status: 500 }
      );
    }

    // Fetch user's integrations with joined definition data
    const { data: integrations, error: integrationsError } = await supabase
      .from('tenant_integrations')
      .select(`
        *,
        definition:integration_definitions(*)
      `)
      .eq('tenant_id', user.id)
      .order('created_at', { ascending: false });

    if (integrationsError) {
      console.error('Error fetching integrations:', integrationsError);
      return NextResponse.json(
        { error: 'Failed to fetch integrations' },
        { status: 500 }
      );
    }

    // Never send encrypted credentials to frontend
    const sanitizedIntegrations = integrations?.map((integration: any) => {
      const { encrypted_credentials, ...rest } = integration;
      return rest;
    }) || [];

    const response: IntegrationsResponse = {
      definitions: definitions as IntegrationDefinition[] || [],
      integrations: sanitizedIntegrations as TenantIntegration[]
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('GET /api/integrations error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/integrations
 * Create new integration with encrypted credentials
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Parse request body
    const body: CreateIntegrationRequest = await request.json();
    const { definition_id, credentials, brand_id, settings } = body;

    // Validate required fields
    if (!definition_id || !credentials) {
      return NextResponse.json(
        { error: 'Missing required fields: definition_id, credentials' },
        { status: 400 }
      );
    }

    // Verify definition exists
    const { data: definition, error: defError } = await supabase
      .from('integration_definitions')
      .select('*')
      .eq('id', definition_id)
      .eq('is_active', true)
      .single();

    if (defError || !definition) {
      return NextResponse.json(
        { error: 'Invalid or inactive integration definition' },
        { status: 400 }
      );
    }

    // Validate required credential fields
    const configSchema = definition.config_schema as any;
    const requiredFields = configSchema.fields
      .filter((field: any) => field.required)
      .map((field: any) => field.key);

    const missingFields = requiredFields.filter(
      (field: string) => !credentials[field] || credentials[field].trim() === ''
    );

    if (missingFields.length > 0) {
      return NextResponse.json(
        { error: `Missing required credentials: ${missingFields.join(', ')}` },
        { status: 400 }
      );
    }

    // Encrypt credentials
    let encryptedCredentials: string;
    try {
      encryptedCredentials = encryptCredentials(credentials);
    } catch (error) {
      console.error('Encryption error:', error);
      return NextResponse.json(
        { error: 'Failed to encrypt credentials' },
        { status: 500 }
      );
    }

    // Check for duplicate integration
    const { data: existing } = await supabase
      .from('tenant_integrations')
      .select('id')
      .eq('tenant_id', user.id)
      .eq('definition_id', definition_id)
      .maybeSingle();

    if (existing) {
      return NextResponse.json(
        { error: 'Integration already exists for this platform. Please disconnect the existing one first.' },
        { status: 409 }
      );
    }

    // Insert integration
    const { data: integration, error: insertError } = await supabase
      .from('tenant_integrations')
      .insert({
        tenant_id: user.id,
        brand_id: brand_id || null,
        definition_id,
        encrypted_credentials: encryptedCredentials,
        status: 'active',
        settings: settings || null
      })
      .select(`
        *,
        definition:integration_definitions(*)
      `)
      .single();

    if (insertError) {
      console.error('Insert error:', insertError);
      return NextResponse.json(
        { error: 'Failed to create integration' },
        { status: 500 }
      );
    }

    // Remove encrypted credentials from response
    const { encrypted_credentials: _, ...sanitizedIntegration } = integration;

    return NextResponse.json(sanitizedIntegration, { status: 201 });

  } catch (error) {
    console.error('POST /api/integrations error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
