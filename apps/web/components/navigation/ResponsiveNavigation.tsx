'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Zap, 
  TrendingUp, 
  Target, 
  Settings, 
  CheckCircle, 
  ChevronDown, 
  ChevronRight, 
  Menu,
  X,
  Home,
  BarChart2,
  Star,
  Edit,
  MessageSquare,
  Instagram,
  Megaphone,
  BarChart,
  RadioTower,
  Calendar,
  Brain,
  Palette,
  Users,
  Search,
  DollarSign,
  Shield,
  Lightbulb,
  Activity,
  Repeat,
  Clock,
  Building,
  Hash,
  Heart,
  ArrowUp,
  Camera,
  Layout,
  Archive
} from 'lucide-react';

// ChevronLeft icon component
const ChevronLeft = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
  </svg>
);

interface NavigationItem {
  label: string;
  href: string;
  icon: React.ComponentType<any>;
  description: string;
  children?: NavigationItem[];
  status?: 'new' | 'beta' | 'pro';
  badge?: string;
  color?: string;
}

const navigationItems: NavigationItem[] = [
  {
    label: 'Quick Start',
    href: '/workspace/quick-start',
    icon: Zap,
    description: 'Immediate value for time-pressed founders',
    color: 'text-blue-600',
    children: [
      {
        label: "Today's Focus",
        href: '/workspace/quick-start/today',
        icon: Target,
        description: 'AI-prioritized tasks and insights',
        badge: '3 urgent',
        color: 'text-orange-600'
      },
      {
        label: 'Quick Wins',
        href: '/workspace/quick-start/wins',
        icon: CheckCircle,
        description: 'One-click optimizations',
        status: 'new',
        color: 'text-green-600'
      },
      {
        label: 'Performance Snapshot',
        href: '/workspace/quick-start/snapshot',
        icon: Activity,
        description: 'Traffic light system overview',
        color: 'text-purple-600'
      },
      {
        label: 'Action Items',
        href: '/workspace/quick-start/actions',
        icon: CheckCircle,
        description: 'Clear next steps, not just data',
        color: 'text-indigo-600'
      }
    ]
  },
  {
    label: 'OKR Module',
    href: '/workspace/okr',
    icon: Target,
    description: 'Objectives and Key Results tracking',
    color: 'text-emerald-600',
    children: [
      {
        label: 'Dashboard',
        href: '/workspace/okr/dashboard',
        icon: BarChart2,
        description: 'Performance dashboard overview',
        color: 'text-blue-600'
      },
      {
        label: 'Create OKR',
        href: '/workspace/okr/create',
        icon: Target,
        description: 'Set new objectives and key results',
        color: 'text-green-600'
      },
      {
        label: 'Manage OKRs',
        href: '/workspace/okr/manage',
        icon: Settings,
        description: 'Edit and track existing OKRs',
        color: 'text-purple-600'
      }
    ]
  },
  {
    label: 'Growth Tools',
    href: '/workspace/growth-tools',
    icon: TrendingUp,
    description: 'Actionable growth levers',
    color: 'text-green-600',
    children: [
      {
        label: 'Publishing & Scheduling',
        href: '/workspace/growth-tools/publishing',
        icon: Calendar,
        description: 'Smart calendar and bulk scheduler',
        color: 'text-blue-600'
      },
      {
        label: 'Engagement Hub',
        href: '/workspace/growth-tools/engagement',
        icon: MessageSquare,
        description: 'Unified inbox and community management',
        color: 'text-purple-600'
      },
      {
        label: 'Performance Tracking',
        href: '/workspace/growth-tools/performance',
        icon: BarChart,
        description: 'Simple dashboard with competitor benchmarking',
        color: 'text-orange-600'
      }
    ]
  },
  {
    label: 'Content Studio',
    href: '/workspace/content-studio',
    icon: Edit,
    description: 'One-stop content creation and optimization',
    color: 'text-purple-600',
    children: [
      {
        label: 'AI Content Assistant',
        href: '/workspace/content-studio/ai-assistant',
        icon: Brain,
        description: 'Multi-platform post generator',
        status: 'new',
        color: 'text-indigo-600'
      },
      {
        label: 'Visual Tools',
        href: '/workspace/content-studio/visual',
        icon: Palette,
        description: 'Canva integration and grid planner',
        color: 'text-pink-600'
      },
      {
        label: 'Content Library',
        href: '/workspace/content-studio/library',
        icon: Archive,
        description: 'Asset management and templates',
        color: 'text-amber-600'
      }
    ]
  },
  {
    label: 'Growth Accelerators',
    href: '/workspace/growth-accelerators',
    icon: ArrowUp,
    description: 'Proactive growth features',
    color: 'text-blue-600',
    children: [
      {
        label: 'SEO Booster',
        href: '/workspace/growth-accelerators/seo',
        icon: Search,
        description: 'Keyword tracker and content gap analysis',
        color: 'text-green-600'
      },
      {
        label: 'Ad Optimizer',
        href: '/workspace/growth-accelerators/ads',
        icon: Megaphone,
        description: 'Ad performance and budget recommendations',
        color: 'text-red-600'
      },
      {
        label: 'Influencer Finder',
        href: '/workspace/growth-accelerators/influencer',
        icon: Users,
        description: 'Micro-influencer discovery and outreach',
        color: 'text-purple-600'
      }
    ]
  },
  {
    label: 'Settings',
    href: '/workspace/settings',
    icon: Settings,
    description: 'Essential controls without complexity',
    color: 'text-gray-600',
    children: [
      {
        label: 'Connections',
        href: '/workspace/settings/connections',
        icon: RadioTower,
        description: 'Social accounts and integrations',
        color: 'text-blue-600'
      },
      {
        label: 'Brand Setup',
        href: '/workspace/settings/brand',
        icon: Building,
        description: 'Brand kit and competitor tracking',
        color: 'text-purple-600'
      },
      {
        label: 'Billing & Plans',
        href: '/workspace/settings/billing',
        icon: DollarSign,
        description: 'Transparent pricing and usage',
        color: 'text-green-600'
      }
    ]
  }
];

