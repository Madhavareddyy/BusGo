import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  Bus, 
  Users, 
  TrendingUp, 
  Calendar, 
  MapPin, 
  Clock, 
  Search, 
  CheckCircle2, 
  Download, 
  AlertCircle,
  Sparkles,
  Phone,
  Filter
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { dbService } from '../../services/db';

export const OperatorDashboardPage = () => {
  const { user, profile, logout } = useAuth();
  const [operatorData, setOperatorData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedTripId, setSelectedTripId] = useState(null);
  const [searchPassenger, setSearchPassenger] = useState('');

  useEffect(() => {
    let isMounted = true;
    dbService.getOperatorData(user?.email).then((data) => {
      if (isMounted) {
        setOperatorData(data);
        if (data.trips && data.trips.length > 0) {
          setSelectedTripId(data.trips[0].id);
        }
        setLoading(false);
      }
    });
    return () => { isMounted = false; };
  }, [user]);

  if (loading || !operatorData) {
    return (
      <div className="min-h-screen bg-brand-bg flex items-center justify-center p-4">
        <p className="text-xs font-bold text-brand-muted">Loading Operator Fleet Portal...</p>
      </div>
    );
  }

  const activeTrip = operatorData.trips.find((t) => t.id === selectedTripId) || operatorData.trips[0];
  const manifestPassengers = (activeTrip?.passengers || []).filter((p) => {
    if (!searchPassenger.trim()) return true;
    const q = searchPassenger.toLowerCase();
    return p.name.toLowerCase().includes(q) || p.seat.toLowerCase().includes(q) || p.phone.includes(q);
  });

  return (
    <div className="min-h-screen bg-brand-bg py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Operator Header Ribbon */}
        <div className="bg-white rounded-card border border-brand-border p-6 shadow-card flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-brand-navy text-white flex items-center justify-center font-black text-xl shadow-md">
              <Bus className="w-7 h-7 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-brand-navy">
                  {operatorData.operator_name} Portal
                </h1>
                <Badge variant="success" size="sm" dot>
                  APPROVED OPERATOR
                </Badge>
              </div>
              <p className="text-xs text-brand-muted mt-0.5">
                Headquarters: {operatorData.headquarters} • Rating: ★ {operatorData.rating} ({operatorData.reviews_count} reviews)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
              Verified Partner
            </span>
          </div>
        </div>

        {/* Fleet KPI Metric Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-card border border-brand-border shadow-sm space-y-1">
            <span className="text-xs font-bold text-brand-muted uppercase tracking-wider">Active Fleet</span>
            <p className="text-2xl font-black text-brand-navy">{operatorData.fleet_count} Buses</p>
            <span className="text-[11px] text-emerald-700 font-semibold">100% Inspected</span>
          </div>

          <div className="bg-white p-5 rounded-card border border-brand-border shadow-sm space-y-1">
            <span className="text-xs font-bold text-brand-muted uppercase tracking-wider">Today's Scheduled Trips</span>
            <p className="text-2xl font-black text-brand-navy">{operatorData.active_trips_count} Departures</p>
            <span className="text-[11px] text-brand-red font-semibold">On-Time Dispatch</span>
          </div>

          <div className="bg-white p-5 rounded-card border border-brand-border shadow-sm space-y-1">
            <span className="text-xs font-bold text-brand-muted uppercase tracking-wider">Booked Passengers</span>
            <p className="text-2xl font-black text-brand-navy">{operatorData.total_passengers_today}</p>
            <span className="text-[11px] text-emerald-700 font-semibold">89% Avg. Occupancy</span>
          </div>

          <div className="bg-white p-5 rounded-card border border-brand-border shadow-sm space-y-1">
            <span className="text-xs font-bold text-brand-muted uppercase tracking-wider">Gross Bookings Revenue</span>
            <p className="text-2xl font-black text-brand-navy">₹{operatorData.gross_earnings.toLocaleString()}</p>
            <span className="text-[11px] text-emerald-700 font-semibold">+14.2% vs Last Week</span>
          </div>
        </div>

        {/* Trips & Passenger Manifests Section */}
        <div className="bg-white rounded-card border border-brand-border shadow-card overflow-hidden">
          <div className="p-6 border-b border-brand-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-brand-navy">Scheduled Trips & Passenger Boarding Manifests</h2>
              <p className="text-xs text-brand-muted">Select a departure schedule below to inspect passenger verification lists</p>
            </div>

            {/* Trip Selector Buttons */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
              {operatorData.trips.map((trip) => (
                <button
                  key={trip.id}
                  type="button"
                  onClick={() => setSelectedTripId(trip.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                    selectedTripId === trip.id
                      ? 'bg-brand-red text-white shadow-sm'
                      : 'bg-gray-100 text-brand-navy hover:bg-gray-200'
                  }`}
                >
                  {trip.route} ({trip.departure})
                </button>
              ))}
            </div>
          </div>

          {/* Active Trip Details Strip */}
          {activeTrip && (
            <div className="bg-gray-50/70 p-5 border-b border-gray-200 flex flex-wrap items-center justify-between gap-4 text-xs">
              <div className="space-y-0.5">
                <span className="text-brand-muted font-medium">Selected Trip:</span>
                <p className="font-bold text-brand-navy text-sm">{activeTrip.route} • {activeTrip.bus}</p>
                <p className="text-brand-muted">Reg: {activeTrip.reg_no} • Departure: {activeTrip.departure} • Occupancy: {activeTrip.occupancy}</p>
              </div>

              {/* Search Passenger in Manifest */}
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-2.5" />
                  <input
                    type="text"
                    placeholder="Search seat, name or phone..."
                    value={searchPassenger}
                    onChange={(e) => setSearchPassenger(e.target.value)}
                    className="pl-8 pr-3 py-1.5 text-xs border border-gray-300 rounded-lg outline-none focus:border-brand-red bg-white w-64"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Passenger Manifest Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-100/70 text-brand-muted uppercase font-bold text-[10px] tracking-wider border-b border-gray-200">
                <tr>
                  <th className="py-3 px-4">Seat No.</th>
                  <th className="py-3 px-4">Passenger Name</th>
                  <th className="py-3 px-4">Age / Gender</th>
                  <th className="py-3 px-4">Boarding Stop</th>
                  <th className="py-3 px-4">Phone Number</th>
                  <th className="py-3 px-4">Boarding Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {manifestPassengers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-brand-muted">
                      No passengers match search criteria.
                    </td>
                  </tr>
                ) : (
                  manifestPassengers.map((p, idx) => (
                    <tr key={idx} className="hover:bg-red-50/30 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-brand-navy">
                        <span className="px-2 py-1 rounded bg-gray-100 text-brand-navy border border-gray-200">
                          {p.seat}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-bold text-brand-navy">{p.name}</td>
                      <td className="py-3 px-4 text-brand-muted">{p.age} Yrs • {p.gender}</td>
                      <td className="py-3 px-4 text-brand-navy font-medium flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-brand-red" />
                        {p.boarding}
                      </td>
                      <td className="py-3 px-4 font-mono text-brand-muted">{p.phone}</td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          {p.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OperatorDashboardPage;
