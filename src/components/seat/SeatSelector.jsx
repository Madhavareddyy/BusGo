import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  MapPin, 
  Sparkles, 
  AlertCircle, 
  Check, 
  ShieldCheck, 
  User, 
  Users,
  Compass
} from 'lucide-react';
import { Button } from '../ui/Button';

export const SeatSelector = ({
  bus,
  seats = [],
  selectedSeatIds = [],
  onSeatToggle,
  onProceed,
  boardingStops = [],
  droppingStops = [],
  selectedBoardingStop,
  selectedDroppingStop,
  onSelectBoardingStop,
  onSelectDroppingStop,
  lockExpiresAt,
  isLocking = false,
  error = ''
}) => {
  const [activeDeck, setActiveDeck] = useState('lower');
  const [timeLeft, setTimeLeft] = useState('');

  // 10-minute countdown timer
  useEffect(() => {
    if (!lockExpiresAt) return;

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const expiry = new Date(lockExpiresAt).getTime();
      const diff = expiry - now;

      if (diff <= 0) {
        setTimeLeft('00:00 - Expired');
        clearInterval(interval);
      } else {
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        setTimeLeft(`${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [lockExpiresAt]);

  const lowerSeats = seats.filter((s) => s.deck === 'lower');
  const upperSeats = seats.filter((s) => s.deck === 'upper');

  // Compute selected seats list
  const selectedSeats = seats.filter((s) => selectedSeatIds.includes(s.id));
  const subtotal = selectedSeats.reduce((acc, s) => acc + (s.fare || bus.base_fare || 899), 0);
  const gst = subtotal * 0.05;
  const total = subtotal + gst;

  // Compute position (row 1..5, col 1..3) accurately for any seat without row number overlap
  const getSeatPosition = (seat) => {
    if (seat.row >= 1 && seat.row <= 5 && seat.col >= 1 && seat.col <= 3) {
      return { row: seat.row, col: seat.col };
    }
    const num = parseInt(String(seat.seat_number || '').replace(/\D/g, ''), 10);
    if (!isNaN(num) && num > 0) {
      const computedRow = Math.ceil(num / 3);
      const computedCol = ((num - 1) % 3) + 1;
      return {
        row: computedRow <= 5 ? computedRow : 5,
        col: computedCol,
      };
    }
    return { row: 1, col: 1 };
  };

  const renderSeat = (seat) => {
    const isSelected = selectedSeatIds.includes(seat.id);
    const isBooked = seat.status === 'booked';
    const isLocked = seat.status === 'locked' && !isSelected;
    const isLadies = Boolean(seat.is_ladies);

    let seatClasses = 'border transition-all duration-150 flex flex-col items-center justify-center cursor-pointer select-none relative shrink-0 ';
    
    // Size depending on sleeper berth vs regular seat
    if (seat.type === 'sleeper' || bus.bus_type?.toLowerCase().includes('sleeper')) {
      seatClasses += 'w-16 h-10 rounded-md text-[11px] font-bold ';
    } else {
      seatClasses += 'w-10 h-10 rounded-lg text-xs font-bold ';
    }

    if (isBooked) {
      seatClasses += 'bg-gray-200 border-gray-300 text-gray-400 cursor-not-allowed ';
    } else if (isLocked) {
      seatClasses += 'bg-amber-100 border-amber-300 text-amber-700 cursor-not-allowed ';
    } else if (isSelected) {
      seatClasses += 'bg-brand-success text-white border-brand-success shadow-md ring-2 ring-emerald-300 ';
    } else if (isLadies) {
      seatClasses += 'bg-pink-50 border-pink-400 text-pink-700 hover:bg-pink-100 hover:border-pink-500 ';
    } else {
      seatClasses += 'bg-white border-gray-300 text-brand-navy hover:border-brand-red hover:bg-red-50/50 ';
    }

    return (
      <div
        key={seat.id}
        onClick={() => {
          if (!isBooked && !isLocked) {
            onSeatToggle(seat);
          }
        }}
        title={`${seat.seat_number} • ₹${seat.fare || bus.base_fare} ${isLadies ? '(Female Reserved)' : ''} ${isBooked ? '(Booked)' : ''}`}
        className={seatClasses}
      >
        <span>{seat.seat_number}</span>
        {isLadies && !isSelected && !isBooked && (
          <span className="text-[8px] text-pink-600 font-extrabold uppercase leading-none">
            F
          </span>
        )}
        {isSelected && (
          <Check className="w-3 h-3 text-white absolute top-0.5 right-0.5" />
        )}
      </div>
    );
  };

  return (
    <div className="bg-gray-50 border-t border-brand-border p-4 sm:p-6 rounded-b-card space-y-6 animate-in fade-in duration-200">
      {/* Top Banner: Real-Time Lock Countdown & Seat Instructions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-brand-border shadow-sm">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-brand-red shrink-0" />
          <span className="text-xs font-bold text-brand-navy">
            Click on seats to select (Max 6 seats per booking)
          </span>
        </div>

        {selectedSeatIds.length > 0 && lockExpiresAt && (
          <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-800 px-3 py-1 rounded-full text-xs font-bold animate-pulse">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            <span>Seats Locked: {timeLeft}</span>
          </div>
        )}
      </div>

      {error && (
        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg font-medium flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Grid: Deck Layouts & Booking Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Side: Seat Layout Engine (8 cols) */}
        <div className="lg:col-span-8 bg-white p-5 rounded-xl border border-brand-border shadow-sm space-y-5">
          {/* Deck Switcher Tabs (If bus has lower and upper decks) */}
          {upperSeats.length > 0 && (
            <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
              <button
                type="button"
                onClick={() => setActiveDeck('lower')}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeDeck === 'lower'
                    ? 'bg-brand-navy text-white shadow-sm'
                    : 'bg-gray-100 text-brand-muted hover:bg-gray-200'
                }`}
              >
                Lower Deck ({lowerSeats.filter(s => s.status === 'available').length} Available)
              </button>
              <button
                type="button"
                onClick={() => setActiveDeck('upper')}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeDeck === 'upper'
                    ? 'bg-brand-navy text-white shadow-sm'
                    : 'bg-gray-100 text-brand-muted hover:bg-gray-200'
                }`}
              >
                Upper Deck ({upperSeats.filter(s => s.status === 'available').length} Available)
              </button>
            </div>
          )}

          {/* Seat Layout View */}
          <div className="relative border-2 border-dashed border-gray-200 rounded-xl p-5 bg-slate-50/60 overflow-x-auto min-w-0">
            {/* Bus Front Indicator with Steering Wheel */}
            <div className="flex justify-between items-center pb-4 mb-4 border-b border-gray-200">
              <span className="text-[11px] font-bold text-brand-muted uppercase tracking-wider flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5 text-brand-red" />
                Bus Front
              </span>
              <div className="w-7 h-7 rounded-full bg-gray-200 border border-gray-300 flex items-center justify-center text-gray-600 text-xs font-black shadow-inner" title="Driver Cabin">
                ✇
              </div>
            </div>

            {/* Seats Grid */}
            <div className="space-y-3 min-w-[280px]">
              {/* Group by rows */}
              {[1, 2, 3, 4, 5].map((rowNum) => {
                const currentDeckSeats = activeDeck === 'lower' ? lowerSeats : upperSeats;
                const rowSeats = currentDeckSeats.filter((s) => getSeatPosition(s).row === rowNum);

                if (rowSeats.length === 0) return null;

                const leftSeats = rowSeats
                  .filter((s) => getSeatPosition(s).col === 1)
                  .sort((a, b) => getSeatPosition(a).col - getSeatPosition(b).col);
                const rightSeats = rowSeats
                  .filter((s) => getSeatPosition(s).col >= 2)
                  .sort((a, b) => getSeatPosition(a).col - getSeatPosition(b).col);

                return (
                  <div key={rowNum} className="flex items-center justify-between gap-4 sm:gap-6 py-1">
                    {/* Left Single Berth / Seat */}
                    <div className="flex items-center gap-2 shrink-0">
                      {leftSeats.map(renderSeat)}
                    </div>

                    {/* Aisle Walking Space */}
                    <div className="flex-1 text-center border-t border-dotted border-gray-300 text-[9px] text-gray-400 uppercase tracking-widest font-semibold select-none px-2">
                      Aisle
                    </div>

                    {/* Right Double Berth / Seats */}
                    <div className="flex items-center gap-2 shrink-0">
                      {rightSeats.map(renderSeat)}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Bus Rear Label */}
            <div className="pt-4 mt-4 border-t border-gray-200 text-center text-[10px] text-gray-400 font-bold uppercase tracking-widest">
              Bus Rear
            </div>
          </div>

          {/* Seat Legends Bar */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2 text-xs text-brand-muted font-medium border-t border-gray-100">
            <div className="flex items-center gap-1.5">
              <div className="w-4 h-4 rounded bg-white border border-gray-300" />
              <span>Available</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-4 h-4 rounded bg-brand-success text-white flex items-center justify-center text-[10px]">✓</div>
              <span>Selected</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-4 h-4 rounded bg-gray-200 border border-gray-300" />
              <span>Booked</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-4 h-4 rounded bg-pink-50 border border-pink-400 text-pink-600 flex items-center justify-center text-[10px] font-bold">F</div>
              <span>Female Reserved</span>
            </div>
          </div>
        </div>

        {/* Right Side: Boarding/Dropping & Price Summary (4 cols) */}
        <div className="lg:col-span-4 bg-white p-5 rounded-xl border border-brand-border shadow-sm space-y-5">
          {/* Boarding Point Selection */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-brand-navy flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-brand-red" />
              Boarding Point ({bus.from})
            </label>
            <select
              value={selectedBoardingStop}
              onChange={(e) => onSelectBoardingStop(e.target.value)}
              className="w-full text-xs font-semibold p-2.5 border border-brand-border rounded-lg bg-gray-50 focus:border-brand-red outline-none"
            >
              {boardingStops.map((stop) => (
                <option key={stop.id || stop.name} value={stop.id || stop.name}>
                  {stop.name} {stop.time ? `(${stop.time})` : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Dropping Point Selection */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-brand-navy flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-brand-success" />
              Dropping Point ({bus.to})
            </label>
            <select
              value={selectedDroppingStop}
              onChange={(e) => onSelectDroppingStop(e.target.value)}
              className="w-full text-xs font-semibold p-2.5 border border-brand-border rounded-lg bg-gray-50 focus:border-brand-red outline-none"
            >
              {droppingStops.map((stop) => (
                <option key={stop.id || stop.name} value={stop.id || stop.name}>
                  {stop.name} {stop.time ? `(${stop.time})` : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Selected Seats Summary */}
          <div className="pt-3 border-t border-gray-100 space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="text-brand-muted font-medium">Selected Seats:</span>
              <span className="font-bold text-brand-navy">
                {selectedSeats.length > 0 
                  ? selectedSeats.map(s => s.seat_number).join(', ') 
                  : 'None selected'}
              </span>
            </div>

            <div className="flex justify-between items-center text-xs">
              <span className="text-brand-muted font-medium">Base Fare ({selectedSeats.length} seats):</span>
              <span className="font-semibold text-brand-navy">₹{subtotal.toFixed(2)}</span>
            </div>

            <div className="flex justify-between items-center text-xs">
              <span className="text-brand-muted font-medium">GST & Tolls (5%):</span>
              <span className="font-semibold text-brand-navy">₹{gst.toFixed(2)}</span>
            </div>

            <div className="pt-2 border-t border-gray-100 flex justify-between items-center">
              <span className="text-sm font-bold text-brand-navy">Total Fare:</span>
              <span className="text-xl font-black text-brand-red">₹{total.toFixed(2)}</span>
            </div>
          </div>

          {/* Proceed CTA Button */}
          <Button
            variant="primary"
            size="lg"
            className="w-full font-bold text-xs uppercase tracking-wider shadow-md hover:shadow-lg"
            disabled={selectedSeatIds.length === 0 || isLocking}
            onClick={onProceed}
          >
            {isLocking ? 'Locking Seats...' : `Continue with ${selectedSeatIds.length} ${selectedSeatIds.length === 1 ? 'Seat' : 'Seats'}`}
          </Button>

          <p className="text-[10px] text-center text-brand-muted">
            10-minute temporary seat lock is secured automatically upon continuing.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SeatSelector;
