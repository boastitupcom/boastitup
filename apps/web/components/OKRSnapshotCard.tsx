// apps/web/components/OKRSnapshotCard.tsx
'use client';

import React from 'react';
import { DollarSign, Users, Target, RotateCcw, TrendingUp, TrendingDown, ShoppingBag, UserPlus, CreditCard, ArrowUpCircle } from 'lucide-react';
import type { OKRSnapshot } from '@boastitup/types';

interface OKRSnapshotCardProps {
  okrData: OKRSnapshot;
  showDetails?: boolean;
  onDetailsClick?: () => void;
  className?: string;
}

const IconMap = {
  DollarSign: DollarSign,
  Users: Users,
  Target: Target,
  Repeat: RotateCcw,
  ShoppingBag: ShoppingBag,
  UserPlus: UserPlus,
  CreditCard: CreditCard,
  ArrowUpCircle: ArrowUpCircle,
};

// Distinct color schemes for each specific metric (not just metric type)
const MetricSpecificColors = {
  // Monthly Revenue Target - Rich Green
  'monthly_revenue': {
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    accent: 'bg-emerald-500',
    icon: 'bg-emerald-100 text-emerald-700',
    progress: 'stroke-emerald-500',
    text: 'text-emerald-800',
  },
  // New Customer Acquisition - Vibrant Blue
  'customer_acquisition': {
    bg: 'bg-blue-50',
    border: 'border-blue-200', 
    accent: 'bg-blue-500',
    icon: 'bg-blue-100 text-blue-700',
    progress: 'stroke-blue-500',
    text: 'text-blue-800',
  },
  // Average Order Value - Warm Orange
  'average_order_value': {
    bg: 'bg-orange-50',
    border: 'border-orange-200',
    accent: 'bg-orange-500',
    icon: 'bg-orange-100 text-orange-700',
    progress: 'stroke-orange-500',
    text: 'text-orange-800',
  },
  // Repeat Purchase Rate - Deep Purple
  'repeat_purchase_rate': {
    bg: 'bg-purple-50',
    border: 'border-purple-200',
    accent: 'bg-purple-500',
    icon: 'bg-purple-100 text-purple-700',
    progress: 'stroke-purple-500',
    text: 'text-purple-800',
  },
};

// Fallback color schemes by metric type
const MetricTypeColors = {
  revenue: {
    bg: 'bg-green-50',
    border: 'border-green-200',
    accent: 'bg-green-500',
    icon: 'bg-green-100 text-green-700',
    progress: 'stroke-green-500',
    text: 'text-green-800',
  },
  customers: {
    bg: 'bg-blue-50',
    border: 'border-blue-200', 
    accent: 'bg-blue-500',
    icon: 'bg-blue-100 text-blue-700',
    progress: 'stroke-blue-500',
    text: 'text-blue-800',
  },
  conversions: {
    bg: 'bg-indigo-50',
    border: 'border-indigo-200',
    accent: 'bg-indigo-500',
    icon: 'bg-indigo-100 text-indigo-700',
    progress: 'stroke-indigo-500',
    text: 'text-indigo-800',
  },
  engagement: {
    bg: 'bg-violet-50',
    border: 'border-violet-200',
    accent: 'bg-violet-500',
    icon: 'bg-violet-100 text-violet-700',
    progress: 'stroke-violet-500',
    text: 'text-violet-800',
  },
};

const StatusColors = {
  on_track: {
    bg: 'bg-green-50',
    border: 'border-green-200',
    text: 'text-green-800',
    badge: 'bg-green-100 text-green-800',
    progress: 'stroke-green-500',
    icon: 'bg-green-100 text-green-600',
  },
  close_to_target: {
    bg: 'bg-orange-50',
    border: 'border-orange-200',
    text: 'text-orange-800',
    badge: 'bg-orange-100 text-orange-800',
    progress: 'stroke-orange-500',
    icon: 'bg-orange-100 text-orange-600',
  },
  needs_attention: {
    bg: 'bg-red-50',
    border: 'border-red-200',
    text: 'text-red-800',
    badge: 'bg-red-100 text-red-800',
    progress: 'stroke-red-500',
    icon: 'bg-red-100 text-red-600',
  },
  at_risk: {
    bg: 'bg-yellow-50',
    border: 'border-yellow-200',
    text: 'text-yellow-800',
    badge: 'bg-yellow-100 text-yellow-800',
    progress: 'stroke-yellow-500',
    icon: 'bg-yellow-100 text-yellow-600',
  },
  behind: {
    bg: 'bg-red-50',
    border: 'border-red-200',
    text: 'text-red-800',
    badge: 'bg-red-100 text-red-800',
    progress: 'stroke-red-500',
    icon: 'bg-red-100 text-red-600',
  },
  achieved: {
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    text: 'text-emerald-800',
    badge: 'bg-emerald-100 text-emerald-800',
    progress: 'stroke-emerald-500',
    icon: 'bg-emerald-100 text-emerald-600',
  },
};

const StatusLabels = {
  on_track: 'ON TRACK',
  close_to_target: 'CLOSE TO TARGET',
  needs_attention: 'NEEDS ATTENTION',
  at_risk: 'AT RISK',
  behind: 'BEHIND',
  achieved: 'ACHIEVED',
};

