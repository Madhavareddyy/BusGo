import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  Bus, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  AlertCircle, 
  ShieldCheck, 
  Clock,
  Sparkles
} from 'lucide-react';
import { Logo } from '../../components/common/Logo';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

export const OperatorLoginPage = () => {
  const { login, isDemoMode } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const redirectPath = location.state?.from?.pathname || '/operator/dashboard';

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim()) {
      setError('Please enter your operator email address');
      return;
    }
    if (!password) {
      setError('Please enter your password');
      return;
    }

    setLoading(true);
    try {
      await login(email, password, 'operator');
      navigate(redirectPath, { replace: true });
    } catch (err) {
      setError(err.message || 'Operator login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoActive = () => {
    setEmail('operator@sunrisetravels.in');
    setPassword('Pass@123');
    setError('');
  };

  const handleDemoPending = () => {
    setEmail('operator@pending.in');
    setPassword('Pass@123');
    setError('');
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-3">
        <Logo size="lg" white />
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-xs font-semibold text-amber-300">
          <Bus className="w-3.5 h-3.5" />
          <span>Bus Fleet Partner Portal</span>
        </div>
        <h2 className="text-2xl font-black text-white tracking-tight">
          Operator Management Login
        </h2>
        <p className="text-xs text-gray-400">
          Sign in to manage schedules, fleet buses, pricing, and live passenger manifests
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white text-brand-text py-8 px-6 sm:px-10 rounded-card-lg border border-brand-border shadow-2xl space-y-6">
          {/* Demo Pills */}
          {isDemoMode && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl space-y-2">
              <span className="text-[10px] font-bold text-amber-900 uppercase tracking-wider flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                DEMO OPERATOR ACCOUNTS
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleDemoActive}
                  className="flex-1 py-1.5 px-2 bg-emerald-100 hover:bg-emerald-200 text-emerald-900 text-[10px] font-bold rounded text-center transition-colors"
                >
                  Approved: Sunrise Travels
                </button>
                <button
                  type="button"
                  onClick={handleDemoPending}
                  className="flex-1 py-1.5 px-2 bg-amber-100 hover:bg-amber-200 text-amber-900 text-[10px] font-bold rounded text-center transition-colors"
                >
                  Pending: CityLink
                </button>
              </div>
            </div>
          )}

          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg flex items-start gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <Input
              label="Operator Email"
              placeholder="e.g. partner@sunrisetravels.in"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              leftIcon={Mail}
              required
            />

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
              variant="secondary"
              size="lg"
              className="w-full font-bold uppercase tracking-wider text-xs shadow-md bg-brand-navy hover:bg-slate-800"
              isLoading={loading}
              icon={ArrowRight}
              iconPosition="right"
            >
              Sign In to Fleet Portal
            </Button>
          </form>

          <div className="pt-2 border-t border-gray-100 text-center space-y-3">
            <p className="text-xs text-brand-muted">
              Want to partner with BusGo?{' '}
              <Link to="/operator/register" className="font-bold text-brand-red hover:underline">
                Register New Bus Fleet
              </Link>
            </p>
            <div className="text-xs">
              <Link to="/login" className="text-gray-400 hover:text-brand-navy">
                ← Return to Passenger Sign In
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OperatorLoginPage;
