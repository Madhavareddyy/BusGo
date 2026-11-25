import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  AlertCircle, 
  CheckCircle2, 
  ShieldCheck, 
  Bus,
  Sparkles
} from 'lucide-react';
import { Logo } from '../../components/common/Logo';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { ForgotPasswordModal } from './ForgotPasswordModal';

export const LoginPage = () => {
  const { login, isDemoMode } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [forgotOpen, setForgotOpen] = useState(false);

  const redirectPath = location.state?.from?.pathname || '/profile';

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim()) {
      setError('Please enter your email address');
      return;
    }
    if (!password) {
      setError('Please enter your password');
      return;
    }

    setLoading(true);
    try {
      await login(email, password, 'customer');
      navigate(redirectPath, { replace: true });
    } catch (err) {
      setError(err.message || 'Failed to authenticate');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemoFill = () => {
    setEmail('customer@busgo.in');
    setPassword('Pass@123');
    setError('');
  };

  return (
    <div className="min-h-screen bg-brand-bg flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-3">
        <Logo size="lg" />
        <h2 className="text-2xl font-black text-brand-navy tracking-tight">
          Welcome Back to BusGo
        </h2>
        <p className="text-xs text-brand-muted">
          Sign in to access your booked tickets, seat preferences, and discounts
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white py-8 px-6 sm:px-10 rounded-card-lg border border-brand-border shadow-card space-y-6">
          {/* Quick Test / Demo Credentials */}
          <div className="p-3 bg-amber-50/80 border border-amber-200 rounded-xl space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-amber-900 uppercase tracking-wider flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                QUICK TEST CREDENTIALS
              </span>
              <button
                type="button"
                onClick={handleQuickDemoFill}
                className="text-[10px] font-black text-brand-red bg-white px-2 py-0.5 rounded border border-red-200 hover:bg-red-50 transition-colors shadow-xs"
              >
                Auto-Fill Demo
              </button>
            </div>
            <p className="text-[11px] text-amber-800">
              Instant test login: <strong className="font-mono text-brand-navy">customer@busgo.in</strong> / <strong className="font-mono text-brand-navy">Pass@123</strong>
            </p>
          </div>

          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg flex items-start gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <Input
              label="Email Address"
              placeholder="e.g. name@example.com"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              leftIcon={Mail}
              autoComplete="email"
              required
            />

            <div className="space-y-1">
              <Input
                label="Password"
                placeholder="••••••••"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                leftIcon={Lock}
                rightIcon={showPassword ? EyeOff : Eye}
                onRightIconClick={() => setShowPassword(!showPassword)}
                autoComplete="current-password"
                required
              />
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setForgotOpen(true)}
                  className="text-xs text-brand-red font-semibold hover:underline pt-1"
                >
                  Forgot your password?
                </button>
              </div>
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
              Sign In to Account
            </Button>
          </form>

          {/* Social or quick register divider */}
          <div className="pt-2 border-t border-gray-100 text-center space-y-4">
            <p className="text-xs text-brand-muted">
              Don't have an account yet?{' '}
              <Link to="/register" className="font-bold text-brand-red hover:underline">
                Create BusGo Account
              </Link>
            </p>

            <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-brand-muted">
              <Link to="/operator/login" className="hover:text-brand-navy hover:underline">
                Bus Operator Portal →
              </Link>
              <Link to="/admin/login" className="hover:text-brand-navy hover:underline text-gray-400">
                Admin Gate
              </Link>
            </div>
          </div>
        </div>
      </div>

      <ForgotPasswordModal
        isOpen={forgotOpen}
        onClose={() => setForgotOpen(false)}
      />
    </div>
  );
};

export default LoginPage;
