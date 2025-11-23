# Integration Settings - Implementation Guide

This document provides a complete overview of the Integration Settings feature implementation.

## 📋 Feature Overview

The Integration Settings feature allows users to:
- View all available integration platforms (8 pre-configured)
- Connect platforms by entering credentials via dynamic forms
- Test connections before saving
- View connected integrations with status indicators
- Disconnect integrations with confirmation

**Target Platforms:** Desktop (1280px+) and Tablet (768px-1279px)

## 🏗️ Architecture

### File Structure

```
apps/web/
├── app/
│   ├── api/
│   │   └── integrations/
│   │       ├── route.ts                    # GET (list), POST (create)
│   │       ├── [id]/
│   │       │   └── route.ts                # DELETE (disconnect)
│   │       └── test/
│   │           └── route.ts                # POST (test connection)
│   └── workspace/
│       └── settings/
│           └── integrations/
│               ├── page.tsx                # Main list page
│               └── add/
│                   └── page.tsx            # Add integration form
├── components/
│   └── integrations/
│       ├── StatusBadge.tsx                 # Status indicator
│       ├── IntegrationCard.tsx             # Connected integration card
│       ├── PlatformCard.tsx                # Available platform card
│       └── DynamicFormField.tsx            # Form field renderer
├── lib/
│   └── integrations/
│       └── encryption.ts                   # AES-256-GCM encryption utilities
├── types/
│   └── integrations.ts                     # TypeScript definitions
└── database/
    ├── schema.sql                          # Database tables & policies
    ├── seed-data.sql                       # 8 platform configurations
    ├── generate-key.js                     # Encryption key generator
    └── README.md                           # Setup instructions
```

## 🗄️ Database Schema

### Tables

**integration_definitions**
- Stores platform templates (Instagram, Facebook, etc.)
- Contains JSON config schema for dynamic forms
- Public read access (no RLS)

**tenant_integrations**
- Stores user's connected integrations
- Encrypted credentials (AES-256-GCM)
- RLS enabled (users only see their own)

**integration_audit_log**
- Tracks all integration changes
- Auto-populated via database triggers

### Key Columns

```sql
integration_definitions:
- id (UUID)
- platform_key (VARCHAR) - unique identifier
- display_name (VARCHAR) - shown in UI
- category (VARCHAR) - social_media/analytics/advertising
- config_schema (JSONB) - dynamic form definition
- is_active (BOOLEAN)

tenant_integrations:
- id (UUID)
- tenant_id (UUID) - user ID
- definition_id (UUID) - FK to integration_definitions
- encrypted_credentials (TEXT) - never decrypted on frontend
- status (VARCHAR) - active/error/expired/disconnected
- last_sync_at (TIMESTAMP)
```

## 🔐 Security Implementation

### Encryption

**Algorithm:** AES-256-GCM (authenticated encryption)

**Process:**
1. User enters credentials in form
2. Frontend sends plain JSON to API
3. API encrypts using server-side key
4. Encrypted string stored in database
5. Format: `IV:AuthTag:Ciphertext` (all hex)

**Key Management:**
- 256-bit key (64 hex characters)
- Generated via `node database/generate-key.js`
- Stored in `INTEGRATION_ENCRYPTION_KEY` env variable
- Different keys for dev/staging/production

### Row Level Security (RLS)

Policies ensure:
- Users can only SELECT their own integrations
- Users can only INSERT with their own tenant_id
- Users can only UPDATE/DELETE their own integrations
- No access to other tenants' data

### API Security

- All routes check `auth.uid()` via Supabase
- Encrypted credentials NEVER sent to frontend
- Input validation on all endpoints
- Parameterized queries prevent SQL injection

## 🎨 UI Components

### StatusBadge

**Purpose:** Visual status indicator

**States:**
- Active (green) - working correctly
- Error (red) - last test/sync failed
- Expired (orange) - token expired
- Disconnected (gray) - manually disconnected

### IntegrationCard

**Purpose:** Display connected integration

**Features:**
- Platform logo and name
- Status badge
- Last sync timestamp
- Connected date
- Error message (if status = error)
- Disconnect button

### PlatformCard

**Purpose:** Display available platform to connect

**Features:**
- Platform logo and name
- Category badge
- Description
- Connect button (disabled if already connected)

### DynamicFormField

**Purpose:** Render form field from JSON schema

