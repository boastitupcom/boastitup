/**
 * Integration Settings Type Definitions
 * Defines types for platform integrations, credentials, and configuration
 */

export type IntegrationStatus = 'active' | 'error' | 'expired' | 'disconnected';

export type IntegrationCategory = 'social_media' | 'analytics' | 'advertising';

export type FieldType = 'text' | 'password' | 'email' | 'url' | 'textarea';

/**
 * Field definition from config_schema.fields array
 */
export interface ConfigField {
  key: string;
  label: string;
  type: FieldType;
  required: boolean;
  placeholder?: string;
  help_text?: string;
  validation?: {
    pattern?: string;
    min_length?: number;
    max_length?: number;
  };
}

/**
 * Configuration schema stored in integration_definitions.config_schema
 */
export interface ConfigSchema {
  fields: ConfigField[];
  setup_instructions?: string[];
  auth_type?: 'api_key' | 'oauth' | 'service_account';
}

/**
 * Platform definition from integration_definitions table
 */
export interface IntegrationDefinition {
  id: string;
  platform_key: string;
  display_name: string;
  category: IntegrationCategory;
  logo_url?: string;
  config_schema: ConfigSchema;
  is_active: boolean;
  description?: string;
  created_at?: string;
  updated_at?: string;
}

/**
 * User's connected integration from tenant_integrations table
 */
export interface TenantIntegration {
  id: string;
  tenant_id: string;
  brand_id?: string;
  definition_id: string;
  encrypted_credentials: string; // Never decrypted on frontend
  status: IntegrationStatus;
  error_message?: string;
  last_sync_at?: string;
  settings?: Record<string, any>; // Non-sensitive settings
  created_at: string;
  updated_at: string;
  // Joined data from integration_definitions
  definition?: IntegrationDefinition;
}

/**
 * Credentials object before encryption (used in forms)
 */
export type Credentials = Record<string, string>;

/**
 * Form data state for add integration page
 */
export interface IntegrationFormData {
  definition_id: string;
  credentials: Credentials;
  settings?: Record<string, any>;
}

/**
 * Test connection result
 */
export interface TestConnectionResult {
  success: boolean;
  message: string;
  details?: any;
}

/**
 * API response for GET /api/integrations
 */
export interface IntegrationsResponse {
  definitions: IntegrationDefinition[];
  integrations: TenantIntegration[];
}

/**
 * API request body for POST /api/integrations
 */
export interface CreateIntegrationRequest {
  definition_id: string;
  credentials: Credentials;
  brand_id?: string;
  settings?: Record<string, any>;
}

/**
 * API request body for POST /api/integrations/test
 */
export interface TestIntegrationRequest {
  definition_id: string;
  platform_key: string;
  credentials: Credentials;
}

/**
 * Field validation error
 */
export interface FieldError {
  field: string;
  message: string;
}

/**
 * Form errors state
 */
export type FormErrors = Record<string, string>;
