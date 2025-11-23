/**
 * Add Integration Page
 * /workspace/settings/integrations/add?platform=X
 *
 * Dynamic form for adding new integrations based on platform config schema
 */

'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@boastitup/ui/components/ui/button';
import { Card, CardContent, CardHeader } from '@boastitup/ui/components/ui/card';
import { DynamicFormField } from '@/components/integrations/DynamicFormField';
import type {
  IntegrationDefinition,
  ConfigField,
  Credentials,
  FormErrors,
  TestConnectionResult
} from '@/types/integrations';

function AddIntegrationContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const platformKey = searchParams.get('platform');

  const [definition, setDefinition] = useState<IntegrationDefinition | null>(null);
  const [formData, setFormData] = useState<Credentials>({});
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(true);
  const [testing, setTesting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [testResult, setTestResult] = useState<TestConnectionResult | null>(null);

  // Fetch platform definition
  useEffect(() => {
    if (!platformKey) {
      router.push('/workspace/settings/integrations');
      return;
    }

    fetchDefinition();
  }, [platformKey]);

  const fetchDefinition = async () => {
    try {
      setLoading(true);

      const response = await fetch('/api/integrations');
      if (!response.ok) {
        throw new Error('Failed to fetch platforms');
      }

      const data = await response.json();
      const platformDef = data.definitions.find(
        (def: IntegrationDefinition) => def.platform_key === platformKey
      );

      if (!platformDef) {
        throw new Error('Platform not found');
      }

      setDefinition(platformDef);

      // Initialize form data with empty values
      const initialFormData: Credentials = {};
      platformDef.config_schema.fields.forEach((field: ConfigField) => {
        initialFormData[field.key] = '';
      });
      setFormData(initialFormData);
    } catch (err) {
      console.error('Error fetching definition:', err);
      alert('Failed to load platform configuration. Redirecting...');
      router.push('/workspace/settings/integrations');
    } finally {
      setLoading(false);
    }
  };

  const handleFieldChange = (key: string, value: string) => {
    setFormData(prev => ({ ...prev, [key]: value }));
    // Clear error for this field
    if (errors[key]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[key];
        return newErrors;
      });
    }
    // Clear test result when form changes
    setTestResult(null);
  };

  const validateForm = (): boolean => {
    if (!definition) return false;

    const newErrors: FormErrors = {};

    definition.config_schema.fields.forEach((field: ConfigField) => {
      const value = formData[field.key] || '';

      // Required field validation
      if (field.required && !value.trim()) {
        newErrors[field.key] = `${field.label} is required`;
        return;
      }

      // Type-specific validation
      if (value.trim()) {
        if (field.type === 'email') {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(value)) {
            newErrors[field.key] = 'Invalid email format';
          }
        } else if (field.type === 'url') {
          try {
            new URL(value);
          } catch {
            newErrors[field.key] = 'Invalid URL format';
          }
        }

        // Pattern validation
        if (field.validation?.pattern) {
          const regex = new RegExp(field.validation.pattern);
          if (!regex.test(value)) {
            newErrors[field.key] = `Invalid format for ${field.label}`;
          }
        }
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleTestConnection = async () => {
    if (!validateForm() || !definition) return;

    setTesting(true);
    setTestResult(null);

    try {
      const response = await fetch('/api/integrations/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          definition_id: definition.id,
          platform_key: definition.platform_key,
          credentials: formData
        })
      });

      const result: TestConnectionResult = await response.json();
      setTestResult(result);

      if (!result.success) {
        console.error('Test failed:', result.message);
      }
    } catch (err) {
      console.error('Error testing connection:', err);
      setTestResult({
        success: false,
        message: 'Failed to test connection. Please try again.'
      });
    } finally {
      setTesting(false);
    }
  };

  const handleSave = async () => {
    if (!validateForm() || !definition) return;

    setSaving(true);

    try {
      const response = await fetch('/api/integrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          definition_id: definition.id,
          credentials: formData
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save integration');
      }

      // Success - redirect back to list page
      router.push('/workspace/settings/integrations');
    } catch (err) {
      console.error('Error saving integration:', err);
      alert(err instanceof Error ? err.message : 'Failed to save integration');
    } finally {
      setSaving(false);
    }
  };

  const handleBack = () => {
    router.push('/workspace/settings/integrations');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-8">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading platform...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!definition) {
    return null;
  }

  const setupInstructions = definition.config_schema.setup_instructions || [];

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBack}
            className="mb-4"
          >
            ← Back to Integrations
          </Button>

          <div className="flex items-center gap-4 mb-2">
            {definition.logo_url && (
              <div className="w-16 h-16 rounded-lg bg-white border border-gray-200 flex items-center justify-center overflow-hidden">
                <img
                  src={definition.logo_url}
                  alt={definition.display_name}
                  className="w-10 h-10 object-contain"
                />
              </div>
            )}
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Connect {definition.display_name}
              </h1>
              <p className="text-muted-foreground">
                {definition.description || 'Connect this platform to track your data.'}
              </p>
            </div>
          </div>
        </div>

        {/* Setup Instructions */}
        {setupInstructions.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <h3 className="font-semibold">Setup Instructions</h3>
            </CardHeader>
            <CardContent>
              <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
                {setupInstructions.map((instruction, index) => (
                  <li key={index}>{instruction}</li>
                ))}
              </ol>
            </CardContent>
          </Card>
        )}

        {/* Form */}
        <Card>
          <CardHeader>
            <h3 className="font-semibold">Credentials</h3>
            <p className="text-sm text-muted-foreground">
              Enter your {definition.display_name} credentials below. All credentials are encrypted before storage.
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            {definition.config_schema.fields.map((field: ConfigField) => (
              <DynamicFormField
                key={field.key}
                field={field}
                value={formData[field.key] || ''}
                onChange={handleFieldChange}
                error={errors[field.key]}
              />
            ))}
          </CardContent>
        </Card>

        {/* Test Result Banner */}
        {testResult && (
          <div
            className={`mt-6 p-4 rounded-lg border ${
              testResult.success
                ? 'bg-green-50 border-green-200'
                : 'bg-red-50 border-red-200'
            }`}
          >
            <div className="flex items-start gap-2">
              <span className="text-lg">
                {testResult.success ? '✓' : '✕'}
              </span>
              <div>
                <p
                  className={`font-medium ${
                    testResult.success ? 'text-green-800' : 'text-red-800'
                  }`}
                >
                  {testResult.success ? 'Connection Successful' : 'Connection Failed'}
                </p>
                <p
                  className={`text-sm ${
                    testResult.success ? 'text-green-700' : 'text-red-700'
                  }`}
                >
                  {testResult.message}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-6 flex gap-3">
          <Button
            variant="outline"
            onClick={handleTestConnection}
            disabled={testing || saving}
            className="flex-1"
          >
            {testing ? 'Testing...' : 'Test Connection'}
          </Button>
          <Button
            onClick={handleSave}
            disabled={testing || saving}
            className="flex-1"
          >
            {saving ? 'Saving...' : 'Save & Connect'}
          </Button>
        </div>

        <p className="mt-4 text-xs text-center text-muted-foreground">
          We recommend testing your connection before saving. Your credentials are encrypted using AES-256-GCM.
        </p>
      </div>
    </div>
  );
}

export default function AddIntegrationPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 p-4 md:p-8">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading...</p>
            </div>
          </div>
        </div>
      </div>
    }>
      <AddIntegrationContent />
    </Suspense>
  );
}
