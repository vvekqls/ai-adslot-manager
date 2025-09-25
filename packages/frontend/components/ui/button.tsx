import * as React from 'react';
import { cn } from '../../lib/utils';

const buttonVariants = {
  default: 'bg-slate-900 text-white hover:bg-slate-700',
  outline: 'border border-slate-300 bg-white text-slate-900 hover:bg-slate-100'
};

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: keyof typeof buttonVariants;
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        'inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-400',
        buttonVariants[variant],
        className
      )}
      {...props}
    />
  )
);
Button.displayName = 'Button';
