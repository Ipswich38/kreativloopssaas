import { createClient } from '@supabase/supabase-js';
import { auditLogger } from '@/lib/security/encryption';

export interface Notification {
  id: string;
  tenantId: string;
  userId?: string; // If null, it's a system-wide notification
  type: 'info' | 'success' | 'warning' | 'error' | 'appointment' | 'system';
  title: string;
  message: string;
  data?: Record<string, any>;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: 'appointment' | 'payment' | 'system' | 'marketing' | 'reminder' | 'alert';
  channels: ('in_app' | 'email' | 'sms' | 'push')[];
  isRead: boolean;
  isArchived: boolean;
  expiresAt?: string;
  scheduledFor?: string;
  createdAt: string;
  updatedAt: string;
  actions?: NotificationAction[];
}

export interface NotificationAction {
  id: string;
  label: string;
  type: 'link' | 'api' | 'dismiss';
  target?: string;
  style?: 'primary' | 'secondary' | 'danger';
}

export interface NotificationPreferences {
  userId: string;
  tenantId: string;
  channels: {
    inApp: boolean;
    email: boolean;
    sms: boolean;
    push: boolean;
  };
  categories: {
    appointments: boolean;
    payments: boolean;
    system: boolean;
    marketing: boolean;
    reminders: boolean;
    alerts: boolean;
  };
  quietHours: {
    enabled: boolean;
    start: string; // HH:mm
    end: string; // HH:mm
    timezone: string;
  };
  frequency: {
    digest: 'never' | 'daily' | 'weekly';
    immediate: boolean;
  };
}

class NotificationManager {
  private supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  private listeners: Map<string, (notifications: Notification[]) => void> = new Map();
  private realtimeSubscription: any = null;

  constructor() {
    this.initializeRealtime();
  }

