'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  User, 
  Shield, 
  Bell, 
  Palette, 
  Globe,
  Save,
  Eye,
  EyeOff,
  Mail,
  Phone,
  MapPin
} from 'lucide-react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { toast } from 'react-hot-toast';

interface SettingsData {
  profile: {
    name: string;
    email: string;
    phone: string;
    avatar: string;
  };
  security: {
    twoFactorEnabled: boolean;
    sessionTimeout: number;
    passwordLastChanged: string;
  };
  notifications: {
    emailNotifications: boolean;
    orderUpdates: boolean;
    marketingEmails: boolean;
    systemAlerts: boolean;
  };
}

export default function SettingsManagement() {
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'notifications'>('profile');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [settings, setSettings] = useState<SettingsData>({
    profile: {
      name: 'Admin User',
      email: 'admin@wonderworks.com',
      phone: '+20 123 456 7890',
      avatar: '/api/placeholder/150/150'
    },
    security: {
      twoFactorEnabled: false,
      sessionTimeout: 30,
      passwordLastChanged: '2024-12-01'
    },
    notifications: {
      emailNotifications: true,
      orderUpdates: true,
      marketingEmails: false,
      systemAlerts: true
    }
  });

  const handleSave = async (section: keyof SettingsData) => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log(`Saving ${section} settings:`, settings[section]);
      toast.success(`${section} settings saved successfully`);
      // Here you would make an API call to save the settings
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save settings');
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'notifications', label: 'Notifications', icon: Bell }
  ] as const;

  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-neutral-900 mb-2">Settings</h1>
        <p className="text-neutral-600">Manage your account settings and preferences</p>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 mb-8">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <Button
              key={tab.id}
              variant={activeTab === tab.id ? 'primary' : 'ghost'}
              size="md"
              onClick={() => setActiveTab(tab.id)}
              className="flex items-center space-x-2"
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </Button>
          );
        })}
      </div>

      {/* Tab Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
      >
        {activeTab === 'profile' && (
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold text-neutral-900">Profile Settings</h2>
              <p className="text-sm text-neutral-600">Update your personal information</p>
            </CardHeader>
            <CardContent className="space-y-6">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Full Name"
                  value={settings.profile.name}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    profile: { ...prev.profile, name: e.target.value }
                  }))}
                  leftIcon={<User className="w-4 h-4" />}
                />
                <Input
                  label="Email Address"
                  type="email"
                  value={settings.profile.email}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    profile: { ...prev.profile, email: e.target.value }
                  }))}
                  leftIcon={<Mail className="w-4 h-4" />}
                />
                <Input
                  label="Phone Number"
                  value={settings.profile.phone}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    profile: { ...prev.profile, phone: e.target.value }
                  }))}
                  leftIcon={<Phone className="w-4 h-4" />}
                />
              </div>
              
              <div className="flex justify-end">
                <Button
                  onClick={() => handleSave('profile')}
                  loading={loading}
                >
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === 'security' && (
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold text-neutral-900">Security Settings</h2>
              <p className="text-sm text-neutral-600">Manage your account security</p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border border-neutral-200 rounded-lg">
                  <div>
                    <h3 className="font-medium text-neutral-900">Two-Factor Authentication</h3>
                    <p className="text-sm text-neutral-600">Add an extra layer of security to your account</p>
                  </div>
                  <Button
                    variant={settings.security.twoFactorEnabled ? 'primary' : 'outline'}
                    size="sm"
                    onClick={() => setSettings(prev => ({
                      ...prev,
                      security: { ...prev.security, twoFactorEnabled: !prev.security.twoFactorEnabled }
                    }))}
                  >
                    {settings.security.twoFactorEnabled ? 'Enabled' : 'Enable'}
                  </Button>
                </div>

                <div className="space-y-4">
                  <h3 className="font-medium text-neutral-900">Change Password</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="Current Password"
                      type={showPassword ? 'text' : 'password'}
                      rightIcon={
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      }
                    />
                    <Input
                      label="New Password"
                      type="password"
                    />
                  </div>
                  <Input
                    label="Confirm New Password"
                    type="password"
                  />
                </div>

                <div className="flex items-center justify-between p-4 border border-neutral-200 rounded-lg">
                  <div>
                    <h3 className="font-medium text-neutral-900">Session Timeout</h3>
                    <p className="text-sm text-neutral-600">Automatically log out after inactivity</p>
                  </div>
                  <select
                    value={settings.security.sessionTimeout}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      security: { ...prev.security, sessionTimeout: parseInt(e.target.value) }
                    }))}
                    className="px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value={15}>15 minutes</option>
                    <option value={30}>30 minutes</option>
                    <option value={60}>1 hour</option>
                    <option value={120}>2 hours</option>
                  </select>
                </div>
              </div>
              
              <div className="flex justify-end">
                <Button
                  onClick={() => handleSave('security')}
                  loading={loading}
                >
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === 'notifications' && (
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold text-neutral-900">Notification Preferences</h2>
              <p className="text-sm text-neutral-600">Choose what notifications you want to receive</p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border border-neutral-200 rounded-lg">
                  <div>
                    <h3 className="font-medium text-neutral-900">Email Notifications</h3>
                    <p className="text-sm text-neutral-600">Receive notifications via email</p>
                  </div>
                  <Button
                    variant={settings.notifications.emailNotifications ? 'primary' : 'outline'}
                    size="sm"
                    onClick={() => setSettings(prev => ({
                      ...prev,
                      notifications: { ...prev.notifications, emailNotifications: !prev.notifications.emailNotifications }
                    }))}
                  >
                    {settings.notifications.emailNotifications ? 'Enabled' : 'Disabled'}
                  </Button>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 border border-neutral-200 rounded-lg">
                    <div>
                      <h4 className="font-medium text-neutral-900">Order Updates</h4>
                      <p className="text-sm text-neutral-600">Get notified about order status changes</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.notifications.orderUpdates}
                      onChange={(e) => setSettings(prev => ({
                        ...prev,
                        notifications: { ...prev.notifications, orderUpdates: e.target.checked }
                      }))}
                      className="accent-primary-600"
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 border border-neutral-200 rounded-lg">
                    <div>
                      <h4 className="font-medium text-neutral-900">Marketing Emails</h4>
                      <p className="text-sm text-neutral-600">Receive promotional offers and updates</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.notifications.marketingEmails}
                      onChange={(e) => setSettings(prev => ({
                        ...prev,
                        notifications: { ...prev.notifications, marketingEmails: e.target.checked }
                      }))}
                      className="accent-primary-600"
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 border border-neutral-200 rounded-lg">
                    <div>
                      <h4 className="font-medium text-neutral-900">System Alerts</h4>
                      <p className="text-sm text-neutral-600">Important system notifications and updates</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.notifications.systemAlerts}
                      onChange={(e) => setSettings(prev => ({
                        ...prev,
                        notifications: { ...prev.notifications, systemAlerts: e.target.checked }
                      }))}
                      className="accent-primary-600"
                    />
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end">
                <Button
                  onClick={() => handleSave('notifications')}
                  loading={loading}
                >
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </motion.div>
    </div>
  );
} 