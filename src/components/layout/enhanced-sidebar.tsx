'use client';

import { useState, useEffect } from 'react';
import {
  Calendar,
  Users,
  CreditCard,
  Package,
  Settings,
  Home,
  FileText,
  DollarSign,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  Bot,
  Stethoscope,
  UserPlus,
  PieChart,
  Search,
  Bell,
  User
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const mainNavigation = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: Home,
    description: 'Overview and analytics',
    badge: null
  },
  {
    name: 'Appointments',
    href: '/appointments',
    icon: Calendar,
    description: 'Manage appointments & scheduling',
    badge: '12'
  },
  {
    name: 'Patients',
    href: '/patients',
    icon: Users,
    description: 'Patient records & management',
    badge: null
  },
  {
    name: 'Services',
    href: '/services',
    icon: Stethoscope,
    description: 'Dental services & procedures',
    badge: null
  },
  {
    name: 'Financial',
    href: '/financial',
    icon: DollarSign,
    description: 'Billing & financial reports',
    badge: null
  }
];

const secondaryNavigation = [
  {
    name: 'Inventory',
    href: '/inventory',
    icon: Package,
    description: 'Stock & supplies management',
    badge: '3'
  },
  {
    name: 'Staff',
    href: '/staff',
    icon: UserPlus,
    description: 'Staff management & payroll',
    badge: null
  },
  {
    name: 'Reports',
    href: '/reports',
    icon: PieChart,
    description: 'Analytics & reports',
    badge: null
  }
];

// Hidden navigation - only visible to IT support
const itSupportNavigation = [
  {
    name: 'MCP System',
    href: '/admin/mcp',
    icon: Bot,
    description: 'AI agents & system monitoring',
    badge: 'ADMIN',
    roles: ['it_support', 'super_admin']
  }
];

const bottomNavigation = [
  {
    name: 'Settings',
    href: '/settings',
    icon: Settings,
    description: 'System configuration',
    badge: null
  }
];

interface EnhancedSidebarProps {
  clinicName: string;
  userEmail?: string;
  userRole?: 'super_admin' | 'clinic_admin' | 'dentist' | 'hygienist' | 'receptionist' | 'it_support' | 'patient';
}

