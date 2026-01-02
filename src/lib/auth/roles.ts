// Role-based access control system
export type UserRole =
  | 'super_admin'     // Full system access, multi-tenant management
  | 'clinic_admin'    // Full clinic access, staff management
  | 'dentist'         // Full patient care, limited admin
  | 'hygienist'       // Limited patient care
  | 'receptionist'    // Appointments, basic patient info
  | 'it_support'      // Technical support, MCP access
  | 'patient';        // Patient portal only

export interface Permission {
  resource: string;
  action: 'create' | 'read' | 'update' | 'delete' | 'manage';
}

// Define permissions for each role
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  super_admin: [
    { resource: '*', action: 'manage' } // Full access to everything
  ],

  clinic_admin: [
    { resource: 'patients', action: 'manage' },
    { resource: 'appointments', action: 'manage' },
    { resource: 'staff', action: 'manage' },
    { resource: 'financial', action: 'manage' },
    { resource: 'reports', action: 'manage' },
    { resource: 'inventory', action: 'manage' },
    { resource: 'settings', action: 'manage' }
  ],

  dentist: [
    { resource: 'patients', action: 'manage' },
    { resource: 'appointments', action: 'manage' },
    { resource: 'treatments', action: 'manage' },
    { resource: 'dental_charts', action: 'manage' },
    { resource: 'prescriptions', action: 'manage' },
    { resource: 'reports', action: 'read' },
    { resource: 'inventory', action: 'read' }
  ],

  hygienist: [
    { resource: 'patients', action: 'read' },
    { resource: 'patients', action: 'update' }, // Limited update
    { resource: 'appointments', action: 'read' },
    { resource: 'appointments', action: 'update' },
    { resource: 'dental_charts', action: 'update' },
    { resource: 'treatments', action: 'create' }, // Basic treatments only
    { resource: 'inventory', action: 'read' }
  ],

  receptionist: [
    { resource: 'patients', action: 'create' },
    { resource: 'patients', action: 'read' },
    { resource: 'patients', action: 'update' }, // Basic info only
    { resource: 'appointments', action: 'manage' },
    { resource: 'financial', action: 'create' }, // Payments
    { resource: 'financial', action: 'read' },
    { resource: 'inventory', action: 'read' }
  ],

  it_support: [
    { resource: 'mcp', action: 'manage' },
    { resource: 'system_logs', action: 'read' },
    { resource: 'integrations', action: 'manage' },
    { resource: 'backups', action: 'manage' },
    { resource: 'monitoring', action: 'read' },
    { resource: 'settings', action: 'read' } // Read-only settings access
  ],

  patient: [
    { resource: 'patient_portal', action: 'read' },
    { resource: 'appointments', action: 'create' }, // Book appointments
    { resource: 'appointments', action: 'read' }, // Own appointments
    { resource: 'medical_records', action: 'read' }, // Own records
    { resource: 'billing', action: 'read' } // Own billing
  ]
};

// Special access levels for sensitive features
export const SENSITIVE_FEATURES = {
  MCP_DASHBOARD: ['super_admin', 'it_support'],
  FINANCIAL_REPORTS: ['super_admin', 'clinic_admin'],
  STAFF_MANAGEMENT: ['super_admin', 'clinic_admin'],
  SYSTEM_SETTINGS: ['super_admin', 'clinic_admin'],
  AUDIT_LOGS: ['super_admin', 'it_support'],
  MULTI_TENANT: ['super_admin'],
  INTEGRATIONS: ['super_admin', 'it_support'],
  PATIENT_DATA_EXPORT: ['super_admin', 'clinic_admin', 'dentist']
};

// Check if user has permission
export function hasPermission(
  userRole: UserRole,
  resource: string,
  action: 'create' | 'read' | 'update' | 'delete' | 'manage'
): boolean {
  const permissions = ROLE_PERMISSIONS[userRole];

  // Check for wildcard permission (super_admin)
  if (permissions.some(p => p.resource === '*' && p.action === 'manage')) {
    return true;
  }

  // Check specific permission
  return permissions.some(p => {
    if (p.resource === resource) {
      return p.action === action || p.action === 'manage';
    }
    return false;
  });
}

