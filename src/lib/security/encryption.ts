// HIPAA-compliant encryption utilities for sensitive data

import CryptoJS from 'crypto-js';

// Environment-based encryption key (should be stored in secure env var)
const ENCRYPTION_KEY = process.env.NEXT_PUBLIC_ENCRYPTION_KEY || 'default-key-change-in-production';

export class EncryptionService {
  private static instance: EncryptionService;
  private key: string;

  constructor() {
    this.key = ENCRYPTION_KEY;

    if (this.key === 'default-key-change-in-production') {
      console.warn('🚨 SECURITY WARNING: Using default encryption key. Change NEXT_PUBLIC_ENCRYPTION_KEY in production!');
    }
  }

  static getInstance(): EncryptionService {
    if (!EncryptionService.instance) {
      EncryptionService.instance = new EncryptionService();
    }
    return EncryptionService.instance;
  }

  // Encrypt sensitive data
  encrypt(plaintext: string): string {
    try {
      const encrypted = CryptoJS.AES.encrypt(plaintext, this.key).toString();
      return encrypted;
    } catch (error) {
      console.error('Encryption failed:', error);
      throw new Error('Failed to encrypt data');
    }
  }

  // Decrypt sensitive data
  decrypt(ciphertext: string): string {
    try {
      const bytes = CryptoJS.AES.decrypt(ciphertext, this.key);
      const decrypted = bytes.toString(CryptoJS.enc.Utf8);

      if (!decrypted) {
        throw new Error('Invalid ciphertext or key');
      }

      return decrypted;
    } catch (error) {
      console.error('Decryption failed:', error);
      throw new Error('Failed to decrypt data');
    }
  }

  // Hash sensitive data (one-way)
  hash(data: string): string {
    return CryptoJS.SHA256(data + this.key).toString();
  }

  // Generate secure token
  generateToken(length: number = 32): string {
    return CryptoJS.lib.WordArray.random(length).toString();
  }

  // Encrypt patient data specifically
  encryptPatientData(data: {
    ssn?: string;
    dob?: string;
    medicalHistory?: string;
    insurance?: any;
  }): {
    ssn?: string;
    dob?: string;
    medicalHistory?: string;
    insurance?: string;
  } {
    const encrypted: any = {};

    if (data.ssn) {
      encrypted.ssn = this.encrypt(data.ssn);
    }
    if (data.dob) {
      encrypted.dob = this.encrypt(data.dob);
    }
    if (data.medicalHistory) {
      encrypted.medicalHistory = this.encrypt(data.medicalHistory);
    }
    if (data.insurance) {
      encrypted.insurance = this.encrypt(JSON.stringify(data.insurance));
    }

    return encrypted;
  }

  // Decrypt patient data specifically
  decryptPatientData(encryptedData: {
    ssn?: string;
    dob?: string;
    medicalHistory?: string;
    insurance?: string;
  }): {
    ssn?: string;
    dob?: string;
    medicalHistory?: string;
    insurance?: any;
  } {
    const decrypted: any = {};

    try {
      if (encryptedData.ssn) {
        decrypted.ssn = this.decrypt(encryptedData.ssn);
      }
      if (encryptedData.dob) {
        decrypted.dob = this.decrypt(encryptedData.dob);
      }
      if (encryptedData.medicalHistory) {
        decrypted.medicalHistory = this.decrypt(encryptedData.medicalHistory);
      }
      if (encryptedData.insurance) {
        decrypted.insurance = JSON.parse(this.decrypt(encryptedData.insurance));
      }
    } catch (error) {
      console.error('Patient data decryption failed:', error);
      throw new Error('Failed to decrypt patient data');
    }

    return decrypted;
  }

  // Mask sensitive data for display
  maskSSN(ssn?: string): string {
    if (!ssn) return '';
    return `***-**-${ssn.slice(-4)}`;
  }

  maskCreditCard(cardNumber?: string): string {
    if (!cardNumber) return '';
    return `****-****-****-${cardNumber.slice(-4)}`;
  }

  maskPhone(phone?: string): string {
    if (!phone) return '';
    return `(***)***-${phone.slice(-4)}`;
  }

  // Validate sensitive data format
  isValidSSN(ssn: string): boolean {
    const ssnRegex = /^\d{3}-?\d{2}-?\d{4}$/;
    return ssnRegex.test(ssn);
  }

  isValidPhone(phone: string): boolean {
    const phoneRegex = /^\+?1?[-.\s]?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})$/;
    return phoneRegex.test(phone);
  }

  isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}