  private initializeRealtime() {
    // Subscribe to real-time notifications
    this.realtimeSubscription = this.supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications'
        },
        (payload) => {
          this.handleRealtimeUpdate(payload);
        }
      )
      .subscribe();
  }

  private async handleRealtimeUpdate(payload: any) {
    const { eventType, new: newNotification, old: oldNotification } = payload;

    // Get current user's tenant for filtering
    const tenantId = localStorage.getItem('currentTenantId');
    if (!tenantId) return;

    // Only process notifications for current tenant
    const notification = newNotification || oldNotification;
    if (notification.tenant_id !== tenantId) return;

    // Notify all listeners
    this.listeners.forEach((listener, userId) => {
      if (!notification.user_id || notification.user_id === userId) {
        this.loadUserNotifications(userId).then(listener);
      }
    });

    // Show browser notification for high/urgent priority
    if (eventType === 'INSERT' && newNotification) {
      await this.showBrowserNotification(newNotification);
    }
  }

  async createNotification(notification: Omit<Notification, 'id' | 'createdAt' | 'updatedAt' | 'isRead' | 'isArchived'>): Promise<Notification> {
    try {
      const { data, error } = await this.supabase
        .from('notifications')
        .insert([{
          tenant_id: notification.tenantId,
          user_id: notification.userId,
          type: notification.type,
          title: notification.title,
          message: notification.message,
          data: notification.data,
          priority: notification.priority,
          category: notification.category,
          channels: notification.channels,
          expires_at: notification.expiresAt,
          scheduled_for: notification.scheduledFor,
          actions: notification.actions,
          is_read: false,
          is_archived: false
        }])
        .select()
        .single();

      if (error) throw error;

      // Process immediate notifications
      if (!notification.scheduledFor || new Date(notification.scheduledFor) <= new Date()) {
        await this.processNotification(data);
      }

      return this.mapDatabaseToNotification(data);
    } catch (error) {
      console.error('Failed to create notification:', error);
      throw error;
    }
  }

  async getUserNotifications(userId: string, tenantId: string, options: {
    limit?: number;
    includeRead?: boolean;
    includeArchived?: boolean;
    category?: string;
  } = {}): Promise<Notification[]> {
    const {
      limit = 50,
      includeRead = true,
      includeArchived = false,
      category
    } = options;

    try {
      let query = this.supabase
        .from('notifications')
        .select('*')
        .eq('tenant_id', tenantId)
        .or(`user_id.is.null,user_id.eq.${userId}`)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (!includeRead) {
        query = query.eq('is_read', false);
      }

      if (!includeArchived) {
        query = query.eq('is_archived', false);
      }

      if (category) {
        query = query.eq('category', category);
      }

      // Filter out expired notifications
      query = query.or('expires_at.is.null,expires_at.gt.' + new Date().toISOString());

      const { data, error } = await query;

      if (error) throw error;

      return data?.map(this.mapDatabaseToNotification) || [];
    } catch (error) {
      console.error('Failed to load user notifications:', error);
      return [];
    }
  }

  async markAsRead(notificationIds: string[], userId: string): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('notifications')
        .update({ is_read: true, updated_at: new Date().toISOString() })
        .in('id', notificationIds)
        .or(`user_id.is.null,user_id.eq.${userId}`);

      if (error) throw error;

      // Log notification read action
      await auditLogger.log({
        userId,
        tenantId: localStorage.getItem('currentTenantId') || '',
        action: 'update',
        resource: 'notification',
        details: { action: 'mark_read', count: notificationIds.length },
        riskLevel: 'low'
      });
    } catch (error) {
      console.error('Failed to mark notifications as read:', error);
      throw error;
    }
  }

  async markAsArchived(notificationIds: string[], userId: string): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('notifications')
        .update({ is_archived: true, updated_at: new Date().toISOString() })
        .in('id', notificationIds)
        .or(`user_id.is.null,user_id.eq.${userId}`);

      if (error) throw error;
    } catch (error) {
      console.error('Failed to archive notifications:', error);
      throw error;
    }
  }

  async deleteNotification(notificationId: string, userId: string): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId)
        .or(`user_id.is.null,user_id.eq.${userId}`);

      if (error) throw error;
    } catch (error) {
      console.error('Failed to delete notification:', error);
      throw error;
    }
  }

  async getUnreadCount(userId: string, tenantId: string): Promise<number> {
    try {
      const { count, error } = await this.supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('tenant_id', tenantId)
        .or(`user_id.is.null,user_id.eq.${userId}`)
        .eq('is_read', false)
        .eq('is_archived', false)
        .or('expires_at.is.null,expires_at.gt.' + new Date().toISOString());

      if (error) throw error;
      return count || 0;
    } catch (error) {
      console.error('Failed to get unread count:', error);
      return 0;
    }
  }

  // Real-time subscription for notifications
  subscribeToNotifications(userId: string, callback: (notifications: Notification[]) => void): () => void {
    this.listeners.set(userId, callback);

    // Load initial notifications
    const tenantId = localStorage.getItem('currentTenantId');
    if (tenantId) {
      this.getUserNotifications(userId, tenantId).then(callback);
    }

    // Return unsubscribe function
    return () => {
      this.listeners.delete(userId);
    };
  }

  private async loadUserNotifications(userId: string): Promise<Notification[]> {
    const tenantId = localStorage.getItem('currentTenantId');
    if (!tenantId) return [];
    return this.getUserNotifications(userId, tenantId);
  }

  private async processNotification(notification: any): Promise<void> {
    const mappedNotification = this.mapDatabaseToNotification(notification);

    // Process based on channels
    for (const channel of mappedNotification.channels) {
      switch (channel) {
        case 'email':
          await this.sendEmailNotification(mappedNotification);
          break;
        case 'sms':
          await this.sendSMSNotification(mappedNotification);
          break;
        case 'push':
          await this.sendPushNotification(mappedNotification);
          break;
        // in_app is handled by real-time subscription
      }
    }
  }

  private async sendEmailNotification(notification: Notification): Promise<void> {
    try {
      await fetch('/api/notifications/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(notification)
      });
    } catch (error) {
      console.error('Failed to send email notification:', error);
    }
  }

  private async sendSMSNotification(notification: Notification): Promise<void> {
    try {
      await fetch('/api/notifications/sms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(notification)
      });
    } catch (error) {
      console.error('Failed to send SMS notification:', error);
    }
  }

  private async sendPushNotification(notification: Notification): Promise<void> {
    try {
      await fetch('/api/notifications/push', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(notification)
      });
    } catch (error) {
      console.error('Failed to send push notification:', error);
    }
  }

  private async showBrowserNotification(notification: any): Promise<void> {
    if (!('Notification' in window) || Notification.permission !== 'granted') {
      return;
    }

    if (notification.priority === 'high' || notification.priority === 'urgent') {
      new Notification(notification.title, {
        body: notification.message,
        icon: '/icon-192.png',
        tag: notification.id,
        requireInteraction: notification.priority === 'urgent'
      });
    }
  }

  private mapDatabaseToNotification(dbNotification: any): Notification {
    return {
      id: dbNotification.id,
      tenantId: dbNotification.tenant_id,
      userId: dbNotification.user_id,
      type: dbNotification.type,
      title: dbNotification.title,
      message: dbNotification.message,
      data: dbNotification.data,
      priority: dbNotification.priority,
      category: dbNotification.category,
      channels: dbNotification.channels,
      isRead: dbNotification.is_read,
      isArchived: dbNotification.is_archived,
      expiresAt: dbNotification.expires_at,
      scheduledFor: dbNotification.scheduled_for,
      createdAt: dbNotification.created_at,
      updatedAt: dbNotification.updated_at,
      actions: dbNotification.actions
    };
  }

  // Request browser notification permission
  async requestNotificationPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission === 'denied') {
      return false;
    }

    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  // Cleanup
  destroy(): void {
    if (this.realtimeSubscription) {
      this.supabase.removeChannel(this.realtimeSubscription);
    }
    this.listeners.clear();
  }
}

