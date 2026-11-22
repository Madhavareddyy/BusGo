import React from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Bus, 
  Clock, 
  MapPin, 
  Star, 
  ShieldCheck, 
  Wifi, 
  Zap, 
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';

export const SearchResultsPlaceholder = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const fromCity = searchParams.get('from') || 'Bengaluru';
  const toCity = searchParams.get('to') || 'Hyderabad';
  const date = searchParams.get('date') || new Date().toISOString().split('T')[0];

  const mockBuses = [
    {
      id: 'bus-1',
      operator: 'Sunrise Travels',
      busType: 'Volvo Multi-Axle AC Sleeper (2+1)',
      departureTime: '21:30',
      arrivalTime: '06:45',
      duration: '9h 15m',
      fromStop: 'Majestic (KBS) Platform 4',
      toStop: 'MGBS Terminal 2',
      fare: 899,
      seatsAvailable: 14,
      rating: 4.8,
      reviewsCount: '1,420',
      badge: 'Fastest Route',
    },
    {
      id: 'bus-2',
      operator: 'Royal Roadways',
      busType: 'Mercedes Super High Deck AC Sleeper',
      departureTime: '22:00',
      arrivalTime: '07:30',
      duration: '9h 30m',
      fromStop: 'Madiwala St. Johns Signal',
      toStop: 'Gachibowli ORR Junction',
      fare: 1150,
      seatsAvailable: 8,
      rating: 4.9,
      reviewsCount: '2,890',
      badge: 'Luxury Coach',
    },
    {
      id: 'bus-3',
      operator: 'GreenLine Express',
      busType: 'BharatBenz AC Semi-Sleeper (2+2)',
      departureTime: '20:15',
      arrivalTime: '05:45',
      duration: '9h 30m',
      fromStop: 'Electronic City Toll Plaza',
      toStop: 'Ameerpet Metro Station',
      fare: 699,
      seatsAvailable: 22,
      rating: 4.7,
      reviewsCount: '980',
      badge: 'Best Value',
    },
  ];

  return (
    <div className="min-h-screen bg-brand-bg py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Navigation back and header strip */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-card border border-brand-border shadow-card">
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              icon={ArrowLeft}
              onClick={() => navigate('/')}
            >
              Modify Search
            </Button>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-brand-navy">
                  {fromCity} → {toCity}
                </h1>
                <Badge variant="primary" size="sm">
                  {date}
                </Badge>
              </div>
              <p className="text-xs text-brand-muted mt-0.5">
                Showing {mockBuses.length} verified buses available for online booking
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="warning" dot>
              Phase 5 Live Filters Arriving Next
            </Badge>
          </div>
        </div>

        {/* Phase Milestone Callout */}
        <div className="p-4 rounded-xl bg-gradient-to-r from-red-50 via-rose-50 to-amber-50 border border-red-200 flex items-start gap-3.5">
          <Sparkles className="w-5 h-5 text-brand-red shrink-0 mt-0.5" />
          <div className="text-xs text-brand-navy space-y-1">
            <p className="font-bold text-sm">Phase 2 Search Navigation Verified!</p>
            <p className="text-brand-muted">
              The homepage search parameters have successfully dispatched. Interactive multi-facet filters (AC/Non-AC, Sleeper/Seater, Price Sliders, Timings) will be wired with PostgreSQL in Phase 5.
            </p>
          </div>
        </div>

        {/* Bus List */}
        <div className="space-y-4">
          {mockBuses.map((bus) => (
            <div
              key={bus.id}
              className="bg-white rounded-card border border-brand-border p-5 shadow-card hover:shadow-card-hover transition-all duration-200"
            >
              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-5">
                {/* Operator info */}
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2.5">
                    <h3 className="text-lg font-bold text-brand-navy">
                      {bus.operator}
                    </h3>
                    <span className="flex items-center gap-1 bg-emerald-50 border border-emerald-200 text-emerald-800 px-1.5 py-0.5 rounded text-[11px] font-bold">
                      <Star className="w-3 h-3 fill-emerald-600 text-emerald-600" />
                      {bus.rating}
                    </span>
                    <span className="text-[11px] text-brand-muted">
                      ({bus.reviewsCount})
                    </span>
                  </div>

                  <p className="text-xs text-brand-muted font-medium">
                    {bus.busType}
                  </p>

                  <div className="inline-block px-2 py-0.5 rounded bg-gray-100 text-brand-text text-[10px] font-semibold border border-gray-200">
                    {bus.badge}
                  </div>
                </div>

                {/* Timing schedule */}
                <div className="flex items-center justify-between lg:justify-center gap-6 sm:gap-10 w-full lg:w-auto">
                  <div className="text-center sm:text-left">
                    <p className="text-lg font-black text-brand-navy">{bus.departureTime}</p>
                    <p className="text-[11px] text-brand-muted truncate max-w-[130px]">{bus.fromStop}</p>
                  </div>

                  <div className="flex flex-col items-center">
                    <span className="text-[11px] text-brand-muted font-medium">{bus.duration}</span>
                    <div className="w-20 sm:w-28 h-0.5 bg-gray-200 my-1 relative">
                      <div className="w-2 h-2 rounded-full bg-brand-red absolute left-0 -top-[3px]" />
                      <div className="w-2 h-2 rounded-full bg-brand-navy absolute right-0 -top-[3px]" />
                    </div>
                    <span className="text-[10px] text-emerald-700 font-semibold">Direct Route</span>
                  </div>

                  <div className="text-center sm:text-right">
                    <p className="text-lg font-black text-brand-navy">{bus.arrivalTime}</p>
                    <p className="text-[11px] text-brand-muted truncate max-w-[130px]">{bus.toStop}</p>
                  </div>
                </div>

                {/* Pricing & CTA */}
                <div className="flex items-center justify-between lg:justify-end gap-5 w-full lg:w-auto pt-4 lg:pt-0 border-t lg:border-t-0 border-gray-100">
                  <div className="text-left lg:text-right">
                    <span className="text-[11px] text-brand-muted">Starting from</span>
                    <p className="text-2xl font-black text-brand-navy leading-none">
                      ₹{bus.fare}
                    </p>
                    <p className="text-[11px] text-emerald-700 font-semibold mt-1">
                      {bus.seatsAvailable} Seats Left
                    </p>
                  </div>

                  <Button
                    variant="primary"
                    size="md"
                    className="font-bold text-xs uppercase tracking-wider"
                    onClick={() => alert(`Phase 6 will unlock interactive seat selection for ${bus.operator}!`)}
                  >
                    View Seats
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SearchResultsPlaceholder;
