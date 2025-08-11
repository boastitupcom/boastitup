// apps/web/components/KPIDetailsModal.tsx
'use client';

import React from 'react';
import { X } from 'lucide-react';
import type { KPIScorecard } from '@boastitup/types';

interface KPIDetailsModalProps {
  kpi: KPIScorecard | null;
  isOpen: boolean;
  onClose: () => void;
}

const StatusColors = {
  above_target: {
    bg: 'bg-green-50',
    text: 'text-green-800',
    badge: 'bg-green-100 text-green-800',
  },
  on_target: {
    bg: 'bg-blue-50',
    text: 'text-blue-800',
    badge: 'bg-blue-100 text-blue-800',
  },
  below_target: {
    bg: 'bg-orange-50',
    text: 'text-orange-800',
    badge: 'bg-orange-100 text-orange-800',
  },
  critical: {
    bg: 'bg-red-50',
    text: 'text-red-800',
    badge: 'bg-red-100 text-red-800',
  },
};

const StatusLabels = {
  above_target: 'ABOVE TARGET',
  on_target: 'ON TRACK', 
  below_target: 'BELOW TARGET',
  critical: 'CRITICAL',
};

export default function KPIDetailsModal({ kpi, isOpen, onClose }: KPIDetailsModalProps) {
  if (!isOpen || !kpi) return null;

  const colors = StatusColors[kpi.status] || StatusColors.on_target;
  const statusLabel = StatusLabels[kpi.status] || 'ON TRACK';

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
    const sign = amount >= 0 ? '+' : '';
    const absPercentage = Math.abs(percentage);
    
    return `${sign}${formattedAmount} (${sign}${absPercentage.toFixed(1)}%)`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-50 transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              {kpi.display_name} - Details
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              aria-label="Close modal"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Current Value - Prominently displayed */}
            <div className="text-center">
              <div className="text-4xl font-bold text-gray-900 mb-2">
                {formatValue(kpi.current_value, kpi.unit_type)}
              </div>
              <div className="text-lg text-gray-600">
                Target: {formatValue(kpi.target_value, kpi.unit_type)}
              </div>
            </div>

            {/* Progress and Status */}
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Progress</span>
                  <span className="text-sm font-bold text-gray-900">
                    {kpi.progress_percentage.toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="h-3 bg-blue-500 rounded-full transition-all duration-300"
                    style={{
                      width: `${Math.min(kpi.progress_percentage, 100)}%`,
                    }}
                  />
                </div>
              </div>

              {/* Status Badge */}
              <div className="flex justify-center">
                <span className={`px-4 py-2 rounded-full text-sm font-semibold ${colors.badge}`}>
                  {statusLabel}
                </span>
              </div>
            </div>

            {/* Key Metrics Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-600 mb-1">Change vs Last Month</div>
                <div className={`text-lg font-bold ${
                  kpi.change_percentage >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {formatChange(kpi.change_amount, kpi.change_percentage, kpi.unit_type)}
                </div>
              </div>

              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-600 mb-1">Previous Value</div>
                <div className="text-lg font-bold text-gray-900">
                  {formatValue(kpi.previous_value, kpi.unit_type)}
                </div>
              </div>
            </div>

            {/* Additional Details */}
            <div className="space-y-3 pt-4 border-t border-gray-200">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700">Category:</span>
                <span className="text-sm text-gray-900 capitalize">{kpi.category}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700">Trend Direction:</span>
                <span className={`text-sm font-medium capitalize ${
                  kpi.trend_direction === 'up' ? 'text-green-600' : 
                  kpi.trend_direction === 'down' ? 'text-red-600' : 'text-gray-600'
                }`}>
                  {kpi.trend_direction}
                </span>
              </div>

              {kpi.alert_level !== 'none' && (
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700">Alert Level:</span>
                  <span className={`text-sm font-medium capitalize px-2 py-1 rounded ${
                    kpi.alert_level === 'warning' ? 'bg-yellow-100 text-yellow-800' : 
                    'bg-red-100 text-red-800'
                  }`}>
                    {kpi.alert_level}
                  </span>
                </div>
              )}

              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700">Period:</span>
                <span className="text-sm text-gray-900">
                  {formatDate(kpi.measurement_date)}
                </span>
              </div>
            </div>

            {/* Insights or Recommendations (placeholder) */}
            <div className="pt-4 border-t border-gray-200">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Performance Insights</h3>
              <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
                {kpi.progress_percentage >= 100 ? 
                  "🎉 Excellent! You've exceeded your target. Consider setting a more ambitious goal for next period." :
                  kpi.progress_percentage >= 80 ? 
                  "✨ You're on track to meet your target. Keep up the good work!" :
                  kpi.progress_percentage >= 60 ? 
                  "⚠️ Progress is slower than expected. Consider reviewing your strategy or tactics." :
                  "🚨 Significant attention needed to reach your target. Immediate action recommended."
                }
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end p-6 border-t border-gray-200">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </>
  );
}