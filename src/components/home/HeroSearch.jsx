import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  MapPin, 
  ArrowLeftRight, 
  Calendar, 
  Search, 
  Sparkles,
  ChevronDown,
  TrendingUp
} from 'lucide-react';
import { INDIAN_CITIES } from '../../data/mockData';
import { Button } from '../ui/Button';

export const HeroSearch = ({ onSearch }) => {
  const navigate = useNavigate();
  const [fromCity, setFromCity] = useState('Bengaluru');
  const [toCity, setToCity] = useState('Hyderabad');
  const [journeyDate, setJourneyDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  });
  const [showFromDropdown, setShowFromDropdown] = useState(false);
  const [showToDropdown, setShowToDropdown] = useState(false);
  const [isSwapping, setIsSwapping] = useState(false);
  const [error, setError] = useState('');

  const handleSwapCities = () => {
    setIsSwapping(true);
    const temp = fromCity;
    setFromCity(toCity);
    setToCity(temp);
    setError('');
    setTimeout(() => setIsSwapping(false), 300);
  };

  const setDatePreset = (daysOffset) => {
    const d = new Date();
    d.setDate(d.getDate() + daysOffset);
    setJourneyDate(d.toISOString().split('T')[0]);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!fromCity) {
      setError('Please select a departure (From) city');
      return;
    }
    if (!toCity) {
      setError('Please select a destination (To) city');
      return;
    }
    if (fromCity === toCity) {
      setError('Departure and destination cities cannot be identical');
      return;
    }
    if (!journeyDate) {
      setError('Please select your date of journey');
      return;
    }

    if (onSearch) {
      onSearch({ from: fromCity, to: toCity, date: journeyDate });
    } else {
      navigate(`/search?from=${encodeURIComponent(fromCity)}&to=${encodeURIComponent(toCity)}&date=${encodeURIComponent(journeyDate)}`);
    }
  };

  const formatDisplayDate = (dateStr) => {
    if (!dateStr) return '';
    try {
      const parts = dateStr.split('-');
      const d = new Date(parts[0], parts[1] - 1, parts[2]);
      return d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="relative bg-gradient-to-b from-brand-navy via-slate-900 to-brand-navy pt-12 pb-20 sm:pb-28 px-4 sm:px-6 lg:px-8 text-white overflow-hidden">
      {/* Background Decorative Overlay */}
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#D84E55_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-brand-red/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-6xl mx-auto space-y-8 z-10">
        {/* Hero Title & Value Proposition */}
        <div className="text-center space-y-3 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs font-semibold text-amber-300">
            <Sparkles className="w-3.5 h-3.5" />
            <span>India's Premier Online Bus Ticket Booking Platform</span>
          </div>
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
            Book Bus Tickets Online <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-rose-300 to-amber-200">
              With Verified Seat Selection
            </span>
          </h1>
          <p className="text-gray-300 text-sm sm:text-base max-w-2xl mx-auto">
            Choose from over 3,500+ private operators and RTCs across India. Live seat layouts, instant PNR confirmation, and zero convenience fees on first trip.
          </p>
        </div>

        {/* Elevated RedBus-Inspired Search Card */}
        <div className="bg-white rounded-card-lg p-4 sm:p-6 shadow-search border border-brand-border/60 text-brand-text">
          <form onSubmit={handleSearchSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
              {/* FROM City */}
              <div className="relative md:col-span-4">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-brand-muted mb-1 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-brand-red" />
                  <span>From</span>
                </label>
                <div 
                  className="flex items-center border border-brand-border rounded-lg p-3 hover:border-brand-red focus-within:border-brand-red focus-within:ring-1 focus-within:ring-brand-red bg-white cursor-pointer transition-colors"
                  onClick={() => {
                    setShowFromDropdown(!showFromDropdown);
                    setShowToDropdown(false);
                  }}
                >
                  <div className="flex-1">
                    <p className="text-base font-bold text-brand-navy leading-none">
                      {fromCity || 'Select Origin'}
                    </p>
                    <p className="text-[11px] text-brand-muted mt-1 truncate">
                      {INDIAN_CITIES.find(c => c.name === fromCity)?.terminals[0] || 'Pick departure point'}
                    </p>
                  </div>
                  <ChevronDown className="w-4 h-4 text-brand-muted" />
                </div>

                {/* From Dropdown Menu */}
                {showFromDropdown && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl shadow-2xl border border-brand-border z-50 max-h-64 overflow-y-auto divide-y divide-gray-100 animate-in fade-in zoom-in-95 duration-150">
                    {INDIAN_CITIES.map((city) => (
                      <div
                        key={city.id}
                        className={`p-3 hover:bg-red-50/60 cursor-pointer transition-colors flex items-center justify-between ${
                          fromCity === city.name ? 'bg-red-50 text-brand-red font-semibold' : ''
                        }`}
                        onClick={() => {
                          setFromCity(city.name);
                          setShowFromDropdown(false);
                          setError('');
                        }}
                      >
                        <div>
                          <p className="text-sm font-bold text-brand-navy">{city.name}</p>
                          <p className="text-[11px] text-brand-muted">{city.state} • {city.terminals.slice(0, 2).join(', ')}</p>
                        </div>
                        {fromCity === city.name && (
                          <span className="text-xs text-brand-red font-bold">Selected</span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* SWAP Cities Button */}
              <div className="flex justify-center md:col-span-1">
                <button
                  type="button"
                  onClick={handleSwapCities}
                  className={`w-11 h-11 rounded-full bg-gray-50 border border-brand-border text-brand-navy hover:bg-brand-red hover:text-white hover:border-brand-red transition-all duration-300 flex items-center justify-center shadow-sm ${
                    isSwapping ? 'rotate-180 scale-110' : ''
                  }`}
                  title="Swap From and To cities"
                  aria-label="Swap cities"
                >
                  <ArrowLeftRight className="w-4 h-4" />
                </button>
              </div>

              {/* TO City */}
              <div className="relative md:col-span-4">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-brand-muted mb-1 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-brand-success" />
                  <span>To</span>
                </label>
                <div 
                  className="flex items-center border border-brand-border rounded-lg p-3 hover:border-brand-red focus-within:border-brand-red focus-within:ring-1 focus-within:ring-brand-red bg-white cursor-pointer transition-colors"
                  onClick={() => {
                    setShowToDropdown(!showToDropdown);
                    setShowFromDropdown(false);
                  }}
                >
                  <div className="flex-1">
                    <p className="text-base font-bold text-brand-navy leading-none">
                      {toCity || 'Select Destination'}
                    </p>
                    <p className="text-[11px] text-brand-muted mt-1 truncate">
                      {INDIAN_CITIES.find(c => c.name === toCity)?.terminals[0] || 'Pick dropping point'}
                    </p>
                  </div>
                  <ChevronDown className="w-4 h-4 text-brand-muted" />
                </div>

                {/* To Dropdown Menu */}
                {showToDropdown && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl shadow-2xl border border-brand-border z-50 max-h-64 overflow-y-auto divide-y divide-gray-100 animate-in fade-in zoom-in-95 duration-150">
                    {INDIAN_CITIES.map((city) => (
                      <div
                        key={city.id}
                        className={`p-3 hover:bg-red-50/60 cursor-pointer transition-colors flex items-center justify-between ${
                          toCity === city.name ? 'bg-red-50 text-brand-red font-semibold' : ''
                        } ${fromCity === city.name ? 'opacity-40 pointer-events-none' : ''}`}
                        onClick={() => {
                          setToCity(city.name);
                          setShowToDropdown(false);
                          setError('');
                        }}
                      >
                        <div>
                          <p className="text-sm font-bold text-brand-navy">{city.name}</p>
                          <p className="text-[11px] text-brand-muted">{city.state} • {city.terminals.slice(0, 2).join(', ')}</p>
                        </div>
                        {toCity === city.name && (
                          <span className="text-xs text-brand-red font-bold">Selected</span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* DATE Picker */}
              <div className="relative md:col-span-3">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-brand-muted mb-1 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-blue-500" />
                  <span>Date of Journey</span>
                </label>
                <div className="relative border border-brand-border rounded-lg p-2.5 hover:border-brand-red bg-white transition-colors">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-bold text-brand-navy leading-none">
                        {formatDisplayDate(journeyDate)}
                      </p>
                      <input
                        type="date"
                        value={journeyDate}
                        min={new Date().toISOString().split('T')[0]}
                        onChange={(e) => setJourneyDate(e.target.value)}
                        className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
                      />
                      <p className="text-[10px] text-brand-muted mt-0.5">Click to change date</p>
                    </div>
                    <Calendar className="w-5 h-5 text-brand-muted pointer-events-none" />
                  </div>
                </div>
              </div>
            </div>

            {/* Error Feedback */}
            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg font-medium">
                {error}
              </div>
            )}

            {/* Bottom Row: Quick Date Shortcuts & Search CTA */}
            <div className="flex flex-col sm:flex-row items-center justify-between pt-2 border-t border-gray-100 gap-3">
              <div className="flex items-center gap-2 text-xs">
                <span className="text-brand-muted font-medium">Quick Dates:</span>
                <button
                  type="button"
                  onClick={() => setDatePreset(0)}
                  className="px-2.5 py-1 rounded bg-gray-100 hover:bg-gray-200 text-brand-navy font-semibold text-[11px] transition-colors"
                >
                  Today
                </button>
                <button
                  type="button"
                  onClick={() => setDatePreset(1)}
                  className="px-2.5 py-1 rounded bg-red-50 hover:bg-red-100 text-brand-red font-semibold text-[11px] transition-colors"
                >
                  Tomorrow
                </button>
                <button
                  type="button"
                  onClick={() => setDatePreset(2)}
                  className="px-2.5 py-1 rounded bg-gray-100 hover:bg-gray-200 text-brand-navy font-semibold text-[11px] transition-colors"
                >
                  Day After
                </button>
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                icon={Search}
                iconPosition="right"
                className="w-full sm:w-auto px-8 text-sm font-bold tracking-wide uppercase shadow-md hover:shadow-lg"
              >
                Search Buses
              </Button>
            </div>
          </form>
        </div>

        {/* Popular Route Shortcuts Under Hero */}
        <div className="flex flex-wrap items-center justify-center gap-2 text-xs text-gray-300">
          <span className="text-gray-400 flex items-center gap-1 font-medium">
            <TrendingUp className="w-3.5 h-3.5 text-amber-300" />
            Trending Routes:
          </span>
          {[
            { from: 'Bengaluru', to: 'Hyderabad' },
            { from: 'Bengaluru', to: 'Chennai' },
            { from: 'Mumbai', to: 'Pune' },
            { from: 'Delhi', to: 'Jaipur' },
            { from: 'Pune', to: 'Goa' },
          ].map((r, i) => (
            <button
              key={i}
              type="button"
              onClick={() => {
                setFromCity(r.from);
                setToCity(r.to);
                setError('');
              }}
              className="bg-white/10 hover:bg-white/20 text-white px-2.5 py-1 rounded-full border border-white/10 transition-colors"
            >
              {r.from} → {r.to}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HeroSearch;

