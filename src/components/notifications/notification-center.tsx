'use client';

import { useState, useEffect } from 'react';
import {
  Bell,
  Check,
  Archive,
  Trash2,
  Filter,
  Settings,
  Circle,
  Clock,
  AlertTriangle,
  Info,
  CheckCircle,
  X,
  Calendar,
  CreditCard,
  Users,
  Mail,
  MessageSquare
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { cn } from '@/lib/utils';
import { useAuth } from '@/lib/auth/auth-client';
import { notificationManager, Notification, NotificationTemplates } from '@/lib/notifications/notification-system';
import { formatDistanceToNow } from 'date-fns';

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NotificationCenter({ isOpen, onClose }: NotificationCenterProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread' | 'urgent'>('unread');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [unreadCount, setUnreadCount] = useState(0);
  const { user } = useAuth();

  useEffect(() => {
    if (!user || !isOpen) return;

    setLoading(true);

    // Subscribe to real-time notifications
    const unsubscribe = notificationManager.subscribeToNotifications(user.id, (newNotifications) => {
      setNotifications(newNotifications);
      setLoading(false);
    });

    // Load unread count
    loadUnreadCount();

    return () => {
      unsubscribe();
    };
  }, [user, isOpen]);

  const loadUnreadCount = async () => {
    if (!user?.tenantId) return;
    const count = await notificationManager.getUnreadCount(user.id, user.tenantId);
    setUnreadCount(count);
  };

  const handleMarkAsRead = async (notificationIds: string[]) => {
    if (!user) return;

    try {
      await notificationManager.markAsRead(notificationIds, user.id);
      await loadUnreadCount();
    } catch (error) {
      console.error('Failed to mark notifications as read:', error);
    }
  };

  const handleMarkAsArchived = async (notificationIds: string[]) => {
    if (!user) return;

    try {
      await notificationManager.markAsArchived(notificationIds, user.id);
    } catch (error) {
      console.error('Failed to archive notifications:', error);
    }
  };

  const handleDeleteNotification = async (notificationId: string) => {
    if (!user) return;

    try {
      await notificationManager.deleteNotification(notificationId, user.id);
    } catch (error) {
      console.error('Failed to delete notification:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    const unreadIds = notifications.filter(n => !n.isRead).map(n => n.id);
    if (unreadIds.length > 0) {
      await handleMarkAsRead(unreadIds);
    }
  };

  const handleNotificationAction = async (notification: Notification, actionId: string) => {
    const action = notification.actions?.find(a => a.id === actionId);
    if (!action) return;

    switch (action.type) {
      case 'link':
        if (action.target) {
          window.location.href = action.target;
        }
        break;
      case 'api':
        if (action.target) {
          try {
            await fetch(action.target, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ notificationId: notification.id, ...notification.data })
            });
            // Mark as read after action
            await handleMarkAsRead([notification.id]);
          } catch (error) {
            console.error('Failed to execute notification action:', error);
          }
        }
        break;
      case 'dismiss':
        await handleMarkAsRead([notification.id]);
        break;
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    // Filter by read status
    switch (filter) {
      case 'unread':
        if (notification.isRead) return false;
        break;
      case 'urgent':
        if (notification.priority !== 'urgent') return false;
        break;
    }

    // Filter by category
    if (selectedCategory !== 'all' && notification.category !== selectedCategory) {
      return false;
    }

    return true;
  });

  const getNotificationIcon = (notification: Notification) => {
    switch (notification.type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      case 'error':
        return <AlertTriangle className="h-5 w-5 text-red-600" />;
      case 'appointment':
        return <Calendar className="h-5 w-5 text-blue-600" />;
      case 'system':
        return <Settings className="h-5 w-5 text-gray-600" />;
      default:
        return <Info className="h-5 w-5 text-blue-600" />;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'appointment':
        return <Calendar className="h-4 w-4" />;
      case 'payment':
        return <CreditCard className="h-4 w-4" />;
      case 'marketing':
        return <Mail className="h-4 w-4" />;
      case 'reminder':
        return <Clock className="h-4 w-4" />;
      case 'alert':
        return <AlertTriangle className="h-4 w-4" />;
      case 'system':
        return <Settings className="h-4 w-4" />;
      default:
        return <MessageSquare className="h-4 w-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-500';
      case 'high':
        return 'bg-orange-500';
      case 'medium':
        return 'bg-blue-500';
      default:
        return 'bg-gray-400';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-start justify-end">
      <div className="w-full max-w-md h-full bg-white shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Bell className="h-5 w-5 text-gray-600" />
              <h2 className="text-lg font-semibold text-gray-900">Notifications</h2>
              {unreadCount > 0 && (
                <Badge variant="destructive" className="text-xs">
                  {unreadCount}
                </Badge>
              )}
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Filters */}
          <div className="mt-4 space-y-3">
            <div className="flex space-x-2">
              {[
                { key: 'unread', label: 'Unread' },
                { key: 'all', label: 'All' },
                { key: 'urgent', label: 'Urgent' }
              ].map(({ key, label }) => (
                <Button
                  key={key}
                  variant={filter === key ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilter(key as any)}
                  className="text-xs"
                >
                  {label}
                </Button>
              ))}
            </div>

            <div className="flex items-center space-x-2 overflow-x-auto">
              {[
                { key: 'all', label: 'All', icon: MessageSquare },
                { key: 'appointment', label: 'Appointments', icon: Calendar },
                { key: 'payment', label: 'Payments', icon: CreditCard },
                { key: 'reminder', label: 'Reminders', icon: Clock },
                { key: 'system', label: 'System', icon: Settings }
              ].map(({ key, label, icon: Icon }) => (
                <Button
                  key={key}
                  variant={selectedCategory === key ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setSelectedCategory(key)}
                  className="text-xs whitespace-nowrap flex items-center space-x-1"
                >
                  <Icon className="h-3 w-3" />
                  <span>{label}</span>
                </Button>
              ))}
            </div>
          </div>

          {/* Actions */}
          {notifications.some(n => !n.isRead) && (
            <div className="mt-3 flex justify-end">
              <Button
                variant="link"
                size="sm"
                onClick={handleMarkAllAsRead}
                className="text-blue-600 text-xs p-0 h-auto"
              >
                Mark all as read
              </Button>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-6 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-sm text-gray-600 mt-2">Loading notifications...</p>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="p-6 text-center">
              <Bell className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-sm font-medium text-gray-900 mb-1">No notifications</h3>
              <p className="text-sm text-gray-500">
                {filter === 'unread' ? 'All caught up!' : 'No notifications to show'}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={cn(
                    'p-4 hover:bg-gray-50 transition-colors',
                    !notification.isRead && 'bg-blue-50/50 border-l-4 border-l-blue-500'
                  )}
                >
                  <div className="flex items-start space-x-3">
                    {/* Icon & Priority */}
                    <div className="flex-shrink-0 relative">
                      {getNotificationIcon(notification)}
                      <div
                        className={cn(
                          'absolute -top-1 -right-1 w-3 h-3 rounded-full',
                          getPriorityColor(notification.priority)
                        )}
                      />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <h4 className={cn(
                            'text-sm truncate',
                            !notification.isRead ? 'font-semibold text-gray-900' : 'font-medium text-gray-700'
                          )}>
                            {notification.title}
                          </h4>
                          <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                            {notification.message}
                          </p>

                          {/* Actions */}
                          {notification.actions && notification.actions.length > 0 && (
                            <div className="flex space-x-2 mt-2">
                              {notification.actions.map((action) => (
                                <Button
                                  key={action.id}
                                  variant={action.style === 'primary' ? 'default' : 'outline'}
                                  size="sm"
                                  onClick={() => handleNotificationAction(notification, action.id)}
                                  className="text-xs h-7"
                                >
                                  {action.label}
                                </Button>
                              ))}
                            </div>
                          )}

                          {/* Meta */}
                          <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                            <span className="flex items-center space-x-1">
                              {getCategoryIcon(notification.category)}
                              <span className="capitalize">{notification.category}</span>
                            </span>
                            <span>
                              {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                            </span>
                          </div>
                        </div>

                        {/* Actions Menu */}
                        <div className="flex items-center space-x-1 ml-2">
                          {!notification.isRead && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleMarkAsRead([notification.id])}
                              className="h-6 w-6 text-gray-400 hover:text-gray-600"
                              title="Mark as read"
                            >
                              <Check className="h-3 w-3" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleMarkAsArchived([notification.id])}
                            className="h-6 w-6 text-gray-400 hover:text-gray-600"
                            title="Archive"
                          >
                            <Archive className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteNotification(notification.id)}
                            className="h-6 w-6 text-gray-400 hover:text-red-600"
                            title="Delete"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-4 bg-gray-50">
          <Button
            variant="outline"
            size="sm"
            className="w-full text-xs"
            onClick={() => {
              // Navigate to notification settings
              window.location.href = '/settings/notifications';
            }}
          >
            <Settings className="h-3 w-3 mr-1" />
            Notification Settings
          </Button>
        </div>
      </div>
    </div>
  );
}

// Hook for using notifications in components
export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    const unsubscribe = notificationManager.subscribeToNotifications(user.id, setNotifications);
    loadUnreadCount();

    return unsubscribe;
  }, [user]);

  const loadUnreadCount = async () => {
    if (!user?.tenantId) return;
    const count = await notificationManager.getUnreadCount(user.id, user.tenantId);
    setUnreadCount(count);
    setLoading(false);
  };

  const createNotification = async (notification: Omit<Notification, 'id' | 'createdAt' | 'updatedAt' | 'isRead' | 'isArchived' | 'tenantId'>) => {
    if (!user?.tenantId) return;

    await notificationManager.createNotification({
      ...notification,
      tenantId: user.tenantId
    });
  };

  const markAsRead = async (notificationIds: string[]) => {
    if (!user) return;
    await notificationManager.markAsRead(notificationIds, user.id);
    await loadUnreadCount();
  };

  return {
    notifications,
    unreadCount,
    loading,
    createNotification,
    markAsRead,
    // Notification templates
    templates: NotificationTemplates
  };
}