import React, { useState } from 'react';
import { User, Lock, Mail, Phone, Eye, EyeOff, ShieldCheck, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

export const LoginModal = ({ isOpen, onClose }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState('customer'); // customer, operator, admin
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSuccessMsg(
        isRegister 
          ? `Welcome to BusGo, ${fullName || 'Passenger'}! Full Supabase Auth connects in Phase 3.`
          : `Signed in successfully as ${role.toUpperCase()}! Full Supabase session management arrives in Phase 3.`
      );
      setTimeout(() => {
        setSuccessMsg('');
        onClose();
      }, 1800);
    }, 800);
  };

  const handleDemoFill = (selectedRole) => {
    setRole(selectedRole);
    if (selectedRole === 'admin') {
      setEmail('admin@busgo.in');
      setPassword('Admin@BusGo2026');
    } else if (selectedRole === 'operator') {
      setEmail('partner@sunrisetravels.in');
      setPassword('Sunrise@Operator2026');
    } else {
      setEmail('passenger@busgo.in');
      setPassword('Travel@Safe2026');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isRegister ? 'Create Your BusGo Account' : 'Sign In to BusGo'}
      description="Access your bookings, saved passengers, and exclusive offers"
      maxWidth="max-w-md"
    >
      <div className="space-y-4">
        {/* Role Selector Tabs */}
        <div className="flex p-1 bg-gray-100 rounded-lg text-xs font-semibold">
          {[
            { id: 'customer', label: 'Passenger' },
            { id: 'operator', label: 'Bus Operator' },
            { id: 'admin', label: 'Admin Portal' },
          ].map((r) => (
            <button
              key={r.id}
              type="button"
              onClick={() => handleDemoFill(r.id)}
              className={`flex-1 py-1.5 rounded-md transition-all text-center ${
                role === r.id
                  ? 'bg-white text-brand-navy shadow-sm font-bold'
                  : 'text-brand-muted hover:text-brand-text'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>

        {/* Success message */}
        {successMsg ? (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-center space-y-2 animate-in zoom-in-95">
            <CheckCircle2 className="w-8 h-8 text-brand-success mx-auto" />
            <p className="text-sm font-bold text-emerald-900">{successMsg}</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            {isRegister && (
              <Input
                label="Full Name"
                placeholder="e.g. Madhav Sharma"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                leftIcon={User}
                required
              />
            )}

            <Input
              label="Email Address"
              placeholder="e.g. yourname@domain.com"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              leftIcon={Mail}
              required
            />

            {isRegister && (
              <Input
                label="Mobile Number"
                placeholder="10-digit mobile number"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                leftIcon={Phone}
                required
              />
            )}

            <Input
              label="Password"
              placeholder="••••••••"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              leftIcon={Lock}
              rightIcon={showPassword ? EyeOff : Eye}
              onRightIconClick={() => setShowPassword(!showPassword)}
              required
            />

            <Button
              type="submit"
              variant="primary"
              size="md"
              className="w-full text-sm font-bold uppercase tracking-wider"
              isLoading={loading}
              icon={ArrowRight}
              iconPosition="right"
            >
              {isRegister ? 'Register Account' : 'Sign In'}
            </Button>

            {/* Quick Demo Pre-fill helper */}
            <div className="pt-2 text-center">
              <span className="text-[11px] text-brand-muted">
                Quick testing? Click above tabs: <strong className="text-brand-navy">Passenger</strong>, <strong className="text-brand-navy">Operator</strong>, or <strong className="text-brand-navy">Admin</strong>.
              </span>
            </div>

            <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-xs">
              <button
                type="button"
                onClick={() => setIsRegister(!isRegister)}
                className="text-brand-red font-semibold hover:underline"
              >
                {isRegister ? 'Already have an account? Sign In' : 'New to BusGo? Create Account'}
              </button>
              {!isRegister && (
                <button
                  type="button"
                  onClick={() => alert('Password reset email workflow will be active with Supabase in Phase 3!')}
                  className="text-brand-muted hover:text-brand-text"
                >
                  Forgot Password?
                </button>
              )}
            </div>
          </form>
        )}
      </div>
    </Modal>
  );
};

export default LoginModal;
