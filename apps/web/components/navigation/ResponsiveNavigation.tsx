'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Rocket, 
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
  RadioTower
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
}

const navigationItems: NavigationItem[] = [
  {
    label: 'Launchpad',
    href: '/workspace/analytics',
    icon: Rocket,
    description: 'Analytics and insights dashboard',
    children: [
      {
        label: "Today's Focus",
        href: '/workspace/analytics/today',
        icon: CheckCircle,
        description: 'AI-prioritized tasks and insights',
        badge: '3 urgent'
      },
      {
        label: 'Quick Wins',
        href: '/workspace/analytics/wins',
        icon: CheckCircle,
        description: 'One-click optimizations',
        status: 'new'
      }
    ]
  },
  {
    label: 'Brand Buzz',
    href: '/workspace/brand-buzz',
    icon: RadioTower,
    description: 'Brand monitoring and buzz tracking'
  },
  {
    label: 'Market Details',
    href: '/workspace/market-details',
    icon: BarChart2,
    description: 'Market analysis and competitive insights'
  },
  {
    label: 'Rank Boost',
    href: '/workspace/rank-boost',
    icon: Star,
    description: 'SEO optimization and ranking tools'
  },
  {
    label: 'Content Spark',
    href: '/workspace/content-spark',
    icon: Edit,
    description: 'Content creation and optimization',
    children: [
      {
        label: 'Publishing & Scheduling',
        href: '/workspace/content-spark/publishing',
        icon: CheckCircle,
        description: 'Schedule your content'
      }
    ]
  },
  {
    label: 'Social Vibe',
    href: '/workspace/social-vibe',
    icon: MessageSquare,
    description: 'Social media management'
  },
  {
    label: 'Instagram Analysis',
    href: '/workspace/instagram-analysis',
    icon: Instagram,
    description: 'Instagram insights and analytics',
    status: 'beta'
  },
  {
    label: 'Ad Amplifier',
    href: '/workspace/ad-amplifier',
    icon: Megaphone,
    description: 'Advertisement optimization'
  },
  {
    label: 'Performance',
    href: '/workspace/performance',
    icon: BarChart,
    description: 'Performance metrics and KPIs'
  },
  {
    label: 'Connect Hub',
    href: '/workspace/connect-hub',
    icon: Settings,
    description: 'Settings and integrations'
  }
];

export function ResponsiveSidebar() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [expandedItems, setExpandedItems] = useState(new Set(['Launchpad']));
  const [isMobile, setIsMobile] = useState(false);
  const pathname = usePathname(); // Use Next.js usePathname instead of state

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
      case 'new': return 'bg-green-500 text-white';
      case 'beta': return 'bg-blue-500 text-white';
      case 'pro': return 'bg-purple-500 text-white';
      default: return 'bg-gray-500 text-white';
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
      // No need to manually set path - Next.js handles this
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
          flex items-center justify-between p-3 rounded-lg cursor-pointer
          transition-all duration-200 group
          ${active 
            ? 'bg-blue-50 text-blue-700 font-medium shadow-sm' 
            : 'hover:bg-gray-50 text-gray-700 hover:shadow-sm'
          }
          ${level === 0 ? 'mt-2' : 'mt-1'}
          ${!isExpanded && level === 0 ? 'justify-center' : ''}
        `}
        onClick={() => handleNavClick(item.href, item.label, hasChildren)}
      >
        <div className="flex items-center flex-1 min-w-0">
          <div className={`flex-shrink-0 ${!isExpanded && level === 0 ? 'mx-auto' : ''}`}>
            <Icon className={`${isExpanded ? 'w-5 h-5' : 'w-6 h-6'} transition-all duration-200`} />
          </div>
          
          {isExpanded && (
            <div className="flex-1 ml-3 min-w-0">
              <div className="flex items-center gap-2">
                <span className={`text-sm ${level === 0 ? 'font-semibold' : ''} truncate`}>
                  {item.label}
                </span>
                {item.status && (
                  <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(item.status)} flex-shrink-0`}>
                    {item.status.toUpperCase()}
                  </span>
                )}
                {item.badge && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-600 flex-shrink-0">
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
            {isItemExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </div>
        )}
      </div>
    );

    return (
      <div key={item.label} className={level > 0 ? 'ml-4' : ''}>
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
          <div className="mt-1">
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
          className="fixed top-4 left-4 z-50 w-10 h-10 bg-white border border-gray-300 rounded-lg shadow-md hover:shadow-lg transition-shadow flex items-center justify-center"
        >
          <Menu className="w-5 h-5 text-gray-600" />
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
        <nav className={`flex-1 overflow-y-auto ${isExpanded ? 'p-4' : 'p-2'} transition-all duration-300`}>
          {navigationItems.map(item => renderNavItem(item))}
        </nav>
        
        {/* Footer */}
        {isExpanded && (
          <div className="p-4 border-t border-gray-200">
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Current Plan</span>
                <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full">GROWTH</span>
              </div>
              <div className="text-xs text-gray-500 mb-3">
                7 days left in trial • 3/10 accounts used
              </div>
              <button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm font-medium py-2 px-4 rounded-lg hover:opacity-90 transition-opacity">
                Upgrade to Pro →
              </button>
            </div>
          </div>
        )}
      </aside>
    </>
  );
}