export function EnhancedSidebar({ clinicName, userEmail, userRole = 'dentist' }: EnhancedSidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
    // Load collapsed state from localStorage
    const collapsed = localStorage.getItem('sidebar-collapsed');
    if (collapsed) {
      setIsCollapsed(JSON.parse(collapsed));
    }
  }, []);

  useEffect(() => {
    if (mounted) {
      localStorage.setItem('sidebar-collapsed', JSON.stringify(isCollapsed));
    }
  }, [isCollapsed, mounted]);

  const toggleCollapsed = () => {
    setIsCollapsed(!isCollapsed);
  };

  const toggleMobile = () => {
    setIsMobileOpen(!isMobileOpen);
  };

  const NavItem = ({ item, section = 'main' }: { item: any; section?: string }) => {
    const isActive = pathname.startsWith(item.href);

    return (
      <Link
        href={item.href}
        className={cn(
          'group flex items-center transition-all duration-200 rounded-lg',
          isCollapsed ? 'justify-center p-3' : 'px-3 py-3',
          isActive
            ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/25'
            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
        )}
        onClick={() => setIsMobileOpen(false)}
        title={isCollapsed ? item.name : undefined}
      >
        <item.icon
          className={cn(
            'flex-shrink-0 transition-colors',
            isCollapsed ? 'h-6 w-6' : 'h-5 w-5 mr-3',
            isActive ? 'text-white' : 'text-gray-500 group-hover:text-gray-700'
          )}
        />

        {!isCollapsed && (
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <span className="text-sm font-medium truncate block">
                  {item.name}
                </span>
                {item.description && (
                  <span className="text-xs text-gray-500 group-hover:text-gray-600 truncate block">
                    {item.description}
                  </span>
                )}
              </div>

              {item.badge && (
                <Badge
                  variant={isActive ? 'secondary' : 'outline'}
                  className={cn(
                    'ml-2 text-xs',
                    isActive ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'
                  )}
                >
                  {item.badge}
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Tooltip for collapsed state */}
        {isCollapsed && item.badge && (
          <div className="absolute left-16 top-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {item.badge}
          </div>
        )}
      </Link>
    );
  };

  return (
    <>
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button
          variant="outline"
          size="icon"
          onClick={toggleMobile}
          className="bg-white shadow-lg border-gray-200"
        >
          {isMobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {/* Mobile backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          'fixed inset-y-0 left-0 z-40 bg-white border-r border-gray-200 shadow-lg transition-all duration-300 ease-in-out lg:translate-x-0',
          // Desktop width
          'lg:static lg:inset-0',
          isCollapsed ? 'lg:w-20' : 'lg:w-72',
          // Mobile behavior
          'w-72',
          isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className={cn(
            'flex items-center border-b border-gray-200 bg-gray-50',
            isCollapsed ? 'h-20 justify-center px-2' : 'h-20 px-4'
          )}>
            {!isCollapsed ? (
              <div className="flex items-center flex-1 min-w-0">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-md">
                  <Stethoscope className="h-5 w-5 text-white" />
                </div>
                <div className="ml-3 min-w-0 flex-1">
                  <h1 className="text-sm font-bold text-gray-900 truncate">
                    {clinicName}
                  </h1>
                  <p className="text-xs text-gray-500 truncate">
                    Dental Practice Management
                  </p>
                </div>
              </div>
            ) : (
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-md">
                <Stethoscope className="h-5 w-5 text-white" />
              </div>
            )}

            {/* Collapse toggle - desktop only */}
            <div className="hidden lg:block">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleCollapsed}
                className="w-8 h-8 text-gray-400 hover:text-gray-600"
              >
                {isCollapsed ? (
                  <ChevronRight className="h-4 w-4" />
                ) : (
                  <ChevronLeft className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          {/* Search bar - only when expanded */}
          {!isCollapsed && (
            <div className="p-4 border-b border-gray-100">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search features..."
                  className="w-full pl-10 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          )}

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto">
            <div className={cn('space-y-1', isCollapsed ? 'p-2' : 'p-4')}>
              {/* Main Navigation */}
              <div className="space-y-1">
                {!isCollapsed && (
                  <h3 className="px-3 text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">
                    Core Features
                  </h3>
                )}
                {mainNavigation.map((item) => (
                  <NavItem key={item.name} item={item} section="main" />
                ))}
              </div>

              {/* Divider */}
              <div className={cn('border-t border-gray-200', isCollapsed ? 'my-2' : 'my-6')} />

              {/* Secondary Navigation */}
              <div className="space-y-1">
                {!isCollapsed && (
                  <h3 className="px-3 text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">
                    Management
                  </h3>
                )}
                {secondaryNavigation.map((item) => (
                  <NavItem key={item.name} item={item} section="secondary" />
                ))}
              </div>

              {/* IT Support Navigation - Only show for IT support and super admin */}
              {(userRole === 'it_support' || userRole === 'super_admin') && (
                <>
                  <div className={cn('border-t border-gray-200', isCollapsed ? 'my-2' : 'my-6')} />
                  <div className="space-y-1">
                    {!isCollapsed && (
                      <h3 className="px-3 text-xs font-medium text-red-500 uppercase tracking-wider mb-3">
                        System Administration
                      </h3>
                    )}
                    {itSupportNavigation.map((item) => (
                      <NavItem key={item.name} item={item} section="admin" />
                    ))}
                  </div>
                </>
              )}
            </div>
          </nav>

          {/* Bottom section */}
          <div className="border-t border-gray-200 bg-gray-50">
            {/* Settings */}
            <div className={cn('space-y-1', isCollapsed ? 'p-2' : 'p-4')}>
              {bottomNavigation.map((item) => (
                <NavItem key={item.name} item={item} section="bottom" />
              ))}
            </div>

            {/* User section */}
            {!isCollapsed && (
              <div className="p-4 border-t border-gray-100">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-green-500 rounded-full flex items-center justify-center">
                    <User className="h-4 w-4 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      Dr. Admin
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {userEmail || 'admin@clinic.com'}
                    </p>
                  </div>
                  <Bell className="h-4 w-4 text-gray-400" />
                </div>
              </div>
            )}

            {isCollapsed && (
              <div className="p-2">
                <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-green-500 rounded-full flex items-center justify-center mx-auto">
                  <User className="h-5 w-5 text-white" />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}