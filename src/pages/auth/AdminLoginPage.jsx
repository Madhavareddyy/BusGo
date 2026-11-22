import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  ShieldAlert, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  AlertCircle, 
  ShieldCheck, 
  Server,
  Sparkles
} from 'lucide-react';
import { Logo } from '../../components/common/Logo';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

export const AdminLoginPage = () => {
  const { login, isDemoMode } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const redirectPath = location.state?.from?.pathname || '/admin/dashboard';

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password) {
      setError('Please provide administrative credentials');
      return;
    }

    setLoading(true);
    try {
      await login(email, password, 'admin');
      navigate(redirectPath, { replace: true });
    } catch (err) {
      setError(err.message || 'Access Denied: Administrative verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemoFill = () => {
    setEmail('admin@busgo.in');
    setPassword('Admin@123');
    setError('');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-3">
        <Logo size="lg" white />
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-xs font-semibold text-rose-400">
          <ShieldAlert className="w-3.5 h-3.5" />
          <span>Restricted Access: System Operations Only</span>
        </div>
        <h2 className="text-2xl font-black text-white tracking-tight">
          BusGo Administrator Console
        </h2>
        <p className="text-xs text-gray-400">
          Central management for users, operator audits, city routes, and simulated financials
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-slate-900 text-white py-8 px-6 sm:px-10 rounded-card-lg border border-slate-800 shadow-2xl space-y-6">
          {/* Security Rule Callout */}
          <div className="p-3 bg-slate-800/80 border border-slate-700 rounded-xl space-y-1.5 text-xs text-gray-300">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1">
                <Server className="w-3.5 h-3.5" />
                SECURITY AUDIT ENFORCED
              </span>
              {isDemoMode && (
                <button
                  type="button"
                  onClick={handleQuickDemoFill}
                  className="text-[10px] font-black text-amber-300 bg-white/10 px-2 py-0.5 rounded border border-white/20 hover:bg-white/20 transition-colors"
                >
                  Auto-Fill Admin
                </button>
              )}
            </div>
            <p className="text-[11px] text-gray-400 leading-relaxed">
              Admin credentials cannot be registered publicly. See <code className="text-rose-400 font-mono">SETUP_ADMIN.md</code> for elevation instructions.
            </p>
          </div>

          {error && (
            <div className="p-3 bg-rose-950/60 border border-rose-800 text-rose-300 text-xs rounded-lg flex items-start gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-1">
                Admin Identifier / Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@busgo.in"
                required
                className="w-full text-xs rounded-lg border border-slate-700 bg-slate-950 p-2.5 focus:outline-none focus:border-brand-red focus:ring-1 focus:ring-brand-red text-white placeholder-gray-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-1">
                Secure Master Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full text-xs rounded-lg border border-slate-700 bg-slate-950 p-2.5 pr-10 focus:outline-none focus:border-brand-red focus:ring-1 focus:ring-brand-red text-white placeholder-gray-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              variant="danger"
              size="lg"
              className="w-full font-bold uppercase tracking-wider text-xs shadow-md bg-rose-600 hover:bg-rose-700"
              isLoading={loading}
              icon={ArrowRight}
              iconPosition="right"
            >
              Authorize & Enter Console
            </Button>
          </form>

          <div className="pt-2 border-t border-slate-800 text-center">
            <Link to="/login" className="text-xs text-gray-500 hover:text-gray-300">
              ← Return to Passenger Portal
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLoginPage;
