import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  AlertCircle, 
  CheckCircle2, 
  ShieldCheck 
} from 'lucide-react';
import { Logo } from '../../components/common/Logo';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { PolicyModal } from '../../components/common/PolicyModal';

export const RegisterPage = () => {
  const { registerCustomer, isDemoMode } = useAuth();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(true);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [verificationSent, setVerificationSent] = useState(false);
  const [policyModal, setPolicyModal] = useState(null);

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');

    if (!fullName.trim()) {
      setError('Please enter your full name');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setError('Please provide a valid email address');
      return;
    }
    if (phone && !/^[6-9]\d{9}$/.test(phone.trim())) {
      setError('Please enter a valid 10-digit Indian mobile number');
      return;
    }
    if (password.length < 6) {
      setError('Password must contain at least 6 characters');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (!agreeTerms) {
      setError('Please accept the BusGo Terms of Service to continue');
      return;
    }

    setLoading(true);
    try {
      const res = await registerCustomer({
        email,
        password,
        fullName,
        phone,
        city,
      });

      if (res?.requiresVerification) {
        setVerificationSent(true);
      } else {
        navigate('/profile', { replace: true });
      }
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-bg flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-3">
        <Logo size="lg" />
        <h2 className="text-2xl font-black text-brand-navy tracking-tight">
          Create Your BusGo Account
        </h2>
        <p className="text-xs text-brand-muted">
          Unlock instant seat booking, m-tickets, and return journey discounts
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white py-8 px-6 sm:px-10 rounded-card-lg border border-brand-border shadow-card space-y-6">
          {verificationSent ? (
            <div className="text-center space-y-4 py-4 animate-in zoom-in-95">
              <div className="w-16 h-16 rounded-full bg-emerald-50 text-brand-success flex items-center justify-center mx-auto border border-emerald-200">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-brand-navy">
                Account Created Successfully!
              </h3>
              <p className="text-xs sm:text-sm text-brand-muted leading-relaxed">
                We've registered your account for <strong className="text-brand-navy">{email}</strong>.
                If email confirmation is active on your cloud project, please click the confirmation link in your email. Otherwise, you can sign in directly!
              </p>
              <div className="pt-2">
                <Button
                  variant="primary"
                  size="md"
                  className="w-full font-bold"
                  onClick={() => navigate('/login')}
                  icon={ArrowRight}
                  iconPosition="right"
                >
                  Proceed to Sign In
                </Button>
              </div>
            </div>
          ) : (
            <>
              {error && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg flex items-start gap-2 animate-in fade-in">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleRegister} className="space-y-4">
            <Input
              label="Full Name"
              placeholder="e.g. Madhav Sharma"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              leftIcon={User}
              required
            />

            <Input
              label="Email Address"
              placeholder="name@example.com"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              leftIcon={Mail}
              required
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="Mobile Number (+91)"
                placeholder="9876543210"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                leftIcon={Phone}
                maxLength={10}
              />
              <Input
                label="Current City"
                placeholder="e.g. Bengaluru"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                leftIcon={MapPin}
              />
            </div>

            <Input
              label="Password (min. 6 characters)"
              placeholder="••••••••"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              leftIcon={Lock}
              rightIcon={showPassword ? EyeOff : Eye}
              onRightIconClick={() => setShowPassword(!showPassword)}
              required
            />

            <Input
              label="Confirm Password"
              placeholder="••••••••"
              type={showPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              leftIcon={Lock}
              required
            />

            <div className="flex items-start gap-2 pt-1 text-xs text-brand-muted">
              <input
                id="terms"
                type="checkbox"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-gray-300 text-brand-red focus:ring-brand-red"
              />
              <label htmlFor="terms">
                I agree to the{' '}
                <button
                  type="button"
                  onClick={() => setPolicyModal('terms')}
                  className="text-brand-red font-semibold hover:underline"
                >
                  Terms and Conditions
                </button>{' '}
                and{' '}
                <button
                  type="button"
                  onClick={() => setPolicyModal('privacy')}
                  className="text-brand-red font-semibold hover:underline"
                >
                  Privacy Policy
                </button>
              </label>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full font-bold uppercase tracking-wider text-xs shadow-md"
              isLoading={loading}
              icon={ArrowRight}
              iconPosition="right"
            >
              Complete Registration
            </Button>
          </form>

              <div className="pt-2 border-t border-gray-100 text-center">
                <p className="text-xs text-brand-muted">
                  Already have an account?{' '}
                  <Link to="/login" className="font-bold text-brand-red hover:underline">
                    Sign In
                  </Link>
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      <PolicyModal
        isOpen={Boolean(policyModal)}
        policyType={policyModal}
        onClose={() => setPolicyModal(null)}
      />
    </div>
  );
};

export default RegisterPage;
