'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { 
  BarChart3, 
  FolderOpen, 
  Package, 
  ShoppingCart, 
  Users
} from 'lucide-react';

interface AdminNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  className?: string;
}

interface TabItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  badge?: number;
}

const tabs: TabItem[] = [
  { 
    id: 'dashboard', 
    label: 'Dashboard', 
    icon: <BarChart3 className="w-5 h-5" aria-hidden="true" focusable="false" /> 
  },
  { 
    id: 'categories', 
    label: 'Categories', 
    icon: <FolderOpen className="w-5 h-5" aria-hidden="true" focusable="false" /> 
  },
  { 
    id: 'products', 
    label: 'Products', 
    icon: <Package className="w-5 h-5" aria-hidden="true" focusable="false" /> 
  },
  { 
    id: 'orders', 
    label: 'Orders', 
    icon: <ShoppingCart className="w-5 h-5" aria-hidden="true" focusable="false" /> 
  },
  { 
    id: 'users', 
    label: 'Users', 
    icon: <Users className="w-5 h-5" aria-hidden="true" focusable="false" /> 
  },
  /* Settings and Notifications tabs temporarily removed pending real back-end integration */
];

export default function AdminNavigation({ activeTab, onTabChange, className }: AdminNavigationProps) {
  return (
    <div className={cn('bg-white border-b border-neutral-200', className)}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="flex items-center justify-between">
          {/* Tab Navigation */}
          <div className="flex space-x-1">
            {tabs.map((tab) => (
              <Button
                key={tab.id}
                variant={activeTab === tab.id ? 'primary' : 'ghost'}
                size="md"
                onClick={() => onTabChange(tab.id)}
                className={cn(
                  'relative flex items-center space-x-2 rounded-lg',
                  activeTab === tab.id 
                    ? 'bg-primary-50 text-primary-700 border-primary-200' 
                    : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50'
                )}
              >
                {tab.icon}
                <span className="font-medium">{tab.label}</span>
                {tab.badge && (
                  <Badge 
                    variant="primary" 
                    size="sm" 
                    className="ml-1"
                  >
                    {tab.badge}
                  </Badge>
                )}
              </Button>
            ))}
          </div>

          {/* Placeholder for future nav actions */}
        </nav>
      </div>
    </div>
  );
} 