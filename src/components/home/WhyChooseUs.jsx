import React from 'react';
import { 
  Clock, 
  RotateCcw, 
  Headphones, 
  Smartphone 
} from 'lucide-react';

export const WhyChooseUs = () => {
  const features = [
    {
      icon: Clock,
      title: 'Real-Time Seat Locking',
      description: 'Your chosen seats are reserved instantly for 10 minutes, preventing double-bookings while you safely complete checkout.',
      badge: 'Zero Conflict Guarantee',
      color: 'text-brand-red bg-red-50 border-red-200',
    },
    {
      icon: Smartphone,
      title: 'Instant M-Ticket & PDF',
      description: 'Download your official boarding pass with high-resolution verifiable QR code immediately upon simulated payment.',
      badge: 'Eco-Friendly M-Ticket',
      color: 'text-brand-success bg-emerald-50 border-emerald-200',
    },
    {
      icon: RotateCcw,
      title: 'Transparent Refund Rules',
      description: 'Cancel with a single click. View transparent refund calculations and enjoy immediate seat release back to available pool.',
      badge: 'Instant Simulation',
      color: 'text-blue-600 bg-blue-50 border-blue-200',
    },
    {
      icon: Headphones,
      title: '24x7 Customer Care',
      description: 'Reach our dedicated support specialists via toll-free helpline, instant chat, or WhatsApp for any travel assistance.',
      badge: '1800-BUS-GO-IN',
      color: 'text-amber-600 bg-amber-50 border-amber-200',
    },
  ];

  return (
    <section className="py-16 bg-brand-bg border-t border-brand-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Header */}
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-wider text-brand-red bg-red-50 px-3 py-1 rounded-full border border-red-200">
            The BusGo Advantage
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-brand-navy tracking-tight">
            Why Millions of Passengers Trust BusGo
          </h2>
          <p className="text-sm text-brand-muted">
            Engineered with modern concurrency control, instant mobile ticketing, and student-friendly transparency.
          </p>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((f, idx) => {
            const Icon = f.icon;
            return (
              <div
                key={idx}
                className="bg-white rounded-card-lg p-6 border border-brand-border shadow-card hover:shadow-card-hover transition-all duration-200 flex flex-col justify-between group"
              >
                <div className="space-y-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${f.color}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-brand-navy group-hover:text-brand-red transition-colors">
                      {f.title}
                    </h3>
                    <p className="text-xs text-brand-muted mt-2 leading-relaxed">
                      {f.description}
                    </p>
                  </div>
                </div>

                <div className="mt-6 pt-3 border-t border-gray-100">
                  <span className="text-[11px] font-bold text-brand-navy tracking-wide uppercase">
                    ✓ {f.badge}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUs;
