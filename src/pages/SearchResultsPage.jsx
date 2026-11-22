import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { 
  Bus, 
  AlertCircle, 
  Search, 
  RotateCcw, 
  Sparkles, 
  ArrowRight,
  Database,
  Calendar,
  Frown
} from 'lucide-react';
import { dbService } from '../services/db';
import { SearchHeader } from '../components/search/SearchHeader';
import { FilterSidebar } from '../components/search/FilterSidebar';
import { SortBar } from '../components/search/SortBar';
import { BusCard } from '../components/search/BusCard';
import { Skeleton } from '../components/ui/Skeleton';
import { Button } from '../components/ui/Button';

export const SearchResultsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // Search parameters with robust defaults matching live seed data
  const fromCity = searchParams.get('from') || 'Bengaluru';
  const toCity = searchParams.get('to') || 'Hyderabad';
  const journeyDate = searchParams.get('date') || '2026-11-23';

  // State
  const [trips, setTrips] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [forceMock, setForceMock] = useState(false);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Filters State
  const [filters, setFilters] = useState({
    hasAc: false,
    hasNonAc: false,
    isSleeper: false,
    isSeater: false,
    departureTimes: [],
    maxPrice: null,
    operators: [],
  });

  // Sorting State (default cheapest first)
  const [sort, setSort] = useState('price_asc');

  // Fetch Trips on search params or mock mode change
  useEffect(() => {
    let isCurrent = true;
    setIsLoading(true);
    setError(null);

    dbService.searchTrips(fromCity, toCity, journeyDate, { forceMock })
      .then((data) => {
        if (!isCurrent) return;
        setTrips(data || []);
        setIsLoading(false);
      })
      .catch((err) => {
        if (!isCurrent) return;
        console.error('Failed to search trips:', err);
        setError(err.message || 'Unable to retrieve bus schedules. Please try again.');
        setIsLoading(false);
      });

    return () => { isCurrent = false; };
  }, [fromCity, toCity, journeyDate, forceMock]);

  // Derived available operators from fetched trips
  const availableOperators = useMemo(() => {
    const set = new Set();
    trips.forEach((t) => {
      if (t.operator) set.add(t.operator);
    });
    return Array.from(set).sort();
  }, [trips]);

  // Derived price bounds
  const priceBounds = useMemo(() => {
    if (trips.length === 0) return { min: 400, max: 2000 };
    const fares = trips.map((t) => t.base_fare || 899);
    const min = Math.max(200, Math.floor(Math.min(...fares) / 100) * 100);
    const max = Math.min(3000, Math.ceil(Math.max(...fares) / 100) * 100);
    return { min, max: max > min ? max : min + 1000 };
  }, [trips]);

  // Handle Filter Change
  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value
    }));
  };

  // Reset Filters
  const handleResetFilters = () => {
    setFilters({
      hasAc: false,
      hasNonAc: false,
      isSleeper: false,
      isSeater: false,
      departureTimes: [],
      maxPrice: null,
      operators: [],
    });
  };

  // Calculate active filter count
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.hasAc) count++;
    if (filters.hasNonAc) count++;
    if (filters.isSleeper) count++;
    if (filters.isSeater) count++;
    if (filters.departureTimes && filters.departureTimes.length > 0) count += filters.departureTimes.length;
    if (filters.maxPrice && filters.maxPrice < priceBounds.max) count++;
    if (filters.operators && filters.operators.length > 0) count += filters.operators.length;
    return count;
  }, [filters, priceBounds]);

  // Filter trips based on active criteria
  const filteredTrips = useMemo(() => {
    return trips.filter((t) => {
      // 1. AC / Non-AC
      if (filters.hasAc && !filters.hasNonAc && !t.has_ac) return false;
      if (filters.hasNonAc && !filters.hasAc && t.has_ac) return false;

      // 2. Sleeper / Seater
      if (filters.isSleeper && !filters.isSeater && !t.is_sleeper) return false;
      if (filters.isSeater && !filters.isSleeper && t.is_sleeper) return false;

      // 3. Price Filter
      if (filters.maxPrice && t.base_fare > filters.maxPrice) return false;

      // 4. Departure Time Bucket
      if (filters.departureTimes && filters.departureTimes.length > 0) {
        const hour = parseInt(t.departure_time.split(':')[0], 10);
        let bucket = 'night';
        if (hour < 6) bucket = 'early_morning';
        else if (hour < 12) bucket = 'morning';
        else if (hour < 18) bucket = 'afternoon';
        else bucket = 'night';

        if (!filters.departureTimes.includes(bucket)) return false;
      }

      // 5. Operator
      if (filters.operators && filters.operators.length > 0) {
        if (!filters.operators.includes(t.operator)) return false;
      }

      return true;
    });
  }, [trips, filters]);

  // Sort filtered trips
  const sortedTrips = useMemo(() => {
    const list = [...filteredTrips];
    switch (sort) {
      case 'price_asc':
        return list.sort((a, b) => a.base_fare - b.base_fare);
      case 'price_desc':
        return list.sort((a, b) => b.base_fare - a.base_fare);
      case 'departure_asc':
        return list.sort((a, b) => a.departure_time.localeCompare(b.departure_time));
      case 'duration_asc':
        return list.sort((a, b) => (a.duration_minutes || 0) - (b.duration_minutes || 0));
      case 'rating_desc':
        return list.sort((a, b) => (b.operator_rating || 0) - (a.operator_rating || 0));
      default:
        return list;
    }
  }, [filteredTrips, sort]);

  // Date Navigation Handlers
  const handleDateChange = (daysDelta) => {
    const parts = journeyDate.split('-');
    const cur = new Date(parts[0], parts[1] - 1, parts[2]);
    cur.setDate(cur.getDate() + daysDelta);
    const nextDate = cur.toISOString().split('T')[0];
    setSearchParams({ from: fromCity, to: toCity, date: nextDate });
  };

  const handleModifySearch = (newParams) => {
    setSearchParams({
      from: newParams.from,
      to: newParams.to,
      date: newParams.date
    });
  };

  // Check if data is from live Supabase
  const isLiveSupabase = trips.length > 0 && trips[0].source === 'supabase_cloud';

  return (
    <div className="min-h-screen bg-brand-bg pb-16">
      {/* Search Header Bar with Date Navigator & Modify Search */}
      <SearchHeader
        fromCity={fromCity}
        toCity={toCity}
        journeyDate={journeyDate}
        busesCount={sortedTrips.length}
        isLiveSupabase={isLiveSupabase}
        forceMock={forceMock}
        onToggleForceMock={() => setForceMock(!forceMock)}
        onModifySearch={handleModifySearch}
        onPrevDay={() => handleDateChange(-1)}
        onNextDay={() => handleDateChange(1)}
        onOpenMobileFilters={() => setMobileFilterOpen(true)}
        activeFilterCount={activeFilterCount}
      />

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setForceMock(true)}
            >
              Switch to Demo Mode
            </Button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Desktop Left Sidebar Filters (4 cols) */}
          <div className="hidden lg:block lg:col-span-3">
            <FilterSidebar
              filters={filters}
              onFilterChange={handleFilterChange}
              onResetFilters={handleResetFilters}
              availableOperators={availableOperators}
              priceBounds={priceBounds}
              activeCount={activeFilterCount}
            />
          </div>

          {/* Results Main Column (9 cols) */}
          <div className="lg:col-span-9 space-y-4">
            {/* Sorting & Filter Header Bar */}
            <SortBar
              activeSort={sort}
              onSortChange={setSort}
              totalCount={sortedTrips.length}
            />

            {/* Loading Skeleton State */}
            {isLoading && (
              <div className="space-y-4">
                {[1, 2, 3].map((n) => (
                  <div key={n} className="bg-white rounded-card border border-brand-border p-6 space-y-4 shadow-sm animate-pulse">
                    <div className="flex justify-between items-center">
                      <div className="h-5 bg-gray-200 rounded w-1/3" />
                      <div className="h-5 bg-gray-200 rounded w-1/6" />
                    </div>
                    <div className="grid grid-cols-3 gap-4 py-2">
                      <div className="h-10 bg-gray-200 rounded" />
                      <div className="h-10 bg-gray-200 rounded" />
                      <div className="h-10 bg-gray-200 rounded" />
                    </div>
                    <div className="h-8 bg-gray-200 rounded w-1/4 ml-auto" />
                  </div>
                ))}
              </div>
            )}

            {/* Empty Results State */}
            {!isLoading && sortedTrips.length === 0 && (
              <div className="bg-white rounded-card border border-brand-border p-8 sm:p-12 text-center shadow-card space-y-4">
                <div className="w-16 h-16 rounded-full bg-red-50 text-brand-red flex items-center justify-center mx-auto">
                  <Frown className="w-8 h-8" />
                </div>

                <div className="max-w-md mx-auto space-y-2">
                  <h3 className="text-xl font-bold text-brand-navy">
                    No Buses Found
                  </h3>
                  <p className="text-sm text-brand-muted">
                    No scheduled bus services match{' '}
                    <strong className="text-brand-navy">{fromCity}</strong> to{' '}
                    <strong className="text-brand-navy">{toCity}</strong> on{' '}
                    <strong className="text-brand-navy">{journeyDate}</strong>
                    {activeFilterCount > 0 ? ' with your selected filters.' : '.'}
                  </p>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-3 pt-3">
                  {activeFilterCount > 0 && (
                    <Button
                      variant="primary"
                      size="md"
                      icon={RotateCcw}
                      onClick={handleResetFilters}
                    >
                      Clear All Filters ({activeFilterCount})
                    </Button>
                  )}

                  {/* Quick Shortcut to Verified Live Trip */}
                  <Button
                    variant="outline"
                    size="md"
                    onClick={() => {
                      setForceMock(false);
                      setSearchParams({ from: 'Bengaluru', to: 'Hyderabad', date: '2026-11-23' });
                    }}
                  >
                    View Live Supabase Trip (BLR → HYD)
                  </Button>

                  {/* Switch to demo mode button */}
                  {!forceMock && (
                    <Button
                      variant="ghost"
                      size="md"
                      onClick={() => setForceMock(true)}
                    >
                      Explore in Demo Mode
                    </Button>
                  )}
                </div>
              </div>
            )}

            {/* Bus Cards List */}
            {!isLoading && sortedTrips.length > 0 && (
              <div className="space-y-4">
                {sortedTrips.map((bus) => (
                  <BusCard key={bus.id} bus={bus} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Slide-Up Filters Modal */}
      {mobileFilterOpen && (
        <FilterSidebar
          filters={filters}
          onFilterChange={handleFilterChange}
          onResetFilters={handleResetFilters}
          availableOperators={availableOperators}
          priceBounds={priceBounds}
          isMobileModal={true}
          onCloseMobileModal={() => setMobileFilterOpen(false)}
          activeCount={activeFilterCount}
        />
      )}
    </div>
  );
};

export default SearchResultsPage;
