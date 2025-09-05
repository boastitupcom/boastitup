"use client";
import React, { useState, useRef, useEffect } from 'react';
import { Star, MoreVertical, Target, Clock, TrendingUp, TrendingDown, Minus, ChevronDown, ChevronUp, Link, Play, Users } from 'lucide-react';

const InsightsDashboard = () => {
  // Real data from CSV - 3 insights with 9 actions (3 each)
  const dummyData = [
    {
      // Insight 1: Branded Search Volume Growth
      insight_id: "fb3c6b83-a1ea-4788-bf2d-7e7974666f12",
      insight_category: "awareness",
      insight_title: "Branded Search Volume: +5,000",
      insight_description: "Branded search volume shows strong growth at ~5,000 monthly searches with a +120% YoY increase, indicating growing brand awareness and interest.",
      platform: "search",
      confidence_score: 0.85,
      impact_score: 8,
      percentage_change: 1.20,
      priority_display: "HIGH PRIORITY",
      created_at: "2025-08-29T03:50:00Z",
      
      actions: [
        {
          action_id: "fb3c6b83-a1ea-4788-bf2d-7e7974666f12_1",
          action_text: "Capitalize on search momentum",
          action_priority: "high",
          stage: "new",
          saved_at: null
        },
        {
          action_id: "fb3c6b83-a1ea-4788-bf2d-7e7974666f12_2",
          action_text: "Expand branded content strategy",
          action_priority: "high",
          stage: "new",
          saved_at: null
        },
        {
          action_id: "fb3c6b83-a1ea-4788-bf2d-7e7974666f12_3",
          action_text: "Track and protect brand terms",
          action_priority: "medium",
          stage: "viewed",
          saved_at: null
        }
      ]
    },
    {
      // Insight 2: Social Media Engagement Performance
      insight_id: "ab2c5d74-b2fb-5899-cf3e-8f8085777e23",
      insight_category: "awareness",
      insight_title: "Social Media Reach: ~14,000 followers (3.2% engagement)",
      insight_description: "Instagram following of ~14,000 followers with 3.2% engagement rate shows moderate social presence with room for improvement.",
      platform: "instagram",
      confidence_score: 0.75,
      impact_score: 6,
      percentage_change: 0.032,
      priority_display: "MEDIUM PRIORITY",
      created_at: "2025-08-28T10:30:00Z",
      
      actions: [
        {
          action_id: "ab2c5d74-b2fb-5899-cf3e-8f8085777e24",
          action_text: "Enhance Instagram content strategy",
          action_priority: "high",
          stage: "selected_for_action",
          saved_at: "2025-08-29T08:00:00Z"
        },
        {
          action_id: "ab2c5d74-b2fb-5899-cf3e-8f8085777e25",
          action_text: "Launch Instagram growth campaign",
          action_priority: "medium",
          stage: "in_progress",
          saved_at: null
        },
        {
          action_id: "ab2c5d74-b2fb-5899-cf3e-8f8085777e26",
          action_text: "Optimize posting strategy",
          action_priority: "medium",
          stage: "new",
          saved_at: null
        }
      ]
    },
    {
      // Insight 3: Significant Gap vs Competitors
      insight_id: "cd3d6e85-c3gc-6910-dg4f-9g9196888f34",
      insight_category: "awareness",
      insight_title: "Competitor Comparison: Nike (-450k), Adidas (-350k) (Significant Gap)",
      insight_description: "Competitor comparison shows significant gap with Nike (~450k) and Adidas (~350k) followers, indicating major opportunity for growth.",
      platform: "multi_platform",
      confidence_score: 0.90,
      impact_score: 9,
      percentage_change: null,
      priority_display: "HIGH PRIORITY",
      created_at: "2025-08-27T15:45:00Z",
      
      actions: [
        {
          action_id: "cd3d6e85-c3gc-6910-dg4f-9g9196888f35",
          action_text: "Launch aggressive follower acquisition",
          action_priority: "high",
          stage: "actioned",
          saved_at: "2025-08-28T12:00:00Z"
        },
        {
          action_id: "cd3d6e85-c3gc-6910-dg4f-9g9196888f36",
          action_text: "Invest in viral content creation",
          action_priority: "high",
          stage: "in_progress",
          saved_at: "2025-08-28T14:00:00Z"
        },
        {
          action_id: "cd3d6e85-c3gc-6910-dg4f-9g9196888f37",
          action_text: "Strategic influencer partnerships",
          action_priority: "medium",
          stage: "selected_for_action",
          saved_at: null
        }
      ]
    }
  ];

  const [insights, setInsights] = useState(dummyData);
  const [expandedCards, setExpandedCards] = useState(new Set());
  const [dropdownOpen, setDropdownOpen] = useState(null);

  // Helper functions
  const getCategoryColor = (category) => {
    const colors = {
      trust: "bg-purple-100 text-purple-800",
      awareness: "bg-blue-100 text-blue-800",
      sentiment: "bg-green-100 text-green-800",
      consideration: "bg-orange-100 text-orange-800"
    };
    return colors[category] || "bg-gray-100 text-gray-800";
  };

  const getPriorityColor = (priority) => {
    const colors = {
      "HIGH PRIORITY": "bg-red-100 text-red-800",
      "MEDIUM PRIORITY": "bg-orange-100 text-orange-800",
      "LOW PRIORITY": "bg-blue-100 text-blue-800"
    };
    return colors[priority] || "bg-gray-100 text-gray-800";
  };

  const getStageColor = (stage) => {
    const colors = {
      new: "bg-blue-100 text-blue-800",
      viewed: "bg-gray-100 text-gray-800",
      selected_for_action: "bg-yellow-100 text-yellow-800",
      in_progress: "bg-orange-100 text-orange-800",
      actioned: "bg-green-100 text-green-800"
    };
    return colors[stage] || "bg-gray-100 text-gray-800";
  };

  const getActionPriorityColor = (priority) => {
    const colors = {
      high: "bg-red-100 text-red-800",
      medium: "bg-orange-100 text-orange-800",
      low: "bg-blue-100 text-blue-800"
    };
    return colors[priority] || "bg-gray-100 text-gray-800";
  };

  const getTrendIcon = (percentage_change) => {
    if (!percentage_change) return <Minus className="w-4 h-4 text-gray-500" />;
    if (percentage_change > 0) return <TrendingUp className="w-4 h-4 text-green-500" />;
    return <TrendingDown className="w-4 h-4 text-red-500" />;
  };

  const getDaysOld = (created_at) => {
    const now = new Date();
    const created = new Date(created_at);
    const diffTime = Math.abs(now - created);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    return `${diffDays} days ago`;
  };

  const toggleCardExpansion = (insightId) => {
    const newExpanded = new Set(expandedCards);
    if (newExpanded.has(insightId)) {
      newExpanded.delete(insightId);
    } else {
      newExpanded.add(insightId);
    }
    setExpandedCards(newExpanded);
  };

  const handleActionSave = (insightId, actionId) => {
    setInsights(prevInsights => 
      prevInsights.map(insight => {
        if (insight.insight_id === insightId) {
          return {
            ...insight,
            actions: insight.actions.map(action => 
              action.action_id === actionId 
                ? { ...action, saved_at: new Date().toISOString() }
                : action
            )
          };
        }
        return insight;
      })
    );
  };

  const handleDropdownAction = (insightId, actionId, actionType) => {
    setInsights(prevInsights => 
      prevInsights.map(insight => {
        if (insight.insight_id === insightId) {
          if (actionType === 'link_to_okr') {
            // Update master insight's OKR
            return { ...insight, okr_objective_id: 'okr_' + Date.now() };
          } else {
            // Update specific action
            return {
              ...insight,
              actions: insight.actions.map(action => 
                action.action_id === actionId 
                  ? { 
                      ...action, 
                      stage: actionType === 'select' ? 'selected_for_action' :
                             actionType === 'progress' ? 'in_progress' :
                             actionType === 'campaign' ? 'assigned_to_campaign' : action.stage,
                      assigned_to_campaign_id: actionType === 'campaign' ? 'campaign_' + Date.now() : action.assigned_to_campaign_id
                    }
                  : action
              )
            };
          }
        }
        return insight;
      })
    );
    setDropdownOpen(null);
  };

  const toggleDropdown = (actionId) => {
    setDropdownOpen(dropdownOpen === actionId ? null : actionId);
  };

  const handleStageChange = (insightId, actionId, newStage) => {
    setInsights(prevInsights => 
      prevInsights.map(insight => {
        if (insight.insight_id === insightId) {
          return {
            ...insight,
            actions: insight.actions.map(action => 
              action.action_id === actionId 
                ? { ...action, stage: newStage }
                : action
            )
          };
        }
        return insight;
      })
    );
  };

  return (
    <div className="p-4 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">AI Insights Dashboard</h1>
        
        {/* Single Category Header for All Insights */}
        <div className="bg-blue-600 text-white font-semibold text-sm tracking-wide p-3 rounded-t-lg mb-0">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-white rounded-full"></div>
            <span className="uppercase">Awareness</span>
          </div>
        </div>
        
        {/* 2x2 Grid Layout */}
        <div className="bg-white border border-gray-200 rounded-b-lg shadow-lg overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
            {insights.map((insight, index) => (
              <div key={insight.insight_id} className={`border-gray-200 ${
                index === 0 ? '' : 'border-t lg:border-t-0'
              } ${
                index === 1 ? 'lg:border-l' : ''
              } ${
                index === 2 ? 'border-t lg:border-l-0' : ''
              }`}>
                {/* Compact Card Content */}
                <div className="p-3">
                  {/* Title and Priority */}
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-sm font-semibold text-gray-900 leading-tight flex-1 pr-2">
                      {insight.insight_title}
                    </h3>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium whitespace-nowrap ${getPriorityColor(insight.priority_display)}`}>
                      {insight.priority_display.includes('HIGH') ? 'HIGH' : 
                       insight.priority_display.includes('MEDIUM') ? 'MED' : 'LOW'}
                    </span>
                  </div>
                  
                  {/* Compact Description */}
                  <p className="text-xs text-gray-600 leading-relaxed mb-3 line-clamp-2">
                    {insight.insight_description}
                  </p>

                  {/* Compact Metrics Row */}
                  <div className="flex items-center justify-between mb-3 text-xs">
                    <div className="flex items-center space-x-1">
                      <span className="text-gray-500">Confidence:</span>
                      <div className="w-8 bg-gray-200 rounded-full h-1">
                        <div className="bg-blue-500 h-1 rounded-full" style={{width: `${insight.confidence_score * 100}%`}}></div>
                      </div>
                      <span className="text-gray-700 font-medium">{Math.round(insight.confidence_score * 100)}%</span>
                    </div>
                    
                    <div className="flex items-center space-x-1">
                      <span className="text-gray-500">Impact:</span>
                      <span className={`font-medium ${
                        insight.impact_score >= 8 ? 'text-red-600' : 
                        insight.impact_score >= 5 ? 'text-orange-600' : 'text-blue-600'
                      }`}>
                        {insight.impact_score >= 8 ? 'High' : 
                         insight.impact_score >= 5 ? 'Med' : 'Low'}
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-1">
                      {getTrendIcon(insight.percentage_change)}
                      <span className="text-gray-500">{getDaysOld(insight.created_at)}</span>
                    </div>
                  </div>

                  {/* Compact AI Actions Button */}
                  <button
                    onClick={() => toggleCardExpansion(insight.insight_id)}
                    className="w-full bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded p-2 transition-colors duration-200"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-blue-700">
                        🤖 AI Suggested Actions ({insight.actions.length})
                      </span>
                      {expandedCards.has(insight.insight_id) ? 
                        <ChevronUp className="w-3 h-3 text-blue-500" /> : 
                        <ChevronDown className="w-3 h-3 text-blue-500" />
                      }
                    </div>
                  </button>
                </div>

                {/* Expandable Actions Section */}
                {expandedCards.has(insight.insight_id) && (
                  <div className="border-t border-gray-100 bg-gray-50">
                    <div className="p-3 space-y-2">
                      {insight.actions.map((action) => (
                        <div key={action.action_id} className="bg-white rounded p-2 border border-gray-200">
                          {/* Compact Action Header */}
                          <div className="flex items-start justify-between mb-1">
                            <div className="flex-1 pr-2">
                              <div className="flex items-center space-x-1 mb-1">
                                <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium ${getActionPriorityColor(action.action_priority)}`}>
                                  {action.action_priority.charAt(0).toUpperCase() + action.action_priority.slice(1)}
                                </span>
                                <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium ${getStageColor(action.stage)}`}>
                                  {action.stage.replace('_', ' ')}
                                </span>
                              </div>
                              <h4 className="font-medium text-xs text-gray-900 leading-tight">
                                {action.action_text}
                              </h4>
                            </div>
                            
                            {/* Compact Action Controls */}
                            <div className="flex items-center space-x-1">
                              <button
                                onClick={() => handleActionSave(insight.insight_id, action.action_id)}
                                className={`p-1 rounded hover:bg-gray-100 transition-colors ${action.saved_at ? 'text-yellow-500' : 'text-gray-400'}`}
                                title="Save Action"
                              >
                                <Star className="w-3 h-3" fill={action.saved_at ? 'currentColor' : 'none'} />
                              </button>
                              
                              <div className="relative">
                                <button 
                                  onClick={() => toggleDropdown(action.action_id)}
                                  className="p-1 rounded hover:bg-gray-100 transition-colors text-gray-400"
                                  title="Action Options"
                                >
                                  <MoreVertical className="w-3 h-3" />
                                </button>
                                
                                {/* Compact Dropdown Menu */}
                                {dropdownOpen === action.action_id && (
                                  <div className="absolute right-0 top-full mt-1 w-40 bg-white rounded shadow-lg border border-gray-200 py-1 z-10">
                                    <button
                                      onClick={() => handleDropdownAction(insight.insight_id, action.action_id, 'select')}
                                      className="w-full text-left px-2 py-1.5 text-xs text-gray-700 hover:bg-gray-50 flex items-center space-x-1"
                                    >
                                      <Target className="w-3 h-3" />
                                      <span>Select for Action</span>
                                    </button>
                                    <button
                                      onClick={() => handleDropdownAction(insight.insight_id, action.action_id, 'progress')}
                                      className="w-full text-left px-2 py-1.5 text-xs text-gray-700 hover:bg-gray-50 flex items-center space-x-1"
                                    >
                                      <Play className="w-3 h-3" />
                                      <span>Mark In Progress</span>
                                    </button>
                                    <button
                                      onClick={() => handleDropdownAction(insight.insight_id, action.action_id, 'link_to_okr')}
                                      className="w-full text-left px-2 py-1.5 text-xs text-gray-700 hover:bg-gray-50 flex items-center space-x-1"
                                    >
                                      <Link className="w-3 h-3" />
                                      <span>Link to OKR</span>
                                    </button>
                                    <button
                                      onClick={() => handleDropdownAction(insight.insight_id, action.action_id, 'campaign')}
                                      className="w-full text-left px-2 py-1.5 text-xs text-gray-700 hover:bg-gray-50 flex items-center space-x-1"
                                    >
                                      <Users className="w-3 h-3" />
                                      <span>Assign to Campaign</span>
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          {/* Compact Action Footer */}
                          <div className="flex items-center justify-between pt-1 border-t border-gray-100">
                            <div className="flex items-center space-x-1">
                              <input
                                type="checkbox"
                                checked={action.stage === 'selected_for_action' || action.stage === 'in_progress' || action.stage === 'actioned'}
                                onChange={(e) => handleStageChange(
                                  insight.insight_id, 
                                  action.action_id, 
                                  e.target.checked ? 'selected_for_action' : 'new'
                                )}
                                className="w-3 h-3 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                              />
                              <span className="text-xs text-gray-500">Select</span>
                            </div>
                            
                            <div className="flex items-center space-x-1">
                              <Clock className="w-3 h-3 text-gray-400" />
                              <span className="text-xs text-gray-500">Today</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InsightsDashboard;