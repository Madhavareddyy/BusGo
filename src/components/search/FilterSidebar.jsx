import React from 'react';
import { 
  SlidersHorizontal, 
  RotateCcw, 
  Sun, 
  Sunset, 
  Moon, 
  Sunrise, 
  X, 
  Check, 
  Sparkles,
  Zap
} from 'lucide-react';
import { Button } from '../ui/Button';

export const FilterSidebar = ({
  filters,
  onFilterChange,
  onResetFilters,
  availableOperators = [],
  priceBounds = { min: 400, max: 2000 },
  isMobileModal = false,
  onCloseMobileModal,
  activeCount = 0
}) => {
  // Timing buckets definition
  const TIMING_BUCKETS = [
    { id: 'early_morning', label: 'Before 6 AM', sub: 'Early Morning', icon: Sunrise },
    { id: 'morning', label: '6 AM - 12 PM', sub: 'Morning', icon: Sun },
    { id: 'afternoon', label: '12 PM - 6 PM', sub: 'Afternoon / Eve', icon: Sunset },
    { id: 'night', label: 'After 6 PM', sub: 'Night', icon: Moon },
  ];

  const handleTimingToggle = (bucketId) => {
    const current = filters.departureTimes || [];
    const exists = current.includes(bucketId);
    const updated = exists 
      ? current.filter((id) => id !== bucketId)
      : [...current, bucketId];
    onFilterChange('departureTimes', updated);
  };

  const handleOperatorToggle = (operatorName) => {
    const current = filters.operators || [];
    const exists = current.includes(operatorName);
    const updated = exists
      ? current.filter((op) => op !== operatorName)
      : [...current, operatorName];
    onFilterChange('operators', updated);
  };

  const content = (
    <div className="space-y-6 text-brand-text">
      {/* Header with Active Count & Reset */}
      <div className="flex items-center justify-between pb-3 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-brand-red" />
          <h2 className="text-sm font-bold uppercase tracking-wider text-brand-navy">
            Filter Buses
          </h2>
          {activeCount > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-brand-red/10 text-brand-red font-bold text-xs">
              {activeCount} active
            </span>
          )}
        </div>

        {activeCount > 0 && (
          <button
            type="button"
            onClick={onResetFilters}
            className="text-xs font-bold text-brand-red hover:underline flex items-center gap-1 transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            Reset All
          </button>
        )}
      </div>

      {/* 1. BUS TYPE FILTERS */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-brand-muted">
          Bus Type
        </h3>
        <div className="grid grid-cols-2 gap-2 text-xs font-medium">
          <label className={`flex items-center gap-2.5 p-2 rounded-lg border cursor-pointer transition-all ${
            filters.hasAc ? 'bg-red-50/70 border-brand-red text-brand-red font-bold' : 'border-gray-200 hover:border-gray-300'
          }`}>
            <input
              type="checkbox"
              checked={Boolean(filters.hasAc)}
              onChange={(e) => onFilterChange('hasAc', e.target.checked)}
              className="accent-brand-red w-4 h-4 rounded"
            />
            <span>AC Buses</span>
          </label>

          <label className={`flex items-center gap-2.5 p-2 rounded-lg border cursor-pointer transition-all ${
            filters.hasNonAc ? 'bg-red-50/70 border-brand-red text-brand-red font-bold' : 'border-gray-200 hover:border-gray-300'
          }`}>
            <input
              type="checkbox"
              checked={Boolean(filters.hasNonAc)}
              onChange={(e) => onFilterChange('hasNonAc', e.target.checked)}
              className="accent-brand-red w-4 h-4 rounded"
            />
            <span>Non-AC Buses</span>
          </label>

          <label className={`flex items-center gap-2.5 p-2 rounded-lg border cursor-pointer transition-all ${
            filters.isSleeper ? 'bg-red-50/70 border-brand-red text-brand-red font-bold' : 'border-gray-200 hover:border-gray-300'
          }`}>
            <input
              type="checkbox"
              checked={Boolean(filters.isSleeper)}
              onChange={(e) => onFilterChange('isSleeper', e.target.checked)}
              className="accent-brand-red w-4 h-4 rounded"
            />
            <span>Sleeper</span>
          </label>

          <label className={`flex items-center gap-2.5 p-2 rounded-lg border cursor-pointer transition-all ${
            filters.isSeater ? 'bg-red-50/70 border-brand-red text-brand-red font-bold' : 'border-gray-200 hover:border-gray-300'
          }`}>
            <input
              type="checkbox"
              checked={Boolean(filters.isSeater)}
              onChange={(e) => onFilterChange('isSeater', e.target.checked)}
              className="accent-brand-red w-4 h-4 rounded"
            />
            <span>Seater</span>
          </label>
        </div>
      </div>

      {/* 2. DEPARTURE TIME FILTERS */}
      <div className="space-y-3 pt-3 border-t border-gray-100">
        <h3 className="text-xs font-bold uppercase tracking-wider text-brand-muted">
          Departure Time
        </h3>
        <div className="grid grid-cols-2 gap-2">
          {TIMING_BUCKETS.map((bucket) => {
            const Icon = bucket.icon;
            const isSelected = (filters.departureTimes || []).includes(bucket.id);
            return (
              <button
                key={bucket.id}
                type="button"
                onClick={() => handleTimingToggle(bucket.id)}
                className={`flex flex-col items-center justify-center p-2.5 rounded-lg border text-center transition-all ${
                  isSelected
                    ? 'bg-brand-red text-white border-brand-red shadow-sm'
                    : 'bg-white border-gray-200 text-brand-navy hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <Icon className={`w-4 h-4 mb-1 ${isSelected ? 'text-white' : 'text-brand-muted'}`} />
                <span className="text-[11px] font-bold leading-tight">
                  {bucket.label}
                </span>
                <span className={`text-[10px] ${isSelected ? 'text-white/80' : 'text-brand-muted'}`}>
                  {bucket.sub}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. PRICE RANGE SLIDER */}
      <div className="space-y-3 pt-3 border-t border-gray-100">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-brand-muted">
            Max Price
          </h3>
          <span className="text-sm font-black text-brand-red">
            ₹{filters.maxPrice || priceBounds.max}
          </span>
        </div>
        <input
          type="range"
          min={priceBounds.min}
          max={priceBounds.max}
          step={50}
          value={filters.maxPrice || priceBounds.max}
          onChange={(e) => onFilterChange('maxPrice', Number(e.target.value))}
          className="w-full accent-brand-red cursor-pointer"
        />
        <div className="flex items-center justify-between text-[11px] text-brand-muted font-medium">
          <span>₹{priceBounds.min}</span>
          <span>₹{priceBounds.max}</span>
        </div>
      </div>

      {/* 4. BUS OPERATORS CHECKLIST */}
      {availableOperators.length > 0 && (
        <div className="space-y-3 pt-3 border-t border-gray-100">
          <h3 className="text-xs font-bold uppercase tracking-wider text-brand-muted">
            Bus Operators ({availableOperators.length})
          </h3>
          <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
            {availableOperators.map((operatorName) => {
              const isSelected = (filters.operators || []).includes(operatorName);
              return (
                <label
                  key={operatorName}
                  className="flex items-center justify-between p-1.5 rounded hover:bg-gray-50 cursor-pointer text-xs"
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleOperatorToggle(operatorName)}
                      className="accent-brand-red w-3.5 h-3.5 rounded"
                    />
                    <span className={`truncate max-w-[160px] ${isSelected ? 'font-bold text-brand-navy' : 'text-gray-700'}`}>
                      {operatorName}
                    </span>
                  </div>
                </label>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );

  // If rendering inside a mobile modal drawer
  if (isMobileModal) {
    return (
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
        <div className="bg-white w-full sm:max-w-md max-h-[85vh] rounded-t-2xl sm:rounded-2xl p-6 overflow-y-auto shadow-2xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <h2 className="text-base font-bold text-brand-navy">Filter Buses</h2>
            <button
              type="button"
              onClick={onCloseMobileModal}
              className="p-1 rounded-full hover:bg-gray-100 text-gray-500"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          {content}
          <div className="pt-4 border-t border-gray-100 flex gap-3">
            <Button
              variant="outline"
              size="md"
              className="flex-1"
              onClick={onResetFilters}
            >
              Reset
            </Button>
            <Button
              variant="primary"
              size="md"
              className="flex-1"
              onClick={onCloseMobileModal}
            >
              Apply Filters
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Desktop sticky sidebar
  return (
    <aside className="bg-white rounded-card border border-brand-border p-5 shadow-card sticky top-36">
      {content}
    </aside>
  );
};

export default FilterSidebar;