// Export singleton instance
export const notificationManager = new NotificationManager();

// Utility functions for common notifications
export const NotificationTemplates = {
  // Appointment reminders
  appointmentReminder: (appointment: any): Omit<Notification, 'id' | 'createdAt' | 'updatedAt' | 'isRead' | 'isArchived'> => ({
    tenantId: appointment.tenantId,
    userId: appointment.patientId,
    type: 'appointment',
    title: 'Appointment Reminder',
    message: `You have an appointment scheduled for ${new Date(appointment.appointmentDate).toLocaleDateString()} at ${appointment.startTime}`,
    priority: 'medium',
    category: 'reminder',
    channels: ['in_app', 'email', 'sms'],
    data: { appointmentId: appointment.id },
    actions: [
      {
        id: 'confirm',
        label: 'Confirm',
        type: 'api',
        target: '/api/appointments/confirm',
        style: 'primary'
      },
      {
        id: 'reschedule',
        label: 'Reschedule',
        type: 'link',
        target: `/appointments/${appointment.id}/reschedule`,
        style: 'secondary'
      }
    ]
  }),

  // Payment reminders
  paymentReminder: (payment: any): Omit<Notification, 'id' | 'createdAt' | 'updatedAt' | 'isRead' | 'isArchived'> => ({
    tenantId: payment.tenantId,
    userId: payment.patientId,
    type: 'warning',
    title: 'Payment Reminder',
    message: `You have an outstanding balance of $${payment.amount}. Please make a payment to avoid late fees.`,
    priority: 'high',
    category: 'payment',
    channels: ['in_app', 'email'],
    data: { paymentId: payment.id, amount: payment.amount },
    actions: [
      {
        id: 'pay_now',
        label: 'Pay Now',
        type: 'link',
        target: `/billing/pay/${payment.id}`,
        style: 'primary'
      }
    ]
  }),

  // System alerts
  systemAlert: (tenantId: string, alert: { title: string; message: string; priority: 'low' | 'medium' | 'high' | 'urgent' }): Omit<Notification, 'id' | 'createdAt' | 'updatedAt' | 'isRead' | 'isArchived'> => ({
    tenantId,
    type: 'system',
    title: alert.title,
    message: alert.message,
    priority: alert.priority,
    category: 'system',
    channels: ['in_app']
  }),

  // Welcome notification for new patients
  welcomePatient: (tenantId: string, patientId: string, clinicName: string): Omit<Notification, 'id' | 'createdAt' | 'updatedAt' | 'isRead' | 'isArchived'> => ({
    tenantId,
    userId: patientId,
    type: 'success',
    title: `Welcome to ${clinicName}!`,
    message: 'Thank you for choosing our practice. Your patient portal is now ready.',
    priority: 'medium',
    category: 'marketing',
    channels: ['in_app', 'email'],
    actions: [
      {
        id: 'explore_portal',
        label: 'Explore Portal',
        type: 'link',
        target: '/patient-portal',
        style: 'primary'
      }
    ]
  })
};