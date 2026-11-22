import React from 'react';
import { Star, ShieldCheck, Bus, Award } from 'lucide-react';
import { VERIFIED_OPERATORS } from '../../data/mockData';
import { Badge } from '../ui/Badge';

export const PopularOperators = () => {
  return (
    <section className="py-14 bg-white border-t border-brand-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-brand-red text-xs font-bold uppercase tracking-wider mb-1">
              <Award className="w-4 h-4" />
              <span>Verified Fleet Partners</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-brand-navy tracking-tight">
              Top Rated Bus Operators
            </h2>
            <p className="text-sm text-brand-muted mt-1">
              Travel with India's most trusted luxury and sleeper coach partners
            </p>
          </div>
          <Badge variant="success" size="md" dot>
            Safety Audited Fleet
          </Badge>
        </div>

        {/* Operators Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {VERIFIED_OPERATORS.map((operator) => (
            <div
              key={operator.id}
              className="rounded-card border border-brand-border p-5 shadow-card hover:shadow-card-hover transition-all duration-200 bg-white flex flex-col justify-between"
            >
              <div className="space-y-4">
                {/* Top Row: Name and Rating */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-red-50 text-brand-red flex items-center justify-center font-bold text-lg border border-red-100 shrink-0">
                      <Bus className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-brand-navy">
                        {operator.name}
                      </h3>
                      <p className="text-xs text-brand-muted">
                        Fleet: {operator.fleetSize}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 bg-emerald-50 border border-emerald-200 text-emerald-800 px-2 py-1 rounded-lg text-xs font-black shrink-0">
                    <Star className="w-3.5 h-3.5 fill-emerald-600 text-emerald-600" />
                    <span>{operator.rating}</span>
                  </div>
                </div>

                {/* Highlight Badge */}
                <div className="inline-block px-2.5 py-1 rounded-md bg-amber-50 text-amber-800 border border-amber-200 text-[11px] font-semibold">
                  ★ {operator.highlight}
                </div>

                {/* Bus Types */}
                <div className="text-xs text-brand-muted">
                  <span className="font-semibold text-brand-navy">Coach Types: </span>
                  <span>{operator.busTypes}</span>
                </div>

                {/* Amenities Pills */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {operator.amenities.map((amenity, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded text-[10px] font-medium bg-gray-100 text-brand-text border border-gray-200"
                    >
                      {amenity}
                    </span>
                  ))}
                </div>
              </div>

              {/* Bottom reviews badge */}
              <div className="mt-5 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-brand-muted">
                <span className="flex items-center gap-1 text-emerald-700 font-semibold">
                  <ShieldCheck className="w-3.5 h-3.5 text-brand-success" />
                  Verified Operator
                </span>
                <span>{operator.reviewsCount} reviews</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PopularOperators;

