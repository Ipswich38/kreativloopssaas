import { createClient } from '@supabase/supabase-js';
import React from 'react';
import { TenantUser, UserRole } from '../database/multi-tenant';
import { createUserContext, UserContext } from './roles';
import { SessionManager } from './session-manager';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

export interface AuthUser {
  id: string;
  email: string;
  emailVerified: boolean;
  phone?: string;
  phoneVerified: boolean;
  role: UserRole;
  tenantId?: string;
  profile: {
    firstName: string;
    lastName: string;
    avatar?: string;
    title?: string;
    specialties?: string[];
  };
  lastLogin?: string;
  mfaEnabled: boolean;
  securityFlags: {
    passwordChangeRequired: boolean;
    accountLocked: boolean;
    loginAttempts: number;
    lastFailedLogin?: string;
  };
}

export interface AuthState {
  user: AuthUser | null;
  userContext: UserContext | null;
  loading: boolean;
  error: string | null;
  tenantId: string | null;
}

class AuthClient {
  private sessionManager: SessionManager;
  private listeners: ((state: AuthState) => void)[] = [];
  private currentState: AuthState = {
    user: null,
    userContext: null,
    loading: true,
    error: null,
    tenantId: null
  };

  constructor() {
    this.sessionManager = new SessionManager();
    this.initialize();
  }

