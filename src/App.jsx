import React, { useState, Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { HomePage } from './pages/HomePage';
import { SearchResultsPage } from './pages/SearchResultsPage';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { ManageBookingModal } from './components/booking/ManageBookingModal';
import { HelpModal } from './components/common/HelpModal';
import { PolicyModal } from './components/common/PolicyModal';

// Code-split heavy routes with lazy loading for optimal bundle size
const OperatorLoginPage = lazy(() => import('./pages/auth/OperatorLoginPage'));
const OperatorRegisterPage = lazy(() => import('./pages/auth/OperatorRegisterPage'));
const AdminLoginPage = lazy(() => import('./pages/auth/AdminLoginPage'));
const ProfilePage = lazy(() => import('./pages/customer/ProfilePage'));
const OperatorDashboardPage = lazy(() => import('./pages/operator/OperatorDashboardPage'));
const AdminDashboardPage = lazy(() => import('./pages/admin/AdminDashboardPage'));
const BookingConfirmationPage = lazy(() => import('./pages/booking/BookingConfirmationPage'));

const PageLoadingSpinner = () => (
  <div className="min-h-[60vh] bg-brand-bg flex items-center justify-center p-6">
    <div className="text-center space-y-3">
      <div className="w-10 h-10 rounded-full border-4 border-brand-red border-t-transparent animate-spin mx-auto" />
      <p className="text-xs font-bold text-brand-muted">Loading page...</p>
    </div>
  </div>
);

export default function App() {
  const [manageBookingOpen, setManageBookingOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [policyType, setPolicyType] = useState(null);

  const handleOpenPolicy = (type) => {
    setPolicyType(type);
  };

  const handleOpenFaq = () => {
    const el = document.querySelector('section#offers-section + section + section + section + section + section + section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    } else {
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    }
  };

  return (
    <AuthProvider>
      <div className="min-h-screen flex flex-col bg-brand-bg text-brand-text font-sans antialiased selection:bg-brand-red selection:text-white">
        {/* Global Responsive Navigation Header */}
        <Navbar 
          onOpenManageBooking={() => setManageBookingOpen(true)}
          onOpenHelp={() => setHelpOpen(true)}
        />

        {/* Application Routing Body */}
        <main className="flex-1">
          <Suspense fallback={<PageLoadingSpinner />}>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<HomePage />} />
              <Route path="/search" element={<SearchResultsPage />} />
              <Route path="/booking/confirmation" element={<BookingConfirmationPage />} />
              <Route path="/bookings" element={<ProfilePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/operator/login" element={<OperatorLoginPage />} />
              <Route path="/operator/register" element={<OperatorRegisterPage />} />
              <Route path="/admin/login" element={<AdminLoginPage />} />

              {/* Protected Customer Routes */}
              <Route 
                path="/profile" 
                element={
                  <ProtectedRoute allowedRoles={['customer', 'operator', 'admin']}>
                    <ProfilePage />
                  </ProtectedRoute>
                } 
              />

              {/* Protected Operator Routes */}
              <Route 
                path="/operator/dashboard" 
                element={
                  <ProtectedRoute allowedRoles={['operator', 'admin']}>
                    <OperatorDashboardPage />
                  </ProtectedRoute>
                } 
              />

              {/* Protected Admin Routes */}
              <Route 
                path="/admin/dashboard" 
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminDashboardPage />
                  </ProtectedRoute>
                } 
              />
            </Routes>
          </Suspense>
        </main>

        {/* Global Comprehensive Footer */}
        <Footer 
          onOpenFaq={handleOpenFaq}
          onOpenPolicy={handleOpenPolicy}
        />

        {/* Interactive Modals */}
        <ManageBookingModal 
          isOpen={manageBookingOpen}
          onClose={() => setManageBookingOpen(false)}
        />

        <HelpModal 
          isOpen={helpOpen}
          onClose={() => setHelpOpen(false)}
        />

        <PolicyModal 
          isOpen={Boolean(policyType)}
          policyType={policyType}
          onClose={() => setPolicyType(null)}
        />
      </div>
    </AuthProvider>
  );
}
