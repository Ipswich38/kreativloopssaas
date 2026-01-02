'use client';

import { Fragment } from 'react';
import { ChevronRight, Home } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

export interface BreadcrumbItem {
  label: string;
  href?: string;
  current?: boolean;
  icon?: React.ComponentType<any>;
}

interface BreadcrumbProps {
  items?: BreadcrumbItem[];
  showHome?: boolean;
  className?: string;
  separator?: React.ReactNode;
  maxItems?: number;
}

// Route configuration for automatic breadcrumbs
const routeConfig: Record<string, { label: string; icon?: React.ComponentType<any> }> = {
  '/dashboard': { label: 'Dashboard', icon: Home },
  '/appointments': { label: 'Appointments' },
  '/appointments/new': { label: 'New Appointment' },
  '/patients': { label: 'Patients' },
  '/patients/new': { label: 'New Patient' },
  '/services': { label: 'Services' },
  '/financial': { label: 'Financial' },
  '/inventory': { label: 'Inventory' },
  '/staff': { label: 'Staff' },
  '/reports': { label: 'Reports' },
  '/settings': { label: 'Settings' },
  '/auth': { label: 'Authentication' },
  '/auth/login': { label: 'Login' }
};

export function Breadcrumb({
  items: customItems,
  showHome = true,
  className,
  separator = <ChevronRight className="h-4 w-4" />,
  maxItems = 5
}: BreadcrumbProps) {
  const pathname = usePathname();

  // Generate breadcrumbs from pathname if no custom items provided
  const items = customItems || generateBreadcrumbsFromPath(pathname, showHome);

  // Limit the number of items shown
  const displayItems = items.length > maxItems
    ? [
        items[0],
        { label: '...', href: undefined },
        ...items.slice(-(maxItems - 2))
      ]
    : items;

  return (
    <nav className={cn('flex items-center space-x-1 text-sm', className)} aria-label="Breadcrumb">
      <ol className="flex items-center space-x-1">
        {displayItems.map((item, index) => {
          const isLast = index === displayItems.length - 1;
          const isCurrent = item.current || isLast;

          return (
            <li key={index} className="flex items-center">
              {index > 0 && (
                <span className="mx-2 text-gray-400" aria-hidden="true">
                  {separator}
                </span>
              )}

              {item.label === '...' ? (
                <span className="text-gray-500 px-2">...</span>
              ) : item.href && !isCurrent ? (
                <Link
                  href={item.href}
                  className="flex items-center space-x-1 text-gray-600 hover:text-gray-900 transition-colors duration-150 rounded-md px-2 py-1 hover:bg-gray-100"
                  aria-current={isCurrent ? 'page' : undefined}
                >
                  {item.icon && <item.icon className="h-4 w-4" />}
                  <span>{item.label}</span>
                </Link>
              ) : (
                <span
                  className={cn(
                    'flex items-center space-x-1 px-2 py-1 rounded-md',
                    isCurrent
                      ? 'text-blue-600 font-medium bg-blue-50'
                      : 'text-gray-500'
                  )}
                  aria-current={isCurrent ? 'page' : undefined}
                >
                  {item.icon && <item.icon className="h-4 w-4" />}
                  <span>{item.label}</span>
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

// Generate breadcrumbs automatically from pathname
function generateBreadcrumbsFromPath(pathname: string, showHome: boolean): BreadcrumbItem[] {
  const segments = pathname.split('/').filter(Boolean);
  const items: BreadcrumbItem[] = [];

  // Add home if requested
  if (showHome && pathname !== '/dashboard') {
    items.push({
      label: 'Dashboard',
      href: '/dashboard',
      icon: Home
    });
  }

  // Build breadcrumbs from path segments
  let currentPath = '';
  segments.forEach((segment, index) => {
    currentPath += `/${segment}`;

    const config = routeConfig[currentPath];
    const isLast = index === segments.length - 1;

    items.push({
      label: config?.label || formatSegment(segment),
      href: isLast ? undefined : currentPath,
      current: isLast,
      icon: config?.icon
    });
  });

  return items;
}

// Format URL segment into readable label
function formatSegment(segment: string): string {
  return segment
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

// Hook for managing breadcrumbs
export function useBreadcrumbs(customItems?: BreadcrumbItem[]) {
  const pathname = usePathname();
  const items = customItems || generateBreadcrumbsFromPath(pathname, true);

  return {
    items,
    currentPage: items[items.length - 1]?.label || 'Page'
  };
}

// Compact breadcrumb for mobile
export function CompactBreadcrumb({ className }: { className?: string }) {
  const { items } = useBreadcrumbs();

  if (items.length <= 1) return null;

  const previousItem = items[items.length - 2];
  const currentItem = items[items.length - 1];

  return (
    <nav className={cn('flex items-center text-sm lg:hidden', className)}>
      {previousItem && previousItem.href ? (
        <Link
          href={previousItem.href}
          className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ChevronRight className="h-4 w-4 rotate-180 mr-1" />
          <span>Back to {previousItem.label}</span>
        </Link>
      ) : (
        <Link
          href="/dashboard"
          className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
        >
          <Home className="h-4 w-4 mr-1" />
          <span>Back to Dashboard</span>
        </Link>
      )}
    </nav>
  );
}

// Page header with breadcrumb and actions
export function PageHeader({
  title,
  description,
  breadcrumbItems,
  actions,
  children,
  className
}: {
  title: string;
  description?: string;
  breadcrumbItems?: BreadcrumbItem[];
  actions?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('space-y-4', className)}>
      {/* Breadcrumb */}
      <div className="flex items-center justify-between">
        <Breadcrumb items={breadcrumbItems} />
        <CompactBreadcrumb />
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">{title}</h1>
          {description && (
            <p className="mt-1 text-sm text-gray-600 sm:text-base">{description}</p>
          )}
        </div>

        {actions && (
          <div className="mt-4 sm:mt-0 sm:ml-4 flex-shrink-0">
            {actions}
          </div>
        )}
      </div>

      {children}
    </div>
  );
}

// Quick navigation component
export function QuickNavigation() {
  const pathname = usePathname();

  const quickLinks = [
    { label: 'Dashboard', href: '/dashboard', icon: Home },
    { label: 'Today\'s Appointments', href: '/appointments?date=today' },
    { label: 'Add Patient', href: '/patients/new' },
    { label: 'Schedule Appointment', href: '/appointments/new' },
    { label: 'Financial Reports', href: '/reports/financial' }
  ];

  return (
    <div className="bg-white border-b border-gray-200">
      <div className="container-responsive">
        <div className="flex items-center space-x-6 py-2 overflow-x-auto">
          {quickLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'flex items-center space-x-1 px-3 py-1 rounded-md text-sm font-medium whitespace-nowrap transition-colors',
                pathname === link.href || pathname.startsWith(link.href + '/')
                  ? 'text-blue-600 bg-blue-50'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              )}
            >
              {link.icon && <link.icon className="h-4 w-4" />}
              <span>{link.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}