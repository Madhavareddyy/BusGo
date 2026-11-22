import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  Bus, 
  Building2, 
  FileText, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Lock, 
  Eye, 
  EyeOff, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  ArrowRight 
} from 'lucide-react';
import { Logo } from '../../components/common/Logo';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

export const OperatorRegisterPage = () => {
  const { registerOperator } = useAuth();
  const navigate = useNavigate();

  const [companyName, setCompanyName] = useState('');
  const [fleetSize, setFleetSize] = useState('10');
  const [registrationNumber, setRegistrationNumber] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!companyName.trim()) {
      setError('Please provide your transport agency / company name');
      return;
    }
    if (!registrationNumber.trim()) {
      setError('Please provide transport license / permit number');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setError('Please provide a valid company email address');
      return;
    }
    if (!phone || !/^[6-9]\d{9}$/.test(phone.trim())) {
      setError('Please provide a valid 10-digit Indian mobile number');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      await registerOperator({
        companyName,
        fleetSize,
        registrationNumber,
        fullName,
        email,
        phone,
        city,
        password,
      });
      setSubmitted(true);
    } catch (err) {
      setError(err.message || 'Operator registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-lg text-center space-y-3">
        <Logo size="lg" white />
        <h2 className="text-2xl font-black text-white tracking-tight">
          Partner With BusGo Fleet Network
        </h2>
        <p className="text-xs text-gray-400">
          Register your bus agency to list buses, schedules, and sell tickets to thousands of daily passengers
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-lg px-4">
        <div className="bg-white text-brand-text py-8 px-6 sm:px-10 rounded-card-lg border border-brand-border shadow-2xl space-y-6">
          {submitted ? (
            <div className="text-center space-y-4 py-4 animate-in zoom-in-95">
              <div className="w-16 h-16 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto border border-amber-200">
                <Clock className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-brand-navy">
                Application Submitted for Audit
              </h3>
              <p className="text-xs sm:text-sm text-brand-muted leading-relaxed">
                Thank you for applying to join BusGo! Your fleet account for <strong className="text-brand-navy">{companyName}</strong> has been created with status <span className="text-amber-700 font-bold">PENDING APPROVAL</span>.
              </p>
              <div className="p-3.5 bg-gray-50 border border-brand-border rounded-xl text-xs text-left space-y-1">
                <p><span className="text-brand-muted">Registered Email:</span> <strong className="text-brand-navy">{email}</strong></p>
                <p><span className="text-brand-muted">Permit License:</span> <strong className="text-brand-navy">{registrationNumber}</strong></p>
                <p><span className="text-brand-muted">Fleet Size:</span> <strong className="text-brand-navy">{fleetSize} Buses</strong></p>
              </div>
              <p className="text-xs text-brand-muted">
                Our operations team reviews compliance permits within 24 hours. Once approved, you can log in to manage your routes.
              </p>
              <div className="pt-2 flex gap-2">
                <Link to="/operator/login" className="w-full">
                  <Button variant="primary" size="md" className="w-full">
                    Go to Operator Login
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <>
              {/* Approval Notice */}
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2.5 text-xs text-amber-900">
                <Clock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">Controlled Account Gate:</span> All new operator applications require verification by a BusGo administrator before operational route publishing is granted.
                </div>
              </div>

              {error && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg flex items-start gap-2 animate-in fade-in">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  label="Travel Agency / Company Name"
                  placeholder="e.g. Royal Travels Pvt Ltd"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  leftIcon={Building2}
                  required
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Input
                    label="Transport License / GST No."
                    placeholder="e.g. KA-01-2024-TR-8812"
                    value={registrationNumber}
                    onChange={(e) => setRegistrationNumber(e.target.value)}
                    leftIcon={FileText}
                    required
                  />
                  <Input
                    label="Total Fleet Size"
                    type="number"
                    min="1"
                    value={fleetSize}
                    onChange={(e) => setFleetSize(e.target.value)}
                    leftIcon={Bus}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Input
                    label="Authorized Contact Person"
                    placeholder="e.g. Rajesh Varma"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    leftIcon={User}
                    required
                  />
                  <Input
                    label="Headquarter City"
                    placeholder="e.g. Bengaluru"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    leftIcon={MapPin}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Input
                    label="Official Email Address"
                    placeholder="partner@company.com"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    leftIcon={Mail}
                    required
                  />
                  <Input
                    label="Contact Phone (+91)"
                    placeholder="9876543210"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    leftIcon={Phone}
                    maxLength={10}
                    required
                  />
                </div>

                <Input
                  label="Account Password (min. 6 characters)"
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
                  variant="secondary"
                  size="lg"
                  className="w-full font-bold uppercase tracking-wider text-xs shadow-md bg-brand-navy hover:bg-slate-800"
                  isLoading={loading}
                  icon={ArrowRight}
                  iconPosition="right"
                >
                  Submit Fleet Registration
                </Button>
              </form>

              <div className="pt-2 border-t border-gray-100 text-center">
                <p className="text-xs text-brand-muted">
                  Already registered your fleet?{' '}
                  <Link to="/operator/login" className="font-bold text-brand-navy hover:underline">
                    Sign In to Portal
                  </Link>
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default OperatorRegisterPage;