**Supported Types:**
- text
- password
- email
- url
- textarea

**Features:**
- Label with required indicator (*)
- Placeholder text
- Help text below field
- Error messages (inline, red)
- Type-specific validation

## 🔄 Data Flow

### Main Page Load

```
User visits /workspace/settings/integrations
  ↓
GET /api/integrations
  ↓
Fetch all definitions (8 platforms)
  ↓
Fetch user's integrations (with JOIN)
  ↓
Render two sections:
  - Connected (if any exist)
  - Available (not yet connected)
```

### Connect Platform

```
User clicks "Connect" on platform card
  ↓
Navigate to /integrations/add?platform=instagram
  ↓
Fetch definitions, find matching platform
  ↓
Render dynamic form from config_schema.fields
  ↓
User fills form
  ↓
User clicks "Test Connection"
  ↓
POST /api/integrations/test
  ↓
Show success/error banner
  ↓
User clicks "Save & Connect"
  ↓
POST /api/integrations
  ↓
Encrypt credentials
  ↓
INSERT to database
  ↓
Navigate back to main page
```

### Disconnect Platform

```
User clicks "Disconnect"
  ↓
Confirmation dialog
  ↓
User confirms
  ↓
DELETE /api/integrations/[id]
  ↓
RLS ensures user owns integration
  ↓
Remove from database
  ↓
Trigger logs to audit_log
  ↓
Remove from UI (optimistic update)
```

## 🎯 Form Validation

### Client-Side

**Required Fields:**
- Check if value is empty/whitespace
- Show error: "[Label] is required"

**Email Fields:**
- Regex: `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`

**URL Fields:**
- Validate using `new URL(value)`

**Pattern Validation:**
- If field.validation.pattern exists
- Test value with RegExp

### Server-Side

**Required Fields:**
- Verify all required credentials present
- Return 400 if missing

**Definition Validation:**
- Verify definition_id exists and is active
- Match platform_key to definition

**Duplicate Check:**
- Check if user already has integration for this platform
- Return 409 if duplicate exists

## 🧪 Testing Strategy

### Manual Testing Checklist

**Main Page:**
- [ ] Page loads without errors
- [ ] Shows 8 platforms if none connected
- [ ] Shows connected section when integrations exist
- [ ] Status badges show correct colors
- [ ] Clicking "Connect" navigates to add page
- [ ] Clicking "Disconnect" shows confirmation
- [ ] After disconnect, integration removed from list

**Add Page:**
- [ ] Loads correct platform from query param
- [ ] Shows platform name and logo
- [ ] Form renders correct number of fields
- [ ] Required fields show asterisk
- [ ] Help text displays below fields
- [ ] Validation errors show on submit
- [ ] Test connection shows result banner
- [ ] Save redirects back to main page
- [ ] Back button works

**Responsive:**
- [ ] Desktop: 3-column grid
- [ ] Tablet: 2-column grid
- [ ] Touch targets adequate on tablet
- [ ] No horizontal scrolling

**Database:**
- [ ] Row created in tenant_integrations
- [ ] encrypted_credentials is not readable
- [ ] status is 'active'
- [ ] tenant_id matches current user
- [ ] Audit log has entry

**Security:**
- [ ] Cannot access other users' integrations
- [ ] Credentials never in network tab
- [ ] Credentials never in console logs
- [ ] RLS prevents unauthorized access

## 📦 Pre-configured Platforms

1. **Instagram Business** (social_media)
   - Access token
   - Instagram Account ID

2. **Facebook Page** (social_media)
   - Page access token
   - Page ID

3. **Twitter (X)** (social_media)
   - API key & secret
   - Access token & secret

4. **LinkedIn Company Page** (social_media)
   - Access token
   - Organization ID

5. **Google Search Console** (analytics)
   - Service account JSON
   - Site URL

6. **Google Analytics 4** (analytics)
   - Service account JSON
   - Property ID

7. **Google Ads** (advertising)
   - Developer token
   - OAuth credentials
   - Customer ID

8. **Meta Ads** (advertising)
   - Access token
   - Ad Account ID

## 🚀 Deployment Steps

### 1. Environment Setup

```bash
# Generate encryption key
node apps/web/database/generate-key.js

# Add to .env.local (development)
INTEGRATION_ENCRYPTION_KEY=your_generated_key_here

# Add to environment variables (production)
# Use your hosting provider's secrets manager
```

