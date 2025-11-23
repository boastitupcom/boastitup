-- Seed Data for Integration Definitions
-- Pre-configured platform definitions for 8 integrations

-- Clear existing data (for development only)
-- TRUNCATE integration_definitions CASCADE;

-- ============================================================================
-- 1. Instagram Business
-- ============================================================================
INSERT INTO integration_definitions (
  platform_key,
  display_name,
  category,
  description,
  logo_url,
  config_schema,
  is_active
) VALUES (
  'instagram',
  'Instagram Business',
  'social_media',
  'Connect your Instagram Business account to track posts, stories, and engagement metrics.',
  '/logos/instagram.svg',
  '{
    "auth_type": "api_key",
    "fields": [
      {
        "key": "access_token",
        "label": "Access Token",
        "type": "password",
        "required": true,
        "placeholder": "IGQVJXa1...",
        "help_text": "Get your access token from Meta Developer Console"
      },
      {
        "key": "instagram_account_id",
        "label": "Instagram Account ID",
        "type": "text",
        "required": true,
        "placeholder": "17841405793187218",
        "help_text": "Your Instagram Business Account ID"
      }
    ],
    "setup_instructions": [
      "Go to Meta Developer Console (developers.facebook.com)",
      "Create a new app or select existing app",
      "Add Instagram Basic Display product",
      "Generate User Access Token with instagram_basic scope",
      "Get your Instagram Account ID from Graph API Explorer"
    ]
  }'::jsonb,
  true
);

-- ============================================================================
-- 2. Facebook Page
-- ============================================================================
INSERT INTO integration_definitions (
  platform_key,
  display_name,
  category,
  description,
  logo_url,
  config_schema,
  is_active
) VALUES (
  'facebook',
  'Facebook Page',
  'social_media',
  'Connect your Facebook Page to analyze posts, engagement, and audience insights.',
  '/logos/facebook.svg',
  '{
    "auth_type": "api_key",
    "fields": [
      {
        "key": "page_access_token",
        "label": "Page Access Token",
        "type": "password",
        "required": true,
        "placeholder": "EAAGm0PX...",
        "help_text": "Long-lived page access token from Meta"
      },
      {
        "key": "page_id",
        "label": "Facebook Page ID",
        "type": "text",
        "required": true,
        "placeholder": "102354123456789",
        "help_text": "Your Facebook Page ID"
      }
    ],
    "setup_instructions": [
      "Go to Meta Developer Console",
      "Create app and add Facebook Login",
      "Use Graph API Explorer to get Page Access Token",
      "Select your page and required permissions",
      "Generate long-lived token (60 days)"
    ]
  }'::jsonb,
  true
);

-- ============================================================================
-- 3. Twitter (X)
-- ============================================================================
INSERT INTO integration_definitions (
  platform_key,
  display_name,
  category,
  description,
  logo_url,
  config_schema,
  is_active
) VALUES (
  'twitter',
  'Twitter (X)',
  'social_media',
  'Connect your Twitter/X account to track tweets, mentions, and engagement.',
  '/logos/twitter.svg',
  '{
    "auth_type": "api_key",
    "fields": [
      {
        "key": "api_key",
        "label": "API Key",
        "type": "text",
        "required": true,
        "placeholder": "xxxxxxxxxxxxxxxxxxx",
        "help_text": "Consumer Key from Twitter Developer Portal"
      },
      {
        "key": "api_secret",
        "label": "API Secret",
        "type": "password",
        "required": true,
        "placeholder": "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
        "help_text": "Consumer Secret from Twitter Developer Portal"
      },
      {
        "key": "access_token",
        "label": "Access Token",
        "type": "password",
        "required": true,
        "help_text": "OAuth Access Token"
      },
      {
        "key": "access_token_secret",
        "label": "Access Token Secret",
        "type": "password",
        "required": true,
        "help_text": "OAuth Access Token Secret"
      }
    ],
    "setup_instructions": [
      "Go to Twitter Developer Portal (developer.twitter.com)",
      "Create a new project and app",
      "Generate API keys and tokens",
      "Copy API Key, API Secret, Access Token, and Access Token Secret",
      "Ensure your app has read permissions"
    ]
  }'::jsonb,
  true
);

-- ============================================================================
-- 4. LinkedIn Company Page
-- ============================================================================
INSERT INTO integration_definitions (
  platform_key,
  display_name,
  category,
  description,
  logo_url,
  config_schema,
  is_active
) VALUES (
  'linkedin',
  'LinkedIn Company Page',
  'social_media',
  'Connect your LinkedIn Company Page to track posts and follower insights.',
  '/logos/linkedin.svg',
  '{
    "auth_type": "oauth",
    "fields": [
      {
        "key": "access_token",
        "label": "Access Token",
        "type": "password",
        "required": true,
        "placeholder": "AQV...",
        "help_text": "OAuth 2.0 Access Token from LinkedIn"
      },
      {
        "key": "organization_id",
        "label": "Organization ID",
        "type": "text",
        "required": true,
        "placeholder": "12345678",
        "help_text": "Your LinkedIn Organization/Company ID"
      }
    ],
    "setup_instructions": [
      "Go to LinkedIn Developers (developer.linkedin.com)",
      "Create a new app",
      "Add required scopes: r_organization_social, w_organization_social",
      "Complete OAuth 2.0 flow to get access token",
      "Find your Organization ID in LinkedIn Company Page settings"
    ]
  }'::jsonb,
  true
);

