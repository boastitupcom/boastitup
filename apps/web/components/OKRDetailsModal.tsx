// apps/web/components/OKRDetailsModal.tsx
'use client';

import React from 'react';
import { X } from 'lucide-react';
import type { OKRSnapshot } from '@boastitup/types';

interface OKRDetailsModalProps {
  okr: OKRSnapshot | null;
  isOpen: boolean;
  onClose: () => void;
}

const StatusColors = {
  on_track: {
    bg: 'bg-green-50',
    text: 'text-green-800',
    badge: 'bg-green-100 text-green-800',
  },
  close_to_target: {
    bg: 'bg-orange-50',
    text: 'text-orange-800',
    badge: 'bg-orange-100 text-orange-800',
  },
  needs_attention: {
    bg: 'bg-red-50',
    text: 'text-red-800',
    badge: 'bg-red-100 text-red-800',
  },
  at_risk: {
    bg: 'bg-yellow-50',
    text: 'text-yellow-800',
    badge: 'bg-yellow-100 text-yellow-800',
  },
  behind: {
    bg: 'bg-red-50',
    text: 'text-red-800',
    badge: 'bg-red-100 text-red-800',
  },
  achieved: {
    bg: 'bg-emerald-50',
    text: 'text-emerald-800',
    badge: 'bg-emerald-100 text-emerald-800',
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

export default function OKRDetailsModal({ okr, isOpen, onClose }: OKRDetailsModalProps) {
  if (!isOpen || !okr) return null;

  const colors = StatusColors[okr.status] || StatusColors.on_track;
  const statusLabel = StatusLabels[okr.status] || 'ON TRACK';

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
              {okr.title} - Details
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
                {formatValue(okr.current_value, okr.unit_type)}
              </div>
              <div className="text-lg text-gray-600">
                Target: {formatValue(okr.target_value, okr.unit_type)}
              </div>
            </div>

            {/* Progress and Status */}
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Progress</span>
                  <span className="text-sm font-bold text-gray-900">
                    {okr.progress_percentage.toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="h-3 bg-blue-500 rounded-full transition-all duration-300"
                    style={{
                      width: `${Math.min(okr.progress_percentage, 100)}%`,
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
                <div className="text-sm text-gray-600 mb-1">Change vs Last Period</div>
                <div className={`text-lg font-bold ${
                  okr.change_percentage >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {formatChange(okr.change_amount, okr.change_percentage, okr.unit_type)}
                </div>
              </div>

              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-600 mb-1">Confidence Score</div>
                <div className="text-lg font-bold text-gray-900">
                  {okr.confidence_score}/10
                </div>
              </div>
            </div>

            {/* Additional Details */}
            <div className="space-y-3 pt-4 border-t border-gray-200">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700">Metric Type:</span>
                <span className="text-sm text-gray-900 capitalize">{okr.metric_type}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700">Days Remaining:</span>
                <span className="text-sm text-gray-900">
                  {okr.days_remaining} days
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700">Target Date:</span>
                <span className="text-sm text-gray-900">
                  {formatDate(okr.target_date)}
                </span>
              </div>
            </div>

            {/* Description */}
            <div className="pt-4 border-t border-gray-200">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Description</h3>
              <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                {okr.description}
              </p>
            </div>

            {/* Insights based on status */}
            <div className="pt-4 border-t border-gray-200">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Performance Insights</h3>
              <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
                {okr.status === 'achieved' ? 
                  "🎉 Congratulations! You've achieved this OKR. Consider setting a more ambitious target for the next period." :
                  okr.status === 'close_to_target' ? 
                  "🚀 You're very close to your target! A final push should get you there." :
                  okr.status === 'on_track' ? 
                  "✨ Great progress! You're on track to meet your target if you maintain current performance." :
                  okr.status === 'at_risk' ? 
                  "⚠️ Performance is below expected pace. Consider reviewing strategy or increasing efforts." :
                  "🚨 Urgent attention needed. Current progress suggests the target won't be met without significant changes."
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