### 2. Database Migration

```bash
# Run schema.sql in Supabase SQL Editor
# Run seed-data.sql in Supabase SQL Editor

# Verify tables created
# Verify 8 platforms seeded
```

### 3. Build & Deploy

```bash
# Type check
pnpm check-types

# Build
pnpm build

# Deploy to your hosting provider
```

### 4. Verify Deployment

- Visit `/workspace/settings/integrations`
- Check that 8 platforms appear
- Try connecting a platform
- Verify encryption in database

## 🔧 Customization

### Adding a New Platform

1. Insert into `integration_definitions`:

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
  'tiktok',
  'TikTok for Business',
  'social_media',
  'Connect your TikTok Business account',
  '/logos/tiktok.svg',
  '{
    "auth_type": "api_key",
    "fields": [
      {
        "key": "access_token",
        "label": "Access Token",
        "type": "password",
        "required": true,
        "help_text": "Get from TikTok Developer Portal"
      }
    ],
    "setup_instructions": ["Step 1", "Step 2"]
  }'::jsonb,
  true
);
```

2. Add validation function to `apps/web/app/api/integrations/test/route.ts`:

```typescript
function validateTikTok(credentials: Record<string, string>): TestConnectionResult {
  // Add validation logic
  return {
    success: true,
    message: 'Credentials validated!'
  };
}
```

### Customizing Form Fields

Edit `config_schema.fields` in database:

```json
{
  "key": "field_name",
  "label": "Display Label",
  "type": "text|password|email|url|textarea",
  "required": true|false,
  "placeholder": "Enter value...",
  "help_text": "Additional info",
  "validation": {
    "pattern": "regex_pattern",
    "min_length": 10,
    "max_length": 100
  }
}
```

## 🐛 Troubleshooting

### Encryption Key Error

**Error:** "INTEGRATION_ENCRYPTION_KEY environment variable is not set"

**Solution:** Add key to `.env.local` and restart server

### Build Errors

**Error:** TypeScript compilation errors

**Solution:** Run `pnpm check-types` to see specific errors

### Database Errors

**Error:** RLS policy violation

**Solution:**
- Check user is authenticated
- Verify tenant_id matches auth.uid()
- Ensure RLS is enabled

### Missing Platforms

**Error:** No platforms showing on main page

**Solution:**
- Run seed-data.sql
- Check is_active = true
- Verify API route is working

## 📊 Success Metrics

**Functional:**
- ✅ All 8 platforms appear on main page
- ✅ Can successfully save integration with encrypted credentials
- ✅ Can disconnect integration
- ✅ Form renders dynamically for each platform
- ✅ Works on desktop and tablet

**Technical:**
- ✅ Page loads in < 2 seconds
- ✅ No console errors or warnings
- ✅ TypeScript compiles without errors
- ✅ All API endpoints return appropriate status codes
- ✅ Database queries use proper indexes

**User Experience:**
- ✅ Clear navigation (user never feels lost)
- ✅ Helpful error messages (user knows what to fix)
- ✅ Loading states prevent confusion
- ✅ Success feedback confirms actions

## 🔮 Future Enhancements (Out of MVP Scope)

- Mobile support (< 768px)
- Edit existing credentials
- Bulk operations (disconnect all, test all)
- Advanced filtering and search
- OAuth flow automation
- Automatic token refresh
- Integration health dashboard
- Category filtering tabs
- Real-time status updates
- Webhook configuration
- Data sync scheduling
- Export/import configurations

## 📝 Notes

- This is an MVP implementation with basic validation
- Test connections perform format validation, not actual API calls
- Production implementation should make real API calls
- Encryption key rotation requires a migration script (not included)
- Audit logs are kept indefinitely (implement cleanup as needed)

## 🆘 Support

For issues or questions:
1. Check this guide first
2. Review database/README.md for setup help
3. Check API route error logs
4. Verify environment variables are set
5. Test encryption key is valid

## ✅ Definition of Done

- [x] User can view all available platforms
- [x] User can navigate to add page
- [x] Form renders dynamically from database JSON schema
- [x] User can test connection
- [x] User can save integration with encrypted credentials
- [x] User can view connected integrations with status
- [x] User can disconnect integration
- [x] No credentials stored in plain text
- [x] Works on desktop and tablet
- [x] No TypeScript or console errors
- [x] Documentation complete
