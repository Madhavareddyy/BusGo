import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { HomePage } from './pages/HomePage';
import { SearchResultsPlaceholder } from './pages/SearchResultsPlaceholder';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { OperatorLoginPage } from './pages/auth/OperatorLoginPage';
import { OperatorRegisterPage } from './pages/auth/OperatorRegisterPage';
import { AdminLoginPage } from './pages/auth/AdminLoginPage';
import { ProfilePage } from './pages/customer/ProfilePage';
import { OperatorDashboardPreview } from './pages/operator/OperatorDashboardPreview';
import { AdminDashboardPreview } from './pages/admin/AdminDashboardPreview';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { ManageBookingModal } from './components/booking/ManageBookingModal';
import { HelpModal } from './components/common/HelpModal';
import { PolicyModal } from './components/common/PolicyModal';

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
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/search" element={<SearchResultsPlaceholder />} />
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
                <ProtectedRoute allowedRoles={['operator']}>
                  <OperatorDashboardPreview />
                </ProtectedRoute>
              } 
            />

            {/* Protected Admin Routes */}
            <Route 
              path="/admin/dashboard" 
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminDashboardPreview />
                </ProtectedRoute>
              } 
            />
          </Routes>
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
