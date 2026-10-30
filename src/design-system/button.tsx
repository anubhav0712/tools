import React, { forwardRef } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'agent' | 'danger';
  size?: 'sm' | 'md' | 'lg' | 'icon';
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'secondary', size = 'md', children, disabled, ...props }, ref) => {
    const baseStyles =
      'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed select-none active:scale-[0.98] cursor-pointer';

    const variants = {
      primary:
        'bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm shadow-indigo-600/20 border border-indigo-600',
      secondary:
        'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 hover:border-slate-300 shadow-xs',
      ghost:
        'bg-transparent hover:bg-slate-100 text-slate-600 hover:text-slate-900',
      agent:
        'bg-purple-50 hover:bg-purple-100/80 text-purple-700 border border-purple-200 shadow-xs',
      danger:
        'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 shadow-xs',
    };

    const sizes = {
      sm: 'text-xs px-2.5 py-1.5 min-h-[32px] gap-1.5',
      md: 'text-sm px-3.5 py-2 min-h-[38px] gap-2',
      lg: 'text-base px-5 py-2.5 min-h-[44px] gap-2.5',
      icon: 'p-2 min-w-[38px] min-h-[38px] text-slate-500 hover:text-slate-800 hover:bg-slate-100',
    };

    return (
      <button
        ref={ref}
        disabled={disabled}
        className={twMerge(clsx(baseStyles, variants[variant], sizes[size], className))}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
