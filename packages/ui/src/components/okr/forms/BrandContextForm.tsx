"use client";

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Textarea } from '../../ui/textarea';
import { Separator } from '../../ui/separator';
import { Building2, Package, Target, Users, Hash, History } from 'lucide-react';

// Validation schema matching story.txt lines 294-306
const brandContextSchema = z.object({
  keyProduct: z.string().optional(),
  productCategory: z.string().optional(),
  keyCompetition: z.string().optional(),
  majorKeywords: z.string().optional(),
  objective: z.string().optional(),
  historicalOKRs: z.string().optional(),
});

type BrandContextForm = z.infer<typeof brandContextSchema>;

interface BrandContextFormProps {
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

export function BrandContextForm({
  brandName,
  industry,
  onSubmit,
  onSkip,
  isLoading = false
}: BrandContextFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch
  } = useForm<BrandContextForm>({
    resolver: zodResolver(brandContextSchema)
  });

  const onFormSubmit = (data: BrandContextForm) => {
    // Parse comma-separated values into arrays
    const processedData = {
      keyProduct: data.keyProduct?.trim() || undefined,
      productCategory: data.productCategory?.trim() || undefined,
      keyCompetition: data.keyCompetition 
        ? data.keyCompetition.split(',').map(c => c.trim()).filter(Boolean)
        : undefined,
      majorKeywords: data.majorKeywords
        ? data.majorKeywords.split(',').map(k => k.trim()).filter(Boolean)
        : undefined,
      objective: data.objective?.trim() || undefined,
      historicalOKRs: data.historicalOKRs
        ? data.historicalOKRs.split('\\n').map(o => o.trim()).filter(Boolean)
        : undefined,
    };

    onSubmit(processedData);
  };

  const hasAnyData = Object.values(watch()).some(value => value && value.trim());

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
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
          {/* Key Product */}
          <div className="space-y-2">
            <Label htmlFor="keyProduct" className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              Key Product or Service
            </Label>
            <Input
              id="keyProduct"
              {...register('keyProduct')}
              placeholder="e.g., SaaS platform, mobile app, consulting services"
              disabled={isLoading}
            />
            {errors.keyProduct && (
              <p className="text-sm text-destructive">{errors.keyProduct.message}</p>
            )}
          </div>

          {/* Product Category */}
          <div className="space-y-2">
            <Label htmlFor="productCategory" className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              Product Category
            </Label>
            <Input
              id="productCategory"
              {...register('productCategory')}
              placeholder="e.g., B2B SaaS, E-commerce, FinTech, HealthTech"
              disabled={isLoading}
            />
            {errors.productCategory && (
              <p className="text-sm text-destructive">{errors.productCategory.message}</p>
            )}
          </div>

          {/* Key Competition */}
          <div className="space-y-2">
            <Label htmlFor="keyCompetition" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Key Competitors
            </Label>
            <Input
              id="keyCompetition"
              {...register('keyCompetition')}
              placeholder="e.g., Competitor A, Competitor B, Competitor C"
              disabled={isLoading}
            />
            <p className="text-xs text-muted-foreground">
              Separate multiple competitors with commas
            </p>
            {errors.keyCompetition && (
              <p className="text-sm text-destructive">{errors.keyCompetition.message}</p>
            )}
          </div>

          {/* Major Keywords */}
          <div className="space-y-2">
            <Label htmlFor="majorKeywords" className="flex items-center gap-2">
              <Hash className="h-4 w-4" />
              Major Keywords
            </Label>
            <Input
              id="majorKeywords"
              {...register('majorKeywords')}
              placeholder="e.g., automation, productivity, analytics, growth"
              disabled={isLoading}
            />
            <p className="text-xs text-muted-foreground">
              Separate keywords with commas
            </p>
            {errors.majorKeywords && (
              <p className="text-sm text-destructive">{errors.majorKeywords.message}</p>
            )}
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
              {...register('objective')}
              placeholder="What's your primary business objective for this quarter?"
              rows={3}
              disabled={isLoading}
            />
            {errors.objective && (
              <p className="text-sm text-destructive">{errors.objective.message}</p>
            )}
          </div>

          {/* Historical OKRs */}
          <div className="space-y-2">
            <Label htmlFor="historicalOKRs" className="flex items-center gap-2">
              <History className="h-4 w-4" />
              Previous OKRs (Optional)
            </Label>
            <Textarea
              id="historicalOKRs"
              {...register('historicalOKRs')}
              placeholder="List any previous OKRs, one per line (helps AI avoid duplicates)"
              rows={4}
              disabled={isLoading}
            />
            <p className="text-xs text-muted-foreground">
              Enter each previous OKR on a new line
            </p>
            {errors.historicalOKRs && (
              <p className="text-sm text-destructive">{errors.historicalOKRs.message}</p>
            )}
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