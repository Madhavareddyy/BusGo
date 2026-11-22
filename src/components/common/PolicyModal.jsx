import React from 'react';
import { ShieldCheck, FileText, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';

export const PolicyModal = ({ isOpen, onClose, policyType }) => {
  const getPolicyContent = () => {
    switch (policyType) {
      case 'cancellation':
        return {
          title: 'Cancellation & Refund Rules',
          description: 'Official BusGo ticket cancellation policy and refund tiers',
          body: (
            <div className="space-y-4 text-xs sm:text-sm text-brand-text">
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-900 text-xs">
                <strong>Simulated Refund Timeline:</strong> Cancellations are processed immediately. In our academic simulator, refundable amounts are marked with DEMO_REFUNDED status.
              </div>
              <div className="border border-brand-border rounded-lg overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-gray-100 text-brand-navy font-bold">
                    <tr>
                      <th className="p-2.5">Time Before Departure</th>
                      <th className="p-2.5">Cancellation Deduction</th>
                      <th className="p-2.5 text-right">Refund Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    <tr>
                      <td className="p-2.5 font-medium">&gt; 24 Hours before journey</td>
                      <td className="p-2.5 text-gray-500">10% base fare</td>
                      <td className="p-2.5 text-right font-bold text-brand-success">90% Refund</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-medium">12 to 24 Hours before journey</td>
                      <td className="p-2.5 text-gray-500">25% base fare</td>
                      <td className="p-2.5 text-right font-bold text-brand-success">75% Refund</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-medium">4 to 12 Hours before journey</td>
                      <td className="p-2.5 text-gray-500">50% base fare</td>
                      <td className="p-2.5 text-right font-bold text-amber-600">50% Refund</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-medium">&lt; 4 Hours or Post-Departure</td>
                      <td className="p-2.5 text-gray-500">100% fare</td>
                      <td className="p-2.5 text-right font-bold text-rose-600">No Refund (0%)</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p className="text-xs text-brand-muted">
                * Note: Convenience fee and payment gateway charges are non-refundable. Cancelled seats are immediately released back to the general inventory.
              </p>
            </div>
          ),
        };
      case 'terms':
        return {
          title: 'Terms and Conditions',
          description: 'BusGo ticketing platform terms of service',
          body: (
            <div className="space-y-3 text-xs sm:text-sm text-brand-text">
              <p>
                1. <strong>Platform Role:</strong> BusGo is an online bus ticketing facilitator connecting passengers with verified bus fleet operators across India.
              </p>
              <p>
                2. <strong>Reporting Time:</strong> Passengers must report at the designated boarding point at least 15 minutes before the scheduled departure time.
              </p>
              <p>
                3. <strong>Identity Proof:</strong> A valid government photo ID (Aadhaar, Driving License, PAN card, or Passport) is mandatory during boarding.
              </p>
              <p>
                4. <strong>Luggage Allowance:</strong> Up to 15 kg of personal luggage is permitted per passenger ticket. Flammable or hazardous materials are strictly prohibited.
              </p>
            </div>
          ),
        };
      case 'privacy':
        return {
          title: 'Privacy Policy',
          description: 'How BusGo safeguards passenger data',
          body: (
            <div className="space-y-3 text-xs sm:text-sm text-brand-text">
              <p>
                1. <strong>Academic Demonstration:</strong> BusGo is built as an academic portfolio platform. We do not store or collect actual credit card details, CVVs, or UPI PINs.
              </p>
              <p>
                2. <strong>Passenger Data:</strong> Passenger names and mobile numbers entered during booking simulation are strictly used for ticket generation and PNR status lookup.
              </p>
              <p>
                3. <strong>Data Encryption:</strong> All communications between the client and Supabase PostgreSQL platform are encrypted using TLS/HTTPS.
              </p>
            </div>
          ),
        };
      default:
        return {
          title: 'Bus Operator Partnership',
          description: 'Join India’s fastest growing bus ticketing network',
          body: (
            <div className="space-y-3 text-xs sm:text-sm text-brand-text">
              <p>
                Bus fleet operators can register on BusGo to manage buses, set dynamic pricing, monitor passenger manifests, and view simulated earnings in the Operator Portal.
              </p>
              <p className="font-semibold text-brand-navy">
                Operator registration and portal modules will be unlocked in Phase 11!
              </p>
            </div>
          ),
        };
    }
  };

  const content = getPolicyContent();

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={content.title}
      description={content.description}
      maxWidth="max-w-lg"
    >
      <div className="space-y-4">
        {content.body}
        <div className="pt-2 flex justify-end">
          <Button variant="primary" size="sm" onClick={onClose}>
            Understood
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default PolicyModal;