  private async initialize() {
    // Listen for auth state changes
    supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        await this.handleSignIn(session.user);
      } else if (event === 'SIGNED_OUT') {
        await this.handleSignOut();
      }
    });

    // Check for existing session
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      await this.handleSignIn(session.user);
    } else {
      this.updateState({ loading: false });
    }
  }

  private async handleSignIn(authUser: any) {
    try {
      // Get tenant user record
      const { data: tenantUser, error } = await supabase
        .from('tenant_users')
        .select(`
          *,
          tenants:tenant_id (
            id,
            name,
            domain,
            subdomain,
            is_active
          )
        `)
        .eq('auth_user_id', authUser.id)
        .eq('is_active', true)
        .single();

      if (error || !tenantUser) {
        throw new Error('User not found or inactive');
      }

      // Check if tenant is active
      if (!tenantUser.tenants?.is_active) {
        throw new Error('Tenant account is suspended');
      }

      // Update last login
      await supabase
        .from('tenant_users')
        .update({
          last_login: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', tenantUser.id);

      // Create auth user object
      const user: AuthUser = {
        id: tenantUser.id,
        email: authUser.email,
        emailVerified: authUser.email_confirmed_at != null,
        phone: authUser.phone,
        phoneVerified: authUser.phone_confirmed_at != null,
        role: tenantUser.role as UserRole,
        tenantId: tenantUser.tenant_id,
        profile: tenantUser.profile || {},
        lastLogin: tenantUser.last_login,
        mfaEnabled: authUser.app_metadata?.mfa_enabled || false,
        securityFlags: {
          passwordChangeRequired: false,
          accountLocked: false,
          loginAttempts: 0
        }
      };

      // Create user context
      const userContext = createUserContext({
        id: user.id,
        email: user.email,
        role: user.role,
        clinicId: user.tenantId,
        name: `${user.profile.firstName} ${user.profile.lastName}`
      });

      // Set tenant context for RLS
      await supabase.rpc('set_config', {
        setting_name: 'app.current_tenant_id',
        setting_value: user.tenantId,
        is_local: false
      });

      // Start session monitoring
      this.sessionManager.startSession();

      this.updateState({
        user,
        userContext,
        loading: false,
        error: null,
        tenantId: user.tenantId
      });

    } catch (error: any) {
      console.error('Auth error:', error);
      this.updateState({
        user: null,
        userContext: null,
        loading: false,
        error: error.message,
        tenantId: null
      });

      // Sign out on error
      await supabase.auth.signOut();
    }
  }

  private async handleSignOut() {
    this.sessionManager.endSession();
    this.updateState({
      user: null,
      userContext: null,
      loading: false,
      error: null,
      tenantId: null
    });
  }

  private updateState(partial: Partial<AuthState>) {
    this.currentState = { ...this.currentState, ...partial };
    this.listeners.forEach(listener => listener(this.currentState));
  }

  // Public methods
  subscribe(listener: (state: AuthState) => void) {
    this.listeners.push(listener);

    // Immediately call with current state
    listener(this.currentState);

    // Return unsubscribe function
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  async signIn(email: string, password: string, tenantId?: string) {
    this.updateState({ loading: true, error: null });

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        // Track failed login attempts
        await this.trackFailedLogin(email);
        throw error;
      }

      return { success: true, user: data.user };
    } catch (error: any) {
      this.updateState({
        loading: false,
        error: error.message
      });
      return { success: false, error: error.message };
    }
  }

  async signUp(userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role: UserRole;
    tenantId: string;
  }) {
    this.updateState({ loading: true, error: null });

    try {
      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: {
            first_name: userData.firstName,
            last_name: userData.lastName,
            role: userData.role
          }
        }
      });

      if (authError) throw authError;

      // Create tenant user record
      if (authData.user) {
        const { error: tenantUserError } = await supabase
          .from('tenant_users')
          .insert([{
            auth_user_id: authData.user.id,
            tenant_id: userData.tenantId,
            role: userData.role,
            profile: {
              firstName: userData.firstName,
              lastName: userData.lastName
            },
            permissions: [],
            is_active: true
          }]);

        if (tenantUserError) {
          // Clean up auth user if tenant user creation fails
          await supabase.auth.admin.deleteUser(authData.user.id);
          throw tenantUserError;
        }
      }

      return { success: true, user: authData.user };
    } catch (error: any) {
      this.updateState({
        loading: false,
        error: error.message
      });
      return { success: false, error: error.message };
    }
  }

  async signOut() {
    this.updateState({ loading: true });

    try {
      await supabase.auth.signOut();
      return { success: true };
    } catch (error: any) {
      this.updateState({
        loading: false,
        error: error.message
      });
      return { success: false, error: error.message };
    }
  }

  async resetPassword(email: string) {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`
      });

      if (error) throw error;
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  async updatePassword(newPassword: string) {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  async updateProfile(updates: Partial<AuthUser['profile']>) {
    if (!this.currentState.user) {
      return { success: false, error: 'No user logged in' };
    }

    try {
      const { error } = await supabase
        .from('tenant_users')
        .update({
          profile: { ...this.currentState.user.profile, ...updates },
          updated_at: new Date().toISOString()
        })
        .eq('id', this.currentState.user.id);

      if (error) throw error;

      // Update local state
      this.updateState({
        user: {
          ...this.currentState.user,
          profile: { ...this.currentState.user.profile, ...updates }
        }
      });

      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  private async trackFailedLogin(email: string) {
    // Track failed login attempts for security monitoring
    try {
      await supabase
        .from('security_logs')
        .insert([{
          event_type: 'failed_login',
          email,
          ip_address: await this.getClientIP(),
          user_agent: navigator.userAgent,
          timestamp: new Date().toISOString()
        }]);
    } catch (error) {
      console.warn('Failed to log security event:', error);
    }
  }

  private async getClientIP(): Promise<string> {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      return data.ip;
    } catch {
      return 'unknown';
    }
  }

  // Getters for current state
  get user() { return this.currentState.user; }
  get userContext() { return this.currentState.userContext; }
  get loading() { return this.currentState.loading; }
  get error() { return this.currentState.error; }
  get tenantId() { return this.currentState.tenantId; }
  get isAuthenticated() { return !!this.currentState.user; }
}

// Export singleton instance
export const authClient = new AuthClient();

// React hook for auth state
export function useAuth() {
  const [state, setState] = React.useState<AuthState>({
    user: null,
    userContext: null,
    loading: true,
    error: null,
    tenantId: null
  });

  React.useEffect(() => {
    const unsubscribe = authClient.subscribe(setState);
    return unsubscribe;
  }, []);

  return {
    ...state,
    signIn: authClient.signIn.bind(authClient),
    signUp: authClient.signUp.bind(authClient),
    signOut: authClient.signOut.bind(authClient),
    resetPassword: authClient.resetPassword.bind(authClient),
    updatePassword: authClient.updatePassword.bind(authClient),
    updateProfile: authClient.updateProfile.bind(authClient)
  };
}