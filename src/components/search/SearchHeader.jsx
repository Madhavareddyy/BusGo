import React, { useState } from 'react';
import { 
  ArrowLeft, 
  ArrowRight, 
  Calendar, 
  MapPin, 
  Search, 
  ChevronLeft, 
  ChevronRight, 
  Database, 
  SlidersHorizontal,
  Sparkles,
  ArrowLeftRight
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';

export const SearchHeader = ({
  fromCity,
  toCity,
  journeyDate,
  busesCount,
  isLiveSupabase,
  forceMock,
  onToggleForceMock,
  onModifySearch,
  onPrevDay,
  onNextDay,
  onOpenMobileFilters,
  activeFilterCount = 0
}) => {
  const [isModifying, setIsModifying] = useState(false);
  const [editFrom, setEditFrom] = useState(fromCity);
  const [editTo, setEditTo] = useState(toCity);
  const [editDate, setEditDate] = useState(journeyDate);

  const formatDisplayDate = (dateStr) => {
    if (!dateStr) return '';
    try {
      const parts = dateStr.split('-');
      const d = new Date(parts[0], parts[1] - 1, parts[2]);
      return d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  const handleApplyModify = (e) => {
    e.preventDefault();
    if (editFrom && editTo && editDate) {
      onModifySearch({ from: editFrom, to: editTo, date: editDate });
      setIsModifying(false);
    }
  };

  return (
    <div className="bg-white border-b border-brand-border sticky top-16 z-30 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 space-y-3">
        {/* Main Bar */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Origin -> Destination & Date */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xl sm:text-2xl font-black text-brand-navy tracking-tight">
                {fromCity}
              </span>
              <ArrowRight className="w-4 h-4 text-brand-red shrink-0" />
              <span className="text-xl sm:text-2xl font-black text-brand-navy tracking-tight">
                {toCity}
              </span>
            </div>

            {/* Date Navigator Pill */}
            <div className="flex items-center bg-gray-100 rounded-lg p-0.5 border border-gray-200">
              <button
                type="button"
                onClick={onPrevDay}
                className="p-1.5 hover:bg-white rounded-md text-gray-600 hover:text-brand-navy transition-colors"
                title="Previous Day"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <div className="px-2.5 py-1 text-xs font-bold text-brand-navy flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-brand-red" />
                <span>{formatDisplayDate(journeyDate)}</span>
              </div>
              <button
                type="button"
                onClick={onNextDay}
                className="p-1.5 hover:bg-white rounded-md text-gray-600 hover:text-brand-navy transition-colors"
                title="Next Day"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Bus Count Pill */}
            <span className="text-xs font-semibold text-brand-muted bg-gray-50 border border-gray-200 px-2.5 py-1 rounded-full">
              {busesCount} {busesCount === 1 ? 'Bus' : 'Buses'} Available
            </span>
          </div>

          {/* Controls & Mode Indicator */}
          <div className="flex items-center flex-wrap gap-2.5">
            {/* Mode Indicator & Switcher */}
            <button
              type="button"
              onClick={onToggleForceMock}
              title="Click to toggle between Live Supabase and Demo Mock mode"
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border transition-colors ${
                !forceMock && isLiveSupabase
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                  : 'bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100'
              }`}
            >
              <Database className="w-3.5 h-3.5" />
              <span>
                {!forceMock && isLiveSupabase ? 'Live Supabase Cloud' : 'Local Demo Mode'}
              </span>
              <span className="text-[10px] underline opacity-75 ml-0.5">
                (Switch)
              </span>
            </button>

            {/* Mobile Filter Button */}
            <Button
              variant="outline"
              size="sm"
              icon={SlidersHorizontal}
              className="lg:hidden relative"
              onClick={onOpenMobileFilters}
            >
              Filters
              {activeFilterCount > 0 && (
                <span className="ml-1 px-1.5 py-0.2 bg-brand-red text-white text-[10px] font-bold rounded-full">
                  {activeFilterCount}
                </span>
              )}
            </Button>

            {/* Modify Search Button */}
            <Button
              variant={isModifying ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setIsModifying(!isModifying)}
            >
              {isModifying ? 'Close' : 'Modify Search'}
            </Button>
          </div>
        </div>

        {/* Collapsible Modify Search Drawer */}
        {isModifying && (
          <form 
            onSubmit={handleApplyModify}
            className="pt-3 pb-1 border-t border-gray-100 grid grid-cols-1 sm:grid-cols-12 gap-3 items-end animate-in fade-in slide-in-from-top-2 duration-200"
          >
            <div className="sm:col-span-4">
              <label className="block text-[11px] font-bold text-brand-muted uppercase mb-1">
                From City
              </label>
              <input
                type="text"
                value={editFrom}
                onChange={(e) => setEditFrom(e.target.value)}
                required
                className="w-full text-xs font-bold p-2.5 border border-brand-border rounded-lg focus:border-brand-red outline-none"
                placeholder="Departure City"
              />
            </div>

            <div className="sm:col-span-4">
              <label className="block text-[11px] font-bold text-brand-muted uppercase mb-1">
                To City
              </label>
              <input
                type="text"
                value={editTo}
                onChange={(e) => setEditTo(e.target.value)}
                required
                className="w-full text-xs font-bold p-2.5 border border-brand-border rounded-lg focus:border-brand-red outline-none"
                placeholder="Destination City"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-[11px] font-bold text-brand-muted uppercase mb-1">
                Journey Date
              </label>
              <input
                type="date"
                value={editDate}
                onChange={(e) => setEditDate(e.target.value)}
                required
                className="w-full text-xs font-bold p-2 border border-brand-border rounded-lg focus:border-brand-red outline-none"
              />
            </div>

            <div className="sm:col-span-2">
              <Button
                type="submit"
                variant="primary"
                size="md"
                className="w-full text-xs font-bold uppercase tracking-wider"
              >
                Update Search
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default SearchHeader;
