'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bell, 
  X, 
  CheckCircle, 
  AlertTriangle, 
  Info, 
  Clock,
  Settings,
  Filter,
  Trash2,
  Eye,
  EyeOff
} from 'lucide-react';
import Button from '@/components/ui/Button';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';

interface Notification {
  id: string;
  type: 'success' | 'warning' | 'error' | 'info';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  action?: {
    label: string;
    url: string;
  };
}

interface NotificationSettings {
  emailNotifications: boolean;
  orderUpdates: boolean;
  systemAlerts: boolean;
  marketingEmails: boolean;
  soundEnabled: boolean;
  desktopNotifications: boolean;
}

export default function NotificationsPanel() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [settings, setSettings] = useState<NotificationSettings>({
    emailNotifications: true,
    orderUpdates: true,
    systemAlerts: true,
    marketingEmails: false,
    soundEnabled: true,
    desktopNotifications: true
  });
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');
  const [showSettings, setShowSettings] = useState(false);
  const [loading, setLoading] = useState(false);

  // Simulate real-time notifications
  useEffect(() => {
    const mockNotifications: Notification[] = [
      {
        id: '1',
        type: 'success',
        title: 'Order Completed',
        message: 'Order #12345 has been successfully delivered to the customer.',
        timestamp: new Date(Date.now() - 1000 * 60 * 5), // 5 minutes ago
        read: false,
        action: {
          label: 'View Order',
          url: '/admin/orders/12345'
        }
      },
      {
        id: '2',
        type: 'warning',
        title: 'Low Stock Alert',
        message: 'Product "Wireless Headphones" is running low on stock (5 units remaining).',
        timestamp: new Date(Date.now() - 1000 * 60 * 15), // 15 minutes ago
        read: false,
        action: {
          label: 'Restock',
          url: '/admin/products'
        }
      },
      {
        id: '3',
        type: 'info',
        title: 'New Customer Registration',
        message: 'A new customer has registered: john.doe@example.com',
        timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
        read: true
      },
      {
        id: '4',
        type: 'error',
        title: 'Payment Failed',
        message: 'Payment for order #12344 has failed. Please review the payment details.',
        timestamp: new Date(Date.now() - 1000 * 60 * 60), // 1 hour ago
        read: false,
        action: {
          label: 'Review Payment',
          url: '/admin/orders/12344'
        }
      },
      {
        id: '5',
        type: 'success',
        title: 'Inventory Updated',
        message: 'Product inventory has been successfully updated with new stock.',
        timestamp: new Date(Date.now() - 1000 * 60 * 120), // 2 hours ago
        read: true
      }
    ];

    setNotifications(mockNotifications);
  }, []);

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'unread') return !notification.read;
    if (filter === 'read') return notification.read;
    return true;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(n => ({ ...n, read: true }))
    );
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-success-600" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-warning-600" />;
      case 'error':
        return <AlertTriangle className="w-5 h-5 text-error-600" />;
      case 'info':
        return <Info className="w-5 h-5 text-primary-600" />;
      default:
        return <Bell className="w-5 h-5 text-neutral-600" />;
    }
  };

  const getNotificationBadge = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return <Badge variant="success" size="sm">Success</Badge>;
      case 'warning':
        return <Badge variant="warning" size="sm">Warning</Badge>;
      case 'error':
        return <Badge variant="error" size="sm">Error</Badge>;
      case 'info':
        return <Badge variant="primary" size="sm">Info</Badge>;
      default:
        return <Badge variant="neutral" size="sm">Notification</Badge>;
    }
  };

  const formatTimeAgo = (timestamp: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - timestamp.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  return (
    <div className="max-w-4xl mx-auto py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Notifications</h1>
          <p className="text-neutral-600 mt-1">Manage your notifications and preferences</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowSettings(!showSettings)}
          >
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={markAllAsRead}
            disabled={unreadCount === 0}
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            Mark All Read
          </Button>
        </div>
      </div>

      {/* Settings Panel */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-6"
          >
            <Card>
              <CardHeader>
                <h2 className="text-lg font-semibold text-neutral-900">Notification Preferences</h2>
                <p className="text-sm text-neutral-600">Choose what notifications you want to receive</p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 border border-neutral-200 rounded-lg">
                      <div>
                        <h3 className="font-medium text-neutral-900">Email Notifications</h3>
                        <p className="text-sm text-neutral-600">Receive notifications via email</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={settings.emailNotifications}
                        onChange={(e) => setSettings(prev => ({
                          ...prev,
                          emailNotifications: e.target.checked
                        }))}
                        className="accent-primary-600"
                      />
                    </div>
                    <div className="flex items-center justify-between p-3 border border-neutral-200 rounded-lg">
                      <div>
                        <h3 className="font-medium text-neutral-900">Order Updates</h3>
                        <p className="text-sm text-neutral-600">Get notified about order status changes</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={settings.orderUpdates}
                        onChange={(e) => setSettings(prev => ({
                          ...prev,
                          orderUpdates: e.target.checked
                        }))}
                        className="accent-primary-600"
                      />
                    </div>
                    <div className="flex items-center justify-between p-3 border border-neutral-200 rounded-lg">
                      <div>
                        <h3 className="font-medium text-neutral-900">System Alerts</h3>
                        <p className="text-sm text-neutral-600">Important system notifications</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={settings.systemAlerts}
                        onChange={(e) => setSettings(prev => ({
                          ...prev,
                          systemAlerts: e.target.checked
                        }))}
                        className="accent-primary-600"
                      />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 border border-neutral-200 rounded-lg">
                      <div>
                        <h3 className="font-medium text-neutral-900">Desktop Notifications</h3>
                        <p className="text-sm text-neutral-600">Show browser notifications</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={settings.desktopNotifications}
                        onChange={(e) => setSettings(prev => ({
                          ...prev,
                          desktopNotifications: e.target.checked
                        }))}
                        className="accent-primary-600"
                      />
                    </div>
                    <div className="flex items-center justify-between p-3 border border-neutral-200 rounded-lg">
                      <div>
                        <h3 className="font-medium text-neutral-900">Sound Notifications</h3>
                        <p className="text-sm text-neutral-600">Play sound for new notifications</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={settings.soundEnabled}
                        onChange={(e) => setSettings(prev => ({
                          ...prev,
                          soundEnabled: e.target.checked
                        }))}
                        className="accent-primary-600"
                      />
                    </div>
                    <div className="flex items-center justify-between p-3 border border-neutral-200 rounded-lg">
                      <div>
                        <h3 className="font-medium text-neutral-900">Marketing Emails</h3>
                        <p className="text-sm text-neutral-600">Receive promotional notifications</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={settings.marketingEmails}
                        onChange={(e) => setSettings(prev => ({
                          ...prev,
                          marketingEmails: e.target.checked
                        }))}
                        className="accent-primary-600"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex space-x-1">
                <Button
                  variant={filter === 'all' ? 'primary' : 'ghost'}
                  size="sm"
                  onClick={() => setFilter('all')}
                >
                  All ({notifications.length})
                </Button>
                <Button
                  variant={filter === 'unread' ? 'primary' : 'ghost'}
                  size="sm"
                  onClick={() => setFilter('unread')}
                >
                  Unread ({unreadCount})
                </Button>
                <Button
                  variant={filter === 'read' ? 'primary' : 'ghost'}
                  size="sm"
                  onClick={() => setFilter('read')}
                >
                  Read ({notifications.length - unreadCount})
                </Button>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={clearAll}
              disabled={notifications.length === 0}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Clear All
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Notifications List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-neutral-900">
              {filter === 'all' ? 'All Notifications' : 
               filter === 'unread' ? 'Unread Notifications' : 'Read Notifications'}
            </h2>
            <Badge variant="primary">{filteredNotifications.length}</Badge>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-neutral-200">
            <AnimatePresence>
              {filteredNotifications.map((notification) => (
                <motion.div
                  key={notification.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className={`p-4 hover:bg-neutral-50 transition-colors ${
                    !notification.read ? 'bg-primary-50/50' : ''
                  }`}
                >
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 mt-1">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <h3 className="text-sm font-medium text-neutral-900">
                              {notification.title}
                            </h3>
                            {getNotificationBadge(notification.type)}
                            {!notification.read && (
                              <div className="w-2 h-2 bg-primary-600 rounded-full"></div>
                            )}
                          </div>
                          <p className="text-sm text-neutral-600 mb-2">
                            {notification.message}
                          </p>
                          <div className="flex items-center space-x-4">
                            <span className="text-xs text-neutral-500 flex items-center">
                              <Clock className="w-3 h-3 mr-1" />
                              {formatTimeAgo(notification.timestamp)}
                            </span>
                            {notification.action && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-primary-600 hover:text-primary-700"
                              >
                                {notification.action.label}
                              </Button>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {!notification.read && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => markAsRead(notification.id)}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteNotification(notification.id)}
                            className="text-error-600 hover:text-error-700"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            {filteredNotifications.length === 0 && (
              <div className="p-8 text-center">
                <Bell className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
                <p className="text-lg font-medium text-neutral-700">No notifications</p>
                <p className="text-sm text-neutral-500">
                  {filter === 'all' ? 'You\'re all caught up!' :
                   filter === 'unread' ? 'No unread notifications' : 'No read notifications'}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 