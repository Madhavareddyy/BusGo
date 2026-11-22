import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { 
  CheckCircle2, 
  Download, 
  Printer, 
  MapPin, 
  Clock, 
  Calendar, 
  Bus, 
  ShieldCheck, 
  ArrowRight,
  Share2,
  Sparkles,
  RotateCcw
} from 'lucide-react';
import QRCode from 'qrcode';
import { Button } from '../../components/ui/Button';
import { ticketGenerator } from '../../services/ticketGenerator';
import { dbService } from '../../services/db';

export const BookingConfirmationPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const pnr = searchParams.get('pnr') || 'BG829471';

  const [booking, setBooking] = useState(null);
  const [qrDataUrl, setQrDataUrl] = useState(null);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    // Look up booking from database or local storage
    dbService.getUserBookings().then((bookings) => {
      const match = bookings.find((b) => b.pnr === pnr);
      if (match) {
        setBooking(match);
      } else {
        // Fallback demo booking record
        setBooking({
          pnr: pnr,
          from: 'Bengaluru',
          to: 'Hyderabad',
          journey_date: '2026-11-23',
          departure_time: '21:30',
          arrival_time: '06:45',
          duration: '9h 15m',
          operator: 'Sunrise Travels',
          bus_name: 'Sunrise Volvo B11R AC Sleeper',
          bus_type: 'AC Sleeper (2+1)',
          boarding_point: 'Majestic (KBS) Platform 4',
          dropping_point: 'MGBS Terminal 2',
          total_fare: 899.00,
          status: 'confirmed',
          passengers: [
            { seat_number: 'L1', full_name: 'Madhavan Rao', age: 28, gender: 'Male' }
          ],
        });
      }
    });
  }, [pnr]);

  // Generate QR Code on page load
  useEffect(() => {
    if (booking) {
      QRCode.toDataURL(
        JSON.stringify({
          pnr: booking.pnr,
          date: booking.journey_date,
          seats: (booking.passengers || []).map((p) => p.seat_number).join(','),
          operator: booking.operator,
        }),
        { width: 160, margin: 1 }
      ).then(setQrDataUrl);
    }
  }, [booking]);

  const handleDownloadPDF = async () => {
    if (!booking) return;
    setIsDownloading(true);
    try {
      await ticketGenerator.downloadTicketPDF(booking);
    } finally {
      setIsDownloading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (!booking) {
    return (
      <div className="min-h-screen bg-brand-bg flex items-center justify-center p-4">
        <p className="text-sm font-bold text-brand-muted">Loading your booking details...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-bg py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Top Success Banner */}
        <div className="bg-white rounded-card border border-emerald-200 p-6 sm:p-8 shadow-card text-center space-y-3 relative overflow-hidden">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-sm">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div className="space-y-1">
            <span className="text-xs font-bold text-emerald-800 uppercase tracking-widest bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
              Booking Confirmed
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-brand-navy pt-2">
              Ticket Booked Successfully!
            </h1>
            <p className="text-xs text-brand-muted max-w-md mx-auto">
              Your journey is confirmed on the BusGo platform. An SMS and email with your ticket details have been dispatched.
            </p>
          </div>

          {/* PNR Display Banner */}
          <div className="inline-flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl px-5 py-2.5 mt-2">
            <span className="text-xs font-bold text-brand-muted uppercase tracking-wider">PNR Number:</span>
            <span className="text-xl font-black text-brand-red tracking-wider font-mono">
              {booking.pnr}
            </span>
          </div>
        </div>

        {/* E-Ticket Card Layout */}
        <div className="bg-white rounded-card border border-brand-border shadow-card overflow-hidden">
          {/* Ticket Header Strip */}
          <div className="bg-brand-navy text-white p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold tracking-tight">
                  {booking.from} → {booking.to}
                </span>
                <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-[10px] font-bold uppercase">
                  Confirmed
                </span>
              </div>
              <p className="text-xs text-gray-300 mt-0.5">
                {booking.operator} • {booking.bus_name || booking.bus_type}
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs">
              <Calendar className="w-4 h-4 text-brand-red" />
              <span className="font-bold">{booking.journey_date}</span>
            </div>
          </div>

          {/* Ticket Body Content */}
          <div className="p-6 space-y-6">
            {/* Timings & Stops Grid */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 pb-6 border-b border-gray-100 items-center">
              <div className="md:col-span-5 space-y-1">
                <span className="text-[10px] font-bold text-brand-muted uppercase">Boarding Point</span>
                <p className="text-base font-bold text-brand-navy">{booking.departure_time} - {booking.from}</p>
                <p className="text-xs text-brand-muted">{booking.boarding_point || 'Main Central Bus Stand'}</p>
              </div>

              <div className="md:col-span-2 text-center py-2 md:py-0">
                <span className="text-xs font-bold text-brand-muted">{booking.duration || '9h 15m'}</span>
                <div className="w-full h-0.5 bg-gray-200 my-1 relative">
                  <div className="w-2 h-2 rounded-full bg-brand-red absolute left-0 -top-[3px]" />
                  <div className="w-2 h-2 rounded-full bg-brand-navy absolute right-0 -top-[3px]" />
                </div>
                <span className="text-[10px] text-emerald-700 font-semibold">Direct Route</span>
              </div>

              <div className="md:col-span-5 md:text-right space-y-1">
                <span className="text-[10px] font-bold text-brand-muted uppercase">Dropping Point</span>
                <p className="text-base font-bold text-brand-navy">{booking.arrival_time} - {booking.to}</p>
                <p className="text-xs text-brand-muted">{booking.dropping_point || 'City Central Terminal'}</p>
              </div>
            </div>

            {/* Passenger Manifest & QR Code Row */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
              {/* Manifest Table (8 cols) */}
              <div className="md:col-span-8 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-brand-muted">
                  Passenger Manifest
                </h4>
                <div className="border border-gray-200 rounded-xl overflow-hidden divide-y divide-gray-100 text-xs">
                  {(booking.passengers || []).map((p, i) => (
                    <div key={i} className="p-3 flex items-center justify-between bg-gray-50/50">
                      <div>
                        <p className="font-bold text-brand-navy">{p.full_name || p.name}</p>
                        <p className="text-[11px] text-brand-muted">{p.age} Yrs • {p.gender}</p>
                      </div>
                      <span className="px-3 py-1 rounded-lg bg-red-50 text-brand-red font-black border border-red-200 text-xs">
                        Seat {p.seat_number}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="text-xs text-brand-muted pt-1">
                  <span>Total Fare Paid (Simulation): </span>
                  <strong className="text-brand-navy text-sm font-black">
                    ₹{parseFloat(booking.total_fare || 899).toFixed(2)}
                  </strong>
                </div>
              </div>

              {/* QR Code Container (4 cols) */}
              <div className="md:col-span-4 flex flex-col items-center justify-center p-4 bg-gray-50 rounded-xl border border-gray-200 text-center space-y-2">
                {qrDataUrl ? (
                  <img src={qrDataUrl} alt="Boarding QR Code" className="w-32 h-32 rounded-lg shadow-sm border border-white" />
                ) : (
                  <div className="w-32 h-32 bg-gray-200 rounded-lg animate-pulse" />
                )}
                <span className="text-[10px] font-bold text-brand-muted uppercase tracking-wider">
                  Scan for Boarding Pass
                </span>
              </div>
            </div>
          </div>

          {/* Action Button Strip */}
          <div className="bg-gray-50 p-5 border-t border-brand-border flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Button
                variant="primary"
                size="md"
                icon={Download}
                onClick={handleDownloadPDF}
                disabled={isDownloading}
              >
                {isDownloading ? 'Generating PDF...' : 'Download PDF Ticket'}
              </Button>
              <Button
                variant="outline"
                size="md"
                icon={Printer}
                onClick={handlePrint}
              >
                Print Ticket
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="md"
                onClick={() => navigate('/profile')}
              >
                View in My Bookings
              </Button>
              <Button
                variant="ghost"
                size="md"
                icon={RotateCcw}
                onClick={() => navigate('/')}
              >
                Book Another Trip
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingConfirmationPage;
