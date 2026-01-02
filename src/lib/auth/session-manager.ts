'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';

// Session configuration
const SESSION_TIMEOUT = 10 * 60 * 1000; // 10 minutes in milliseconds
const WARNING_TIME = 2 * 60 * 1000; // Show warning 2 minutes before logout
const HEARTBEAT_INTERVAL = 30 * 1000; // Send heartbeat every 30 seconds

interface SessionConfig {
  onWarning?: () => void;
  onTimeout?: () => void;
  onExtend?: () => void;
  enableWarning?: boolean;
}

export class SessionManager {
  private timeoutId: NodeJS.Timeout | null = null;
  private warningTimeoutId: NodeJS.Timeout | null = null;
  private heartbeatId: NodeJS.Timeout | null = null;
  private lastActivity: number = Date.now();
  private config: SessionConfig;

  constructor(config: SessionConfig = {}) {
    this.config = {
      enableWarning: true,
      ...config
    };
    this.init();
  }

  private init() {
    // Listen for user activity
    this.addActivityListeners();

    // Start session timeout
    this.resetTimeout();

    // Start heartbeat
    this.startHeartbeat();

    // Handle page visibility changes
    document.addEventListener('visibilitychange', this.handleVisibilityChange);
  }

  private addActivityListeners() {
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];

    const activityHandler = () => {
      this.updateActivity();
    };

    events.forEach(event => {
      document.addEventListener(event, activityHandler, { passive: true });
    });
  }

  private updateActivity() {
    this.lastActivity = Date.now();
    this.resetTimeout();

    // Store last activity in localStorage for cross-tab sync
    localStorage.setItem('lastActivity', this.lastActivity.toString());
  }

  private resetTimeout() {
    // Clear existing timeouts
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }
    if (this.warningTimeoutId) {
      clearTimeout(this.warningTimeoutId);
    }

    // Set warning timeout
    if (this.config.enableWarning && this.config.onWarning) {
      this.warningTimeoutId = setTimeout(() => {
        this.config.onWarning?.();
      }, SESSION_TIMEOUT - WARNING_TIME);
    }

    // Set session timeout
    this.timeoutId = setTimeout(() => {
      this.handleTimeout();
    }, SESSION_TIMEOUT);
  }

  private handleTimeout() {
    // Clear session data
    this.clearSession();

    // Notify parent component
    this.config.onTimeout?.();
  }

  private handleVisibilityChange = () => {
    if (document.hidden) {
      // Page is hidden, stop heartbeat
      this.stopHeartbeat();
    } else {
      // Page is visible, check if session is still valid
      const lastActivity = parseInt(localStorage.getItem('lastActivity') || '0');
      const timeSinceActivity = Date.now() - lastActivity;

      if (timeSinceActivity > SESSION_TIMEOUT) {
        this.handleTimeout();
      } else {
        // Resume heartbeat
        this.startHeartbeat();
        this.resetTimeout();
      }
    }
  };

  private startHeartbeat() {
    this.heartbeatId = setInterval(() => {
      // Send heartbeat to server to keep session alive
      this.sendHeartbeat();
    }, HEARTBEAT_INTERVAL);
  }

  private stopHeartbeat() {
    if (this.heartbeatId) {
      clearInterval(this.heartbeatId);
      this.heartbeatId = null;
    }
  }

  private async sendHeartbeat() {
    try {
      await fetch('/api/auth/heartbeat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include'
      });
    } catch (error) {
      console.warn('Heartbeat failed:', error);
    }
  }

  public extendSession() {
    this.updateActivity();
    this.config.onExtend?.();
  }

  public clearSession() {
    // Clear timeouts
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }
    if (this.warningTimeoutId) {
      clearTimeout(this.warningTimeoutId);
    }

    // Clear heartbeat
    this.stopHeartbeat();

    // Clear local storage
    localStorage.removeItem('lastActivity');

    // Remove event listeners
    document.removeEventListener('visibilitychange', this.handleVisibilityChange);
  }

  public destroy() {
    this.clearSession();
  }
}

// React hook for session management
export function useSessionManager(config?: SessionConfig) {
  const router = useRouter();
  const sessionManagerRef = useRef<SessionManager | null>(null);

  const handleWarning = useCallback(() => {
    // Show warning modal or toast
    const confirmed = window.confirm(
      'Your session will expire in 2 minutes due to inactivity. Click OK to continue working.'
    );

    if (confirmed && sessionManagerRef.current) {
      sessionManagerRef.current.extendSession();
    }
  }, []);

  const handleTimeout = useCallback(() => {
    // Clear user session and redirect to login
    localStorage.clear();
    sessionStorage.clear();

    // Show timeout message
    alert('Your session has expired due to inactivity. Please log in again.');

    // Redirect to login
    router.push('/auth/login?reason=timeout');
  }, [router]);

  useEffect(() => {
    const sessionConfig = {
      onWarning: handleWarning,
      onTimeout: handleTimeout,
      ...config
    };

    sessionManagerRef.current = new SessionManager(sessionConfig);

    return () => {
      if (sessionManagerRef.current) {
        sessionManagerRef.current.destroy();
      }
    };
  }, [handleWarning, handleTimeout, config]);

  return {
    extendSession: () => sessionManagerRef.current?.extendSession(),
    clearSession: () => sessionManagerRef.current?.clearSession()
  };
}

// Session warning component
export function SessionWarningModal({
  isOpen,
  onExtend,
  onLogout
}: {
  isOpen: boolean;
  onExtend: () => void;
  onLogout: () => void;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 max-w-md mx-4 shadow-2xl">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
            <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Session Expiring Soon</h3>
            <p className="text-sm text-gray-600">Your session will expire in 2 minutes</p>
          </div>
        </div>

        <p className="text-gray-700 mb-6">
          You've been inactive for a while. Your session will automatically log out in 2 minutes for security reasons.
        </p>

        <div className="flex space-x-3">
          <button
            onClick={onExtend}
            className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Continue Session
          </button>
          <button
            onClick={onLogout}
            className="flex-1 bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors font-medium"
          >
            Log Out Now
          </button>
        </div>
      </div>
    </div>
  );
}

// Activity monitor hook
export function useActivityMonitor() {
  const lastActivityRef = useRef(Date.now());

  useEffect(() => {
    const updateLastActivity = () => {
      lastActivityRef.current = Date.now();
    };

    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    events.forEach(event => {
      document.addEventListener(event, updateLastActivity, { passive: true });
    });

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, updateLastActivity);
      });
    };
  }, []);

  return {
    getLastActivity: () => lastActivityRef.current,
    getInactiveTime: () => Date.now() - lastActivityRef.current
  };
}