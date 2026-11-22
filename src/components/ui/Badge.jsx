import React from 'react';

export const Badge = ({
  children,
  variant = 'neutral',
  size = 'md',
  dot = false,
  className = '',
  ...props
}) => {
  const variants = {
    primary: 'bg-red-50 text-brand-red border-red-200',
    success: 'bg-emerald-50 text-brand-success border-emerald-200',
    warning: 'bg-amber-50 text-amber-700 border-amber-200',
    danger: 'bg-rose-50 text-rose-700 border-rose-200',
    navy: 'bg-slate-100 text-brand-navy border-slate-300',
    neutral: 'bg-gray-100 text-brand-text border-gray-200',
    purple: 'bg-purple-50 text-purple-700 border-purple-200',
  };

  const dots = {
    primary: 'bg-brand-red',
    success: 'bg-brand-success',
    warning: 'bg-brand-warning',
    danger: 'bg-rose-600',
    navy: 'bg-brand-navy',
    neutral: 'bg-brand-muted',
    purple: 'bg-purple-600',
  };

  const sizes = {
    sm: 'text-[11px] px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5 font-medium',
    lg: 'text-sm px-3 py-1.5 gap-2 font-medium',
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border ${variants[variant] || variants.neutral} ${sizes[size] || sizes.md} ${className}`}
      {...props}
    >
      {dot && (
        <span
          className={`w-1.5 h-1.5 rounded-full ${dots[variant] || 'bg-gray-400'}`}
        />
      )}
      {children}
    </span>
  );
};

export default Badge;
