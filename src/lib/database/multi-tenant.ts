import { createClient } from '@supabase/supabase-js';

// Multi-tenant database schema and utilities
export interface Tenant {
  id: string;
  name: string;
  domain?: string;
  subdomain?: string;
  settings: TenantSettings;
  subscription: {
    plan: 'starter' | 'professional' | 'enterprise';
    status: 'active' | 'suspended' | 'cancelled';
    validUntil: string;
    features: string[];
  };
  created_at: string;
  updated_at: string;
  is_active: boolean;
}

export interface TenantSettings {
  branding: {
    logo?: string;
    primaryColor: string;
    secondaryColor: string;
    clinicName: string;
  };
  features: {
    multiProvider: boolean;
    advancedReporting: boolean;
    apiAccess: boolean;
    customFields: boolean;
    smsReminders: boolean;
    onlineBooking: boolean;
    patientPortal: boolean;
    inventory: boolean;
  };
  notifications: {
    email: boolean;
    sms: boolean;
    push: boolean;
    appointmentReminders: boolean;
    paymentReminders: boolean;
  };
  business: {
    timezone: string;
    currency: string;
    language: string;
    dateFormat: string;
    timeFormat: '12h' | '24h';
  };
  security: {
    sessionTimeout: number;
    mfaRequired: boolean;
    passwordPolicy: {
      minLength: number;
      requireUppercase: boolean;
      requireNumbers: boolean;
      requireSymbols: boolean;
    };
  };
}

export interface TenantUser {
  id: string;
  tenantId: string;
  email: string;
  role: 'super_admin' | 'clinic_admin' | 'dentist' | 'hygienist' | 'receptionist' | 'it_support' | 'patient';
  profile: {
    firstName: string;
    lastName: string;
    phone?: string;
    avatar?: string;
    title?: string;
    specialties?: string[];
  };
  permissions: string[];
  isActive: boolean;
  lastLogin?: string;
  created_at: string;
  updated_at: string;
}

// Create tenant-aware Supabase client
export function createTenantClient(tenantId: string) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // Row Level Security (RLS) will handle tenant isolation
  // All queries will automatically filter by tenant_id
  return supabase;
}

