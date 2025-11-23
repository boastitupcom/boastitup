-- Integration Settings Database Schema
-- Creates tables for platform definitions and user integrations

-- ============================================================================
-- Table: integration_definitions
-- Purpose: Store platform templates with configuration schemas
-- ============================================================================
CREATE TABLE IF NOT EXISTS integration_definitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  platform_key VARCHAR(50) UNIQUE NOT NULL, -- e.g., 'instagram', 'facebook'
  display_name VARCHAR(100) NOT NULL, -- e.g., 'Instagram Business'
  category VARCHAR(50) NOT NULL, -- 'social_media', 'analytics', 'advertising'
  description TEXT,
  logo_url TEXT,
  config_schema JSONB NOT NULL, -- JSON schema defining form fields
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for fast lookup by platform key
CREATE INDEX IF NOT EXISTS idx_integration_definitions_platform_key
  ON integration_definitions(platform_key);

-- Index for filtering active definitions
CREATE INDEX IF NOT EXISTS idx_integration_definitions_active
  ON integration_definitions(is_active)
  WHERE is_active = true;

-- ============================================================================
-- Table: tenant_integrations
-- Purpose: Store user's connected integrations with encrypted credentials
-- ============================================================================
CREATE TABLE IF NOT EXISTS tenant_integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL, -- User ID from auth.users
  brand_id UUID, -- Optional: associate with specific brand
  definition_id UUID NOT NULL REFERENCES integration_definitions(id) ON DELETE CASCADE,
  encrypted_credentials TEXT NOT NULL, -- AES-256-GCM encrypted credentials
  status VARCHAR(20) DEFAULT 'active', -- 'active', 'error', 'expired', 'disconnected'
  error_message TEXT, -- Store last error if status = 'error'
  last_sync_at TIMESTAMP WITH TIME ZONE, -- Last successful data sync
  settings JSONB, -- Non-sensitive settings (account names, options, etc.)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for fast user lookup
CREATE INDEX IF NOT EXISTS idx_tenant_integrations_tenant_id
  ON tenant_integrations(tenant_id);

-- Index for definition joins
CREATE INDEX IF NOT EXISTS idx_tenant_integrations_definition_id
  ON tenant_integrations(definition_id);

-- Index for status filtering
CREATE INDEX IF NOT EXISTS idx_tenant_integrations_status
  ON tenant_integrations(status);

-- Composite index for user + definition (prevents duplicates)
CREATE UNIQUE INDEX IF NOT EXISTS idx_tenant_integrations_unique
  ON tenant_integrations(tenant_id, definition_id);

-- ============================================================================
-- Row Level Security (RLS) Policies
-- ============================================================================

-- Enable RLS on tenant_integrations
ALTER TABLE tenant_integrations ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only view their own integrations
CREATE POLICY IF NOT EXISTS tenant_integrations_select_policy
  ON tenant_integrations
  FOR SELECT
  USING (tenant_id = auth.uid());

-- Policy: Users can only insert integrations for themselves
CREATE POLICY IF NOT EXISTS tenant_integrations_insert_policy
  ON tenant_integrations
  FOR INSERT
  WITH CHECK (tenant_id = auth.uid());

-- Policy: Users can only update their own integrations
CREATE POLICY IF NOT EXISTS tenant_integrations_update_policy
  ON tenant_integrations
  FOR UPDATE
  USING (tenant_id = auth.uid());

-- Policy: Users can only delete their own integrations
CREATE POLICY IF NOT EXISTS tenant_integrations_delete_policy
  ON tenant_integrations
  FOR DELETE
  USING (tenant_id = auth.uid());

-- Integration definitions are publicly readable (no RLS needed)
-- Only admins should insert/update definitions (handle via API permissions)

-- ============================================================================
-- Audit Log Table (Optional but Recommended)
-- ============================================================================
CREATE TABLE IF NOT EXISTS integration_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  integration_id UUID, -- NULL if integration was deleted
  action VARCHAR(50) NOT NULL, -- 'created', 'updated', 'deleted', 'test_success', 'test_failed'
  details JSONB, -- Additional context
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_integration_audit_log_tenant_id
  ON integration_audit_log(tenant_id);

CREATE INDEX IF NOT EXISTS idx_integration_audit_log_integration_id
  ON integration_audit_log(integration_id);

-- ============================================================================
-- Trigger: Update updated_at timestamp
-- ============================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_integration_definitions_updated_at
  BEFORE UPDATE ON integration_definitions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tenant_integrations_updated_at
  BEFORE UPDATE ON tenant_integrations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- Trigger: Audit log on integration changes
-- ============================================================================
CREATE OR REPLACE FUNCTION log_integration_change()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO integration_audit_log (tenant_id, integration_id, action, details)
    VALUES (NEW.tenant_id, NEW.id, 'created', jsonb_build_object('definition_id', NEW.definition_id));
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO integration_audit_log (tenant_id, integration_id, action, details)
    VALUES (NEW.tenant_id, NEW.id, 'updated', jsonb_build_object('status', NEW.status));
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO integration_audit_log (tenant_id, integration_id, action, details)
    VALUES (OLD.tenant_id, OLD.id, 'deleted', jsonb_build_object('definition_id', OLD.definition_id));
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tenant_integrations_audit_trigger
  AFTER INSERT OR UPDATE OR DELETE ON tenant_integrations
  FOR EACH ROW
  EXECUTE FUNCTION log_integration_change();
