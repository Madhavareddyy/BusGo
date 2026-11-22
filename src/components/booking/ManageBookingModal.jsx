import React, { useState } from 'react';
import { Search, Ticket, AlertCircle } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';

export const ManageBookingModal = ({ isOpen, onClose }) => {
  const [pnr, setPnr] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleSearch = (e) => {
    e.preventDefault();
    setError('');
    setResult(null);

    const cleanPnr = pnr.trim().toUpperCase();
    if (!cleanPnr) {
      setError('Please enter your 6-8 character PNR number');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      if (cleanPnr.length >= 4) {
        setResult({
          pnr: cleanPnr,
          operator: 'Sunrise Travels',
          busType: 'Volvo Multi-Axle AC Sleeper (2+1)',
          route: 'Bengaluru → Hyderabad',
          date: '28 Nov 2026',
          departureTime: '21:30',
          boardingPoint: 'Majestic (KBS) Platform 4',
          seatNumbers: ['U3', 'U4'],
          totalFare: 1780,
          status: 'CONFIRMED',
          passengers: ['Madhav S.', 'Aditi S.'],
        });
      } else {
        setError('No active booking found matching PNR ' + cleanPnr + '. Try "BG782914".');
      }
    }, 700);
  };

  const handleReset = () => {
    setPnr('');
    setPhone('');
    setError('');
    setResult(null);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        handleReset();
        onClose();
      }}
      title="Manage Your Booking"
      description="Retrieve your e-ticket, track bus status, or request cancellation"
      maxWidth="max-w-md"
    >
      <div className="space-y-4">
        {!result ? (
          <form onSubmit={handleSearch} className="space-y-3.5">
            <Input
              label="PNR Number"
              placeholder="e.g. BG782914"
              value={pnr}
              onChange={(e) => setPnr(e.target.value.toUpperCase())}
              leftIcon={Ticket}
              helperText="Find your PNR in your booking confirmation SMS or email"
              autoFocus
            />

            <Input
              label="Registered Mobile Number (Optional)"
              placeholder="10-digit mobile number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              type="tel"
              maxLength={10}
            />

            {error && (
              <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="pt-2 flex gap-2">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setPnr('BG782914');
                  setPhone('9876543210');
                }}
              >
                Use Demo PNR
              </Button>
              <Button
                type="submit"
                variant="primary"
                className="flex-1"
                isLoading={loading}
                icon={Search}
              >
                Search Ticket
              </Button>
            </div>
          </form>
        ) : (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
                  Booking Confirmed
                </span>
                <span className="text-xs font-mono font-black text-emerald-900 bg-white px-2 py-0.5 rounded border border-emerald-300">
                  PNR: {result.pnr}
                </span>
              </div>
              <div className="border-t border-emerald-200/80 pt-2 text-xs text-emerald-900 space-y-1">
                <p className="font-bold text-sm text-brand-navy">{result.route}</p>
                <p>{result.operator} • {result.busType}</p>
                <p><span className="text-emerald-700">Journey:</span> {result.date} at {result.departureTime}</p>
                <p><span className="text-emerald-700">Seats:</span> {result.seatNumbers.join(', ')} ({result.passengers.join(', ')})</p>
                <p><span className="text-emerald-700">Boarding:</span> {result.boardingPoint}</p>
                <p className="font-bold text-sm text-brand-navy pt-1">Total Paid: ₹{result.totalFare}</p>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => setResult(null)}
              >
                Search Another
              </Button>
              <Button
                variant="primary"
                size="sm"
                className="flex-1"
                onClick={() => {
                  alert(`PNR ${result.pnr} verified. Full PDF e-ticket with QR code arrives in Phase 8!`);
                  onClose();
                }}
              >
                View E-Ticket
              </Button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default ManageBookingModal;