// Tenant management utilities
export class TenantManager {
  private supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY! // Service role for admin operations
  );

  async createTenant(tenantData: Omit<Tenant, 'id' | 'created_at' | 'updated_at'>): Promise<Tenant> {
    const { data, error } = await this.supabase
      .from('tenants')
      .insert([{
        ...tenantData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) throw new Error(`Failed to create tenant: ${error.message}`);

    // Initialize tenant-specific tables
    await this.initializeTenantData(data.id);

    return data;
  }

  async getTenant(tenantId: string): Promise<Tenant | null> {
    const { data, error } = await this.supabase
      .from('tenants')
      .select('*')
      .eq('id', tenantId)
      .eq('is_active', true)
      .single();

    if (error || !data) return null;
    return data;
  }

  async getTenantByDomain(domain: string): Promise<Tenant | null> {
    const { data, error } = await this.supabase
      .from('tenants')
      .select('*')
      .or(`domain.eq.${domain},subdomain.eq.${domain}`)
      .eq('is_active', true)
      .single();

    if (error || !data) return null;
    return data;
  }

  async updateTenant(tenantId: string, updates: Partial<Tenant>): Promise<Tenant> {
    const { data, error } = await this.supabase
      .from('tenants')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', tenantId)
      .select()
      .single();

    if (error) throw new Error(`Failed to update tenant: ${error.message}`);
    return data;
  }

  async suspendTenant(tenantId: string): Promise<void> {
    await this.supabase
      .from('tenants')
      .update({
        is_active: false,
        updated_at: new Date().toISOString()
      })
      .eq('id', tenantId);
  }

  private async initializeTenantData(tenantId: string): Promise<void> {
    // Create default data for new tenant
    const defaultData = {
      // Default service types
      services: [
        { name: 'Consultation & Exam', duration: 60, price: 180, category: 'preventive' },
        { name: 'Professional Cleaning', duration: 90, price: 150, category: 'preventive' },
        { name: 'Crown Placement', duration: 180, price: 1200, category: 'restorative' }
      ],
      // Default appointment types
      appointmentTypes: [
        { name: 'Consultation', duration: 30, color: '#3B82F6' },
        { name: 'Cleaning', duration: 60, color: '#10B981' },
        { name: 'Treatment', duration: 90, color: '#F59E0B' },
        { name: 'Emergency', duration: 30, color: '#EF4444' }
      ]
    };

    // Insert default services
    await this.supabase
      .from('services')
      .insert(
        defaultData.services.map(service => ({
          ...service,
          tenant_id: tenantId,
          is_active: true
        }))
      );

    // Insert default appointment types
    await this.supabase
      .from('appointment_types')
      .insert(
        defaultData.appointmentTypes.map(type => ({
          ...type,
          tenant_id: tenantId,
          is_active: true
        }))
      );
  }

  // Tenant usage analytics
  async getTenantUsage(tenantId: string): Promise<{
    patients: number;
    appointments: number;
    revenue: number;
    storage: number;
  }> {
    const [patientsCount, appointmentsCount, revenueSum] = await Promise.all([
      this.supabase
        .from('patients')
        .select('id', { count: 'exact' })
        .eq('tenant_id', tenantId),

      this.supabase
        .from('appointments')
        .select('id', { count: 'exact' })
        .eq('tenant_id', tenantId),

      this.supabase
        .from('payments')
        .select('amount')
        .eq('tenant_id', tenantId)
    ]);

    const totalRevenue = revenueSum.data?.reduce((sum, payment) => sum + (payment.amount || 0), 0) || 0;

    return {
      patients: patientsCount.count || 0,
      appointments: appointmentsCount.count || 0,
      revenue: totalRevenue,
      storage: 0 // TODO: Calculate storage usage
    };
  }
}

// Database schema for multi-tenant setup
export const MULTI_TENANT_SCHEMA = `
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tenants table
CREATE TABLE tenants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  domain TEXT UNIQUE,
  subdomain TEXT UNIQUE,
  settings JSONB NOT NULL DEFAULT '{}',
  subscription JSONB NOT NULL DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tenant users table
CREATE TABLE tenant_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  auth_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('super_admin', 'clinic_admin', 'dentist', 'hygienist', 'receptionist', 'it_support', 'patient')),
  profile JSONB NOT NULL DEFAULT '{}',
  permissions TEXT[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  last_login TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(tenant_id, auth_user_id)
);

-- Patients table (tenant-isolated)
CREATE TABLE patients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  date_of_birth DATE,
  address JSONB DEFAULT '{}',
  insurance_info JSONB DEFAULT '{}',
  medical_history JSONB DEFAULT '{}',
  emergency_contact JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Appointments table (tenant-isolated)
CREATE TABLE appointments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  provider_id UUID NOT NULL REFERENCES tenant_users(id) ON DELETE CASCADE,
  service_id UUID REFERENCES services(id),
  appointment_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show')),
  notes TEXT,
  price DECIMAL(10,2),
  payment_status TEXT CHECK (payment_status IN ('pending', 'paid', 'refunded')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Services table (tenant-isolated)
CREATE TABLE services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  duration INTEGER NOT NULL, -- in minutes
  price DECIMAL(10,2) NOT NULL,
  category TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenant_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;

-- RLS Policies for tenant isolation
-- Users can only access data from their tenant
CREATE POLICY "Users can only access their tenant data" ON tenant_users
  USING (tenant_id = current_setting('app.current_tenant_id')::UUID);

CREATE POLICY "Patients are isolated by tenant" ON patients
  USING (tenant_id = current_setting('app.current_tenant_id')::UUID);

CREATE POLICY "Appointments are isolated by tenant" ON appointments
  USING (tenant_id = current_setting('app.current_tenant_id')::UUID);

CREATE POLICY "Services are isolated by tenant" ON services
  USING (tenant_id = current_setting('app.current_tenant_id')::UUID);

-- Tenant admins can manage their tenant
CREATE POLICY "Tenant admins can manage their tenant" ON tenants
  USING (id = current_setting('app.current_tenant_id')::UUID);

-- Indexes for performance
CREATE INDEX idx_tenant_users_tenant_id ON tenant_users(tenant_id);
CREATE INDEX idx_patients_tenant_id ON patients(tenant_id);
CREATE INDEX idx_appointments_tenant_id ON appointments(tenant_id);
CREATE INDEX idx_appointments_date ON appointments(tenant_id, appointment_date);
CREATE INDEX idx_services_tenant_id ON services(tenant_id);

-- Functions for tenant management
CREATE OR REPLACE FUNCTION set_tenant_id()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    NEW.tenant_id = current_setting('app.current_tenant_id')::UUID;
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Update triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply update triggers
CREATE TRIGGER update_tenants_updated_at BEFORE UPDATE ON tenants FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tenant_users_updated_at BEFORE UPDATE ON tenant_users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_patients_updated_at BEFORE UPDATE ON patients FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON appointments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_services_updated_at BEFORE UPDATE ON services FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
`;

// Utility functions
export function setTenantContext(supabaseClient: any, tenantId: string) {
  return supabaseClient.rpc('set_config', {
    setting_name: 'app.current_tenant_id',
    setting_value: tenantId,
    is_local: false
  });
}

export async function getTenantFromRequest(request: Request): Promise<string | null> {
  // Extract tenant ID from subdomain or custom header
  const url = new URL(request.url);
  const hostname = url.hostname;

  // Check for subdomain pattern (e.g., clinic1.dentalflow.com)
  if (hostname.includes('.')) {
    const subdomain = hostname.split('.')[0];

    const tenantManager = new TenantManager();
    const tenant = await tenantManager.getTenantByDomain(subdomain);

    return tenant?.id || null;
  }

  // Check for tenant ID in headers (for API calls)
  const tenantHeader = request.headers.get('X-Tenant-ID');
  if (tenantHeader) {
    return tenantHeader;
  }

  return null;
}