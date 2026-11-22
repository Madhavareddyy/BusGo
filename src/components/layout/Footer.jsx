import React from 'react';
import { 
  Bus, 
  ShieldCheck, 
  Clock, 
  PhoneCall, 
  Mail, 
  MapPin
} from 'lucide-react';
import { Logo } from '../common/Logo';
import { INDIAN_CITIES, POPULAR_ROUTES } from '../../data/mockData';

export const Footer = ({ onOpenFaq, onOpenPolicy }) => {
  return (
    <footer className="bg-brand-navy text-gray-300 pt-16 pb-8 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Top 4 Value Badges */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pb-12 border-b border-slate-800">
          <div className="flex items-center gap-3.5 p-4 rounded-xl bg-slate-800/50 border border-slate-700/60">
            <div className="w-10 h-10 rounded-lg bg-red-500/10 text-brand-red flex items-center justify-center shrink-0">
              <Bus className="w-5 h-5" />
            </div>
            <div>
              <p className="text-white text-sm font-bold">3,500+ Bus Partners</p>
              <p className="text-xs text-gray-400">Verified operators across India</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5 p-4 rounded-xl bg-slate-800/50 border border-slate-700/60">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 text-brand-success flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-white text-sm font-bold">100% Safe & Secure</p>
              <p className="text-xs text-gray-400">Simulated atomic checkout</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5 p-4 rounded-xl bg-slate-800/50 border border-slate-700/60">
            <div className="w-10 h-10 rounded-lg bg-amber-500/10 text-brand-warning flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <p className="text-white text-sm font-bold">Real-Time Seat Locks</p>
              <p className="text-xs text-gray-400">Zero double-booking guarantee</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5 p-4 rounded-xl bg-slate-800/50 border border-slate-700/60">
            <div className="w-10 h-10 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center shrink-0">
              <PhoneCall className="w-5 h-5" />
            </div>
            <div>
              <p className="text-white text-sm font-bold">24x7 Customer Care</p>
              <p className="text-xs text-gray-400">Toll-free 1800-BUS-GO-IN</p>
            </div>
          </div>
        </div>

        {/* Multi-column Navigation Directory */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 text-sm">
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <Logo size="md" white />
            <p className="text-gray-400 text-xs sm:text-sm leading-relaxed max-w-sm">
              BusGo is India's leading simulated online bus ticketing platform, connecting travelers to over 100,000 routes with premier operators like Sunrise Travels, Royal Roadways, and GreenLine Express.
            </p>
            <div className="pt-2 text-xs text-gray-400 space-y-1">
              <p className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-brand-red shrink-0" />
                BusGo Mobility Tower, MG Road, Bengaluru, KA 560001
              </p>
              <p className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-brand-red shrink-0" />
                support@busgo.in | contact@busgo.in
              </p>
            </div>
          </div>

          {/* Top Routes */}
          <div className="space-y-3">
            <h4 className="text-white font-bold uppercase tracking-wider text-xs">Popular Routes</h4>
            <ul className="space-y-2 text-xs text-gray-400">
              {POPULAR_ROUTES.slice(0, 5).map((r) => (
                <li key={r.id}>
                  <a href={`#search-${r.id}`} className="hover:text-brand-red transition-colors flex items-center gap-1">
                    <span>{r.from} to {r.to}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Top Cities */}
          <div className="space-y-3">
            <h4 className="text-white font-bold uppercase tracking-wider text-xs">Top Cities</h4>
            <ul className="space-y-2 text-xs text-gray-400">
              {INDIAN_CITIES.slice(0, 5).map((c) => (
                <li key={c.id}>
                  <a href={`#city-${c.id}`} className="hover:text-brand-red transition-colors">
                    {c.name} Bus Stand
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer Care & Policies */}
          <div className="space-y-3">
            <h4 className="text-white font-bold uppercase tracking-wider text-xs">Legal & Support</h4>
            <ul className="space-y-2 text-xs text-gray-400">
              <li>
                <button onClick={onOpenFaq} className="hover:text-brand-red transition-colors text-left">
                  Frequently Asked Questions
                </button>
              </li>
              <li>
                <button onClick={() => onOpenPolicy?.('cancellation')} className="hover:text-brand-red transition-colors text-left">
                  Cancellation & Refund Policy
                </button>
              </li>
              <li>
                <button onClick={() => onOpenPolicy?.('terms')} className="hover:text-brand-red transition-colors text-left">
                  Terms of Service
                </button>
              </li>
              <li>
                <button onClick={() => onOpenPolicy?.('privacy')} className="hover:text-brand-red transition-colors text-left">
                  Privacy Policy
                </button>
              </li>
              <li>
                <button onClick={() => onOpenPolicy?.('operator')} className="hover:text-brand-red transition-colors text-left">
                  Bus Operator Registration
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-400">
          <p>© 2026 BusGo Technologies Inc. All rights reserved. Inspired by redBus India.</p>
          <div className="flex items-center gap-4 text-gray-400">
            <span>Simulated Payments: UPI • RuPay • Visa • Mastercard • NetBanking</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
