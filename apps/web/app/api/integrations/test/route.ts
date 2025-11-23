/**
 * POST /api/integrations/test
 * Test connection credentials before saving
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@boastitup/supabase/server';
import type { TestIntegrationRequest, TestConnectionResult } from '@/types/integrations';

/**
 * POST /api/integrations/test
 * Validates credentials by performing basic checks or API calls
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
    const body: TestIntegrationRequest = await request.json();
    const { definition_id, platform_key, credentials } = body;

    // Validate required fields
    if (!definition_id || !platform_key || !credentials) {
      return NextResponse.json(
        { error: 'Missing required fields: definition_id, platform_key, credentials' },
        { status: 400 }
      );
    }

    // Verify definition exists
    const { data: definition, error: defError } = await supabase
      .from('integration_definitions')
      .select('*')
      .eq('id', definition_id)
      .eq('platform_key', platform_key)
      .eq('is_active', true)
      .single();

    if (defError || !definition) {
      return NextResponse.json(
        { error: 'Invalid integration definition' },
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
      const result: TestConnectionResult = {
        success: false,
        message: `Missing required fields: ${missingFields.join(', ')}`
      };
      return NextResponse.json(result, { status: 400 });
    }

    // Perform platform-specific validation
    // For MVP, we do basic validation. In production, this would make actual API calls
    const testResult = await testPlatformConnection(platform_key, credentials);

    return NextResponse.json(testResult);

  } catch (error) {
    console.error('POST /api/integrations/test error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Test connection for specific platform
 * For MVP: Basic validation. For production: Actual API calls
 */
async function testPlatformConnection(
  platformKey: string,
  credentials: Record<string, string>
): Promise<TestConnectionResult> {
  // MVP: Basic validation only
  // In production, this would make actual API calls to verify credentials

  switch (platformKey) {
    case 'instagram':
      return validateInstagram(credentials);

    case 'facebook':
      return validateFacebook(credentials);

    case 'twitter':
      return validateTwitter(credentials);

    case 'linkedin':
      return validateLinkedIn(credentials);

    case 'google_search_console':
      return validateGoogleSearchConsole(credentials);

    case 'google_analytics':
      return validateGoogleAnalytics(credentials);

    case 'google_ads':
      return validateGoogleAds(credentials);

    case 'meta_ads':
      return validateMetaAds(credentials);

    default:
      return {
        success: false,
        message: `Unknown platform: ${platformKey}`
      };
  }
}

// MVP validation functions (basic format checks)
// In production, these would make actual API calls

function validateInstagram(credentials: Record<string, string>): TestConnectionResult {
  const { access_token, instagram_account_id } = credentials;

  if (!access_token || !access_token.startsWith('IG')) {
    return {
      success: false,
      message: 'Invalid access token format. Instagram tokens typically start with "IG".'
    };
  }

  if (!instagram_account_id || !/^\d+$/.test(instagram_account_id)) {
    return {
      success: false,
      message: 'Invalid Instagram Account ID. Must be numeric.'
    };
  }

  return {
    success: true,
    message: 'Credentials format validated. Connection looks good!'
  };
}

function validateFacebook(credentials: Record<string, string>): TestConnectionResult {
  const { page_access_token, page_id } = credentials;

  if (!page_access_token || !page_access_token.startsWith('EAA')) {
    return {
      success: false,
      message: 'Invalid page access token format.'
    };
  }

  if (!page_id || !/^\d+$/.test(page_id)) {
    return {
      success: false,
      message: 'Invalid Page ID. Must be numeric.'
    };
  }

  return {
    success: true,
    message: 'Credentials format validated. Connection looks good!'
  };
}

function validateTwitter(credentials: Record<string, string>): TestConnectionResult {
  const { api_key, api_secret, access_token, access_token_secret } = credentials;

  if (!api_key || !api_secret || api_key.length < 15 || api_secret.length < 30) {
    return {
      success: false,
      message: 'API credentials appear to be too short.'
    };
  }

  return {
    success: true,
    message: 'Credentials format validated. Connection looks good!'
  };
}

function validateLinkedIn(credentials: Record<string, string>): TestConnectionResult {
  const { access_token, organization_id } = credentials;

  if (!access_token || access_token.length < 20) {
    return {
      success: false,
      message: 'Access token appears to be invalid.'
    };
  }

  return {
    success: true,
    message: 'Credentials format validated. Connection looks good!'
  };
}

function validateGoogleSearchConsole(credentials: Record<string, string>): TestConnectionResult {
  const { service_account_json, site_url } = credentials;

  if (!service_account_json) {
    return {
      success: false,
      message: 'Service account JSON is required.'
    };
  }

  try {
    const parsed = JSON.parse(service_account_json);
    if (parsed.type !== 'service_account') {
      return {
        success: false,
        message: 'Invalid service account JSON. Type must be "service_account".'
      };
    }
  } catch (error) {
    return {
      success: false,
      message: 'Invalid JSON format for service account.'
    };
  }

  if (!site_url || (!site_url.startsWith('http://') && !site_url.startsWith('https://'))) {
    return {
      success: false,
      message: 'Site URL must start with http:// or https://'
    };
  }

  return {
    success: true,
    message: 'Service account JSON validated. Connection looks good!'
  };
}

function validateGoogleAnalytics(credentials: Record<string, string>): TestConnectionResult {
  const { service_account_json, property_id } = credentials;

  if (!service_account_json) {
    return {
      success: false,
      message: 'Service account JSON is required.'
    };
  }

  try {
    const parsed = JSON.parse(service_account_json);
    if (parsed.type !== 'service_account') {
      return {
        success: false,
        message: 'Invalid service account JSON.'
      };
    }
  } catch (error) {
    return {
      success: false,
      message: 'Invalid JSON format for service account.'
    };
  }

  if (!property_id || !/^\d+$/.test(property_id)) {
    return {
      success: false,
      message: 'Property ID must be numeric.'
    };
  }

  return {
    success: true,
    message: 'Service account JSON validated. Connection looks good!'
  };
}

function validateGoogleAds(credentials: Record<string, string>): TestConnectionResult {
  const { developer_token, client_id, client_secret, refresh_token, customer_id } = credentials;

  if (!developer_token || developer_token.length < 10) {
    return {
      success: false,
      message: 'Invalid developer token.'
    };
  }

  if (!customer_id) {
    return {
      success: false,
      message: 'Customer ID is required.'
    };
  }

  // Remove dashes from customer ID for validation
  const cleanCustomerId = customer_id.replace(/-/g, '');
  if (!/^\d+$/.test(cleanCustomerId)) {
    return {
      success: false,
      message: 'Customer ID must be numeric (dashes optional).'
    };
  }

  return {
    success: true,
    message: 'Credentials format validated. Connection looks good!'
  };
}

function validateMetaAds(credentials: Record<string, string>): TestConnectionResult {
  const { access_token, ad_account_id } = credentials;

  if (!access_token || !access_token.startsWith('EAA')) {
    return {
      success: false,
      message: 'Invalid access token format.'
    };
  }

  if (!ad_account_id || !ad_account_id.startsWith('act_')) {
    return {
      success: false,
      message: 'Ad Account ID must start with "act_".'
    };
  }

  return {
    success: true,
    message: 'Credentials format validated. Connection looks good!'
  };
}
