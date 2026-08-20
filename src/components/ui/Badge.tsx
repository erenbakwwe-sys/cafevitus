import React from 'react';
import { cn } from '../../lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'premium';
  icon?: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({ 
  className, 
  variant = 'default', 
  icon, 
  children, 
  ...props 
}) => {
  const variants = {
    default: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
    success: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-800/50',
    warning: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-400 border border-amber-200/50 dark:border-amber-800/50',
    danger: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-400 border border-red-200/50 dark:border-red-800/50',
    info: 'bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-400 border border-sky-200/50 dark:border-sky-800/50',
    premium: 'bg-gradient-to-r from-amber-200 to-yellow-400 text-amber-900 dark:from-amber-500/20 dark:to-yellow-500/20 dark:text-amber-300 border border-amber-300/50 dark:border-amber-500/30'
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium backdrop-blur-sm',
        variants[variant],
        className
      )}
      {...props}
    >
      {icon && <span className="flex-shrink-0 [&>svg]:w-3 [&>svg]:h-3">{icon}</span>}
      {children}
    </span>
  );
};
