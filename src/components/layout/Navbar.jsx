import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
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
  ChevronDown,
  LogOut,
  Sparkles,
  LayoutDashboard
} from 'lucide-react';
import { Logo } from '../common/Logo';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { useAuth } from '../../context/AuthContext';

export const Navbar = ({ onOpenManageBooking, onOpenHelp }) => {
  const { user, profile, role, isAuthenticated, logout, isDemoMode } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
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

  const getDashboardPath = () => {
    if (role === 'admin') return '/admin/dashboard';
    if (role === 'operator') return '/operator/dashboard';
    return '/profile';
  };

  const getRoleLabel = () => {
    if (role === 'admin') return 'Admin';
    if (role === 'operator') return 'Bus Operator';
    return 'Passenger';
  };

  return (
    <>
      {/* Top micro announcement bar */}
      <div className="bg-brand-navy text-gray-300 text-[11px] sm:text-xs py-1.5 px-4 sm:px-8 border-b border-gray-800">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 text-emerald-400 font-medium">
              <ShieldCheck className="w-3.5 h-3.5" />
              100% Verified Indian Bus Booking
            </span>
            <span className="hidden md:inline text-gray-500">|</span>
            <span className="hidden md:inline text-gray-400">
              Zero Booking Fee on First Ticket with code <strong className="text-white">BUSGOFIRST</strong>
            </span>
          </div>
          <div className="flex items-center gap-4">
            {isDemoMode && (
              <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold">
                <Sparkles className="w-3 h-3" />
                DEMO AUTH ACTIVE
              </span>
            )}
            <a 
              href="tel:18002874646" 
              className="flex items-center gap-1.5 text-gray-300 hover:text-white transition-colors"
            >
              <PhoneCall className="w-3 h-3 text-brand-red" />
              <span className="font-semibold">Helpline: 1800-BUS-GO-IN</span>
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

            {isAuthenticated ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2.5 p-1.5 pl-3 rounded-full border border-brand-border hover:border-gray-400 bg-white transition-all shadow-sm"
                >
                  <div className="text-right">
                    <p className="text-xs font-bold text-brand-navy leading-none">
                      {profile?.full_name?.split(' ')[0] || 'User'}
                    </p>
                    <span className="text-[10px] font-semibold text-brand-red uppercase">
                      {getRoleLabel()}
                    </span>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-brand-red text-white flex items-center justify-center font-bold text-xs">
                    {profile?.full_name?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-brand-muted pr-1" />
                </button>

                {/* Dropdown Menu */}
                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-brand-border py-2 z-50 animate-in fade-in zoom-in-95 duration-150 divide-y divide-gray-100">
                    <div className="px-4 py-2.5">
                      <p className="text-xs font-bold text-brand-navy truncate">
                        {profile?.full_name}
                      </p>
                      <p className="text-[11px] text-brand-muted truncate">
                        {profile?.email}
                      </p>
                      <div className="mt-1">
                        <Badge variant="primary" size="sm">
                          {getRoleLabel()}
                        </Badge>
                      </div>
                    </div>

                    <div className="py-1">
                      <Link
                        to={getDashboardPath()}
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-xs text-brand-text hover:bg-gray-50 hover:text-brand-red font-medium"
                      >
                        <LayoutDashboard className="w-4 h-4 text-brand-muted" />
                        <span>
                          {role === 'customer' ? 'My Passenger Profile' : 'Portal Dashboard'}
                        </span>
                      </Link>

                      {role === 'customer' && (
                        <button
                          type="button"
                          onClick={() => {
                            setUserDropdownOpen(false);
                            onOpenManageBooking?.();
                          }}
                          className="w-full text-left flex items-center gap-2 px-4 py-2 text-xs text-brand-text hover:bg-gray-50 hover:text-brand-red font-medium"
                        >
                          <Ticket className="w-4 h-4 text-brand-muted" />
                          <span>My Bookings</span>
                        </button>
                      )}
                    </div>

                    <div className="py-1">
                      <button
                        type="button"
                        onClick={async () => {
                          setUserDropdownOpen(false);
                          await logout();
                          navigate('/');
                        }}
                        className="w-full text-left flex items-center gap-2 px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 font-semibold"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/login">
                <Button
                  variant="primary"
                  size="md"
                  icon={User}
                  className="text-xs font-bold uppercase tracking-wider shadow-sm"
                >
                  Login / Register
                </Button>
              </Link>
            )}
          </div>

          {/* Mobile hamburger button */}
          <div className="flex md:hidden items-center gap-2">
            <Link to={isAuthenticated ? getDashboardPath() : '/login'}>
              <Button
                variant="ghost"
                size="sm"
                className="p-2"
                aria-label="Account"
              >
                <User className="w-5 h-5 text-brand-navy" />
              </Button>
            </Link>
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
            {isAuthenticated ? (
              <div className="p-3 bg-red-50/60 rounded-xl border border-red-100 flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-brand-navy">{profile?.full_name}</p>
                  <p className="text-xs text-brand-muted">{profile?.email}</p>
                  <span className="text-[10px] font-bold text-brand-red uppercase">{getRoleLabel()}</span>
                </div>
                <Link to={getDashboardPath()} onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="outline" size="sm" className="text-xs">
                    View
                  </Button>
                </Link>
              </div>
            ) : null}

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
                  </a>
                );
              })}
            </div>

            <div className="pt-3 border-t border-gray-100 space-y-2">
              {isAuthenticated ? (
                <Button
                  variant="outline"
                  size="md"
                  className="w-full justify-center text-sm font-bold text-rose-600 border-rose-200 hover:bg-rose-50"
                  icon={LogOut}
                  onClick={async () => {
                    setMobileMenuOpen(false);
                    await logout();
                    navigate('/');
                  }}
                >
                  Sign Out
                </Button>
              ) : (
                <>
                  <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="block">
                    <Button
                      variant="primary"
                      size="md"
                      className="w-full justify-center text-sm font-bold"
                      icon={User}
                    >
                      Sign In / Register
                    </Button>
                  </Link>
                  <Link to="/operator/login" onClick={() => setMobileMenuOpen(false)} className="block">
                    <Button
                      variant="outline"
                      size="md"
                      className="w-full justify-center text-sm font-medium"
                    >
                      Bus Operator Portal
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </nav>
    </>
  );
};

export default Navbar;
