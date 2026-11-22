import React, { useState } from 'react';
import { HelpCircle, PhoneCall, Mail, MessageSquare, Clock, MapPin, CheckCircle2 } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

export const HelpModal = ({ isOpen, onClose }) => {
  const [querySent, setQuerySent] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || !message) return;
    setQuerySent(true);
    setTimeout(() => {
      setQuerySent(false);
      setName('');
      setEmail('');
      setMessage('');
      onClose();
    }, 2000);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="BusGo 24x7 Customer Support"
      description="We are here to assist with your bookings, boarding, and cancellations"
      maxWidth="max-w-md"
    >
      <div className="space-y-4">
        {/* Support Channels */}
        <div className="grid grid-cols-2 gap-3 text-xs">
          <a
            href="tel:18002874646"
            className="p-3 rounded-lg bg-red-50 border border-red-200 text-brand-navy flex flex-col gap-1 hover:bg-red-100 transition-colors"
          >
            <div className="flex items-center gap-1.5 text-brand-red font-bold">
              <PhoneCall className="w-4 h-4" />
              <span>Toll Free</span>
            </div>
            <span className="font-mono font-bold">1800-BUS-GO-IN</span>
            <span className="text-[10px] text-brand-muted">24/7 Helpline</span>
          </a>

          <a
            href="mailto:support@busgo.in"
            className="p-3 rounded-lg bg-gray-50 border border-gray-200 text-brand-navy flex flex-col gap-1 hover:bg-gray-100 transition-colors"
          >
            <div className="flex items-center gap-1.5 text-blue-600 font-bold">
              <Mail className="w-4 h-4" />
              <span>Email Us</span>
            </div>
            <span className="font-medium truncate">support@busgo.in</span>
            <span className="text-[10px] text-brand-muted">&lt; 30 min response</span>
          </a>
        </div>

        {/* Quick Help Form */}
        {!querySent ? (
          <form onSubmit={handleSubmit} className="space-y-3 pt-2 border-t border-gray-100">
            <p className="text-xs font-bold text-brand-navy">Send Quick Assistance Request</p>
            <Input
              label="Your Full Name"
              placeholder="e.g. Madhav S."
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <Input
              label="Email / Mobile Number"
              placeholder="e.g. 9876543210 or email@domain.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-brand-muted mb-1">
                Your Query / Message
              </label>
              <textarea
                rows={3}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Describe your question or issue..."
                required
                className="w-full text-xs rounded-lg border border-brand-border p-2.5 focus:outline-none focus:border-brand-red focus:ring-1 focus:ring-brand-red text-brand-text placeholder-gray-400"
              />
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <Button variant="outline" size="sm" onClick={onClose} type="button">
                Cancel
              </Button>
              <Button variant="primary" size="sm" type="submit">
                Submit Request
              </Button>
            </div>
          </form>
        ) : (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-center space-y-2 animate-in zoom-in-95">
            <CheckCircle2 className="w-8 h-8 text-brand-success mx-auto" />
            <p className="text-sm font-bold text-emerald-900">Request Received!</p>
            <p className="text-xs text-emerald-800">
              A support specialist has been assigned to your query.
            </p>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default HelpModal;
