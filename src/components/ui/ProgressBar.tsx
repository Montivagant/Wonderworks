import React from 'react';
import { cn } from '@/lib/utils';

interface ProgressBarProps {
  /** percentage between 0 and 100 */
  percentage: number;
  /** colour theme */
  color?: 'primary' | 'success' | 'warning' | 'error' | 'neutral';
  className?: string;
}

const colourMap: Record<Required<ProgressBarProps>['color'], string> = {
  primary: 'bg-primary-600',
  success: 'bg-success-600',
  warning: 'bg-warning-600',
  error: 'bg-error-600',
  neutral: 'bg-neutral-600'
};

export default function ProgressBar({ percentage, color = 'primary', className }: ProgressBarProps) {
  const value = Math.min(Math.max(percentage, 0), 100); // clamp 0-100

  return (
    <div className={cn('w-32 bg-neutral-200 rounded-full h-2', className)} aria-valuenow={value} aria-valuemin={0} aria-valuemax={100} role="progressbar">
      <div
        className={cn(colourMap[color], `w-[${value}%]`, 'h-2 rounded-full transition-all duration-300')}
      />
    </div>
  );
} 