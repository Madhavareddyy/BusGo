import React from 'react';
import { 
  ArrowUpDown, 
  ArrowDownNarrowWide, 
  ArrowUpWideNarrow, 
  Clock, 
  Zap, 
  Star 
} from 'lucide-react';

export const SortBar = ({ activeSort, onSortChange, totalCount = 0 }) => {
  const SORT_OPTIONS = [
    { id: 'price_asc', label: 'Cheapest', icon: ArrowDownNarrowWide, sub: 'Lowest Fare' },
    { id: 'price_desc', label: 'Highest Price', icon: ArrowUpWideNarrow, sub: 'Luxury' },
    { id: 'departure_asc', label: 'Earliest', icon: Clock, sub: 'First Bus' },
    { id: 'duration_asc', label: 'Fastest', icon: Zap, sub: 'Shortest Time' },
    { id: 'rating_desc', label: 'Top Rated', icon: Star, sub: 'Highest Rating' },
  ];

  return (
    <div className="bg-white rounded-card border border-brand-border p-3 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div className="flex items-center gap-2 text-xs font-bold text-brand-muted">
        <ArrowUpDown className="w-3.5 h-3.5 text-brand-red" />
        <span>Sort By:</span>
      </div>

      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
        {SORT_OPTIONS.map((opt) => {
          const Icon = opt.icon;
          const isActive = activeSort === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => onSortChange(opt.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-brand-navy text-white shadow-sm'
                  : 'bg-gray-50 hover:bg-gray-100 text-brand-text border border-gray-200'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-amber-300' : 'text-gray-400'}`} />
              <span>{opt.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default SortBar;
