import { jsPDF } from 'jspdf';
import QRCode from 'qrcode';

/**
 * BusGo PDF Ticket & QR Code Generation Service
 * Generates commercial redBus-inspired e-tickets
 */

export const ticketGenerator = {
  /**
   * Generate QR Code Data URL from booking payload
   */
  async generateQRCode(booking) {
    try {
      const payload = JSON.stringify({
        pnr: booking.pnr,
        trip_id: booking.trip_id || booking.tripId,
        date: booking.journey_date || booking.journeyDate,
        seats: (booking.passengers || []).map((p) => p.seat_number || p.seatNumber).join(','),
        operator: booking.operator || 'BusGo Partner',
        verify_url: `https://busgo.in/verify/${booking.pnr}`
      });

      return await QRCode.toDataURL(payload, {
        width: 180,
        margin: 1,
        color: {
          dark: '#1F2937',
          light: '#FFFFFF'
        }
      });
    } catch (err) {
      console.warn('QR Code generation fallback:', err);
      return null;
    }
  },

  /**
   * Download a professional, redBus-styled PDF e-ticket
   */
  async downloadTicketPDF(booking) {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const qrDataUrl = await this.generateQRCode(booking);

    // Color definitions
    const primaryRed = [216, 78, 85]; // #D84E55
    const darkNavy = [31, 41, 55];   // #1F2937
    const lightBg = [247, 248, 250];  // #F7F8FA
    const mutedGray = [102, 112, 133];

    // Page Header Banner (Crimson Red)
    doc.setFillColor(primaryRed[0], primaryRed[1], primaryRed[2]);
    doc.rect(0, 0, 210, 28, 'F');

    // Header Logo & Brand
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(22);
    doc.text('BusGo', 14, 15);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text('Your Journey, Our Priority • Official E-Ticket & Boarding Pass', 14, 21);

    // 24x7 Helpline on top right
    doc.setFontSize(8);
    doc.text('24x7 Helpline: 1800 209 4545', 196, 13, { align: 'right' });
    doc.text('support@busgo.in', 196, 18, { align: 'right' });

    // Ticket Reference Strip
    doc.setFillColor(lightBg[0], lightBg[1], lightBg[2]);
    doc.roundedRect(14, 34, 182, 18, 2, 2, 'F');
    doc.setDrawColor(229, 231, 235);
    doc.roundedRect(14, 34, 182, 18, 2, 2, 'D');

    doc.setTextColor(mutedGray[0], mutedGray[1], mutedGray[2]);
    doc.setFontSize(8);
    doc.text('PNR NUMBER', 20, 41);
    doc.text('BOOKING ID', 75, 41);
    doc.text('JOURNEY DATE', 130, 41);
    doc.text('STATUS', 175, 41);

    doc.setTextColor(darkNavy[0], darkNavy[1], darkNavy[2]);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text(booking.pnr || 'BG829471', 20, 48);
    doc.text(String(booking.id || booking.booking_id || 'BG-BOOK-01').substring(0, 16), 75, 48);
    doc.text(booking.journey_date || booking.journeyDate || '2026-11-23', 130, 48);
    
    // Status Badge
    doc.setTextColor(primaryRed[0], primaryRed[1], primaryRed[2]);
    doc.text((booking.status || 'CONFIRMED').toUpperCase(), 175, 48);

    // Journey Route Box
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(229, 231, 235);
    doc.roundedRect(14, 58, 182, 42, 2, 2, 'D');

    // Route Heading
    doc.setTextColor(darkNavy[0], darkNavy[1], darkNavy[2]);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(`${booking.from || 'Origin'}  →  ${booking.to || 'Destination'}`, 20, 68);

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(mutedGray[0], mutedGray[1], mutedGray[2]);
    doc.text(`${booking.operator || 'Sunrise Travels'} • ${booking.bus_name || booking.bus_type || 'AC Sleeper (2+1)'}`, 20, 74);

    // Departure & Arrival Details
    doc.setFontSize(8);
    doc.text('DEPARTURE TIME & BOARDING POINT', 20, 83);
    doc.text('ARRIVAL TIME & DROPPING POINT', 115, 83);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(darkNavy[0], darkNavy[1], darkNavy[2]);
    doc.text(booking.departure_time || '21:30', 20, 89);
    doc.text(booking.arrival_time || '06:45', 115, 89);

    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(mutedGray[0], mutedGray[1], mutedGray[2]);
    doc.text(booking.boarding_point || booking.boarding_stop || 'Central Terminal Platform 4', 20, 94);
    doc.text(booking.dropping_point || booking.dropping_stop || 'Main City Dropping Terminal', 115, 94);

    // Passenger Manifest Section
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(darkNavy[0], darkNavy[1], darkNavy[2]);
    doc.text('Passenger Details', 14, 108);

    // Table Header
    doc.setFillColor(lightBg[0], lightBg[1], lightBg[2]);
    doc.rect(14, 112, 182, 8, 'F');
    doc.setFontSize(8);
    doc.setTextColor(mutedGray[0], mutedGray[1], mutedGray[2]);
    doc.text('SEAT NO.', 20, 117);
    doc.text('PASSENGER NAME', 50, 117);
    doc.text('AGE', 115, 117);
    doc.text('GENDER', 140, 117);
    doc.text('STATUS', 170, 117);

    // Passenger Rows
    let y = 125;
    const passengers = booking.passengers && booking.passengers.length > 0
      ? booking.passengers
      : [{ seat_number: 'L1', full_name: booking.contact_name || 'Passenger 1', age: 28, gender: 'Male' }];

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(darkNavy[0], darkNavy[1], darkNavy[2]);

    passengers.forEach((p, idx) => {
      doc.setFont('helvetica', 'bold');
      doc.text(p.seat_number || p.seatNumber || `S${idx + 1}`, 20, y);
      doc.setFont('helvetica', 'normal');
      doc.text(p.full_name || p.name || 'Passenger', 50, y);
      doc.text(String(p.age || 25), 115, y);
      doc.text(p.gender || 'Male', 140, y);
      doc.setTextColor(21, 153, 87); // Emerald green
      doc.text('CONFIRMED', 170, y);
      doc.setTextColor(darkNavy[0], darkNavy[1], darkNavy[2]);

      // Row separator
      doc.setDrawColor(240, 240, 240);
      doc.line(14, y + 2, 196, y + 2);
      y += 8;
    });

    // Primary Contact Details
    y += 4;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Contact & Fare Summary', 14, y);
    y += 6;

    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(mutedGray[0], mutedGray[1], mutedGray[2]);
    doc.text(`Primary Contact: ${booking.contact_name || 'Customer'} (${booking.contact_phone || '9876543210'}) • ${booking.contact_email || 'customer@busgo.in'}`, 14, y);

    // Fare Summary Box
    y += 6;
    doc.setFillColor(lightBg[0], lightBg[1], lightBg[2]);
    doc.roundedRect(14, y, 120, 36, 2, 2, 'F');
    doc.setDrawColor(229, 231, 235);
    doc.roundedRect(14, y, 120, 36, 2, 2, 'D');

    doc.setTextColor(mutedGray[0], mutedGray[1], mutedGray[2]);
    doc.text('Base Ticket Fare:', 20, y + 8);
    doc.text('GST & Tolls (5%):', 20, y + 15);
    doc.text('Discount / Coupon Applied:', 20, y + 22);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(darkNavy[0], darkNavy[1], darkNavy[2]);
    doc.text('Total Amount Paid (Simulation):', 20, y + 30);

    const baseFare = booking.total_fare ? (booking.total_fare / 1.05).toFixed(2) : '856.19';
    const gst = booking.total_fare ? (booking.total_fare * 0.05).toFixed(2) : '42.81';
    const total = booking.total_fare ? parseFloat(booking.total_fare).toFixed(2) : '899.00';

    doc.setFont('helvetica', 'normal');
    doc.text(`₹${baseFare}`, 125, y + 8, { align: 'right' });
    doc.text(`₹${gst}`, 125, y + 15, { align: 'right' });
    doc.text(`- ₹0.00`, 125, y + 22, { align: 'right' });
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(primaryRed[0], primaryRed[1], primaryRed[2]);
    doc.text(`₹${total}`, 125, y + 30, { align: 'right' });

    // Embed QR Code
    if (qrDataUrl) {
      doc.addImage(qrDataUrl, 'PNG', 145, y - 2, 40, 40);
      doc.setFontSize(7);
      doc.setTextColor(mutedGray[0], mutedGray[1], mutedGray[2]);
      doc.text('Scan for Boarding Pass Verification', 165, y + 42, { align: 'center' });
    }

    // Cancellation Policy & Travel Guidelines
    y += 48;
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(darkNavy[0], darkNavy[1], darkNavy[2]);
    doc.text('Cancellation Policy & Boarding Instructions', 14, y);

    y += 5;
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(mutedGray[0], mutedGray[1], mutedGray[2]);
    doc.text('1. Please report at the boarding point at least 15 minutes prior to departure.', 14, y);
    doc.text('2. Carry a valid Government Photo ID (Aadhaar, Passport, Driving License) along with this e-ticket.', 14, y + 4);
    doc.text('3. Cancellation Refund Tier: > 24 hrs (90% refund), 12-24 hrs (75% refund), 4-12 hrs (50% refund), < 4 hrs (0%).', 14, y + 8);
    doc.text('4. This booking was simulated under BusGo Sandbox Demo environment.', 14, y + 12);

    // Footer
    doc.setDrawColor(primaryRed[0], primaryRed[1], primaryRed[2]);
    doc.line(14, 280, 196, 280);
    doc.setFontSize(7);
    doc.text('BusGo India Pvt Ltd • ISO 9001:2026 Certified Travel Network • Have a Safe Journey!', 105, 286, { align: 'center' });

    // Trigger Browser Download
    const fileName = `BusGo-Ticket-${booking.pnr || 'BG829471'}.pdf`;
    doc.save(fileName);
    return true;
  }
};

export default ticketGenerator;
