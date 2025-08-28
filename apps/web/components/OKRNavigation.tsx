"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  BarChart3, 
  Plus, 
  Settings, 
  Target,
  ChevronRight,
  Home
} from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
  Button,
  Badge
} from "@boastitup/ui";
import { cn } from "@boastitup/ui";

// Navigation structure from story.txt lines 511-515
const okrNavigation = [
  { 
    label: 'Dashboard', 
    href: '/workspace/okr/dashboard', 
    icon: BarChart3,
    description: 'Analytics and performance insights'
  },
  { 
    label: 'Create OKRs', 
    href: '/workspace/okr/create', 
    icon: Plus,
    description: 'Build new objectives with AI templates'
  },
  { 
    label: 'Manage OKRs', 
    href: '/workspace/okr/manage', 
    icon: Settings,
    description: 'Edit, organize, and track objectives'
  }
];

interface OKRNavigationProps {
  className?: string;
  showDescriptions?: boolean;
  variant?: 'horizontal' | 'vertical' | 'breadcrumb';
}

export function OKRNavigation({ 
  className, 
  showDescriptions = false, 
  variant = 'horizontal' 
}: OKRNavigationProps) {
  const pathname = usePathname();

  if (variant === 'breadcrumb') {
    return <OKRBreadcrumb pathname={pathname} className={className} />;
  }

  if (variant === 'vertical') {
    return (
      <nav className={cn("space-y-2", className)}>
        {okrNavigation.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href);
          
          return (
            <Link key={item.href} href={item.href}>
              <div className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors",
                isActive 
                  ? "bg-primary text-primary-foreground" 
                  : "hover:bg-muted text-muted-foreground hover:text-foreground"
              )}>
                <item.icon className="h-4 w-4" />
                <div className="flex-1">
                  <div className="font-medium">{item.label}</div>
                  {showDescriptions && (
                    <div className="text-xs opacity-75">{item.description}</div>
                  )}
                </div>
                {isActive && (
                  <Badge variant="secondary" className="text-xs">
                    Current
                  </Badge>
                )}
              </div>
            </Link>
          );
        })}
      </nav>
    );
  }

  // Default horizontal variant
  return (
    <nav className={cn("flex items-center space-x-1", className)}>
      {okrNavigation.map((item) => {
        const isActive = pathname === item.href || pathname.startsWith(item.href);
        
        return (
          <Button
            key={item.href}
            variant={isActive ? "default" : "ghost"}
            size="sm"
            asChild
            className={cn(
              "flex items-center gap-2",
              isActive && "bg-primary text-primary-foreground"
            )}
          >
            <Link href={item.href}>
              <item.icon className="h-4 w-4" />
              {item.label}
              {isActive && <Badge variant="secondary" className="ml-2 text-xs">Active</Badge>}
            </Link>
          </Button>
        );
      })}
    </nav>
  );
}

// Breadcrumb component for detailed navigation
function OKRBreadcrumb({ pathname, className }: { pathname: string; className?: string }) {
  const getBreadcrumbItems = () => {
    const items = [
      { label: 'Workspace', href: '/workspace', icon: Home },
      { label: 'OKRs', href: '/workspace/okr', icon: Target }
    ];

    // Add specific page based on pathname
    if (pathname.includes('/dashboard')) {
      items.push({ label: 'Dashboard', href: '/workspace/okr/dashboard', icon: BarChart3 });
    } else if (pathname.includes('/create')) {
      items.push({ label: 'Create', href: '/workspace/okr/create', icon: Plus });
    } else if (pathname.includes('/manage')) {
      items.push({ label: 'Manage', href: '/workspace/okr/manage', icon: Settings });
    } else if (pathname.includes('/edit')) {
      items.push({ label: 'Manage', href: '/workspace/okr/manage', icon: Settings });
      items.push({ label: 'Edit', href: pathname, icon: Settings });
    }

    return items;
  };

  const breadcrumbItems = getBreadcrumbItems();

  return (
    <Breadcrumb className={className}>
      <BreadcrumbList>
        {breadcrumbItems.map((item, index) => {
          const isLast = index === breadcrumbItems.length - 1;
          
          return (
            <React.Fragment key={item.href}>
              <BreadcrumbItem>
                {isLast ? (
                  <BreadcrumbPage className="flex items-center gap-2">
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </BreadcrumbPage>
                ) : (
                  <BreadcrumbLink href={item.href} className="flex items-center gap-2">
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
              {!isLast && <BreadcrumbSeparator />}
            </React.Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}

// Quick actions component for common OKR operations
interface OKRQuickActionsProps {
  currentPage?: string;
  className?: string;
}

export function OKRQuickActions({ currentPage, className }: OKRQuickActionsProps) {
  const quickActions = React.useMemo(() => {
    const actions = [];
    
    if (currentPage !== 'dashboard') {
      actions.push({
        label: 'View Dashboard',
        href: '/workspace/okr/dashboard',
        icon: BarChart3,
        variant: 'outline' as const
      });
    }
    
    if (currentPage !== 'create') {
      actions.push({
        label: 'Create OKRs',
        href: '/workspace/okr/create',
        icon: Plus,
        variant: 'default' as const
      });
    }
    
    if (currentPage !== 'manage') {
      actions.push({
        label: 'Manage OKRs',
        href: '/workspace/okr/manage',
        icon: Settings,
        variant: 'outline' as const
      });
    }
    
    return actions;
  }, [currentPage]);

  if (quickActions.length === 0) return null;

  return (
    <div className={cn("flex items-center gap-3", className)}>
      {quickActions.map((action) => (
        <Button
          key={action.href}
          variant={action.variant}
          size="sm"
          asChild
        >
          <Link href={action.href} className="flex items-center gap-2">
            <action.icon className="h-4 w-4" />
            {action.label}
          </Link>
        </Button>
      ))}
    </div>
  );
}

// Context provider for OKR navigation state
interface OKRNavigationContextValue {
  currentSection: string;
  setCurrentSection: (section: string) => void;
  breadcrumb: Array<{ label: string; href: string }>;
  setBreadcrumb: (breadcrumb: Array<{ label: string; href: string }>) => void;
}

const OKRNavigationContext = React.createContext<OKRNavigationContextValue | undefined>(undefined);

export function OKRNavigationProvider({ children }: { children: React.ReactNode }) {
  const [currentSection, setCurrentSection] = React.useState<string>('dashboard');
  const [breadcrumb, setBreadcrumb] = React.useState<Array<{ label: string; href: string }>>([]);

  const value = React.useMemo(() => ({
    currentSection,
    setCurrentSection,
    breadcrumb,
    setBreadcrumb
  }), [currentSection, breadcrumb]);

  return (
    <OKRNavigationContext.Provider value={value}>
      {children}
    </OKRNavigationContext.Provider>
  );
}

export function useOKRNavigation() {
  const context = React.useContext(OKRNavigationContext);
  if (context === undefined) {
    throw new Error('useOKRNavigation must be used within an OKRNavigationProvider');
  }
  return context;
}