// Export singleton instance
export const encryption = EncryptionService.getInstance();

// HIPAA audit logging
export interface AuditLog {
  id: string;
  userId: string;
  tenantId: string;
  action: 'view' | 'create' | 'update' | 'delete' | 'export' | 'login' | 'logout';
  resource: string;
  resourceId?: string;
  details?: any;
  ipAddress: string;
  userAgent: string;
  timestamp: string;
  riskLevel: 'low' | 'medium' | 'high';
}

export class AuditLogger {
  private static instance: AuditLogger;

  static getInstance(): AuditLogger {
    if (!AuditLogger.instance) {
      AuditLogger.instance = new AuditLogger();
    }
    return AuditLogger.instance;
  }

  async log(auditData: Omit<AuditLog, 'id' | 'timestamp' | 'ipAddress' | 'userAgent'>) {
    try {
      const ipAddress = await this.getClientIP();
      const userAgent = navigator.userAgent;

      const auditLog: AuditLog = {
        ...auditData,
        id: encryption.generateToken(16),
        timestamp: new Date().toISOString(),
        ipAddress,
        userAgent
      };

      // Store in database
      await fetch('/api/audit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(auditLog)
      });

      // Also log to console in development
      if (process.env.NODE_ENV === 'development') {
        console.log('🔍 Audit Log:', auditLog);
      }
    } catch (error) {
      console.error('Audit logging failed:', error);
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

  // Log patient data access
  async logPatientAccess(userId: string, tenantId: string, patientId: string, action: AuditLog['action']) {
    await this.log({
      userId,
      tenantId,
      action,
      resource: 'patient',
      resourceId: patientId,
      riskLevel: action === 'export' ? 'high' : 'medium'
    });
  }

  // Log financial data access
  async logFinancialAccess(userId: string, tenantId: string, action: AuditLog['action'], details?: any) {
    await this.log({
      userId,
      tenantId,
      action,
      resource: 'financial',
      details,
      riskLevel: 'high'
    });
  }

  // Log authentication events
  async logAuth(userId: string, tenantId: string, action: 'login' | 'logout', details?: any) {
    await this.log({
      userId,
      tenantId,
      action,
      resource: 'auth',
      details,
      riskLevel: action === 'login' ? 'medium' : 'low'
    });
  }
}

// Export singleton instance
export const auditLogger = AuditLogger.getInstance();

// Data sanitization utilities
export class DataSanitizer {
  // Remove potentially malicious content
  static sanitizeInput(input: string): string {
    return input
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove scripts
      .replace(/javascript:/gi, '') // Remove javascript: protocol
      .replace(/on\w+\s*=/gi, '') // Remove event handlers
      .trim();
  }

  // Sanitize SQL inputs (though we use parameterized queries)
  static sanitizeSQL(input: string): string {
    return input
      .replace(/'/g, "''") // Escape single quotes
      .replace(/;/g, '') // Remove semicolons
      .replace(/--/g, '') // Remove SQL comments
      .replace(/\/\*/g, '') // Remove SQL block comments
      .trim();
  }

  // Sanitize file names
  static sanitizeFileName(fileName: string): string {
    return fileName
      .replace(/[^a-zA-Z0-9.-]/g, '_') // Replace special chars with underscore
      .replace(/_{2,}/g, '_') // Replace multiple underscores with single
      .substring(0, 255); // Limit length
  }

  // Validate and sanitize email
  static sanitizeEmail(email: string): string {
    return email.toLowerCase().trim();
  }

  // Sanitize phone number
  static sanitizePhone(phone: string): string {
    return phone.replace(/\D/g, ''); // Keep only digits
  }
}

// Rate limiting utilities
export class RateLimiter {
  private requests = new Map<string, number[]>();

  // Check if request is within rate limit
  isAllowed(identifier: string, maxRequests: number = 10, windowMs: number = 60000): boolean {
    const now = Date.now();
    const windowStart = now - windowMs;

    // Get existing requests for this identifier
    const existingRequests = this.requests.get(identifier) || [];

    // Filter out old requests
    const recentRequests = existingRequests.filter(timestamp => timestamp > windowStart);

    // Check if under limit
    if (recentRequests.length >= maxRequests) {
      return false;
    }

    // Add current request
    recentRequests.push(now);
    this.requests.set(identifier, recentRequests);

    return true;
  }

  // Reset rate limit for identifier
  reset(identifier: string): void {
    this.requests.delete(identifier);
  }
}

// Export rate limiter instance
export const rateLimiter = new RateLimiter();