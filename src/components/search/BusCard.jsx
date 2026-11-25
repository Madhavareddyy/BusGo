import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Star, 
  MapPin, 
  Clock, 
  Wifi, 
  Zap, 
  ShieldCheck, 
  Sparkles, 
  CheckCircle2, 
  Info,
  ChevronDown,
  ChevronUp,
  Loader2
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { SeatSelector } from '../seat/SeatSelector';
import { PassengerForm } from '../booking/PassengerForm';
import { PaymentModal } from '../booking/PaymentModal';
import { dbService } from '../../services/db';
import { useAuth } from '../../context/AuthContext';

export const BusCard = ({ bus }) => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Booking Flow States
  const [isExpanded, setIsExpanded] = useState(false);
  const [bookingStep, setBookingStep] = useState(1); // 1: Seats, 2: Passengers, 3: Payment
  const [seats, setSeats] = useState([]);
  const [isLoadingSeats, setIsLoadingSeats] = useState(false);
  const [selectedSeatIds, setSelectedSeatIds] = useState([]);
  const [lockExpiresAt, setLockExpiresAt] = useState(null);
  const [isLocking, setIsLocking] = useState(false);
  const [lockError, setLockError] = useState('');
  
  // Stops Selection
  const boardingStops = bus.boarding_stops || [
    { id: 'b-1', name: `${bus.from} Central Terminal`, time: bus.departure_time }
  ];
  const droppingStops = bus.dropping_stops || [
    { id: 'd-1', name: `${bus.to} Central Station`, time: bus.arrival_time }
  ];
  const [selectedBoardingStop, setSelectedBoardingStop] = useState(boardingStops[0]?.id || boardingStops[0]?.name);
  const [selectedDroppingStop, setSelectedDroppingStop] = useState(droppingStops[0]?.id || droppingStops[0]?.name);

  // Booking Parameters Cache
  const [passengerPayload, setPassengerPayload] = useState(null);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [isConfirmingBooking, setIsConfirmingBooking] = useState(false);
  const [sessionId] = useState(() => 'sess-' + Math.random().toString(36).substring(2, 10));

  // Additional Details Drawer
  const [showDetails, setShowDetails] = useState(false);

  // Check if arrival is next day (e.g. departure 21:30 and arrival 06:45)
  const isOvernight = bus.arrival_time < bus.departure_time;

  const getSeatColor = (available) => {
    if (available <= 5) return 'text-rose-600 bg-rose-50 border-rose-200';
    if (available <= 12) return 'text-amber-700 bg-amber-50 border-amber-200';
    return 'text-emerald-700 bg-emerald-50 border-emerald-200';
  };

  const boardingPointName = boardingStops[0]?.name || `${bus.from} Central Terminal`;
  const droppingPointName = droppingStops[0]?.name || `${bus.to} Central Station`;

  // Toggle Seat Selector & Fetch Seats on Demand
  const handleToggleSelectSeats = async () => {
    if (!isExpanded) {
      setIsExpanded(true);
      setBookingStep(1);
      setIsLoadingSeats(true);
      setLockError('');
      try {
        const fetchedSeats = await dbService.getTripSeats(bus.id);
        setSeats(fetchedSeats || []);
      } catch (err) {
        console.error('Error loading seats:', err);
      } finally {
        setIsLoadingSeats(false);
      }
    } else {
      setIsExpanded(false);
      setBookingStep(1);
      setSelectedSeatIds([]);
    }
  };

  // Seat toggle selection (max 6 seats)
  const handleSeatToggle = (seat) => {
    setLockError('');
    setSelectedSeatIds((prev) => {
      if (prev.includes(seat.id)) {
        return prev.filter((id) => id !== seat.id);
      } else {
        if (prev.length >= 6) {
          setLockError('You can select a maximum of 6 seats per booking.');
          return prev;
        }
        return [...prev, seat.id];
      }
    });
  };

  // Real-time synchronization of seat statuses to prevent overlapping on concurrent systems
  useEffect(() => {
    if (!isExpanded || bookingStep !== 1) return;

    const syncInterval = setInterval(async () => {
      try {
        const liveSeats = await dbService.getTripSeats(bus.id);
        if (liveSeats && liveSeats.length > 0) {
          setSeats(liveSeats);

          // Verify if any seat selected in local state was claimed by another system
          setSelectedSeatIds((prev) => {
            const conflicting = liveSeats.filter(
              (s) => prev.includes(s.id) && s.status !== 'available'
            );
            if (conflicting.length > 0) {
              const names = conflicting.map((s) => s.seat_number).join(', ');
              setLockError(`Seat ${names} was just claimed by another passenger on another device.`);
              const availableIds = new Set(
                liveSeats.filter((s) => s.status === 'available').map((s) => s.id)
              );
              return prev.filter((id) => availableIds.has(id));
            }
            return prev;
          });
        }
      } catch (err) {
        // silent sync error
      }
    }, 5000);

    return () => clearInterval(syncInterval);
  }, [isExpanded, bookingStep, bus.id]);

  // Step 1 -> Step 2: Atomic Seat Locking
  const handleProceedToPassengers = async () => {
    if (selectedSeatIds.length === 0) return;
    setIsLocking(true);
    setLockError('');

    try {
      const lockRes = await dbService.lockSeats(bus.id, selectedSeatIds, user?.id, sessionId);
      if (lockRes && lockRes.lock_expires_at) {
        setLockExpiresAt(lockRes.lock_expires_at);
      } else {
        setLockExpiresAt(new Date(Date.now() + 600000).toISOString());
      }
      setBookingStep(2);
    } catch (err) {
      console.warn('Seat lock conflict or error:', err);
      setLockError(err.message || 'One or more selected seats were just claimed by another passenger. Please select another seat.');
      // Refresh seats and auto-prune any seats that are no longer available
      const refreshed = await dbService.getTripSeats(bus.id);
      setSeats(refreshed || []);
      if (refreshed) {
        const availableIds = new Set(
          refreshed.filter((s) => s.status === 'available').map((s) => s.id)
        );
        setSelectedSeatIds((prev) => prev.filter((id) => availableIds.has(id)));
      }
    } finally {
      setIsLocking(false);
    }
  };

  // Step 2 -> Step 3: Open Payment Modal
  const handleProceedToPayment = (payload) => {
    setPassengerPayload(payload);
    setPaymentModalOpen(true);
  };

  // Step 3 Completion: Execute Atomic Booking Confirmation
  const handlePaymentSuccess = async (paymentDetails) => {
    setIsConfirmingBooking(true);
    try {
      const selectedSeatsObjects = seats.filter((s) => selectedSeatIds.includes(s.id));
      const formattedPassengers = (passengerPayload.passengers || []).map((p, idx) => ({
        seat_id: p.seat_id || selectedSeatIds[idx],
        seat_number: p.seat_number,
        full_name: p.full_name,
        age: parseInt(p.age, 10) || 28,
        gender: (p.gender || 'male').toLowerCase(),
      }));

      const bStop = boardingStops.find((s) => s.id === selectedBoardingStop || s.name === selectedBoardingStop) || boardingStops[0];
      const dStop = droppingStops.find((s) => s.id === selectedDroppingStop || s.name === selectedDroppingStop) || droppingStops[0];

      const bookingParams = {
        tripId: bus.id,
        seatIds: selectedSeatIds,
        userId: user?.id || null,
        sessionId: sessionId,
        contactName: passengerPayload.contactName,
        contactEmail: passengerPayload.contactEmail,
        contactPhone: passengerPayload.contactPhone,
        passengers: formattedPassengers,
        boardingStopId: bStop?.id || '7bcf1db0-aa39-4232-a8c0-28c7e45fe1e2',
        droppingStopId: dStop?.id || 'be288ed8-3e86-40b6-bfd6-25d936f39bfc',
        boardingPointName: bStop?.name || boardingPointName,
        droppingPointName: dStop?.name || droppingPointName,
        couponCode: passengerPayload.couponCode,
        paymentMethod: paymentDetails.paymentMethod || 'UPI',
        from: bus.from,
        to: bus.to,
        journeyDate: bus.journey_date,
        departureTime: bus.departure_time,
        arrivalTime: bus.arrival_time,
        duration: bus.duration,
        operator: bus.operator,
        busName: bus.bus_name,
        busType: bus.bus_type,
        totalFare: passengerPayload.grandTotal,
      };

      const result = await dbService.confirmBooking(bookingParams);
      setPaymentModalOpen(false);

      // Navigate to confirmation page
      navigate(`/booking/confirmation?pnr=${result.pnr || 'BG829471'}`);
    } catch (err) {
      console.error('Failed to confirm booking:', err);
      alert(`Booking confirmation error: ${err.message}`);
    } finally {
      setIsConfirmingBooking(false);
    }
  };

  return (
    <div className="bg-white rounded-card border border-brand-border shadow-card hover:shadow-card-hover transition-all duration-200 overflow-hidden">
      {/* Main Bus Summary Card */}
      <div className="p-5 space-y-4">
        {/* Top Row: Operator, Rating & Badges */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <h3 className="text-lg font-bold text-brand-navy tracking-tight">
                {bus.operator}
              </h3>
              <span className="flex items-center gap-1 bg-emerald-50 border border-emerald-200 text-emerald-800 px-1.5 py-0.5 rounded text-[11px] font-bold">
                <Star className="w-3 h-3 fill-emerald-600 text-emerald-600" />
                {bus.operator_rating || '4.5'}
              </span>
              {bus.reviews_count && (
                <span className="text-[11px] text-brand-muted">
                  ({Number(bus.reviews_count).toLocaleString()} ratings)
                </span>
              )}
            </div>
            <p className="text-xs text-brand-muted font-medium">
              {bus.bus_name} • {bus.bus_type}
            </p>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            {bus.has_ac ? (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                AC
              </span>
            ) : (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-gray-100 text-gray-700 border border-gray-200">
                Non-AC
              </span>
            )}
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-gray-100 text-brand-navy border border-gray-200">
              {bus.is_sleeper ? 'Sleeper (2+1)' : 'Seater (2+2)'}
            </span>
            {bus.source === 'supabase_cloud' && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300">
                Live Cloud Data
              </span>
            )}
          </div>
        </div>

        {/* Middle Row: Schedule Timings & Duration */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center pt-2 border-t border-gray-100">
          {/* Departure */}
          <div className="md:col-span-3 text-left">
            <p className="text-xl font-black text-brand-navy leading-none">
              {bus.departure_time}
            </p>
            <p className="text-xs font-semibold text-brand-navy mt-1 truncate">
              {bus.from}
            </p>
            <p className="text-[11px] text-brand-muted truncate max-w-[200px]" title={boardingPointName}>
              {boardingPointName}
            </p>
          </div>

          {/* Duration Graphic */}
          <div className="md:col-span-3 flex flex-col items-center justify-center py-2 md:py-0">
            <span className="text-xs text-brand-muted font-bold tracking-wide">
              {bus.duration}
            </span>
            <div className="w-full max-w-[140px] h-0.5 bg-gray-200 my-1 relative">
              <div className="w-2 h-2 rounded-full bg-brand-red absolute left-0 -top-[3px]" />
              <div className="w-2 h-2 rounded-full bg-brand-navy absolute right-0 -top-[3px]" />
            </div>
            <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.2 rounded-full">
              Direct Service
            </span>
          </div>

          {/* Arrival */}
          <div className="md:col-span-3 text-left md:text-right">
            <div className="flex items-baseline md:justify-end gap-1.5">
              <p className="text-xl font-black text-brand-navy leading-none">
                {bus.arrival_time}
              </p>
              {isOvernight && (
                <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-1 rounded">
                  +1 Day
                </span>
              )}
            </div>
            <p className="text-xs font-semibold text-brand-navy mt-1 truncate">
              {bus.to}
            </p>
            <p className="text-[11px] text-brand-muted truncate max-w-[200px] md:ml-auto" title={droppingPointName}>
              {droppingPointName}
            </p>
          </div>

          {/* Fare & CTA */}
          <div className="md:col-span-3 flex md:flex-col items-center md:items-end justify-between pt-3 md:pt-0 border-t md:border-t-0 border-gray-100">
            <div className="text-left md:text-right">
              <span className="text-[10px] text-brand-muted uppercase font-bold tracking-wider">
                Starting at
              </span>
              <p className="text-2xl font-black text-brand-navy leading-none">
                ₹{bus.base_fare}
              </p>
              <div className="mt-1">
                <span className={`inline-block text-[11px] font-bold px-2 py-0.5 rounded border ${getSeatColor(bus.available_seats)}`}>
                  {bus.available_seats} Seats Available
                </span>
              </div>
            </div>

            <Button
              variant={isExpanded ? 'secondary' : 'primary'}
              size="md"
              className="mt-2 text-xs font-bold uppercase tracking-wider shadow-sm hover:shadow-md"
              onClick={handleToggleSelectSeats}
            >
              {isExpanded ? 'Hide Seats' : 'Select Seats'}
            </Button>
          </div>
        </div>

        {/* Bottom Strip: Amenities & Details Toggle */}
        <div className="flex flex-wrap items-center justify-between pt-2 border-t border-gray-100 text-xs gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            {(bus.amenities || []).slice(0, 4).map((amenity, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1 text-[11px] text-brand-muted bg-gray-50 border border-gray-200 px-2 py-0.5 rounded"
              >
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                {amenity}
              </span>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setShowDetails(!showDetails)}
            className="text-xs font-bold text-brand-red hover:underline flex items-center gap-1 ml-auto"
          >
            <span>{showDetails ? 'Hide Stops & Info' : 'View Stops & Info'}</span>
            {showDetails ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Expandable Stops & Policies Drawer */}
        {showDetails && (
          <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 text-xs space-y-3 animate-in fade-in duration-150">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="font-bold text-brand-navy mb-2 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-brand-red" />
                  Boarding Points ({bus.from})
                </p>
                <div className="space-y-1.5 pl-2 border-l-2 border-brand-red/30">
                  {boardingStops.map((stop) => (
                    <div key={stop.id || stop.name} className="flex justify-between">
                      <span className="font-semibold text-brand-navy">{stop.name}</span>
                      <span className="text-brand-muted">{stop.time || bus.departure_time}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <p className="font-bold text-brand-navy mb-2 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-brand-success" />
                  Dropping Points ({bus.to})
                </p>
                <div className="space-y-1.5 pl-2 border-l-2 border-brand-success/30">
                  {droppingStops.map((stop) => (
                    <div key={stop.id || stop.name} className="flex justify-between">
                      <span className="font-semibold text-brand-navy">{stop.name}</span>
                      <span className="text-brand-muted">{stop.time || bus.arrival_time}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-gray-200 text-[11px] text-brand-muted flex flex-wrap gap-4">
              <span className="font-bold text-brand-navy">Cancellation Policy:</span>
              <span>&gt; 24 hrs: 10% fee (90% refund)</span>
              <span>12 - 24 hrs: 25% fee (75% refund)</span>
              <span>4 - 12 hrs: 50% fee (50% refund)</span>
              <span>&lt; 4 hrs: Non-refundable</span>
            </div>
          </div>
        )}
      </div>

      {/* Expandable Integrated Interactive Booking Flow */}
      {isExpanded && (
        <div className="border-t border-brand-border bg-gray-50/70 p-4 sm:p-6 space-y-4">
          {isLoadingSeats ? (
            <div className="p-8 text-center space-y-3">
              <Loader2 className="w-8 h-8 text-brand-red animate-spin mx-auto" />
              <p className="text-xs font-bold text-brand-muted">
                Loading live seat availability & deck configuration...
              </p>
            </div>
          ) : bookingStep === 1 ? (
            <SeatSelector
              bus={bus}
              seats={seats}
              selectedSeatIds={selectedSeatIds}
              onSeatToggle={handleSeatToggle}
              onProceed={handleProceedToPassengers}
              boardingStops={boardingStops}
              droppingStops={droppingStops}
              selectedBoardingStop={selectedBoardingStop}
              selectedDroppingStop={selectedDroppingStop}
              onSelectBoardingStop={setSelectedBoardingStop}
              onSelectDroppingStop={setSelectedDroppingStop}
              lockExpiresAt={lockExpiresAt}
              isLocking={isLocking}
              error={lockError}
            />
          ) : (
            <PassengerForm
              selectedSeats={seats.filter((s) => selectedSeatIds.includes(s.id))}
              baseFare={bus.base_fare}
              onBack={() => setBookingStep(1)}
              onProceedToPayment={handleProceedToPayment}
              defaultContact={{
                name: user?.name,
                email: user?.email,
                phone: user?.phone,
              }}
            />
          )}
        </div>
      )}

      {/* Simulated Payment Modal */}
      <PaymentModal
        isOpen={paymentModalOpen}
        onClose={() => setPaymentModalOpen(false)}
        totalFare={passengerPayload?.grandTotal || bus.base_fare}
        onPaymentSuccess={handlePaymentSuccess}
        isProcessing={isConfirmingBooking}
      />
    </div>
  );
};

export default BusCard;
