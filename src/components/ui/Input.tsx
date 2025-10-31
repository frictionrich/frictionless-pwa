import React from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, className, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-body-3-medium text-neutral-black mb-2">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={cn(
            'input',
            error && 'border-error focus:ring-error',
            className
          )}
          {...props}
        />
        {error && (
          <p className="mt-1 text-body-4 text-error">{error}</p>
        )}
        {helperText && !error && (
          <p className="mt-1 text-body-4 text-neutral-light-grey">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
