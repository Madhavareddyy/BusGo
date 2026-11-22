import React from 'react';

export const Skeleton = ({ className = '', rounded = 'rounded-md', ...props }) => {
  return (
    <div
      className={`animate-shimmer bg-slate-200 ${rounded} ${className}`}
      {...props}
    />
  );
};

export const BusCardSkeleton = () => {
  return (
    <div className="bg-white rounded-card border border-brand-border p-5 shadow-card">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-2 flex-1">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-32" />
          <div className="flex gap-2 pt-2">
            <Skeleton className="h-5 w-16 rounded-full" />
            <Skeleton className="h-5 w-20 rounded-full" />
          </div>
        </div>
        <div className="flex items-center gap-8 w-full md:w-auto justify-between md:justify-end">
          <div className="space-y-1 text-center">
            <Skeleton className="h-6 w-16" />
            <Skeleton className="h-3 w-12 mx-auto" />
          </div>
          <Skeleton className="h-4 w-12" />
          <div className="space-y-1 text-center">
            <Skeleton className="h-6 w-16" />
            <Skeleton className="h-3 w-12 mx-auto" />
          </div>
          <div className="text-right space-y-2">
            <Skeleton className="h-7 w-24 ml-auto" />
            <Skeleton className="h-9 w-28 rounded-lg ml-auto" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Skeleton;