export function ResponsiveSidebar() {
  const [isExpanded, setIsExpanded] = useState(true);
  const [expandedItems, setExpandedItems] = useState(new Set(['Quick Start']));
  const [isMobile, setIsMobile] = useState(false);
  const pathname = usePathname();

  // Handle responsive behavior
  useEffect(() => {
    const checkScreenSize = () => {
      const width = window.innerWidth;
      setIsMobile(width < 768);
      // Auto-expand on desktop
      if (width >= 1024) {
        setIsExpanded(true);
      } else if (width < 768) {
        setIsExpanded(false);
      }
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  const toggleExpanded = (label: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(label)) {
      newExpanded.delete(label);
    } else {
      newExpanded.add(label);
    }
    setExpandedItems(newExpanded);
  };

  const isActive = (href: string) => {
    if (!href) return false;
    return pathname === href || pathname.startsWith(href + '/');
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'new': return 'bg-emerald-100 text-emerald-700 border border-emerald-200';
      case 'beta': return 'bg-blue-100 text-blue-700 border border-blue-200';
      case 'pro': return 'bg-purple-100 text-purple-700 border border-purple-200';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const handleNavClick = (href: string, label: string, hasChildren: boolean) => {
    if (hasChildren && isExpanded) {
      toggleExpanded(label);
    } else if (href) {
      // Close mobile menu after navigation
      if (isMobile) {
        setIsExpanded(false);
      }
    }
  };

  const renderNavItem = (item: NavigationItem, level = 0): React.ReactNode => {
    const hasChildren = item.children && item.children.length > 0;
    const isItemExpanded = expandedItems.has(item.label);
    const active = isActive(item.href);
    const Icon = item.icon;

    const navContent = (
      <div
        className={`
          flex items-center justify-between p-3 rounded-xl cursor-pointer
          transition-all duration-200 group relative
          ${active 
            ? 'bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 font-medium shadow-sm border border-blue-100' 
            : 'hover:bg-gray-50 text-gray-700 hover:shadow-sm'
          }
          ${level === 0 ? 'mb-1' : 'mb-0.5'}
          ${!isExpanded && level === 0 ? 'justify-center' : ''}
        `}
        onClick={() => handleNavClick(item.href, item.label, hasChildren)}
      >
        <div className="flex items-center flex-1 min-w-0">
          <div className={`flex-shrink-0 ${!isExpanded && level === 0 ? 'mx-auto' : ''}`}>
            <Icon className={`
              ${isExpanded ? 'w-5 h-5' : 'w-6 h-6'} 
              transition-all duration-200 
              ${item.color || 'text-gray-500'}
              ${active ? 'text-blue-600' : ''}
            `} />
          </div>
          
          {isExpanded && (
            <div className="flex-1 ml-3 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`text-sm ${level === 0 ? 'font-semibold' : 'font-medium'} truncate`}>
                  {item.label}
                </span>
                {item.status && (
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getStatusColor(item.status)} flex-shrink-0`}>
                    {item.status.toUpperCase()}
                  </span>
                )}
                {item.badge && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-600 border border-red-200 font-medium flex-shrink-0">
                    {item.badge}
                  </span>
                )}
              </div>
              {item.description && level < 2 && (
                <p className="text-xs text-gray-500 mt-0.5 truncate">
                  {item.description}
                </p>
              )}
            </div>
          )}
        </div>
        
        {hasChildren && isExpanded && (
          <div className="ml-2 flex-shrink-0">
            {isItemExpanded ? 
              <ChevronDown className="w-4 h-4 text-gray-400" /> : 
              <ChevronRight className="w-4 h-4 text-gray-400" />
            }
          </div>
        )}
      </div>
    );

    return (
      <div key={item.label} className={level > 0 ? 'ml-6 border-l border-gray-100 pl-4' : ''}>
        {hasChildren && !isExpanded ? (
          // For collapsed state with children, don't use Link
          navContent
        ) : (
          // Use Next.js Link for navigation
          <Link href={item.href}>
            {navContent}
          </Link>
        )}
        
        {hasChildren && isItemExpanded && isExpanded && (
          <div className="mt-2 space-y-1">
            {item.children!.map(child => renderNavItem(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobile && isExpanded && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsExpanded(false)}
        />
      )}

      {/* Mobile Menu Button */}
      {isMobile && !isExpanded && (
        <button
          onClick={() => setIsExpanded(true)}
          className="fixed top-4 left-4 z-50 w-12 h-12 bg-white border border-gray-300 rounded-xl shadow-lg hover:shadow-xl transition-shadow flex items-center justify-center"
        >
          <Menu className="w-6 h-6 text-gray-600" />
        </button>
      )}

      {/* Sidebar */}
      <aside 
        className={`
          flex flex-col bg-white border-r border-gray-200 h-screen z-50
          transition-all duration-300 ease-in-out
          ${isMobile 
            ? `fixed inset-y-0 left-0 ${isExpanded ? 'w-80' : 'w-0 overflow-hidden'}` 
            : `relative ${isExpanded ? 'w-80' : 'w-16'}`
          }
        `}
      >
        {/* Header */}
        <div className={`border-b border-gray-200 ${isExpanded ? 'p-6' : 'p-4'} transition-all duration-300`}>
          {isExpanded ? (
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  BoostItUp
                </h1>
                <p className="text-sm text-gray-500 mt-1">Growth tools that work</p>
              </div>
              {isMobile && (
                <button
                  onClick={() => setIsExpanded(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
          ) : (
            <div className="flex justify-center">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Home className="w-5 h-5 text-white" />
              </div>
            </div>
          )}
        </div>
        
        {/* Toggle Button - Only show on tablet */}
        {!isMobile && (
          <div className="absolute -right-3 top-20 z-10">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="w-6 h-6 bg-white border border-gray-300 rounded-full shadow-md hover:shadow-lg transition-shadow flex items-center justify-center"
            >
              {isExpanded ? (
                <ChevronLeft className="w-3 h-3 text-gray-600" />
              ) : (
                <ChevronRight className="w-3 h-3 text-gray-600" />
              )}
            </button>
          </div>
        )}
        
        {/* Navigation */}
        <nav className={`flex-1 overflow-y-auto ${isExpanded ? 'p-4' : 'p-2'} transition-all duration-300 space-y-1`}>
          {navigationItems.map(item => renderNavItem(item))}
        </nav>
        
        {/* Footer */}
        {isExpanded && (
          <div className="p-4 border-t border-gray-200">
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 border border-blue-100">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-gray-700">Current Plan</span>
                <span className="text-xs px-3 py-1 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-full font-medium">
                  GROWTH
                </span>
              </div>
              <div className="text-xs text-gray-500 mb-3">
                7 days left in trial • 3/10 accounts used
              </div>
              <button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm font-semibold py-2.5 px-4 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-sm hover:shadow-md">
                Upgrade to Pro →
              </button>
            </div>
          </div>
        )}
      </aside>
    </>
  );
}