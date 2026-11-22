import React from 'react';
import { ChevronDown } from 'lucide-react';

export const Select = React.forwardRef(({
  label,
  error,
  helperText,
  options = [],
  placeholder = 'Select an option',
  leftIcon: LeftIcon,
  className = '',
  containerClassName = '',
  id,
  disabled = false,
  ...props
}, ref) => {
  const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className={`w-full ${containerClassName}`}>
      {label && (
        <label
          htmlFor={selectId}
          className="block text-xs font-semibold uppercase tracking-wider text-brand-muted mb-1.5"
        >
          {label}
        </label>
      )}
      <div className="relative rounded-lg shadow-sm">
        {LeftIcon && (
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-brand-muted">
            <LeftIcon className="h-4 w-4" />
          </div>
        )}
        <select
          ref={ref}
          id={selectId}
          disabled={disabled}
          className={`block w-full appearance-none rounded-lg border text-sm transition-all duration-150
            ${LeftIcon ? 'pl-10' : 'pl-3.5'}
            pr-10 py-2.5 text-brand-text bg-white
            ${error 
              ? 'border-red-400 focus:border-red-500 focus:ring-1 focus:ring-red-500' 
              : 'border-brand-border hover:border-gray-300 focus:border-brand-red focus:ring-1 focus:ring-brand-red'
            }
            disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed
            focus:outline-none cursor-pointer
            ${className}`}
          {...props}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map((opt) => {
            const val = typeof opt === 'object' ? opt.value : opt;
            const labelText = typeof opt === 'object' ? opt.label : opt;
            return (
              <option key={val} value={val}>
                {labelText}
              </option>
            );
          })}
        </select>
        <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-brand-muted">
          <ChevronDown className="h-4 w-4" />
        </div>
      </div>
      {error && (
        <p className="mt-1.5 text-xs text-rose-600 font-medium">
          {error}
        </p>
      )}
      {!error && helperText && (
        <p className="mt-1.5 text-xs text-brand-muted">
          {helperText}
        </p>
      )}
    </div>
  );
});

Select.displayName = 'Select';
export default Select;
