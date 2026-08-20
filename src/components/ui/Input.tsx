import React, { forwardRef } from 'react';
import { cn } from '../../lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  iconPrefix?: React.ReactNode;
  iconSuffix?: React.ReactNode;
  variant?: 'default' | 'glass';
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, helperText, iconPrefix, iconSuffix, variant = 'default', ...props }, ref) => {
    
    const variants = {
      default: 'bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white',
      glass: 'bg-white/50 dark:bg-black/20 backdrop-blur-md border-white/20 dark:border-white/10 text-slate-900 dark:text-white shadow-sm'
    };
    
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
            {label}
          </label>
        )}
        <div className="relative">
          {iconPrefix && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              {iconPrefix}
            </div>
          )}
          <input
            ref={ref}
            className={cn(
              'flex h-11 w-full rounded-xl border px-3 py-2 text-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 disabled:cursor-not-allowed disabled:opacity-50',
              variants[variant],
              iconPrefix ? 'pl-10' : '',
              iconSuffix ? 'pr-10' : '',
              error ? 'border-red-500 focus-visible:ring-red-500' : '',
              className
            )}
            {...props}
          />
          {iconSuffix && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
              {iconSuffix}
            </div>
          )}
        </div>
        {error ? (
          <p className="mt-1.5 text-sm text-red-500">{error}</p>
        ) : helperText ? (
          <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">{helperText}</p>
        ) : null}
      </div>
    );
  }
);
Input.displayName = 'Input';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
  variant?: 'default' | 'glass';
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, helperText, variant = 'default', ...props }, ref) => {
    
    const variants = {
      default: 'bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white',
      glass: 'bg-white/50 dark:bg-black/20 backdrop-blur-md border-white/20 dark:border-white/10 text-slate-900 dark:text-white shadow-sm'
    };
    
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          className={cn(
            'flex min-h-[80px] w-full rounded-xl border px-3 py-2 text-sm transition-colors placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 disabled:cursor-not-allowed disabled:opacity-50 resize-y',
            variants[variant],
            error ? 'border-red-500 focus-visible:ring-red-500' : '',
            className
          )}
          {...props}
        />
        {error ? (
          <p className="mt-1.5 text-sm text-red-500">{error}</p>
        ) : helperText ? (
          <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">{helperText}</p>
        ) : null}
      </div>
    );
  }
);
Textarea.displayName = 'Textarea';
