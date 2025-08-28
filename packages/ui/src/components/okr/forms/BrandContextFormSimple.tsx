"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Textarea } from '../../ui/textarea';
import { Separator } from '../../ui/separator';
import { Building2, Package, Target, Users, Hash, History } from 'lucide-react';

interface BrandContextFormSimpleProps {
  brandName: string;
  industry: string;
  onSubmit: (data: {
    keyProduct?: string;
    productCategory?: string;
    keyCompetition?: string[];
    majorKeywords?: string[];
    objective?: string;
    historicalOKRs?: string[];
  }) => void;
  onSkip: () => void;
  isLoading?: boolean;
}

export function BrandContextFormSimple({
  brandName,
  industry,
  onSubmit,
  onSkip,
  isLoading = false
}: BrandContextFormSimpleProps) {
  const [formData, setFormData] = useState({
    keyProduct: '',
    productCategory: '',
    keyCompetition: '',
    majorKeywords: '',
    objective: '',
    historicalOKRs: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const processedData = {
      keyProduct: formData.keyProduct?.trim() || undefined,
      productCategory: formData.productCategory?.trim() || undefined,
      keyCompetition: formData.keyCompetition 
        ? formData.keyCompetition.split(',').map(c => c.trim()).filter(Boolean)
        : undefined,
      majorKeywords: formData.majorKeywords
        ? formData.majorKeywords.split(',').map(k => k.trim()).filter(Boolean)
        : undefined,
      objective: formData.objective?.trim() || undefined,
      historicalOKRs: formData.historicalOKRs
        ? formData.historicalOKRs.split('\n').map(o => o.trim()).filter(Boolean)
        : undefined,
    };

    onSubmit(processedData);
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const hasAnyData = Object.values(formData).some(value => value && value.trim());

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="h-5 w-5" />
          Brand Context Enhancement
        </CardTitle>
        <CardDescription>
          Provide additional context about <strong>{brandName}</strong> in the{' '}
          <strong>{industry}</strong> industry to get more targeted OKR suggestions.
          All fields are optional.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Key Product */}
          <div className="space-y-2">
            <Label htmlFor="keyProduct" className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              Key Product or Service
            </Label>
            <Input
              id="keyProduct"
              value={formData.keyProduct}
              onChange={(e) => handleChange('keyProduct', e.target.value)}
              placeholder="e.g., SaaS platform, mobile app, consulting services"
              disabled={isLoading}
            />
          </div>

          {/* Product Category */}
          <div className="space-y-2">
            <Label htmlFor="productCategory" className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              Product Category
            </Label>
            <Input
              id="productCategory"
              value={formData.productCategory}
              onChange={(e) => handleChange('productCategory', e.target.value)}
              placeholder="e.g., B2B SaaS, E-commerce, FinTech, HealthTech"
              disabled={isLoading}
            />
          </div>

          {/* Key Competition */}
          <div className="space-y-2">
            <Label htmlFor="keyCompetition" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Key Competitors
            </Label>
            <Input
              id="keyCompetition"
              value={formData.keyCompetition}
              onChange={(e) => handleChange('keyCompetition', e.target.value)}
              placeholder="e.g., Competitor A, Competitor B, Competitor C"
              disabled={isLoading}
            />
            <p className="text-xs text-muted-foreground">
              Separate multiple competitors with commas
            </p>
          </div>

          {/* Major Keywords */}
          <div className="space-y-2">
            <Label htmlFor="majorKeywords" className="flex items-center gap-2">
              <Hash className="h-4 w-4" />
              Major Keywords
            </Label>
            <Input
              id="majorKeywords"
              value={formData.majorKeywords}
              onChange={(e) => handleChange('majorKeywords', e.target.value)}
              placeholder="e.g., automation, productivity, analytics, growth"
              disabled={isLoading}
            />
            <p className="text-xs text-muted-foreground">
              Separate keywords with commas
            </p>
          </div>

          <Separator />

          {/* Current Objective */}
          <div className="space-y-2">
            <Label htmlFor="objective" className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              Current Main Objective
            </Label>
            <Textarea
              id="objective"
              value={formData.objective}
              onChange={(e) => handleChange('objective', e.target.value)}
              placeholder="What's your primary business objective for this quarter?"
              rows={3}
              disabled={isLoading}
            />
          </div>

          {/* Historical OKRs */}
          <div className="space-y-2">
            <Label htmlFor="historicalOKRs" className="flex items-center gap-2">
              <History className="h-4 w-4" />
              Previous OKRs (Optional)
            </Label>
            <Textarea
              id="historicalOKRs"
              value={formData.historicalOKRs}
              onChange={(e) => handleChange('historicalOKRs', e.target.value)}
              placeholder="List any previous OKRs, one per line (helps AI avoid duplicates)"
              rows={4}
              disabled={isLoading}
            />
            <p className="text-xs text-muted-foreground">
              Enter each previous OKR on a new line
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button
              type="submit"
              disabled={isLoading}
              className="flex-1"
            >
              {isLoading ? 'Generating Suggestions...' : 'Generate AI Suggestions'}
            </Button>
            
            <Button
              type="button"
              variant="outline"
              onClick={onSkip}
              disabled={isLoading}
              className="flex-1"
            >
              {hasAnyData ? 'Use Basic Context' : 'Skip Enhancement'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}