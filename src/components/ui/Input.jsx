import React from 'react';

export const Input = React.forwardRef(({
  label,
  error,
  helperText,
  leftIcon: LeftIcon,
  rightIcon: RightIcon,
  onRightIconClick,
  className = '',
  containerClassName = '',
  id,
  type = 'text',
  disabled = false,
  ...props
}, ref) => {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className={`w-full ${containerClassName}`}>
      {label && (
        <label
          htmlFor={inputId}
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
        <input
          ref={ref}
          id={inputId}
          type={type}
          disabled={disabled}
          className={`block w-full rounded-lg border text-sm transition-all duration-150
            ${LeftIcon ? 'pl-10' : 'pl-3.5'}
            ${RightIcon ? 'pr-10' : 'pr-3.5'}
            py-2.5 text-brand-text bg-white placeholder-gray-400
            ${error 
              ? 'border-red-400 focus:border-red-500 focus:ring-1 focus:ring-red-500 bg-red-50/20' 
              : 'border-brand-border hover:border-gray-300 focus:border-brand-red focus:ring-1 focus:ring-brand-red'
            }
            disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed
            focus:outline-none
            ${className}`}
          {...props}
        />
        {RightIcon && (
          <button
            type="button"
            tabIndex={-1}
            onClick={onRightIconClick}
            className={`absolute inset-y-0 right-0 pr-3.5 flex items-center ${
              onRightIconClick ? 'cursor-pointer text-brand-muted hover:text-brand-text' : 'pointer-events-none text-brand-muted'
            }`}
          >
            <RightIcon className="h-4 w-4" />
          </button>
        )}
      </div>
      {error && (
        <p className="mt-1.5 text-xs text-rose-600 font-medium flex items-center gap-1">
          <span>{error}</span>
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

Input.displayName = 'Input';
export default Input;
