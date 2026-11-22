import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Clock, Bus } from 'lucide-react';
import { POPULAR_ROUTES } from '../../data/mockData';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';

export const PopularRoutes = ({ onSelectRoute }) => {
  const navigate = useNavigate();

  const handleRouteClick = (route) => {
    if (onSelectRoute) {
      onSelectRoute(route);
    } else {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const dateStr = tomorrow.toISOString().split('T')[0];
      navigate(`/search?from=${encodeURIComponent(route.from)}&to=${encodeURIComponent(route.to)}&date=${dateStr}`);
    }
  };

  return (
    <section className="py-14 bg-brand-bg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-brand-red text-xs font-bold uppercase tracking-wider mb-1">
              <Bus className="w-4 h-4" />
              <span>High Frequency Interstate Corridors</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-brand-navy tracking-tight">
              Popular Bus Routes in India
            </h2>
            <p className="text-sm text-brand-muted mt-1">
              Fast daily connections between major metropolitan cities and tech hubs
            </p>
          </div>
          <Badge variant="navy" size="md">
            Over 300+ Daily Departures
          </Badge>
        </div>

        {/* Routes Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {POPULAR_ROUTES.map((route) => (
            <div
              key={route.id}
              onClick={() => handleRouteClick(route)}
              className="bg-white rounded-card border border-brand-border shadow-card hover:shadow-card-hover transition-all duration-200 overflow-hidden cursor-pointer group flex flex-col justify-between"
            >
              {/* Route Scenic Header Image */}
              <div className="relative h-40 overflow-hidden bg-gray-200">
                <img
                  src={route.image}
                  alt={`${route.from} to ${route.to} bus journey`}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                  {route.tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/90 backdrop-blur-sm text-brand-navy shadow-sm"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="absolute bottom-3 left-3 right-3 text-white">
                  <div className="flex items-center gap-1.5 text-base font-extrabold">
                    <span>{route.from}</span>
                    <ArrowRight className="w-4 h-4 text-brand-red" />
                    <span>{route.to}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-gray-300 mt-0.5">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {route.duration}
                    </span>
                    <span>•</span>
                    <span>{route.distance}</span>
                  </div>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-4 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-brand-muted">
                    {route.dailyBuses}+ Buses Available
                  </span>
                  <div className="text-right">
                    <span className="text-[11px] text-brand-muted">Starting from</span>
                    <p className="text-lg font-black text-brand-navy leading-none">
                      ₹{route.startingFare}
                    </p>
                  </div>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  className="w-full group-hover:bg-brand-red group-hover:text-white group-hover:border-brand-red transition-all text-xs font-bold"
                  icon={ArrowRight}
                  iconPosition="right"
                >
                  Book Bus Tickets
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PopularRoutes;