-- ============================================================================
-- 5. Google Search Console
-- ============================================================================
INSERT INTO integration_definitions (
  platform_key,
  display_name,
  category,
  description,
  logo_url,
  config_schema,
  is_active
) VALUES (
  'google_search_console',
  'Google Search Console',
  'analytics',
  'Track your website search performance, keywords, and indexing status.',
  '/logos/google-search-console.svg',
  '{
    "auth_type": "service_account",
    "fields": [
      {
        "key": "service_account_json",
        "label": "Service Account JSON",
        "type": "textarea",
        "required": true,
        "placeholder": "{\n  \"type\": \"service_account\",\n  ...\n}",
        "help_text": "Paste entire JSON key file content"
      },
      {
        "key": "site_url",
        "label": "Site URL",
        "type": "url",
        "required": true,
        "placeholder": "https://www.example.com",
        "help_text": "Your verified website URL in Search Console"
      }
    ],
    "setup_instructions": [
      "Go to Google Cloud Console",
      "Create a new service account",
      "Download JSON key file",
      "Add service account email to Search Console users",
      "Paste JSON content into the field above"
    ]
  }'::jsonb,
  true
);

-- ============================================================================
-- 6. Google Analytics 4
-- ============================================================================
INSERT INTO integration_definitions (
  platform_key,
  display_name,
  category,
  description,
  logo_url,
  config_schema,
  is_active
) VALUES (
  'google_analytics',
  'Google Analytics 4',
  'analytics',
  'Connect Google Analytics 4 to track website traffic and user behavior.',
  '/logos/google-analytics.svg',
  '{
    "auth_type": "service_account",
    "fields": [
      {
        "key": "service_account_json",
        "label": "Service Account JSON",
        "type": "textarea",
        "required": true,
        "placeholder": "{\n  \"type\": \"service_account\",\n  ...\n}",
        "help_text": "Paste entire JSON key file content"
      },
      {
        "key": "property_id",
        "label": "GA4 Property ID",
        "type": "text",
        "required": true,
        "placeholder": "123456789",
        "help_text": "Your GA4 Property ID (found in Admin settings)"
      }
    ],
    "setup_instructions": [
      "Go to Google Cloud Console",
      "Create a new service account with Analytics Viewer role",
      "Download JSON key file",
      "Add service account email to GA4 property users",
      "Paste JSON content into the field above"
    ]
  }'::jsonb,
  true
);

-- ============================================================================
-- 7. Google Ads
-- ============================================================================
INSERT INTO integration_definitions (
  platform_key,
  display_name,
  category,
  description,
  logo_url,
  config_schema,
  is_active
) VALUES (
  'google_ads',
  'Google Ads',
  'advertising',
  'Connect Google Ads to track campaign performance and ad spend.',
  '/logos/google-ads.svg',
  '{
    "auth_type": "api_key",
    "fields": [
      {
        "key": "developer_token",
        "label": "Developer Token",
        "type": "password",
        "required": true,
        "help_text": "Your Google Ads API developer token"
      },
      {
        "key": "client_id",
        "label": "OAuth Client ID",
        "type": "text",
        "required": true,
        "help_text": "OAuth 2.0 Client ID from Google Cloud"
      },
      {
        "key": "client_secret",
        "label": "OAuth Client Secret",
        "type": "password",
        "required": true,
        "help_text": "OAuth 2.0 Client Secret"
      },
      {
        "key": "refresh_token",
        "label": "Refresh Token",
        "type": "password",
        "required": true,
        "help_text": "OAuth 2.0 Refresh Token"
      },
      {
        "key": "customer_id",
        "label": "Customer ID",
        "type": "text",
        "required": true,
        "placeholder": "123-456-7890",
        "help_text": "Your Google Ads Customer ID (without dashes)"
      }
    ],
    "setup_instructions": [
      "Apply for Google Ads API access",
      "Create OAuth 2.0 credentials in Google Cloud Console",
      "Complete OAuth flow to get refresh token",
      "Find your Customer ID in Google Ads account",
      "Enter all credentials above"
    ]
  }'::jsonb,
  true
);

-- ============================================================================
-- 8. Meta Ads (Facebook Ads)
-- ============================================================================
INSERT INTO integration_definitions (
  platform_key,
  display_name,
  category,
  description,
  logo_url,
  config_schema,
  is_active
) VALUES (
  'meta_ads',
  'Meta Ads',
  'advertising',
  'Connect Meta Ads Manager to track Facebook and Instagram ad campaigns.',
  '/logos/meta.svg',
  '{
    "auth_type": "api_key",
    "fields": [
      {
        "key": "access_token",
        "label": "Access Token",
        "type": "password",
        "required": true,
        "placeholder": "EAAGm0PX...",
        "help_text": "Long-lived user access token with ads_read permission"
      },
      {
        "key": "ad_account_id",
        "label": "Ad Account ID",
        "type": "text",
        "required": true,
        "placeholder": "act_123456789",
        "help_text": "Your Meta Ad Account ID (with act_ prefix)"
      }
    ],
    "setup_instructions": [
      "Go to Meta Developer Console",
      "Create app and add Marketing API",
      "Use Graph API Explorer to generate access token",
      "Request ads_read and ads_management permissions",
      "Find your Ad Account ID in Ads Manager settings"
    ]
  }'::jsonb,
  true
);

-- ============================================================================
-- Verification Query
-- ============================================================================
-- Run this to verify all platforms were inserted correctly:
-- SELECT platform_key, display_name, category, is_active FROM integration_definitions ORDER BY display_name;
