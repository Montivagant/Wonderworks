'use client';

import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { 
  Search, 
  User,
  ChevronDown,
  LogOut
} from 'lucide-react';
import { signOut } from 'next-auth/react';
import Input from '@/components/ui/Input';

interface AdminHeaderProps {
  className?: string;
  userName?: string;
  userRole?: string;
  notifications?: number;
}

export default function AdminHeader({ 
  className, 
  userName = 'Admin User', 
  userRole = 'Administrator',
  notifications = 0 
}: AdminHeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // close menu on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className={cn('bg-white shadow-sm border-b border-neutral-200', className)}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left side - Title and Breadcrumb */}
          <div className="flex items-center space-x-4">
            <div>
              <h1 className="text-xl font-semibold text-neutral-900">
                Admin Dashboard
              </h1>
              <p className="text-sm text-neutral-500">
                Manage your store and monitor performance
              </p>
            </div>
          </div>

          {/* Right side - Search, Notifications, User */}
          <div className="flex items-center space-x-4">
            {/* Search */}
            <Input
              placeholder="Search..."
              leftIcon={<Search className="w-4 h-4" />}
              className="w-64"
            />

            {/* User Menu */}
            <div className="relative" ref={menuRef}>
              <button
                className="flex items-center space-x-3 p-2 rounded-lg hover:bg-neutral-50 cursor-pointer focus:outline-none"
                onClick={() => setMenuOpen((prev) => !prev)}
                aria-haspopup="true"
                aria-expanded={menuOpen}
              >
                <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-primary-600" aria-hidden="true" />
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-sm font-medium text-neutral-900 leading-4">{userName}</p>
                  <p className="text-xs text-neutral-500 leading-4">{userRole}</p>
                </div>
                <ChevronDown className="w-4 h-4 text-neutral-400" aria-hidden="true" />
              </button>

              {/* Dropdown */}
              {menuOpen && (
                <div className="absolute right-0 mt-2 w-44 bg-white border border-neutral-200 rounded-lg shadow-lg z-10">
                  <button
                    className="flex items-center w-full px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-50"
                    onClick={() => {
                      signOut();
                    }}
                  >
                    <LogOut className="w-4 h-4 mr-2" /> Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 