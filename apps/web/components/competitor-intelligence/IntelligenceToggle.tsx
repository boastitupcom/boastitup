// apps/web/components/competitor-intelligence/IntelligenceToggle.tsx
"use client";

import React from 'react';
import { Button } from '@boastitup/ui';
import { Brain, EyeOff, Eye } from 'lucide-react';

interface IntelligenceToggleProps {
  visible: boolean;
  onToggle: (visible: boolean) => void;
  disabled?: boolean;
  className?: string;
}

export const IntelligenceToggle: React.FC<IntelligenceToggleProps> = ({
  visible,
  onToggle,
  disabled = false,
  className = ""
}) => {
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => onToggle(!visible)}
      disabled={disabled}
      className={`flex items-center space-x-2 ${className}`}
    >
      {visible ? (
        <>
          <EyeOff className="w-4 h-4" />
          <span>Hide Intelligence</span>
        </>
      ) : (
        <>
          <Brain className="w-4 h-4" />
          <span>Show Intelligence</span>
        </>
      )}
    </Button>
  );
};