import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import { Bus, Clock, ShieldCheck, MapPin, Users, DollarSign, ArrowRight, Sparkles, LogOut } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';

export const OperatorDashboardPreview = () => {
  const { profile, logout, isDemoMode } = useAuth();

  return (
    <div className="min-h-screen bg-brand-bg py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Operator Header Strip */}
        <div className="bg-slate-900 text-white p-6 rounded-card-lg border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-300 bg-white/10 px-2.5 py-0.5 rounded-full border border-white/20">
                Authorized Fleet Partner
              </span>
              <Badge variant="success" size="sm" dot>
                {profile?.status?.toUpperCase()}
              </Badge>
            </div>
            <h1 className="text-2xl font-black tracking-tight text-white">
              {profile?.company_name || 'Sunrise Travels'} Fleet Management
            </h1>
            <p className="text-xs text-gray-400">
              Permit: {profile?.registration_number || 'KA-01-2024-ST-9912'} • Manager: {profile?.full_name} • Base: {profile?.city || 'Bengaluru'}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              icon={LogOut}
              onClick={logout}
              className="bg-transparent text-white border-white/30 hover:bg-white/10 text-xs"
            >
              Sign Out
            </Button>
          </div>
        </div>

        {/* Phase Milestone Callout */}
        <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-50 via-teal-50 to-blue-50 border border-emerald-200 flex items-start gap-3.5">
          <Sparkles className="w-5 h-5 text-brand-success shrink-0 mt-0.5" />
          <div className="text-xs text-emerald-950 space-y-1">
            <p className="font-bold text-sm">Phase 3 Role-Based Access Control Verified!</p>
            <p className="text-emerald-800 leading-relaxed">
              You are authenticated as an authorized bus operator with protected route guards. Only operators with an approved permit status can view this dashboard. Full fleet management, bus creation, route scheduling, and live passenger manifests will be fully wired in <strong>Phase 11 (Bus Operator Dashboard)</strong>.
            </p>
          </div>
        </div>

        {/* 4 Summary Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-card border border-brand-border shadow-sm">
            <div className="flex items-center justify-between text-brand-muted text-xs">
              <span>Active Fleet Buses</span>
              <Bus className="w-4 h-4 text-brand-red" />
            </div>
            <p className="text-2xl font-black text-brand-navy mt-2">
              {profile?.fleet_size || 150} Buses
            </p>
            <p className="text-[11px] text-emerald-700 font-semibold mt-1">98% Operational</p>
          </div>

          <div className="bg-white p-5 rounded-card border border-brand-border shadow-sm">
            <div className="flex items-center justify-between text-brand-muted text-xs">
              <span>Daily Schedules</span>
              <Clock className="w-4 h-4 text-blue-600" />
            </div>
            <p className="text-2xl font-black text-brand-navy mt-2">48 Trips</p>
            <p className="text-[11px] text-brand-muted mt-1">Next departure in 25 mins</p>
          </div>

          <div className="bg-white p-5 rounded-card border border-brand-border shadow-sm">
            <div className="flex items-center justify-between text-brand-muted text-xs">
              <span>Today's Bookings</span>
              <Users className="w-4 h-4 text-amber-600" />
            </div>
            <p className="text-2xl font-black text-brand-navy mt-2">1,240 Seats</p>
            <p className="text-[11px] text-emerald-700 font-semibold mt-1">82% Occupancy Rate</p>
          </div>

          <div className="bg-white p-5 rounded-card border border-brand-border shadow-sm">
            <div className="flex items-center justify-between text-brand-muted text-xs">
              <span>Simulated Earnings</span>
              <DollarSign className="w-4 h-4 text-emerald-600" />
            </div>
            <p className="text-2xl font-black text-brand-navy mt-2">₹1,18,400</p>
            <p className="text-[11px] text-brand-muted mt-1">Demo financial ledger</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OperatorDashboardPreview;
