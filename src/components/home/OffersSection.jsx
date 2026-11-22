import React, { useState } from 'react';
import { Tag, Copy, Check, Sparkles, Clock } from 'lucide-react';
import { PROMOTIONAL_OFFERS } from '../../data/mockData';

export const OffersSection = () => {
  const [copiedCode, setCopiedCode] = useState(null);

  const handleCopyCode = (code) => {
    navigator.clipboard?.writeText(code);
    setCopiedCode(code);
    setTimeout(() => {
      setCopiedCode(null);
    }, 2500);
  };

  return (
    <section id="offers-section" className="py-12 bg-white border-y border-brand-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2 text-brand-red text-xs font-bold uppercase tracking-wider mb-1">
              <Sparkles className="w-4 h-4" />
              <span>Exclusive Travel Offers</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-brand-navy tracking-tight">
              Best Bus Booking Deals & Coupons
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-brand-muted max-w-sm">
            Save extra on every bus trip. Apply discount codes during checkout.
          </p>
        </div>

        {/* Offers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {PROMOTIONAL_OFFERS.map((offer) => {
            const isCopied = copiedCode === offer.code;

            return (
              <div
                key={offer.id}
                className="rounded-card border border-brand-border bg-white p-5 shadow-card hover:shadow-card-hover transition-all duration-200 flex flex-col justify-between relative overflow-hidden group"
              >
                {/* Accent top stripe */}
                <div className={`h-1.5 w-full absolute top-0 left-0 bg-gradient-to-r ${offer.bgColor}`} />

                <div className="space-y-3 pt-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold tracking-wider px-2 py-0.5 rounded bg-gray-100 text-brand-navy uppercase">
                      {offer.category}
                    </span>
                    <span className="text-[11px] text-brand-muted flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {offer.validTill}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-brand-navy group-hover:text-brand-red transition-colors">
                      {offer.title}
                    </h3>
                    <p className="text-sm font-extrabold text-brand-red mt-0.5">
                      {offer.discount}
                    </p>
                  </div>

                  <p className="text-xs text-brand-muted leading-relaxed line-clamp-2">
                    {offer.description}
                  </p>
                </div>

                {/* Coupon Code Pill & Copy Button */}
                <div className="mt-5 pt-3 border-t border-dashed border-gray-200 flex items-center justify-between">
                  <div className="font-mono text-xs font-bold text-brand-navy bg-gray-100 px-2.5 py-1.5 rounded-lg border border-gray-300 tracking-wider">
                    {offer.code}
                  </div>

                  <button
                    type="button"
                    onClick={() => handleCopyCode(offer.code)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      isCopied
                        ? 'bg-emerald-50 text-brand-success border border-emerald-300'
                        : 'bg-red-50 text-brand-red hover:bg-brand-red hover:text-white'
                    }`}
                  >
                    {isCopied ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Code</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default OffersSection;
