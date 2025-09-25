import * as React from 'react';
import { cn } from '../../lib/utils';

type BadgeProps = React.HTMLAttributes<HTMLSpanElement> & {
  variant?: 'default' | 'secondary' | 'destructive';
};

const variants: Record<NonNullable<BadgeProps['variant']>, string> = {
  default: 'bg-emerald-500/10 text-emerald-700 border-emerald-500/40',
  secondary: 'bg-slate-200 text-slate-700 border-slate-300',
  destructive: 'bg-rose-500/10 text-rose-600 border-rose-500/40'
};

export const Badge = ({ className, variant = 'default', ...props }: BadgeProps) => (
  <span
    className={cn(
      'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium uppercase tracking-wide',
      variants[variant],
      className
    )}
    {...props}
  />
);
