'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import AnalyticsDashboard from '@/components/admin/AnalyticsDashboard';
import UserManagement from '@/components/admin/UserManagement';
import CategoryManagement from '@/components/admin/CategoryManagement';
import ProductManagement from '@/components/admin/ProductManagement';
import OrderManagement from '@/components/admin/OrderManagement';
import AdminHeader from '@/components/admin/AdminHeader';
import AdminNavigation from '@/components/admin/AdminNavigation';
import AdminLayout from '@/components/admin/AdminLayout';

// Type definition for tabs
type TabId = 'dashboard' | 'categories' | 'products' | 'orders' | 'users';

export default function AdminPage() {
  const { data: session, status } = useSession();
  const [activeTab, setActiveTab] = useState<TabId>('dashboard');

  // Loading state
  if (status === 'loading') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="60" cy="60" r="50" stroke="#f27022" strokeWidth="10" fill="#fff" />
          <circle cx="60" cy="60" r="35" stroke="#e35a1a" strokeWidth="6" fill="#fdecd8" />
          <ellipse cx="60" cy="60" rx="18" ry="8" fill="#f27022" opacity="0.2" />
        </svg>
        <p className="mt-6 text-lg text-neutral-700 font-medium">Checking admin credentials...</p>
      </div>
    );
  }

  // Not logged in (guest)
  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] text-center px-4">
        <svg width="140" height="140" viewBox="0 0 140 140" fill="none" xmlns="http://www.w3.org/2000/svg" className="mx-auto mb-6">
          <circle cx="70" cy="70" r="60" fill="#fef7f0" />
          <rect x="40" y="60" width="60" height="40" rx="12" fill="#f27022" />
          <rect x="60" y="80" width="20" height="20" rx="6" fill="#fff" />
          <rect x="65" y="65" width="10" height="15" rx="5" fill="#fff" />
          <circle cx="70" cy="90" r="3" fill="#f27022" />
          <path d="M55 60a15 15 0 0 1 30 0" stroke="#e35a1a" strokeWidth="3" fill="none" />
        </svg>
        <h2 className="mt-2 text-3xl font-extrabold text-neutral-900">Access Restricted</h2>
        <p className="mt-3 text-neutral-600 max-w-md mx-auto text-base">Sorry, this page is for admins only. Please log in to access the dashboard.</p>
        <div className="mt-7 flex flex-col gap-3 items-center">
          <Link href="/login" className="px-7 py-3 rounded-lg bg-primary-600 text-white font-semibold hover:bg-primary-700 transition">Login</Link>
          <Link href="/register" className="px-7 py-3 rounded-lg bg-neutral-200 text-primary-700 font-semibold hover:bg-neutral-300 transition">Sign Up</Link>
        </div>
      </div>
    );
  }

  // Logged in but not admin
  if (session.user?.role !== 'ADMIN') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] text-center px-4">
        <svg width="140" height="140" viewBox="0 0 140 140" fill="none" xmlns="http://www.w3.org/2000/svg" className="mx-auto mb-6">
          <circle cx="70" cy="70" r="60" fill="#f3f4f6" />
          <rect x="45" y="60" width="50" height="40" rx="12" fill="#a3a3a3" />
          <rect x="62" y="80" width="16" height="16" rx="5" fill="#fff" />
          <rect x="67" y="65" width="6" height="13" rx="3" fill="#fff" />
          <circle cx="70" cy="90" r="2.5" fill="#a3a3a3" />
          <path d="M55 60a15 15 0 0 1 30 0" stroke="#737373" strokeWidth="2.5" fill="none" />
        </svg>
        <h2 className="mt-2 text-3xl font-extrabold text-neutral-900">Admins Only</h2>
        <p className="mt-3 text-neutral-600 max-w-md mx-auto text-base">Sorry, you don't have permission to view this page.</p>
        <div className="mt-7 flex flex-col gap-3 items-center">
          <Link href="/" className="px-7 py-3 rounded-lg bg-primary-600 text-white font-semibold hover:bg-primary-700 transition">Go to Home</Link>
        </div>
      </div>
    );
  }

  // Admin user
  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <AnalyticsDashboard />;
      case 'categories':
        return <CategoryManagement />;
      case 'products':
        return <ProductManagement />;
      case 'orders':
        return <OrderManagement />;
      case 'users':
        return <UserManagement />;
      default:
        return <AnalyticsDashboard />;
    }
  };

  return (
    <AdminLayout>
      {/* Admin Header */}
      <AdminHeader 
        userName={session.user?.name || 'Admin User'}
        userRole="Administrator"
        notifications={3}
      />

      {/* Admin Navigation */}
      <AdminNavigation
        activeTab={activeTab}
        onTabChange={(tab) => setActiveTab(tab as TabId)}
      />

      {/* Tab Content */}
      {renderTabContent()}
    </AdminLayout>
  );
} 