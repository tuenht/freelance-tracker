import * as React from 'react';
import { cn } from '@/lib/utils';

// =============================================================================
// Input — Design System Primitive
// Fully accessible, supports error state, helper text
// =============================================================================

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  helperText?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, helperText, id, ...props }, ref) => {
    const describedBy = [
      error ? `${id}-error` : undefined,
      helperText ? `${id}-helper` : undefined,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <div className="flex flex-col gap-1">
        <input
          ref={ref}
          id={id}
          aria-describedby={describedBy || undefined}
          aria-invalid={!!error}
          className={cn(
            'block w-full rounded-lg border px-3 py-2 text-sm text-gray-900',
            'placeholder:text-gray-400',
            'bg-white shadow-sm',
            'transition-colors duration-150',
            'focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-0 focus:border-brand-500',
            'disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500',
            error
              ? 'border-red-400 focus:ring-red-400'
              : 'border-gray-300',
            className,
          )}
          {...props}
        />
        {error && (
          <p id={`${id}-error`} role="alert" className="text-xs text-red-600">
            {error}
          </p>
        )}
        {helperText && !error && (
          <p id={`${id}-helper`} className="text-xs text-gray-500">
            {helperText}
          </p>
        )}
      </div>
    );
  },
);

Input.displayName = 'Input';
