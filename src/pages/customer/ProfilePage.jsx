import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  ShieldCheck, 
  Ticket, 
  LogOut, 
  Save, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  Sparkles,
  Download,
  XCircle,
  RotateCcw,
  Calendar,
  AlertTriangle,
  ArrowRight
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { dbService } from '../../services/db';
import { ticketGenerator } from '../../services/ticketGenerator';

export const ProfilePage = () => {
  const { user, profile, role, logout, updateProfile, isDemoMode } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('bookings'); // 'bookings' | 'profile'
  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [phone, setPhone] = useState(profile?.phone || '');
  const [city, setCity] = useState(profile?.city || '');
  const [isEditing, setIsEditing] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saving, setSaving] = useState(false);

  // Bookings list state
  const [bookings, setBookings] = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(true);

  // Cancellation Modal State
  const [cancelModalBooking, setCancelModalBooking] = useState(null);
  const [cancelling, setCancelling] = useState(false);
  const [cancelResult, setCancelResult] = useState(null);

  // Load user bookings on mount
  useEffect(() => {
    let isMounted = true;
    setLoadingBookings(true);
    dbService.getUserBookings(user?.id, user?.email).then((list) => {
      if (isMounted) {
        setBookings(list || []);
        setLoadingBookings(false);
      }
    });
    return () => { isMounted = false; };
  }, [user]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSaveSuccess(false);

    try {
      await updateProfile({
        full_name: fullName,
        phone,
        city,
      });
      setSaveSuccess(true);
      setIsEditing(false);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      alert(err.message || 'Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  // Download PDF ticket
  const handleDownloadTicket = async (booking) => {
    await ticketGenerator.downloadTicketPDF(booking);
  };

  // Tiered Refund Rate Calculator
  const getRefundDetails = (booking) => {
    if (!booking) return { rate: 0.9, refund: 0, fee: 0, hoursLeft: 48 };
    try {
      const depDate = booking.journey_date || '2026-11-23';
      const depTime = booking.departure_time || '21:30';
      const depTimestamp = new Date(`${depDate}T${depTime}:00`).getTime();
      const now = Date.now();
      const hoursLeft = (depTimestamp - now) / (1000 * 60 * 60);

      const total = booking.total_fare || 899;
      let rate = 0.90;
      if (hoursLeft > 24) rate = 0.90;
      else if (hoursLeft >= 12) rate = 0.75;
      else if (hoursLeft >= 4) rate = 0.50;
      else rate = 0.00;

      const refund = total * rate;
      const fee = total - refund;

      return { rate, refund, fee, hoursLeft: Math.max(0, Math.floor(hoursLeft)) };
    } catch {
      return { rate: 0.9, refund: (booking.total_fare || 899) * 0.9, fee: (booking.total_fare || 899) * 0.1, hoursLeft: 48 };
    }
  };

  // Execute Cancellation
  const handleConfirmCancel = async () => {
    if (!cancelModalBooking) return;
    setCancelling(true);

    try {
      const res = await dbService.cancelBooking(cancelModalBooking.id || cancelModalBooking.pnr, user?.id);
      setCancelResult(res);

      // Refresh bookings
      const updated = await dbService.getUserBookings(user?.id, user?.email);
      setBookings(updated || []);
    } catch (err) {
      alert(`Cancellation error: ${err.message}`);
    } finally {
      setCancelling(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-bg py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* User Banner Ribbon */}
        <div className="bg-white rounded-card border border-brand-border p-6 shadow-card flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-brand-darkred to-brand-red text-white flex items-center justify-center font-black text-2xl shadow-md">
              {profile?.full_name?.charAt(0)?.toUpperCase() || user?.name?.charAt(0)?.toUpperCase() || 'P'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-brand-navy">
                  {profile?.full_name || user?.name || 'Customer Portal'}
                </h1>
                <Badge variant="success" size="sm" dot>
                  {role?.toUpperCase() || 'CUSTOMER'}
                </Badge>
              </div>
              <p className="text-xs text-brand-muted mt-0.5">
                {profile?.email || user?.email} • Member since 2026
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              icon={LogOut}
              onClick={handleLogout}
              className="text-xs text-rose-600 hover:bg-rose-50 hover:border-rose-300"
            >
              Sign Out
            </Button>
          </div>
        </div>

        {/* Demo Mode Notice */}
        {isDemoMode && (
          <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-center gap-2.5">
            <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              <strong>Persistent Demo Mode Active:</strong> Tickets booked are persisted to your browser session and seamlessly sync with the test suite.
            </span>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex items-center gap-3 border-b border-brand-border pb-1">
          <button
            type="button"
            onClick={() => setActiveTab('bookings')}
            className={`px-4 py-2 font-bold text-xs uppercase tracking-wider border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'bookings'
                ? 'border-brand-red text-brand-red'
                : 'border-transparent text-brand-muted hover:text-brand-navy'
            }`}
          >
            <Ticket className="w-4 h-4" />
            <span>My Bookings ({bookings.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('profile')}
            className={`px-4 py-2 font-bold text-xs uppercase tracking-wider border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'profile'
                ? 'border-brand-red text-brand-red'
                : 'border-transparent text-brand-muted hover:text-brand-navy'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Account Details</span>
          </button>
        </div>

        {/* TAB 1: MY BOOKINGS & CANCELLATION */}
        {activeTab === 'bookings' && (
          <div className="space-y-4">
            {loadingBookings ? (
              <div className="bg-white p-8 rounded-card border border-brand-border text-center text-xs font-bold text-brand-muted">
                Loading your journey manifests...
              </div>
            ) : bookings.length === 0 ? (
              <div className="bg-white p-12 rounded-card border border-brand-border text-center shadow-card space-y-4">
                <div className="w-16 h-16 rounded-full bg-red-50 text-brand-red flex items-center justify-center mx-auto">
                  <Ticket className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-brand-navy">No Bookings Yet</h3>
                  <p className="text-xs text-brand-muted">You have not booked any bus tickets yet.</p>
                </div>
                <Button
                  variant="primary"
                  size="md"
                  icon={ArrowRight}
                  onClick={() => navigate('/search')}
                >
                  Search & Book Buses
                </Button>
              </div>
            ) : (
              bookings.map((b) => {
                const isCancelled = b.status === 'cancelled';
                return (
                  <div
                    key={b.pnr || b.id}
                    className={`bg-white rounded-card border p-5 shadow-card space-y-4 transition-all ${
                      isCancelled ? 'border-gray-200 opacity-75' : 'border-brand-border hover:shadow-card-hover'
                    }`}
                  >
                    {/* Header Strip */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-3 border-b border-gray-100">
                      <div className="flex items-center gap-2.5">
                        <span className="text-base font-bold text-brand-navy">
                          {b.from} → {b.to}
                        </span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          isCancelled
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        }`}>
                          {b.status?.toUpperCase()}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-xs text-brand-muted font-medium">PNR:</span>
                        <span className="font-mono font-bold text-brand-red text-xs">{b.pnr}</span>
                      </div>
                    </div>

                    {/* Schedule & Operator */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                      <div>
                        <span className="text-[10px] font-bold text-brand-muted uppercase">Operator & Bus</span>
                        <p className="font-bold text-brand-navy mt-0.5">{b.operator}</p>
                        <p className="text-brand-muted">{b.bus_name || b.bus_type}</p>
                      </div>

                      <div>
                        <span className="text-[10px] font-bold text-brand-muted uppercase">Departure & Date</span>
                        <p className="font-bold text-brand-navy mt-0.5">{b.departure_time} hrs</p>
                        <p className="text-brand-muted">{b.journey_date}</p>
                      </div>

                      <div>
                        <span className="text-[10px] font-bold text-brand-muted uppercase">Seats Booked</span>
                        <p className="font-bold text-brand-navy mt-0.5">
                          {(b.passengers || []).map(p => p.seat_number).join(', ') || 'L1'}
                        </p>
                        <p className="text-emerald-700 font-bold">Total: ₹{parseFloat(b.total_fare || 899).toFixed(2)}</p>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="pt-3 border-t border-gray-100 flex flex-wrap items-center justify-between gap-3">
                      <Button
                        variant="outline"
                        size="sm"
                        icon={Download}
                        onClick={() => handleDownloadTicket(b)}
                        className="text-xs font-bold"
                      >
                        Download PDF Ticket
                      </Button>

                      {!isCancelled && (
                        <Button
                          variant="ghost"
                          size="sm"
                          icon={XCircle}
                          onClick={() => {
                            setCancelModalBooking(b);
                            setCancelResult(null);
                          }}
                          className="text-xs text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                        >
                          Cancel Ticket & Refund
                        </Button>
                      )}

                      {isCancelled && (
                        <span className="text-xs text-rose-600 font-semibold italic">
                          Ticket Cancelled • Refund Processed
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* TAB 2: PROFILE DETAILS FORM */}
        {activeTab === 'profile' && (
          <div className="bg-white rounded-card border border-brand-border p-6 shadow-card space-y-6">
            <div className="flex items-center justify-between border-b border-brand-border pb-4">
              <div>
                <h2 className="text-lg font-bold text-brand-navy">Personal Information</h2>
                <p className="text-xs text-brand-muted">Verified contact info for tickets & emergency updates</p>
              </div>
              <Button
                variant={isEditing ? 'ghost' : 'outline'}
                size="sm"
                onClick={() => setIsEditing(!isEditing)}
              >
                {isEditing ? 'Cancel' : 'Edit Profile'}
              </Button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <Input
                label="Full Name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                disabled={!isEditing}
                leftIcon={User}
              />

              <Input
                label="Registered Email (Immutable Identity)"
                value={profile?.email || user?.email || ''}
                disabled
                leftIcon={Mail}
                helperText="Email is bound to your Supabase Auth account and cannot be modified directly"
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Mobile Number (+91)"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  disabled={!isEditing}
                  leftIcon={Phone}
                />
                <Input
                  label="Home City"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  disabled={!isEditing}
                  leftIcon={MapPin}
                />
              </div>

              {isEditing && (
                <div className="flex justify-end pt-2">
                  <Button
                    type="submit"
                    variant="primary"
                    size="md"
                    isLoading={saving}
                    icon={Save}
                  >
                    Save Changes
                  </Button>
                </div>
              )}
            </form>
          </div>
        )}
      </div>

      {/* TIERED CANCELLATION & REFUND MODAL */}
      <Modal
        isOpen={Boolean(cancelModalBooking)}
        onClose={() => setCancelModalBooking(null)}
        title="Cancel Ticket & Instant Refund Calculation"
        size="md"
      >
        {cancelModalBooking && (
          <div className="space-y-4 text-brand-text">
            {cancelResult ? (
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-center space-y-2">
                <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
                <h4 className="font-bold text-base">Ticket Cancelled Successfully</h4>
                <p className="text-xs text-emerald-700">
                  ₹{parseFloat(cancelResult.refund_amount || 0).toFixed(2)} refund has been initiated to your source payment method. Seats have been released.
                </p>
                <div className="pt-2">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => setCancelModalBooking(null)}
                  >
                    Done
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs space-y-1">
                  <div className="flex items-center gap-2 font-bold">
                    <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>Confirm Cancellation for PNR {cancelModalBooking.pnr}</span>
                  </div>
                  <p className="text-rose-800">
                    Route: {cancelModalBooking.from} → {cancelModalBooking.to} on {cancelModalBooking.journey_date}
                  </p>
                </div>

                {/* Refund Tier Breakdown */}
                {(() => {
                  const { rate, refund, fee, hoursLeft } = getRefundDetails(cancelModalBooking);
                  return (
                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 text-xs space-y-2">
                      <div className="flex justify-between">
                        <span className="text-brand-muted">Time Remaining to Departure:</span>
                        <span className="font-bold text-brand-navy">~{hoursLeft} Hours</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-brand-muted">Original Fare:</span>
                        <span className="font-semibold text-brand-navy">₹{parseFloat(cancelModalBooking.total_fare || 899).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-brand-muted">Cancellation Fee ({(1 - rate) * 100}%):</span>
                        <span className="text-rose-600 font-semibold">₹{fee.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between pt-2 border-t border-gray-200 font-bold text-sm">
                        <span className="text-brand-navy">Estimated Refund ({rate * 100}%):</span>
                        <span className="text-emerald-700">₹{refund.toFixed(2)}</span>
                      </div>
                    </div>
                  );
                })()}

                <div className="text-[11px] text-gray-500">
                  Refund will be simulated to the original payment mode. Seats will be released back to the general inventory immediately.
                </div>

                <div className="pt-2 border-t border-gray-100 flex justify-end gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={cancelling}
                    onClick={() => setCancelModalBooking(null)}
                  >
                    Keep Ticket
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    disabled={cancelling}
                    isLoading={cancelling}
                    onClick={handleConfirmCancel}
                    className="bg-rose-600 hover:bg-rose-700 border-rose-600 text-white"
                  >
                    Confirm Cancellation
                  </Button>
                </div>
              </>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ProfilePage;
