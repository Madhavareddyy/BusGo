import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  Bus, 
  Ticket, 
  Tag, 
  HelpCircle, 
  User, 
  Menu, 
  X, 
  PhoneCall, 
  ShieldCheck, 
  ChevronRight
} from 'lucide-react';
import { Logo } from '../common/Logo';
import { Button } from '../ui/Button';

export const Navbar = ({ onOpenManageBooking, onOpenHelp, onOpenLogin }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const navLinks = [
    { label: 'Bus Tickets', to: '/', icon: Bus, active: location.pathname === '/' || location.pathname.startsWith('/search') },
    { 
      label: 'Manage Booking', 
      to: '#manage-booking', 
      icon: Ticket, 
      onClick: (e) => {
        e.preventDefault();
        onOpenManageBooking?.();
      } 
    },
    { 
      label: 'Offers', 
      to: '#offers', 
      icon: Tag,
      onClick: (e) => {
        e.preventDefault();
        const el = document.getElementById('offers-section');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
        else navigate('/#offers-section');
      }
    },
    { 
      label: 'Help', 
      to: '#help', 
      icon: HelpCircle,
      onClick: (e) => {
        e.preventDefault();
        onOpenHelp?.();
      }
    },
  ];

  return (
    <>
      {/* Top micro announcement bar */}
      <div className="bg-brand-navy text-gray-300 text-[11px] sm:text-xs py-1.5 px-4 sm:px-8 border-b border-gray-800">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 text-emerald-400 font-medium">
              <ShieldCheck className="w-3.5 h-3.5" />
              100% Safe & Verified Bus Booking
            </span>
            <span className="hidden md:inline text-gray-500">|</span>
            <span className="hidden md:inline text-gray-400">
              Zero Booking Fee on First Ticket with code <strong className="text-white">BUSGOFIRST</strong>
            </span>
          </div>
          <div className="flex items-center gap-4">
            <a 
              href="tel:18002874646" 
              className="flex items-center gap-1.5 text-gray-300 hover:text-white transition-colors"
            >
              <PhoneCall className="w-3 h-3 text-brand-red" />
              <span className="font-semibold">24x7 Helpline: 1800-BUS-GO-IN</span>
            </a>
            <span className="hidden sm:inline px-1.5 py-0.5 rounded bg-gray-800 text-[10px] font-bold text-gray-300 border border-gray-700">
              ₹ INR
            </span>
          </div>
        </div>
      </div>

      {/* Main sticky navigation */}
      <nav className="bg-white border-b border-brand-border sticky top-0 z-40 shadow-sm backdrop-blur-md bg-white/95">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-8">
            <Logo size="md" />
            
            {/* Desktop Navigation Links */}
            <div className="hidden lg:flex items-center gap-1">
              {navLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <a
                    key={link.label}
                    href={link.to}
                    onClick={link.onClick}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-semibold transition-all duration-150 cursor-pointer ${
                      link.active
                        ? 'text-brand-red bg-red-50/70'
                        : 'text-brand-text hover:text-brand-red hover:bg-gray-50'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${link.active ? 'text-brand-red' : 'text-brand-muted'}`} />
                    <span>{link.label}</span>
                  </a>
                );
              })}
            </div>
          </div>

          {/* Desktop Right Actions */}
          <div className="hidden md:flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              icon={Ticket}
              onClick={onOpenManageBooking}
              className="hidden lg:inline-flex text-xs font-semibold"
            >
              Print / SMS Ticket
            </Button>

            <Button
              variant="primary"
              size="md"
              icon={User}
              onClick={onOpenLogin}
              className="text-xs font-bold uppercase tracking-wider shadow-sm"
            >
              Login / My Account
            </Button>
          </div>

          {/* Mobile hamburger button */}
          <div className="flex md:hidden items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={onOpenLogin}
              className="p-2"
              aria-label="Account"
            >
              <User className="w-5 h-5 text-brand-navy" />
            </Button>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2.5 rounded-lg text-brand-navy hover:bg-gray-100 focus:outline-none"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Slide-down Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-brand-border bg-white px-4 pt-3 pb-6 space-y-3 animate-in slide-in-from-top-2 duration-200 shadow-xl">
            <div className="space-y-1">
              {navLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <a
                    key={link.label}
                    href={link.to}
                    onClick={(e) => {
                      setMobileMenuOpen(false);
                      if (link.onClick) link.onClick(e);
                    }}
                    className={`flex items-center justify-between px-3.5 py-3 rounded-lg text-sm font-semibold ${
                      link.active
                        ? 'bg-red-50 text-brand-red'
                        : 'text-brand-navy hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-5 h-5 text-brand-red" />
                      <span>{link.label}</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </a>
                );
              })}
            </div>

            <div className="pt-3 border-t border-gray-100 space-y-2">
              <Button
                variant="primary"
                size="md"
                className="w-full justify-center text-sm font-bold"
                icon={User}
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenLogin?.();
                }}
              >
                Sign In / Register
              </Button>

              <Button
                variant="outline"
                size="md"
                className="w-full justify-center text-sm font-medium"
                icon={Ticket}
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenManageBooking?.();
                }}
              >
                Manage Booking / PNR Status
              </Button>
            </div>

            <div className="p-3 bg-gray-50 rounded-lg text-xs text-brand-muted space-y-1">
              <p className="font-semibold text-brand-navy">24x7 Customer Support</p>
              <p>Toll-Free: 1800-BUS-GO-IN (1800-287-4646)</p>
              <p>Email: support@busgo.in</p>
            </div>
          </div>
        )}
      </nav>
    </>
  );
};

export default Navbar;