// Check if user has access to sensitive feature
export function hasSensitiveAccess(userRole: UserRole, feature: keyof typeof SENSITIVE_FEATURES): boolean {
  return SENSITIVE_FEATURES[feature].includes(userRole);
}

// Get user's accessible routes
export function getAccessibleRoutes(userRole: UserRole): string[] {
  const baseRoutes = ['/dashboard'];

  const routePermissions: Record<string, { resource: string; action: string }> = {
    '/patients': { resource: 'patients', action: 'read' },
    '/appointments': { resource: 'appointments', action: 'read' },
    '/services': { resource: 'treatments', action: 'read' },
    '/financial': { resource: 'financial', action: 'read' },
    '/inventory': { resource: 'inventory', action: 'read' },
    '/staff': { resource: 'staff', action: 'read' },
    '/reports': { resource: 'reports', action: 'read' },
    '/settings': { resource: 'settings', action: 'read' }
  };

  const accessibleRoutes = baseRoutes;

  Object.entries(routePermissions).forEach(([route, permission]) => {
    if (hasPermission(userRole, permission.resource, permission.action as any)) {
      accessibleRoutes.push(route);
    }
  });

  // Add special routes
  if (hasSensitiveAccess(userRole, 'MCP_DASHBOARD')) {
    accessibleRoutes.push('/admin/mcp');
  }

  if (userRole === 'patient') {
    return ['/patient-portal'];
  }

  return accessibleRoutes;
}

// Default user context
export interface UserContext {
  id: string;
  email: string;
  role: UserRole;
  clinicId?: string;
  name: string;
  permissions: Permission[];
  accessibleRoutes: string[];
}

// Create user context from role
export function createUserContext(
  user: { id: string; email: string; role: UserRole; clinicId?: string; name: string }
): UserContext {
  return {
    ...user,
    permissions: ROLE_PERMISSIONS[user.role],
    accessibleRoutes: getAccessibleRoutes(user.role)
  };
}

// Role hierarchy (higher number = more permissions)
export const ROLE_HIERARCHY: Record<UserRole, number> = {
  patient: 0,
  receptionist: 1,
  hygienist: 2,
  dentist: 3,
  it_support: 3, // Same level as dentist but different permissions
  clinic_admin: 4,
  super_admin: 5
};

// Check if role A can manage role B
export function canManageRole(managerRole: UserRole, targetRole: UserRole): boolean {
  return ROLE_HIERARCHY[managerRole] > ROLE_HIERARCHY[targetRole];
}

// Get role display name
export function getRoleDisplayName(role: UserRole): string {
  const displayNames: Record<UserRole, string> = {
    super_admin: 'Super Administrator',
    clinic_admin: 'Clinic Administrator',
    dentist: 'Dentist',
    hygienist: 'Dental Hygienist',
    receptionist: 'Receptionist',
    it_support: 'IT Support',
    patient: 'Patient'
  };

  return displayNames[role];
}

// Get role color for UI
export function getRoleColor(role: UserRole): string {
  const colors: Record<UserRole, string> = {
    super_admin: 'bg-purple-100 text-purple-800',
    clinic_admin: 'bg-blue-100 text-blue-800',
    dentist: 'bg-green-100 text-green-800',
    hygienist: 'bg-teal-100 text-teal-800',
    receptionist: 'bg-yellow-100 text-yellow-800',
    it_support: 'bg-gray-100 text-gray-800',
    patient: 'bg-pink-100 text-pink-800'
  };

  return colors[role];
}

// Multi-tenant helpers
export interface TenantContext {
  id: string;
  name: string;
  domain?: string;
  settings: Record<string, any>;
  isActive: boolean;
  createdAt: string;
}

export function createTenantContext(tenant: any): TenantContext {
  return {
    id: tenant.id,
    name: tenant.name,
    domain: tenant.domain,
    settings: tenant.settings || {},
    isActive: tenant.is_active ?? true,
    createdAt: tenant.created_at
  };
}