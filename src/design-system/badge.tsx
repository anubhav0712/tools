import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'agent' | 'gui' | 'success' | 'warning';
}

export const Badge: React.FC<BadgeProps> = ({
  className,
  variant = 'default',
  children,
  ...props
}) => {
  const base =
    'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium transition-colors';

  const variants = {
    default: 'bg-slate-800 text-slate-300 border border-slate-700',
    agent:
      'bg-purple-950/80 text-purple-300 border border-purple-700/60 shadow-sm shadow-purple-950/40',
    gui: 'bg-emerald-950/60 text-emerald-300 border border-emerald-700/50',
    success: 'bg-green-950/60 text-green-300 border border-green-700/50',
    warning: 'bg-amber-950/60 text-amber-300 border border-amber-700/50',
  };

  return (
    <span className={twMerge(clsx(base, variants[variant], className))} {...props}>
      {children}
    </span>
  );
};
