'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface AdminLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export default function AdminLayout({ children, className }: AdminLayoutProps) {
  return (
    <div className={cn('min-h-screen bg-neutral-50 font-sans', className)}>
      <div className="flex flex-col min-h-screen">
        {/* Main Content */}
        <main className="flex-1">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
} 