/**
 * DynamicFormField Component
 * Renders form field dynamically based on field configuration
 */

'use client';

import React from 'react';
import { Input } from '@repo/ui/components/ui/input';
import { Label } from '@repo/ui/components/ui/label';
import { Textarea } from '@repo/ui/components/ui/textarea';
import type { ConfigField } from '@/types/integrations';

interface DynamicFormFieldProps {
  field: ConfigField;
  value: string;
  onChange: (key: string, value: string) => void;
  error?: string;
}

export function DynamicFormField({ field, value, onChange, error }: DynamicFormFieldProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    onChange(field.key, e.target.value);
  };

  const fieldId = `field-${field.key}`;

  return (
    <div className="space-y-2">
      <Label htmlFor={fieldId} className="text-sm font-medium">
        {field.label}
        {field.required && <span className="text-red-500 ml-1">*</span>}
      </Label>

      {field.type === 'textarea' ? (
        <Textarea
          id={fieldId}
          value={value}
          onChange={handleChange}
          placeholder={field.placeholder}
          required={field.required}
          className={error ? 'border-red-500 focus-visible:border-red-500' : ''}
          rows={6}
        />
      ) : (
        <Input
          id={fieldId}
          type={field.type}
          value={value}
          onChange={handleChange}
          placeholder={field.placeholder}
          required={field.required}
          className={error ? 'border-red-500 focus-visible:border-red-500' : ''}
        />
      )}

      {field.help_text && !error && (
        <p className="text-xs text-muted-foreground">{field.help_text}</p>
      )}

      {error && (
        <p className="text-xs text-red-600 font-medium">{error}</p>
      )}
    </div>
  );
}
