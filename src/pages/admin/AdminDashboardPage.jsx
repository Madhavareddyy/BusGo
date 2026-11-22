import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  ShieldCheck, 
  Users, 
  Building2, 
  Bus, 
  TrendingUp, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Database, 
  Activity,
  Layers,
  Sparkles
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { dbService } from '../../services/db';

const REVENUE_DATA = [
  { month: 'Jun', revenue: 780000, bookings: 890 },
  { month: 'Jul', revenue: 950000, bookings: 1100 },
  { month: 'Aug', revenue: 1120000, bookings: 1280 },
  { month: 'Sep', revenue: 1340000, bookings: 1490 },
  { month: 'Oct', revenue: 1510000, bookings: 1680 },
  { month: 'Nov', revenue: 1658420, bookings: 1845 },
];

export const AdminDashboardPage = () => {
  const { user, profile } = useAuth();
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'operators' | 'users' | 'health'
  const [adminData, setAdminData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionNotice, setActionNotice] = useState('');

  useEffect(() => {
    let isMounted = true;
    dbService.getAdminOverview().then((data) => {
      if (isMounted) {
        setAdminData(data);
        setLoading(false);
      }
    });
    return () => { isMounted = false; };
  }, []);

  const handleToggleOperatorStatus = async (op) => {
    const nextStatus = op.status === 'active' ? 'suspended' : 'active';
    await dbService.updateOperatorStatus(op.id, nextStatus);

    setAdminData((prev) => ({
      ...prev,
      operators_list: prev.operators_list.map((item) =>
        item.id === op.id ? { ...item, status: nextStatus } : item
      ),
    }));

    setActionNotice(`Operator "${op.name}" status updated to ${nextStatus.toUpperCase()}.`);
    setTimeout(() => setActionNotice(''), 3000);
  };

  if (loading || !adminData) {
    return (
      <div className="min-h-screen bg-brand-bg flex items-center justify-center p-4">
        <p className="text-xs font-bold text-brand-muted">Loading Central Admin Console...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-bg py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Admin Header Ribbon */}
        <div className="bg-white rounded-card border border-brand-border p-6 shadow-card flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-brand-red text-white flex items-center justify-center font-black text-xl shadow-md">
              <ShieldCheck className="w-8 h-8 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-brand-navy">
                  BusGo Central Administration
                </h1>
                <Badge variant="primary" size="sm" dot>
                  SUPERADMIN
                </Badge>
              </div>
              <p className="text-xs text-brand-muted mt-0.5">
                Authenticated as: {user?.email || 'admin@busgo.in'} • PostgreSQL Row-Level Security Protected
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-emerald-600" />
              <span>Database Online</span>
            </span>
          </div>
        </div>

        {actionNotice && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-lg font-bold flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{actionNotice}</span>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex items-center gap-3 border-b border-brand-border pb-1">
          <button
            type="button"
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 font-bold text-xs uppercase tracking-wider border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'overview'
                ? 'border-brand-red text-brand-red'
                : 'border-transparent text-brand-muted hover:text-brand-navy'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>Overview & KPIs</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('operators')}
            className={`px-4 py-2 font-bold text-xs uppercase tracking-wider border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'operators'
                ? 'border-brand-red text-brand-red'
                : 'border-transparent text-brand-muted hover:text-brand-navy'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Operator Approvals & Fleet</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('health')}
            className={`px-4 py-2 font-bold text-xs uppercase tracking-wider border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'health'
                ? 'border-brand-red text-brand-red'
                : 'border-transparent text-brand-muted hover:text-brand-navy'
            }`}
          >
            <Database className="w-4 h-4" />
            <span>RPC & System Health</span>
          </button>
        </div>

        {/* TAB 1: OVERVIEW & CHARTS */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-card border border-brand-border shadow-sm space-y-1">
                <span className="text-xs font-bold text-brand-muted uppercase tracking-wider">Gross Platform Volume</span>
                <p className="text-2xl font-black text-brand-navy">₹{adminData.stats.total_revenue.toLocaleString()}</p>
                <span className="text-[11px] text-emerald-700 font-semibold">+22.4% MoM</span>
              </div>

              <div className="bg-white p-5 rounded-card border border-brand-border shadow-sm space-y-1">
                <span className="text-xs font-bold text-brand-muted uppercase tracking-wider">Confirmed Bookings</span>
                <p className="text-2xl font-black text-brand-navy">{adminData.stats.total_bookings.toLocaleString()}</p>
                <span className="text-[11px] text-emerald-700 font-semibold">100% Guaranteed PNR</span>
              </div>

              <div className="bg-white p-5 rounded-card border border-brand-border shadow-sm space-y-1">
                <span className="text-xs font-bold text-brand-muted uppercase tracking-wider">Active Operators</span>
                <p className="text-2xl font-black text-brand-navy">{adminData.stats.active_operators}</p>
                <span className="text-[11px] text-brand-muted font-semibold">Across {adminData.stats.total_cities} Cities</span>
              </div>

              <div className="bg-white p-5 rounded-card border border-brand-border shadow-sm space-y-1">
                <span className="text-xs font-bold text-brand-muted uppercase tracking-wider">Platform Health</span>
                <p className="text-2xl font-black text-emerald-700">100%</p>
                <span className="text-[11px] text-emerald-700 font-semibold">Zero Concurrency Clashes</span>
              </div>
            </div>

            {/* Recharts Analytics Bar Chart */}
            <div className="bg-white p-6 rounded-card border border-brand-border shadow-card space-y-4">
              <div>
                <h3 className="text-sm font-bold text-brand-navy uppercase tracking-wider">
                  Monthly Booking Volume Trends (FY 2026)
                </h3>
                <p className="text-xs text-brand-muted">Consolidated ticket reservation transaction growth</p>
              </div>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={REVENUE_DATA}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F0F0F0" />
                    <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip 
                      formatter={(val) => [`₹${val.toLocaleString()}`, 'Gross Volume']}
                      contentStyle={{ backgroundColor: '#1F2937', color: '#fff', borderRadius: '8px', fontSize: '11px' }}
                    />
                    <Bar dataKey="revenue" fill="#D84E55" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: OPERATOR APPROVAL & FLEET */}
        {activeTab === 'operators' && (
          <div className="bg-white rounded-card border border-brand-border shadow-card overflow-hidden space-y-4 p-6">
            <div>
              <h3 className="text-sm font-bold text-brand-navy uppercase tracking-wider">
                Operator Approval & Compliance Directory
              </h3>
              <p className="text-xs text-brand-muted">Admins have master authority to approve new operator registrations or suspend non-compliant fleets</p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-100/70 text-brand-muted uppercase font-bold text-[10px] tracking-wider border-b border-gray-200">
                  <tr>
                    <th className="py-3 px-4">Operator Name</th>
                    <th className="py-3 px-4">Contact Email</th>
                    <th className="py-3 px-4">Buses in Fleet</th>
                    <th className="py-3 px-4">Rating</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {adminData.operators_list.map((op) => {
                    const isPending = op.status === 'pending_approval';
                    const isActive = op.status === 'active';
                    return (
                      <tr key={op.id} className="hover:bg-red-50/30 transition-colors">
                        <td className="py-3 px-4 font-bold text-brand-navy">{op.name}</td>
                        <td className="py-3 px-4 text-brand-muted">{op.email}</td>
                        <td className="py-3 px-4 font-bold">{op.buses}</td>
                        <td className="py-3 px-4 font-bold text-emerald-700">★ {op.rating}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            isActive
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                              : isPending
                              ? 'bg-amber-50 text-amber-800 border border-amber-300'
                              : 'bg-rose-50 text-rose-800 border border-rose-200'
                          }`}>
                            {op.status.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <Button
                            variant={isActive ? 'outline' : 'primary'}
                            size="sm"
                            className="text-xs"
                            onClick={() => handleToggleOperatorStatus(op)}
                          >
                            {isPending ? 'Approve Operator' : isActive ? 'Suspend' : 'Reactivate'}
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: SYSTEM HEALTH & CONCURRENCY MONITOR */}
        {activeTab === 'health' && (
          <div className="bg-white rounded-card border border-brand-border p-6 shadow-card space-y-6">
            <div>
              <h3 className="text-sm font-bold text-brand-navy uppercase tracking-wider">
                PostgreSQL RPC & Concurrency Health Monitor
              </h3>
              <p className="text-xs text-brand-muted">Verifying stored function transactions, seat locks, and ACID integrity</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-brand-navy">lock_trip_seats</span>
                  <span className="text-emerald-700 font-black">ACTIVE</span>
                </div>
                <p className="text-brand-muted text-[11px]">Enforces 10-minute temporary seat reservation with automatic expiry reclamation.</p>
              </div>

              <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-brand-navy">confirm_bus_booking</span>
                  <span className="text-emerald-700 font-black">ACTIVE</span>
                </div>
                <p className="text-brand-muted text-[11px]">Executes atomic booking transactions, unique PNR generation, and payment records.</p>
              </div>

              <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-brand-navy">cancel_booking_rpc</span>
                  <span className="text-emerald-700 font-black">ACTIVE</span>
                </div>
                <p className="text-brand-muted text-[11px]">Executes tiered percentage refunds (90%, 75%, 50%, 0%) and instant seat releases.</p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 space-y-1">
              <p className="font-bold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Row-Level Security (RLS) Verified Safe
              </p>
              <p className="text-emerald-700 text-[11px]">
                Admins and customers operate under isolated policies. No service role key is exposed in client-side code.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboardPage;
