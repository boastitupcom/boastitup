'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Skeleton, Badge } from '@boastitup/ui';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { BrandScoreCardProps } from '../../types/brand-health';
import { getScoreColor } from '../../types/brand-health';

interface ProgressRingProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
  isAnimating?: boolean;
}

const ProgressRing = ({ score, size = 'lg', isAnimating = true }: ProgressRingProps) => {
  const [animatedScore, setAnimatedScore] = useState(0);
  
  const sizeMap = {
    sm: { radius: 40, strokeWidth: 6, fontSize: 'text-lg' },
    md: { radius: 60, strokeWidth: 8, fontSize: 'text-2xl' },
    lg: { radius: 80, strokeWidth: 10, fontSize: 'text-4xl' }
  };
  
  const { radius, strokeWidth, fontSize } = sizeMap[size];
  const circumference = 2 * Math.PI * radius;
  const scoreColors = getScoreColor(score);
  
  useEffect(() => {
    if (!isAnimating) {
      setAnimatedScore(score);
      return;
    }

    const timer = setTimeout(() => {
      const increment = score / 50; // Animation duration ~500ms
      const animate = () => {
        setAnimatedScore(prev => {
          if (prev >= score) return score;
          return Math.min(prev + increment, score);
        });
      };
      
      const interval = setInterval(animate, 10);
      setTimeout(() => clearInterval(interval), 500);
    }, 100);

    return () => clearTimeout(timer);
  }, [score, isAnimating]);

  const strokeDashoffset = circumference - (animatedScore / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center">
      <svg
        className="transform -rotate-90"
        width={radius * 2 + strokeWidth}
        height={radius * 2 + strokeWidth}
      >
        {/* Background circle */}
        <circle
          cx={radius + strokeWidth / 2}
          cy={radius + strokeWidth / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          className="text-gray-200"
        />
        
        {/* Progress circle */}
        <circle
          cx={radius + strokeWidth / 2}
          cy={radius + strokeWidth / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          className={cn(
            "transition-all duration-500 ease-out",
            scoreColors.ring
          )}
        />
      </svg>
      
      {/* Score text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={cn("font-bold", fontSize)}>
          {Math.round(animatedScore)}%
        </span>
        <span className="text-sm text-gray-500 font-medium">Score</span>
      </div>
    </div>
  );
};

export default function BrandScoreCard({ 
  score, 
  isLoading = false, 
  previousScore,
  size = 'lg' 
}: BrandScoreCardProps) {
  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-center">
            <Skeleton className="h-6 w-48 mx-auto" />
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center space-y-4">
          <Skeleton className="h-40 w-40 rounded-full" />
          <Skeleton className="h-4 w-32" />
        </CardContent>
      </Card>
    );
  }

  const scoreColors = getScoreColor(score);
  const hasComparison = previousScore !== undefined && previousScore !== null;
  const scoreDiff = hasComparison ? score - previousScore : 0;
  const isImprovement = scoreDiff > 0;
  const isDecline = scoreDiff < 0;

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    return 'Needs Attention';
  };

  const getTrendIcon = () => {
    if (isImprovement) return <TrendingUp className="h-4 w-4" />;
    if (isDecline) return <TrendingDown className="h-4 w-4" />;
    return <Minus className="h-4 w-4" />;
  };

  const getTrendColor = () => {
    if (isImprovement) return 'text-green-600';
    if (isDecline) return 'text-red-600';
    return 'text-gray-500';
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-center text-lg font-semibold">
          Overall Brand Health Score
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center space-y-6">
        {/* Circular Progress Ring */}
        <div className={cn(
          "p-8 rounded-full bg-gradient-to-br shadow-lg",
          scoreColors.background
        )}>
          <ProgressRing score={score} size={size} />
        </div>

        {/* Score Status Badge */}
        <Badge 
          variant={score >= 80 ? 'default' : score >= 60 ? 'secondary' : 'destructive'}
          className="text-sm font-medium px-4 py-2"
        >
          {getScoreLabel(score)}
        </Badge>

        {/* Comparison with Previous Score */}
        {hasComparison && (
          <div className={cn("flex items-center space-x-2 text-sm", getTrendColor())}>
            {getTrendIcon()}
            <span>
              {isImprovement ? '+' : ''}{scoreDiff.toFixed(1)} from last period
            </span>
          </div>
        )}

        {/* Score Breakdown Hint */}
        <p className="text-xs text-gray-500 text-center max-w-xs">
          Based on sentiment, engagement, reach, mentions velocity, and engagement volume
        </p>
      </CardContent>
    </Card>
  );
}