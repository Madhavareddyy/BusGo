import React, { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';
import { FAQ_ITEMS } from '../../data/mockData';

export const FaqSection = () => {
  const [openId, setOpenId] = useState('faq-1');

  const toggleAccordion = (id) => {
    setOpenId(openId === id ? null : id);
  };

  return (
    <section className="py-16 bg-white border-t border-brand-border">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 text-brand-red text-xs font-bold uppercase tracking-wider">
            <HelpCircle className="w-4 h-4" />
            <span>Got Questions?</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-brand-navy tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="text-sm text-brand-muted">
            Everything you need to know about booking, seat locking, and travel policies on BusGo.
          </p>
        </div>

        {/* Accordion list */}
        <div className="space-y-3">
          {FAQ_ITEMS.map((item) => {
            const isOpen = openId === item.id;
            return (
              <div
                key={item.id}
                className={`rounded-card border transition-all duration-200 overflow-hidden ${
                  isOpen ? 'border-brand-red/60 shadow-sm bg-red-50/10' : 'border-brand-border hover:border-gray-300 bg-white'
                }`}
              >
                <button
                  type="button"
                  onClick={() => toggleAccordion(item.id)}
                  className="w-full p-4.5 text-left flex items-center justify-between gap-4 select-none focus:outline-none"
                  aria-expanded={isOpen}
                >
                  <span className={`text-sm sm:text-base font-bold ${isOpen ? 'text-brand-red' : 'text-brand-navy'}`}>
                    {item.question}
                  </span>
                  <div className={`p-1 rounded-full shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180 text-brand-red bg-red-100/60' : 'text-brand-muted'}`}>
                    <ChevronDown className="w-5 h-5" />
                  </div>
                </button>

                {isOpen && (
                  <div className="px-5 pb-5 text-xs sm:text-sm text-brand-text leading-relaxed border-t border-gray-100/80 pt-3 animate-in fade-in duration-200">
                    {item.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FaqSection;
