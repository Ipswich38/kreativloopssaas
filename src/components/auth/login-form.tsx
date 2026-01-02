'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, AlertCircle, Loader2, Shield, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/lib/auth/auth-client';
import { cn } from '@/lib/utils';
import { rateLimiter, DataSanitizer } from '@/lib/security/encryption';

interface LoginFormProps {
  onSuccess?: () => void;
  redirectTo?: string;
  tenantId?: string;
  tenantName?: string;
}

export function LoginForm({
  onSuccess,
  redirectTo = '/dashboard',
  tenantId,
  tenantName
}: LoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rateLimited, setRateLimited] = useState(false);

  const { signIn, loading, error } = useAuth();
  const router = useRouter();

  // Rate limiting check
  const checkRateLimit = (email: string): boolean => {
    const identifier = `login_${email}_${getClientFingerprint()}`;
    return rateLimiter.isAllowed(identifier, 5, 300000); // 5 attempts per 5 minutes
  };

  // Simple client fingerprinting for rate limiting
  const getClientFingerprint = (): string => {
    return btoa(navigator.userAgent + window.screen.width + window.screen.height);
  };

  const validateForm = (): boolean => {
    setFormError('');

    // Sanitize inputs
    const cleanEmail = DataSanitizer.sanitizeEmail(email);
    const cleanPassword = DataSanitizer.sanitizeInput(password);

    // Validation
    if (!cleanEmail || !cleanPassword) {
      setFormError('Please fill in all fields');
      return false;
    }

    if (!cleanEmail.includes('@')) {
      setFormError('Please enter a valid email address');
      return false;
    }

    if (cleanPassword.length < 8) {
      setFormError('Password must be at least 8 characters');
      return false;
    }

    // Rate limiting check
    if (!checkRateLimit(cleanEmail)) {
      setFormError('Too many login attempts. Please try again in 5 minutes.');
      setRateLimited(true);
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);
    setFormError('');

    try {
      const result = await signIn(
        DataSanitizer.sanitizeEmail(email),
        DataSanitizer.sanitizeInput(password),
        tenantId
      );

      if (result.success) {
        // Store remember me preference
        if (rememberMe) {
          localStorage.setItem('remember_email', email);
        } else {
          localStorage.removeItem('remember_email');
        }

        if (onSuccess) {
          onSuccess();
        } else {
          router.push(redirectTo);
        }
      } else {
        setFormError(result.error || 'Login failed');
      }
    } catch (error: any) {
      setFormError(error.message || 'An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Load remembered email
  useEffect(() => {
    const rememberedEmail = localStorage.getItem('remember_email');
    if (rememberedEmail) {
      setEmail(rememberedEmail);
      setRememberMe(true);
    }
  }, []);

  // Auto-clear rate limit flag
  useEffect(() => {
    if (rateLimited) {
      const timer = setTimeout(() => {
        setRateLimited(false);
      }, 300000); // 5 minutes

      return () => clearTimeout(timer);
    }
  }, [rateLimited]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-green-50 p-4">
      <Card className="w-full max-w-md shadow-xl border-0 bg-white/70 backdrop-blur-lg">
        <CardHeader className="text-center space-y-4">
          {/* Logo/Brand */}
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-green-500 rounded-2xl flex items-center justify-center shadow-lg">
              <Shield className="h-8 w-8 text-white" />
            </div>
          </div>

          <div className="space-y-2">
            <CardTitle className="text-2xl font-bold text-gray-900">
              Welcome Back
            </CardTitle>
            <CardDescription className="text-gray-600">
              {tenantName ? (
                <div className="flex items-center justify-center space-x-2">
                  <Building2 className="h-4 w-4" />
                  <span>Sign in to {tenantName}</span>
                </div>
              ) : (
                'Sign in to your dental practice account'
              )}
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Field */}
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-gray-700">
                Email Address
              </label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="doctor@clinic.com"
                required
                disabled={isSubmitting || loading}
                className="h-11"
                autoComplete="email"
                autoFocus
              />
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  disabled={isSubmitting || loading}
                  className="h-11 pr-10"
                  autoComplete="current-password"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-11 w-10 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isSubmitting || loading}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </Button>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <input
                  id="remember"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  disabled={isSubmitting || loading}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="remember" className="text-sm text-gray-600">
                  Remember me
                </label>
              </div>

              <Button
                type="button"
                variant="link"
                className="text-sm text-blue-600 hover:text-blue-800 p-0 h-auto"
                onClick={() => router.push('/auth/forgot-password')}
                disabled={isSubmitting || loading}
              >
                Forgot password?
              </Button>
            </div>

            {/* Error Display */}
            {(formError || error) && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {formError || error}
                </AlertDescription>
              </Alert>
            )}

            {/* Rate Limit Warning */}
            {rateLimited && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Account temporarily locked due to too many failed attempts.
                  Please try again in 5 minutes.
                </AlertDescription>
              </Alert>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isSubmitting || loading || rateLimited}
              className={cn(
                'w-full h-11 font-medium transition-all duration-200',
                'bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700',
                'disabled:opacity-50 disabled:cursor-not-allowed'
              )}
            >
              {isSubmitting || loading ? (
                <div className="flex items-center space-x-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Signing in...</span>
                </div>
              ) : (
                'Sign In'
              )}
            </Button>
          </form>

          {/* Security Notice */}
          <div className="text-center">
            <p className="text-xs text-gray-500">
              Your session is secured with enterprise-grade encryption.
              <br />
              Automatic logout after 10 minutes of inactivity.
            </p>
          </div>

          {/* Sign Up Link */}
          <div className="text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <Button
                type="button"
                variant="link"
                className="text-blue-600 hover:text-blue-800 p-0 h-auto font-medium"
                onClick={() => router.push('/auth/signup')}
                disabled={isSubmitting || loading}
              >
                Contact your clinic administrator
              </Button>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Additional component for tenant selection if needed
export function TenantSelector({ onTenantSelect }: { onTenantSelect: (tenantId: string) => void }) {
  const [tenants] = useState([
    { id: '1', name: 'Happy Teeth Clinic', domain: 'happyteeth' },
    { id: '2', name: 'Smile Care Center', domain: 'smilecare' },
  ]);

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-gray-900">Select Your Clinic</h3>
      <div className="grid gap-3">
        {tenants.map((tenant) => (
          <Button
            key={tenant.id}
            variant="outline"
            className="justify-start h-auto p-4 text-left"
            onClick={() => onTenantSelect(tenant.id)}
          >
            <div className="flex items-center space-x-3">
              <Building2 className="h-5 w-5 text-blue-600" />
              <div>
                <div className="font-medium">{tenant.name}</div>
                <div className="text-sm text-gray-500">{tenant.domain}.dentalflow.com</div>
              </div>
            </div>
          </Button>
        ))}
      </div>
    </div>
  );
}