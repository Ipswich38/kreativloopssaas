'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Loader2, Shield, AlertTriangle, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/lib/auth/auth-client';
import { hasPermission, hasSensitiveAccess, UserRole } from '@/lib/auth/roles';
import { auditLogger } from '@/lib/security/encryption';

interface AuthGuardProps {
  children: React.ReactNode;
  requiredRole?: UserRole;
  requiredPermission?: {
    resource: string;
    action: 'create' | 'read' | 'update' | 'delete' | 'manage';
  };
  sensitiveFeature?: 'MCP_DASHBOARD' | 'FINANCIAL_REPORTS' | 'STAFF_MANAGEMENT' | 'SYSTEM_SETTINGS' | 'AUDIT_LOGS' | 'MULTI_TENANT' | 'INTEGRATIONS' | 'PATIENT_DATA_EXPORT';
  fallback?: React.ReactNode;
  redirectTo?: string;
}

export function AuthGuard({
  children,
  requiredRole,
  requiredPermission,
  sensitiveFeature,
  fallback,
  redirectTo = '/auth/login'
}: AuthGuardProps) {
  const { user, userContext, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [accessDenied, setAccessDenied] = useState(false);

  useEffect(() => {
    if (!loading) {
      // Not authenticated
      if (!user) {
        router.push(`${redirectTo}?redirect=${encodeURIComponent(pathname)}`);
        return;
      }

      // Check role requirement
      if (requiredRole && user.role !== requiredRole) {
        setAccessDenied(true);
        logAccessAttempt('role_denied');
        return;
      }

      // Check permission requirement
      if (requiredPermission && userContext) {
        const hasAccess = hasPermission(
          user.role,
          requiredPermission.resource,
          requiredPermission.action
        );

        if (!hasAccess) {
          setAccessDenied(true);
          logAccessAttempt('permission_denied');
          return;
        }
      }

      // Check sensitive feature access
      if (sensitiveFeature) {
        const hasAccess = hasSensitiveAccess(user.role, sensitiveFeature);

        if (!hasAccess) {
          setAccessDenied(true);
          logAccessAttempt('sensitive_feature_denied');
          return;
        }
      }

      // Access granted
      setAccessDenied(false);
      logAccessAttempt('granted');
    }
  }, [user, userContext, loading, requiredRole, requiredPermission, sensitiveFeature, pathname, router, redirectTo]);

  const logAccessAttempt = async (result: 'granted' | 'role_denied' | 'permission_denied' | 'sensitive_feature_denied') => {
    if (user) {
      await auditLogger.log({
        userId: user.id,
        tenantId: user.tenantId || '',
        action: 'view',
        resource: 'auth_guard',
        details: {
          pathname,
          requiredRole,
          requiredPermission,
          sensitiveFeature,
          result,
          userRole: user.role
        },
        riskLevel: result === 'granted' ? 'low' : 'high'
      });
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-600" />
          <p className="text-sm text-gray-600">Verifying authentication...</p>
        </div>
      </div>
    );
  }

  // Access denied
  if (accessDenied) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                <Lock className="h-8 w-8 text-red-600" />
              </div>
            </div>
            <CardTitle className="text-xl font-semibold text-gray-900">
              Access Denied
            </CardTitle>
            <CardDescription>
              You don't have permission to access this area
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                {requiredRole && `This area requires ${requiredRole} access level.`}
                {requiredPermission && `You need ${requiredPermission.action} permission for ${requiredPermission.resource}.`}
                {sensitiveFeature && `This is a sensitive feature with restricted access.`}
                {!requiredRole && !requiredPermission && !sensitiveFeature && 'Insufficient privileges.'}
              </AlertDescription>
            </Alert>

            <div className="text-sm text-gray-600 space-y-2">
              <p><strong>Your Role:</strong> {user?.role}</p>
              <p><strong>Required:</strong> {
                requiredRole ||
                (requiredPermission && `${requiredPermission.action} ${requiredPermission.resource}`) ||
                (sensitiveFeature && `Access to ${sensitiveFeature}`) ||
                'Higher privileges'
              }</p>
            </div>

            <div className="flex space-x-3">
              <Button
                variant="outline"
                onClick={() => router.back()}
                className="flex-1"
              >
                Go Back
              </Button>
              <Button
                onClick={() => router.push('/dashboard')}
                className="flex-1"
              >
                Dashboard
              </Button>
            </div>

            <div className="text-center">
              <Button
                variant="link"
                size="sm"
                onClick={() => router.push('/settings/security')}
                className="text-gray-500 hover:text-gray-700"
              >
                Contact administrator for access
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Access granted
  return <>{children}</>;
}

// Higher-order component for page-level protection
export function withAuthGuard<T extends object>(
  Component: React.ComponentType<T>,
  guardProps: Omit<AuthGuardProps, 'children'>
) {
  return function GuardedComponent(props: T) {
    return (
      <AuthGuard {...guardProps}>
        <Component {...props} />
      </AuthGuard>
    );
  };
}

// Hook for checking permissions in components
export function usePermissions() {
  const { user, userContext } = useAuth();

  const checkPermission = (resource: string, action: 'create' | 'read' | 'update' | 'delete' | 'manage') => {
    if (!user) return false;
    return hasPermission(user.role, resource, action);
  };

  const checkSensitiveAccess = (feature: AuthGuardProps['sensitiveFeature']) => {
    if (!user || !feature) return false;
    return hasSensitiveAccess(user.role, feature);
  };

  const checkRole = (requiredRole: UserRole) => {
    if (!user) return false;
    return user.role === requiredRole;
  };

  const checkMinimumRole = (minimumRole: UserRole) => {
    if (!user) return false;

    const roleHierarchy: Record<UserRole, number> = {
      patient: 0,
      receptionist: 1,
      hygienist: 2,
      dentist: 3,
      it_support: 3,
      clinic_admin: 4,
      super_admin: 5
    };

    return roleHierarchy[user.role] >= roleHierarchy[minimumRole];
  };

  return {
    user,
    userContext,
    checkPermission,
    checkSensitiveAccess,
    checkRole,
    checkMinimumRole,
    isAuthenticated: !!user,
    role: user?.role,
    tenantId: user?.tenantId
  };
}

// Component for role-based rendering
export function RoleGuard({
  role,
  minimumRole,
  permission,
  sensitiveFeature,
  children,
  fallback = null
}: {
  role?: UserRole;
  minimumRole?: UserRole;
  permission?: { resource: string; action: 'create' | 'read' | 'update' | 'delete' | 'manage' };
  sensitiveFeature?: AuthGuardProps['sensitiveFeature'];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  const {
    checkRole,
    checkMinimumRole,
    checkPermission,
    checkSensitiveAccess
  } = usePermissions();

  let hasAccess = true;

  if (role && !checkRole(role)) {
    hasAccess = false;
  }

  if (minimumRole && !checkMinimumRole(minimumRole)) {
    hasAccess = false;
  }

  if (permission && !checkPermission(permission.resource, permission.action)) {
    hasAccess = false;
  }

  if (sensitiveFeature && !checkSensitiveAccess(sensitiveFeature)) {
    hasAccess = false;
  }

  return hasAccess ? <>{children}</> : <>{fallback}</>;
}

// Session timeout warning component
export function SessionTimeoutWarning({
  show,
  remainingTime,
  onExtend,
  onLogout
}: {
  show: boolean;
  remainingTime: number;
  onExtend: () => void;
  onLogout: () => void;
}) {
  const minutes = Math.floor(remainingTime / 60);
  const seconds = remainingTime % 60;

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md mx-4">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center">
              <Shield className="h-8 w-8 text-yellow-600" />
            </div>
          </div>
          <CardTitle className="text-xl font-semibold text-gray-900">
            Session Expiring
          </CardTitle>
          <CardDescription>
            Your session will expire in {minutes}:{seconds.toString().padStart(2, '0')}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              You will be automatically logged out for security reasons.
              Click "Stay Signed In" to extend your session.
            </AlertDescription>
          </Alert>

          <div className="flex space-x-3">
            <Button
              variant="outline"
              onClick={onLogout}
              className="flex-1"
            >
              Log Out
            </Button>
            <Button
              onClick={onExtend}
              className="flex-1"
            >
              Stay Signed In
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}