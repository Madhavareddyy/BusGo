import React from 'react';
import { Navigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ShieldAlert, Clock, ArrowLeft, Bus, LogOut } from 'lucide-react';
import { Button } from '../ui/Button';

export const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, profile, role, isAuthenticated, isLoading, logout } = useAuth();
  const location = useLocation();

  // 1. Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-brand-bg flex items-center justify-center p-6">
        <div className="bg-white p-8 rounded-card border border-brand-border shadow-card text-center space-y-4 max-w-sm w-full">
          <div className="w-12 h-12 rounded-full border-4 border-brand-red border-t-transparent animate-spin mx-auto" />
          <div>
            <h3 className="text-base font-bold text-brand-navy">Verifying Session</h3>
            <p className="text-xs text-brand-muted mt-1">Authenticating credentials with server...</p>
          </div>
        </div>
      </div>
    );
  }

  // 2. Unauthenticated: Redirect to role-appropriate login portal
  if (!isAuthenticated || !user) {
    let targetLogin = '/login';
    if (allowedRoles.includes('admin')) {
      targetLogin = '/admin/login';
    } else if (allowedRoles.includes('operator')) {
      targetLogin = '/operator/login';
    }
    return <Navigate to={targetLogin} state={{ from: location }} replace />;
  }

  // 3. Operator Pending Approval Gate:
  // If an operator is logged in but has not been verified/approved by an admin
  if (role === 'operator' && profile?.status === 'pending_approval') {
    return (
      <div className="min-h-screen bg-brand-bg flex items-center justify-center p-4 sm:p-6">
        <div className="bg-white max-w-lg w-full rounded-card-lg border border-amber-200 shadow-xl p-6 sm:p-8 space-y-6 text-center">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 text-brand-warning flex items-center justify-center mx-auto border border-amber-200">
            <Clock className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-800 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
              Registration Under Review
            </span>
            <h2 className="text-2xl font-extrabold text-brand-navy">
              Operator Approval Pending
            </h2>
            <p className="text-xs sm:text-sm text-brand-muted leading-relaxed">
              Welcome, <strong className="text-brand-navy">{profile?.full_name}</strong>! Your application for{' '}
              <strong className="text-brand-navy">{profile?.company_name || 'your transport fleet'}</strong> has been registered successfully.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-gray-50 border border-brand-border text-left text-xs space-y-1.5 text-brand-text">
            <p><span className="font-semibold text-brand-navy">Registration No:</span> {profile?.registration_number || 'Under Verification'}</p>
            <p><span className="font-semibold text-brand-navy">Fleet Declared:</span> {profile?.fleet_size || 1} Buses</p>
            <p><span className="font-semibold text-brand-navy">Base City:</span> {profile?.city || 'India'}</p>
            <p><span className="font-semibold text-brand-navy">Status:</span> <span className="text-amber-700 font-bold uppercase">Pending Admin Approval</span></p>
          </div>

          <p className="text-xs text-brand-muted">
            For security and compliance reasons, bus operators can only publish routes and manage passenger manifests once an administrator approves their permit.
          </p>

          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              size="md"
              className="flex-1"
              icon={LogOut}
              onClick={logout}
            >
              Sign Out
            </Button>
            <Link to="/" className="flex-1">
              <Button variant="primary" size="md" className="w-full">
                Return to Home
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // 4. Role Authorization: Mismatch between user role and allowedRoles
  if (allowedRoles.length > 0 && !allowedRoles.includes(role)) {
    return (
      <div className="min-h-screen bg-brand-bg flex items-center justify-center p-4 sm:p-6">
        <div className="bg-white max-w-md w-full rounded-card-lg border border-rose-200 shadow-xl p-6 sm:p-8 space-y-6 text-center">
          <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto border border-rose-200">
            <ShieldAlert className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-800 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-200">
              403 Forbidden
            </span>
            <h2 className="text-2xl font-extrabold text-brand-navy">
              Unauthorized Access
            </h2>
            <p className="text-xs sm:text-sm text-brand-muted leading-relaxed">
              Your account is registered as a <strong className="text-brand-navy capitalize">{role}</strong>. You do not have permission to view this restricted portal.
            </p>
          </div>

          <div className="flex flex-col gap-2 pt-2">
            <Link to="/" className="w-full">
              <Button variant="primary" size="md" className="w-full" icon={ArrowLeft}>
                Return to Homepage
              </Button>
            </Link>
            <Button variant="ghost" size="sm" onClick={logout}>
              Sign out and switch accounts
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // 5. Authorized
  return children;
};

export default ProtectedRoute;