export default function OKRSnapshotCard({ 
  okrData, 
  showDetails = false, 
  onDetailsClick,
  className = ''
}: OKRSnapshotCardProps) {
  const IconComponent = IconMap[okrData.icon as keyof typeof IconMap] || Target;
  
  // Get metric-specific colors first, then fall back to type-based colors
  const metricKey = okrData.title.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z_]/g, '');
  const metricColors = MetricSpecificColors[metricKey as keyof typeof MetricSpecificColors] || 
                       MetricTypeColors[okrData.metric_type] || 
                       MetricTypeColors.conversions;
                       
  const statusColors = StatusColors[okrData.status] || StatusColors.on_track;
  const statusLabel = StatusLabels[okrData.status] || 'ON TRACK';

  const formatValue = (value: number, unitType: string) => {
    switch (unitType) {
      case 'currency':
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
          notation: value >= 1000000 ? 'compact' : 'standard',
        }).format(value);
      case 'percentage':
        return `${value.toFixed(1)}%`;
      case 'count':
        return new Intl.NumberFormat('en-US', {
          notation: value >= 1000 ? 'compact' : 'standard',
        }).format(value);
      default:
        return value.toString();
    }
  };

  const formatChange = (amount: number, percentage: number, unitType: string) => {
    const formattedAmount = formatValue(Math.abs(amount), unitType);
    const sign = amount >= 0 ? '+' : '-';
    const absPercentage = Math.abs(percentage);
    
    return `${sign}${formattedAmount} (${sign}${absPercentage.toFixed(1)}%)`;
  };

  const circumference = 2 * Math.PI * 36; // radius = 36
  const strokeDashoffset = circumference - (okrData.progress_percentage / 100) * circumference;

  return (
    <div 
      className={`
        relative rounded-xl border ${metricColors.border} bg-white p-6 shadow-sm
        ${onDetailsClick ? 'cursor-pointer hover:shadow-xl hover:scale-[1.02]' : ''} 
        transition-all duration-300 ${className}
      `}
      onClick={onDetailsClick}
    >
      {/* Colored top border accent */}
      <div className={`absolute left-0 top-0 right-0 h-1 ${metricColors.accent} rounded-t-xl`} />
      
      <div className="flex items-start justify-between mb-6">
        {/* Icon with larger, more distinctive design */}
        <div className={`w-14 h-14 rounded-xl ${metricColors.icon} flex items-center justify-center flex-shrink-0 shadow-sm`}>
          <IconComponent className="w-7 h-7" />
        </div>
        
        {/* Status Badge with better contrast */}
        <span className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wide ${statusColors.badge} shadow-sm`}>
          {statusLabel}
        </span>
      </div>

      {/* Title with better typography */}
      <h3 className="font-bold text-xl text-gray-900 mb-3 line-clamp-2 leading-tight">
        {okrData.title}
      </h3>

      {/* Values and Progress with improved layout */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex-1">
          <div className="text-3xl font-extrabold text-gray-900 mb-2">
            {formatValue(okrData.current_value, okrData.unit_type)}
          </div>
          <div className="text-sm font-medium text-gray-600">
            Target: <span className="font-semibold text-gray-800">{formatValue(okrData.target_value, okrData.unit_type)}</span>
          </div>
        </div>
        
        {/* Enhanced Circular Progress */}
        <div className="relative w-24 h-24 flex-shrink-0">
          <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 96 96">
            {/* Background circle */}
            <circle
              cx="48"
              cy="48"
              r="40"
              stroke="currentColor"
              strokeWidth="8"
              fill="none"
              className="text-gray-200"
            />
            {/* Progress circle */}
            <circle
              cx="48"
              cy="48"
              r="40"
              stroke="currentColor"
              strokeWidth="8"
              fill="none"
              strokeDasharray={2 * Math.PI * 40}
              strokeDashoffset={2 * Math.PI * 40 - (okrData.progress_percentage / 100) * 2 * Math.PI * 40}
              strokeLinecap="round"
              className={metricColors.progress}
              style={{
                transition: 'stroke-dashoffset 1.2s ease-in-out',
              }}
            />
          </svg>
          {/* Progress percentage */}
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-base font-bold text-gray-900">
              {okrData.progress_percentage.toFixed(0)}%
            </span>
          </div>
        </div>
      </div>

      {/* Enhanced bottom section */}
      <div className="space-y-3">
        {/* Change Indicator */}
        <div className="flex items-center space-x-2">
          <div className={`p-1 rounded-full ${
            okrData.change_percentage >= 0 ? 'bg-green-100' : 'bg-red-100'
          }`}>
            {okrData.change_percentage >= 0 ? (
              <TrendingUp className="w-4 h-4 text-green-600" />
            ) : (
              <TrendingDown className="w-4 h-4 text-red-600" />
            )}
          </div>
          <span className={`text-sm font-semibold ${
            okrData.change_percentage >= 0 ? 'text-green-700' : 'text-red-700'
          }`}>
            {formatChange(okrData.change_amount, okrData.change_percentage, okrData.unit_type)}
          </span>
        </div>
        
        {/* Bottom row: Confidence Score */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
          <div className="text-xs text-gray-500 uppercase tracking-wide font-medium">
            Confidence Score
          </div>
          <div className="flex items-center space-x-1">
            <div className={`text-sm font-bold ${metricColors.text}`}>{okrData.confidence_score}/10</div>
            <div className="flex space-x-0.5">
              {[...Array(10)].map((_, i) => (
                <div
                  key={i}
                  className={`w-1.5 h-1.5 rounded-full ${
                    i < okrData.confidence_score ? metricColors.accent : 'bg-gray-200'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Show details indicator */}
      {showDetails && (
        <div className="absolute top-2 right-2 w-2 h-2 bg-blue-500 rounded-full" />
      )}
    </div>
  );
}