import React from 'react';
import { cn } from '@/lib/utils';

interface VerticalBarProps {
  /** height percentage between 0 and 100 */
  percentage: number;
  /** colour class e.g. bg-primary-600 */
  colorClass?: string;
  className?: string;
}

export default function VerticalBar({ percentage, colorClass = 'bg-primary-600', className }: VerticalBarProps) {
  const value = Math.min(Math.max(percentage, 0), 100);
  return (
    <div
      className={cn(colorClass, `h-[${value}%]`, 'transition-all duration-300', className)}
    />
  );
} 