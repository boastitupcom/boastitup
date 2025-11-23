# Integration Settings Database Setup

This directory contains the database schema and seed data for the Integration Settings feature.

## Files

- **schema.sql** - Database tables, indexes, RLS policies, and triggers
- **seed-data.sql** - Pre-configured platform definitions (8 platforms)
- **generate-key.js** - Script to generate encryption key

## Setup Instructions

### 1. Generate Encryption Key

First, generate a secure encryption key:

```bash
cd apps/web/database
node generate-key.js
```

Copy the generated key and add it to your `.env.local` file:

```env
INTEGRATION_ENCRYPTION_KEY=your_generated_key_here
```

**IMPORTANT:**
- Keep this key secret and never commit it to version control
- If you lose this key, you cannot decrypt existing credentials
- Use different keys for development, staging, and production

### 2. Run Database Migrations

Execute the schema and seed data in your Supabase database:

#### Option A: Using Supabase Dashboard

1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Copy and paste `schema.sql`
4. Click "Run"
5. Copy and paste `seed-data.sql`
6. Click "Run"

#### Option B: Using Supabase CLI

```bash
# Make sure you're in the project root
supabase db push

# Or execute SQL files directly
psql $DATABASE_URL -f apps/web/database/schema.sql
psql $DATABASE_URL -f apps/web/database/seed-data.sql
```

### 3. Verify Setup

Check that tables were created:

```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name LIKE 'integration%';
```

You should see:
- `integration_definitions`
- `tenant_integrations`
- `integration_audit_log`

Check that platforms were seeded:

```sql
SELECT platform_key, display_name, category, is_active
FROM integration_definitions
ORDER BY display_name;
```

You should see 8 platforms:
- Facebook Page
- Google Ads
- Google Analytics 4
- Google Search Console
- Instagram Business
- LinkedIn Company Page
- Meta Ads
- Twitter (X)

### 4. Test Encryption

Test that encryption is working correctly:

```bash
cd apps/web
node -e "
const { testEncryption } = require('./lib/integrations/encryption.ts');
console.log('Encryption test:', testEncryption() ? 'PASS' : 'FAIL');
"
```

## Row Level Security (RLS)

The schema includes RLS policies to ensure users can only access their own integrations:

- **SELECT**: Users can only view their own integrations
- **INSERT**: Users can only create integrations for themselves
- **UPDATE**: Users can only update their own integrations
- **DELETE**: Users can only delete their own integrations

Integration definitions are publicly readable but only admins should modify them.

## Audit Logging

All integration changes are automatically logged to `integration_audit_log`:
- Created
- Updated
- Deleted
- Test success/failure (optional)

## Troubleshooting

### "INTEGRATION_ENCRYPTION_KEY environment variable is not set"

Make sure you've added the key to `.env.local` and restarted your development server.

### "Encryption key must be 32 bytes"

The key must be exactly 64 hexadecimal characters. Use `generate-key.js` to create a valid key.

### RLS Policy Errors

If you get "new row violates row-level security policy", ensure:
1. User is authenticated
2. `tenant_id` in INSERT matches `auth.uid()`
3. RLS is enabled on the table

### Missing Platforms

If seed data didn't load, check:
1. SQL executed without errors
2. `is_active` is set to `true`
3. No duplicate `platform_key` values

## Security Notes

- Credentials are encrypted using AES-256-GCM
- Each encryption uses a unique IV (Initialization Vector)
- Auth tags ensure data integrity
- Credentials are NEVER sent to the frontend
- All database queries use parameterized statements
- RLS policies prevent unauthorized access

## Adding New Platforms

To add a new platform, insert into `integration_definitions`:

```sql
INSERT INTO integration_definitions (
  platform_key,
  display_name,
  category,
  description,
  logo_url,
  config_schema,
  is_active
) VALUES (
  'platform_key',
  'Display Name',
  'social_media', -- or 'analytics' or 'advertising'
  'Description text',
  '/logos/platform.svg',
  '{
    "auth_type": "api_key",
    "fields": [
      {
        "key": "api_key",
        "label": "API Key",
        "type": "text",
        "required": true,
        "placeholder": "Enter your API key",
        "help_text": "Found in platform settings"
      }
    ],
    "setup_instructions": [
      "Step 1",
      "Step 2"
    ]
  }'::jsonb,
  true
);
```

## Maintenance

### Backup Encryption Key

Store your encryption key in a secure location:
- Password manager
- Secrets management service (AWS Secrets Manager, HashiCorp Vault, etc.)
- Encrypted backup file

### Rotate Encryption Key

To rotate the encryption key:
1. Generate new key
2. Decrypt all credentials with old key
3. Encrypt all credentials with new key
4. Update all environment variables
5. Deploy changes

(This process requires a migration script - not included in MVP)

### Clean Up Old Integrations

Disconnected integrations remain in the database for audit purposes. To clean up:

```sql
DELETE FROM tenant_integrations
WHERE status = 'disconnected'
  AND updated_at < NOW() - INTERVAL '90 days';
```

## Next Steps

After setup:
1. Start development server: `pnpm dev`
2. Navigate to `/workspace/settings/integrations`
3. Connect a platform to test the flow
4. Check database to verify encrypted credentials
5. Test disconnect functionality
