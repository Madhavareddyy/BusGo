import React, { useState } from 'react';
import { 
  CreditCard, 
  Smartphone, 
  Building2, 
  ShieldCheck, 
  CheckCircle2, 
  AlertTriangle, 
  Loader2,
  Lock,
  Sparkles
} from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';

export const PaymentModal = ({
  isOpen,
  onClose,
  totalFare,
  onPaymentSuccess,
  isProcessing = false
}) => {
  const [method, setMethod] = useState('UPI'); // 'UPI' | 'CARD' | 'NETBANKING'
  const [upiApp, setUpiApp] = useState('GPay');
  const [upiId, setUpiId] = useState('customer@okhdfcbank');
  const [selectedBank, setSelectedBank] = useState('HDFC');
  const [localProcessing, setLocalProcessing] = useState(false);

  const handleSimulatePayment = (e) => {
    e.preventDefault();
    setLocalProcessing(true);

    // Simulate 1.5-second bank authorization handshake
    setTimeout(() => {
      setLocalProcessing(false);
      onPaymentSuccess({
        paymentMethod: method,
        amount: totalFare,
        transactionId: 'TXN-' + Math.floor(10000000 + Math.random() * 90000000),
      });
    }, 1500);
  };

  const isBusy = isProcessing || localProcessing;

  return (
    <Modal
      isOpen={isOpen}
      onClose={isBusy ? () => {} : onClose}
      title="Secure Demo Payment Simulation"
      size="lg"
    >
      <div className="space-y-5 text-brand-text">
        {/* Prominent Demo Mode Disclaimer Banner */}
        <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 text-xs flex items-start gap-2.5">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <p className="font-bold">DEMO ENVIRONMENT — NO REAL MONEY WILL BE CHARGED</p>
            <p className="text-[11px] text-amber-800">
              This is a simulated sandbox payment gateway for the BusGo platform demonstration. Never enter real credit cards, CVVs, UPI PINs, or confidential banking credentials.
            </p>
          </div>
        </div>

        {/* Fare Summary Strip */}
        <div className="bg-gray-50 rounded-xl p-4 border border-brand-border flex items-center justify-between">
          <div>
            <span className="text-[11px] text-brand-muted uppercase font-bold tracking-wider">
              Amount Payable (Demo)
            </span>
            <p className="text-2xl font-black text-brand-red leading-tight">
              ₹{parseFloat(totalFare || 899).toFixed(2)}
            </p>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-bold bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-full">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>256-Bit SSL Encrypted</span>
          </div>
        </div>

        {/* Payment Methods Tabs */}
        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            disabled={isBusy}
            onClick={() => setMethod('UPI')}
            className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center justify-center gap-1 ${
              method === 'UPI'
                ? 'bg-brand-red text-white border-brand-red shadow-sm'
                : 'bg-white border-gray-200 hover:border-gray-300 text-brand-navy'
            }`}
          >
            <Smartphone className="w-5 h-5" />
            <span className="text-xs font-bold">UPI / QR</span>
          </button>

          <button
            type="button"
            disabled={isBusy}
            onClick={() => setMethod('CARD')}
            className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center justify-center gap-1 ${
              method === 'CARD'
                ? 'bg-brand-red text-white border-brand-red shadow-sm'
                : 'bg-white border-gray-200 hover:border-gray-300 text-brand-navy'
            }`}
          >
            <CreditCard className="w-5 h-5" />
            <span className="text-xs font-bold">Cards (Demo)</span>
          </button>

          <button
            type="button"
            disabled={isBusy}
            onClick={() => setMethod('NETBANKING')}
            className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center justify-center gap-1 ${
              method === 'NETBANKING'
                ? 'bg-brand-red text-white border-brand-red shadow-sm'
                : 'bg-white border-gray-200 hover:border-gray-300 text-brand-navy'
            }`}
          >
            <Building2 className="w-5 h-5" />
            <span className="text-xs font-bold">Net Banking</span>
          </button>
        </div>

        {/* Method 1: UPI Form */}
        {method === 'UPI' && (
          <div className="p-4 bg-white rounded-xl border border-brand-border space-y-4">
            <div className="flex items-center gap-2">
              {['GPay', 'PhonePe', 'Paytm', 'BHIM'].map((app) => (
                <button
                  key={app}
                  type="button"
                  onClick={() => setUpiApp(app)}
                  className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold border transition-colors ${
                    upiApp === app
                      ? 'bg-red-50 border-brand-red text-brand-red'
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  {app}
                </button>
              ))}
            </div>

            <div>
              <label className="block text-[11px] font-bold text-brand-muted uppercase mb-1">
                Virtual Payment Address (Demo VPA)
              </label>
              <input
                type="text"
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                placeholder="username@bank"
                className="w-full text-xs font-semibold p-2.5 border border-brand-border rounded-lg outline-none focus:border-brand-red"
              />
            </div>
          </div>
        )}

        {/* Method 2: Card Simulation */}
        {method === 'CARD' && (
          <div className="p-4 bg-white rounded-xl border border-brand-border space-y-3">
            <div>
              <label className="block text-[11px] font-bold text-brand-muted uppercase mb-1">
                Demo Test Card Number
              </label>
              <input
                type="text"
                readOnly
                value="4111 •••• •••• 1111 (Demo VISA)"
                className="w-full text-xs font-mono font-bold p-2.5 border border-gray-200 rounded-lg bg-gray-50 text-gray-700"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-brand-muted uppercase mb-1">
                  Expiry
                </label>
                <input
                  type="text"
                  readOnly
                  value="12/28"
                  className="w-full text-xs font-mono p-2.5 border border-gray-200 rounded-lg bg-gray-50 text-gray-700"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-brand-muted uppercase mb-1">
                  CVV (Pre-filled)
                </label>
                <input
                  type="text"
                  readOnly
                  value="••• (Sandbox)"
                  className="w-full text-xs font-mono p-2.5 border border-gray-200 rounded-lg bg-gray-50 text-gray-700"
                />
              </div>
            </div>
          </div>
        )}

        {/* Method 3: Net Banking */}
        {method === 'NETBANKING' && (
          <div className="p-4 bg-white rounded-xl border border-brand-border space-y-3">
            <label className="block text-[11px] font-bold text-brand-muted uppercase">
              Select Demo Bank
            </label>
            <div className="grid grid-cols-2 gap-2">
              {['HDFC Bank', 'State Bank of India', 'ICICI Bank', 'Axis Bank'].map((b) => (
                <button
                  key={b}
                  type="button"
                  onClick={() => setSelectedBank(b)}
                  className={`p-2.5 rounded-lg border text-xs font-bold text-left transition-colors ${
                    selectedBank === b
                      ? 'bg-red-50 border-brand-red text-brand-red'
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  {b}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Payment CTA */}
        <div className="pt-2">
          <Button
            type="button"
            variant="primary"
            size="lg"
            className="w-full text-xs font-bold uppercase tracking-wider shadow-lg flex items-center justify-center gap-2"
            disabled={isBusy}
            onClick={handleSimulatePayment}
          >
            {isBusy ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Simulating Gateway Authorization...</span>
              </>
            ) : (
              <>
                <Lock className="w-4 h-4" />
                <span>Approve Demo Payment (₹{parseFloat(totalFare || 899).toFixed(2)})</span>
              </>
            )}
          </Button>

          <p className="text-[10px] text-center text-gray-400 mt-2">
            Clicking approve completes the atomic transaction on the live database.
          </p>
        </div>
      </div>
    </Modal>
  );
};

export default PaymentModal;
