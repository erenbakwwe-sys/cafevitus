import React, { ButtonHTMLAttributes } from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onAnimationStart' | 'onDragStart' | 'onDragEnd' | 'onDrag' | 'ref'> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'amber';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', fullWidth, loading, disabled, icon, children, ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center font-bold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 disabled:pointer-events-none disabled:opacity-50 rounded-2xl relative overflow-hidden cursor-pointer active:scale-98';
    
    const variants = {
      primary: 'bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:hover:bg-slate-100 dark:text-slate-950 shadow-md',
      amber: 'bg-amber-600 hover:bg-amber-700 text-white shadow-md shadow-amber-600/25',
      secondary: 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 border border-slate-200/80 dark:border-slate-700',
      ghost: 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300',
      danger: 'bg-red-600 text-white hover:bg-red-700 shadow-sm'
    };
    
    const sizes = {
      sm: 'h-9 px-4 text-xs',
      md: 'h-11 px-5 text-sm',
      lg: 'h-13 px-7 text-base'
    };

    const isInteractive = !disabled && !loading;

    return (
      <motion.button
        ref={ref}
        whileHover={isInteractive ? { y: -1 } : {}}
        whileTap={isInteractive ? { scale: 0.98 } : {}}
        className={cn(
          baseStyles,
          variants[variant],
          sizes[size],
          fullWidth ? 'w-full' : '',
          className
        )}
        disabled={disabled || loading}
        {...(props as HTMLMotionProps<"button">)}
      >
        {loading ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : icon ? (
          <span className="mr-2">{icon}</span>
        ) : null}
        {children}
      </motion.button>
    );
  }
);

Button.displayName = 'Button';
