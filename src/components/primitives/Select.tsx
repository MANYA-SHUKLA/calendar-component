import React, { useId } from 'react';
import clsx from 'clsx';

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  options: SelectOption[];
  label?: string;
  error?: string;
}

export const Select: React.FC<SelectProps> = ({
  options,
  label,
  error,
  className,
  id,
  ...props
}) => {
  const generatedId = useId();
  const selectId = id || generatedId;
  
  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={selectId}
          className="block text-sm font-medium text-neutral-200 mb-1"
        >
          {label}
        </label>
      )}
      <select
        id={selectId}
        className={clsx(
          'w-full px-3 py-2 border border-neutral-600 rounded-lg',
          'bg-neutral-800/80 text-neutral-100 backdrop-blur-sm',
          'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500',
          'disabled:bg-neutral-900/50 disabled:cursor-not-allowed disabled:text-neutral-600',
          'hover:border-neutral-500 transition-colors',
          error && 'border-error-500 focus:ring-error-500 focus:border-error-500',
          className
        )}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={error ? `${selectId}-error` : undefined}
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value} className="bg-neutral-800 text-neutral-200">
            {option.label}
          </option>
        ))}
      </select>
      {error && (
        <p
          id={`${selectId}-error`}
          className="mt-1 text-sm text-error-500"
          role="alert"
        >
          {error}
        </p>
      )}
    </div>
  );
};

