import React, { useState } from 'react';
import { 
  User, 
  Mail, 
  Phone, 
  Tag, 
  ShieldCheck, 
  Sparkles, 
  AlertCircle, 
  Check, 
  ArrowLeft 
} from 'lucide-react';
import { Button } from '../ui/Button';

export const PassengerForm = ({
  selectedSeats = [],
  baseFare = 899,
  onBack,
  onProceedToPayment,
  defaultContact = {}
}) => {
  // Contact details
  const [contactName, setContactName] = useState(defaultContact.name || 'Madhavan Rao');
  const [contactEmail, setContactEmail] = useState(defaultContact.email || 'customer@busgo.in');
  const [contactPhone, setContactPhone] = useState(defaultContact.phone || '9845012345');

  // Per-seat passenger details
  const [passengers, setPassengers] = useState(() => {
    return selectedSeats.map((seat, idx) => ({
      seat_id: seat.id,
      seat_number: seat.seat_number,
      is_ladies: Boolean(seat.is_ladies),
      full_name: idx === 0 ? defaultContact.name || 'Madhavan Rao' : '',
      age: idx === 0 ? '28' : '',
      gender: seat.is_ladies ? 'Female' : 'Male',
    }));
  });

  // Coupon state
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState('');
  const [formErrors, setFormErrors] = useState({});

  // Coupon application logic
  const handleApplyCoupon = (e) => {
    e.preventDefault();
    setCouponError('');
    const code = couponCode.trim().toUpperCase();

    if (!code) {
      setCouponError('Please enter a coupon code.');
      return;
    }

    if (code === 'BUSGOFIRST') {
      setAppliedCoupon({ code: 'BUSGOFIRST', discount: 150, type: 'flat' });
    } else if (code === 'SUPERBUS') {
      setAppliedCoupon({ code: 'SUPERBUS', discount: 0.15, type: 'percent' });
    } else if (code === 'VOLVOLUXE') {
      setAppliedCoupon({ code: 'VOLVOLUXE', discount: 200, type: 'flat' });
    } else {
      setCouponError('Invalid coupon code. Try "BUSGOFIRST" or "SUPERBUS".');
    }
  };

  const handlePassengerChange = (index, field, value) => {
    setPassengers((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  // Calculations
  const subtotal = selectedSeats.reduce((acc, s) => acc + (s.fare || baseFare), 0);
  let discountAmount = 0;
  if (appliedCoupon) {
    discountAmount = appliedCoupon.type === 'percent'
      ? subtotal * appliedCoupon.discount
      : appliedCoupon.discount;
  }
  const taxable = Math.max(0, subtotal - discountAmount);
  const gst = taxable * 0.05;
  const grandTotal = taxable + gst;

  // Validation
  const validateAndProceed = (e) => {
    e.preventDefault();
    const errors = {};

    if (!contactName.trim()) errors.contactName = 'Contact name is required.';
    if (!contactEmail.trim() || !contactEmail.includes('@')) errors.contactEmail = 'Valid email is required.';
    if (!/^[6-9]\d{9}$/.test(contactPhone.trim())) errors.contactPhone = 'Valid 10-digit Indian phone is required.';

    passengers.forEach((p, idx) => {
      if (!p.full_name.trim()) errors[`name_${idx}`] = `Passenger ${idx + 1} name is required.`;
      const ageNum = parseInt(p.age, 10);
      if (isNaN(ageNum) || ageNum < 1 || ageNum > 120) errors[`age_${idx}`] = `Age must be between 1 and 120.`;
      if (p.is_ladies && p.gender !== 'Female') {
        errors[`gender_${idx}`] = `Seat ${p.seat_number} is reserved for female passengers.`;
      }
    });

    setFormErrors(errors);

    if (Object.keys(errors).length === 0) {
      onProceedToPayment({
        contactName,
        contactEmail,
        contactPhone,
        passengers,
        couponCode: appliedCoupon?.code || null,
        discountAmount,
        subtotal,
        gst,
        grandTotal,
      });
    }
  };

  return (
    <form onSubmit={validateAndProceed} className="space-y-6 animate-in fade-in duration-200">
      {/* Back button and title */}
      <div className="flex items-center justify-between pb-3 border-b border-gray-100">
        <button
          type="button"
          onClick={onBack}
          className="text-xs font-bold text-brand-muted hover:text-brand-navy flex items-center gap-1 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Seat Selection
        </button>
        <span className="text-xs font-bold text-brand-navy">
          Step 2 of 3: Passenger & Contact Details
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Side: Passenger Inputs (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Primary Contact Card */}
          <div className="bg-white p-5 rounded-xl border border-brand-border shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-brand-navy uppercase tracking-wider flex items-center gap-1.5">
              <Mail className="w-4 h-4 text-brand-red" />
              Contact Information (Ticket will be sent here)
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-brand-muted uppercase mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  placeholder="e.g. Madhavan Rao"
                  className="w-full text-xs font-semibold p-2.5 border border-brand-border rounded-lg focus:border-brand-red outline-none"
                />
                {formErrors.contactName && (
                  <p className="text-[10px] text-rose-600 mt-1">{formErrors.contactName}</p>
                )}
              </div>

              <div>
                <label className="block text-[11px] font-bold text-brand-muted uppercase mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full text-xs font-semibold p-2.5 border border-brand-border rounded-lg focus:border-brand-red outline-none"
                />
                {formErrors.contactEmail && (
                  <p className="text-[10px] text-rose-600 mt-1">{formErrors.contactEmail}</p>
                )}
              </div>

              <div>
                <label className="block text-[11px] font-bold text-brand-muted uppercase mb-1">
                  Mobile Number
                </label>
                <input
                  type="tel"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  placeholder="10-digit mobile"
                  maxLength={10}
                  className="w-full text-xs font-semibold p-2.5 border border-brand-border rounded-lg focus:border-brand-red outline-none"
                />
                {formErrors.contactPhone && (
                  <p className="text-[10px] text-rose-600 mt-1">{formErrors.contactPhone}</p>
                )}
              </div>
            </div>
          </div>

          {/* Per-Passenger Details Cards */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-brand-navy uppercase tracking-wider flex items-center gap-1.5">
              <User className="w-4 h-4 text-brand-red" />
              Passenger Details ({passengers.length} {passengers.length === 1 ? 'Passenger' : 'Passengers'})
            </h3>

            {passengers.map((p, idx) => (
              <div 
                key={p.seat_id || idx} 
                className={`bg-white p-5 rounded-xl border shadow-sm space-y-3 transition-colors ${
                  p.is_ladies ? 'border-pink-300 bg-pink-50/20' : 'border-brand-border'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-brand-navy text-white text-xs font-bold flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <span className="text-xs font-bold text-brand-navy">
                      Passenger {idx + 1}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-gray-100 text-brand-navy text-xs font-black border border-gray-200">
                      Seat: {p.seat_number}
                    </span>
                    {p.is_ladies && (
                      <span className="px-2 py-0.5 rounded-full bg-pink-100 text-pink-700 text-[10px] font-bold border border-pink-200">
                        Female Reserved
                      </span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                  <div className="sm:col-span-6">
                    <label className="block text-[11px] font-bold text-brand-muted uppercase mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={p.full_name}
                      onChange={(e) => handlePassengerChange(idx, 'full_name', e.target.value)}
                      placeholder="Passenger name as on Gov ID"
                      className="w-full text-xs font-semibold p-2.5 border border-brand-border rounded-lg focus:border-brand-red outline-none"
                    />
                    {formErrors[`name_${idx}`] && (
                      <p className="text-[10px] text-rose-600 mt-1">{formErrors[`name_${idx}`]}</p>
                    )}
                  </div>

                  <div className="sm:col-span-3">
                    <label className="block text-[11px] font-bold text-brand-muted uppercase mb-1">
                      Age
                    </label>
                    <input
                      type="number"
                      value={p.age}
                      min={1}
                      max={120}
                      onChange={(e) => handlePassengerChange(idx, 'age', e.target.value)}
                      placeholder="Age"
                      className="w-full text-xs font-semibold p-2.5 border border-brand-border rounded-lg focus:border-brand-red outline-none"
                    />
                    {formErrors[`age_${idx}`] && (
                      <p className="text-[10px] text-rose-600 mt-1">{formErrors[`age_${idx}`]}</p>
                    )}
                  </div>

                  <div className="sm:col-span-3">
                    <label className="block text-[11px] font-bold text-brand-muted uppercase mb-1">
                      Gender
                    </label>
                    <select
                      value={p.gender}
                      onChange={(e) => handlePassengerChange(idx, 'gender', e.target.value)}
                      className="w-full text-xs font-semibold p-2.5 border border-brand-border rounded-lg bg-white focus:border-brand-red outline-none"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                    {formErrors[`gender_${idx}`] && (
                      <p className="text-[10px] text-rose-600 mt-1">{formErrors[`gender_${idx}`]}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Side: Fare Summary & Coupons (4 cols) */}
        <div className="lg:col-span-4 space-y-5">
          {/* Coupon Code Card */}
          <div className="bg-white p-5 rounded-xl border border-brand-border shadow-sm space-y-3">
            <h4 className="text-xs font-bold text-brand-navy uppercase tracking-wider flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-brand-red" />
              Offers & Promo Code
            </h4>

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Try BUSGOFIRST"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                className="flex-1 text-xs font-bold p-2 border border-brand-border rounded-lg uppercase outline-none focus:border-brand-red"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleApplyCoupon}
              >
                Apply
              </Button>
            </div>

            {couponError && (
              <p className="text-[10px] text-rose-600 font-medium">{couponError}</p>
            )}

            {appliedCoupon && (
              <div className="p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs font-bold flex items-center justify-between">
                <span>Code {appliedCoupon.code} Applied!</span>
                <span className="text-emerald-700">-₹{discountAmount.toFixed(2)}</span>
              </div>
            )}
          </div>

          {/* Price Breakdown Card */}
          <div className="bg-white p-5 rounded-xl border border-brand-border shadow-sm space-y-3 text-xs">
            <h4 className="font-bold text-brand-navy uppercase tracking-wider text-xs">
              Fare Breakdown
            </h4>

            <div className="space-y-2 border-b border-gray-100 pb-3">
              <div className="flex justify-between">
                <span className="text-brand-muted">Base Fare ({passengers.length} seats):</span>
                <span className="font-semibold text-brand-navy">₹{subtotal.toFixed(2)}</span>
              </div>

              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-700 font-bold">
                  <span>Coupon Discount:</span>
                  <span>-₹{discountAmount.toFixed(2)}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span className="text-brand-muted">GST & Tolls (5%):</span>
                <span className="font-semibold text-brand-navy">₹{gst.toFixed(2)}</span>
              </div>
            </div>

            <div className="flex justify-between items-center pt-1">
              <span className="text-sm font-bold text-brand-navy">Grand Total:</span>
              <span className="text-xl font-black text-brand-red">
                ₹{grandTotal.toFixed(2)}
              </span>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full text-xs font-bold uppercase tracking-wider mt-2 shadow-md hover:shadow-lg"
            >
              Proceed to Payment
            </Button>

            <div className="p-2.5 rounded-lg bg-gray-50 border border-gray-100 text-[10px] text-brand-muted flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Free instant cancellation available up to 4 hours before departure.</span>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
};

export default PassengerForm;
