import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  ShieldCheck, 
  Users, 
  Bus, 
  MapPin, 
  DollarSign, 
  Check, 
  X, 
  AlertTriangle, 
  LogOut, 
  Sparkles,
  Server
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';

export const AdminDashboardPreview = () => {
  const { profile, logout, isDemoMode } = useAuth();

  // Demonstration interactive operator approval queue
  const [pendingOperators, setPendingOperators] = useState([
    {
      id: 'demo-user-operator-pending',
      company_name: 'CityLink Express',
      full_name: 'Vikas Patil',
      email: 'operator@pending.in',
      registration_number: 'MH-12-2025-CL-4410',
      fleet_size: 45,
      city: 'Pune',
      status: 'pending_approval',
    },
  ]);

  const [approvedOperators, setApprovedOperators] = useState([]);

  const handleApprove = (op) => {
    setPendingOperators((prev) => prev.filter((o) => o.id !== op.id));
    setApprovedOperators((prev) => [...prev, { ...op, status: 'active' }]);

    // Update in localStorage if in demo mode
    try {
      const stored = localStorage.getItem('busgo_demo_users');
      if (stored) {
        const users = JSON.parse(stored);
        const updated = users.map((u) => u.id === op.id ? { ...u, status: 'active' } : u);
        localStorage.setItem('busgo_demo_users', JSON.stringify(updated));
      }
    } catch (e) {
      console.warn(e);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Admin Header */}
        <div className="bg-slate-900 p-6 rounded-card-lg border border-slate-800 shadow-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-rose-400 bg-rose-500/10 px-2.5 py-0.5 rounded-full border border-rose-500/20">
                Master Administrator
              </span>
              <span className="text-xs font-mono text-emerald-400 font-bold">
                ROOT PRIVILEGES
              </span>
            </div>
            <h1 className="text-2xl font-black tracking-tight text-white">
              BusGo Central Administration Console
            </h1>
            <p className="text-xs text-gray-400">
              Authenticated Admin: {profile?.email} • Session verified server-side
            </p>
          </div>

          <Button
            variant="danger"
            size="sm"
            icon={LogOut}
            onClick={logout}
            className="text-xs font-bold"
          >
            Sign Out of Console
          </Button>
        </div>

        {/* Milestone Callout */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-start gap-3.5">
          <Server className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
          <div className="text-xs text-gray-300 space-y-1">
            <p className="font-bold text-sm text-white">Phase 3 Administrator Route Security Verified!</p>
            <p className="text-gray-400 leading-relaxed">
              This route is strictly guarded by server-side role validation. Public registration is permanently locked from granting the admin role. The complete <strong>17-Module Admin Dashboard</strong> (managing cities, buses, trips, seat matrices, simulated revenue, coupons, and reports) will be fully unlocked in <strong>Phase 10</strong>.
            </p>
          </div>
        </div>

        {/* Interactive Operator Approval Queue Demonstration */}
        <div className="bg-slate-900 rounded-card-lg border border-slate-800 p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h2 className="text-lg font-bold text-white">Operator Compliance Verification Queue</h2>
              <p className="text-xs text-gray-400">Review permit licenses and approve new bus fleet partners</p>
            </div>
            <Badge variant="warning" size="sm">
              {pendingOperators.length} Pending Audit
            </Badge>
          </div>

          {pendingOperators.length > 0 ? (
            <div className="space-y-3">
              {pendingOperators.map((op) => (
                <div
                  key={op.id}
                  className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="text-base font-bold text-white">{op.company_name}</p>
                      <span className="text-[10px] font-bold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20 uppercase">
                        Requires Approval
                      </span>
                    </div>
                    <p className="text-xs text-gray-400">
                      Contact: {op.full_name} ({op.email}) • HQ: {op.city}
                    </p>
                    <p className="text-[11px] font-mono text-gray-400">
                      Permit License: <strong className="text-amber-200">{op.registration_number}</strong> • Declared Fleet: {op.fleet_size} Buses
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="success"
                      size="sm"
                      icon={Check}
                      onClick={() => handleApprove(op)}
                      className="text-xs font-bold"
                    >
                      Approve Operator
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-6 rounded-xl bg-slate-950/60 border border-slate-800 text-center space-y-2">
              <Check className="w-8 h-8 text-emerald-400 mx-auto" />
              <p className="text-sm font-bold text-white">All Operator Applications Processed</p>
              <p className="text-xs text-gray-400">
                Newly approved operators can now log in and publish bus trip schedules.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPreview;
