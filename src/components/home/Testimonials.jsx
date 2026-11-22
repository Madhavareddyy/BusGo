import React from 'react';
import { Star, Quote, CheckCircle2 } from 'lucide-react';
import { TESTIMONIALS } from '../../data/mockData';

export const Testimonials = () => {
  return (
    <section className="py-16 bg-white border-t border-brand-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Header */}
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-wider text-brand-red">
            Verified Passenger Experiences
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-brand-navy tracking-tight">
            Loved by Travelers Across India
          </h2>
          <p className="text-sm text-brand-muted">
            Read what real commuters have to say about their journeys with BusGo
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TESTIMONIALS.map((t) => (
            <div
              key={t.id}
              className="bg-brand-bg rounded-card-lg p-6 border border-brand-border shadow-sm flex flex-col justify-between relative group hover:border-brand-red transition-all duration-200"
            >
              <Quote className="w-8 h-8 text-gray-300 absolute top-5 right-5 group-hover:text-brand-red/30 transition-colors" />

              <div className="space-y-4">
                {/* 5 Stars */}
                <div className="flex items-center gap-1">
                  {[...Array(t.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>

                <p className="text-xs sm:text-sm text-brand-text leading-relaxed italic">
                  "{t.comment}"
                </p>

                <div className="pt-2 text-[11px] font-semibold text-brand-muted">
                  Route: <strong className="text-brand-navy">{t.route}</strong> ({t.busOperator})
                </div>
              </div>

              {/* Author Info */}
              <div className="mt-6 pt-4 border-t border-brand-border flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-brand-navy">{t.name}</h4>
                  <p className="text-xs text-brand-muted">{t.city} • {t.role}</p>
                </div>
                <div className="flex items-center gap-1 text-[11px] font-bold text-brand-success bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Verified</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
