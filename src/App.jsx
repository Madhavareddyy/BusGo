import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { HomePage } from './pages/HomePage';
import { SearchResultsPlaceholder } from './pages/SearchResultsPlaceholder';
import { ManageBookingModal } from './components/booking/ManageBookingModal';
import { HelpModal } from './components/common/HelpModal';
import { PolicyModal } from './components/common/PolicyModal';
import { LoginModal } from './components/common/LoginModal';

export default function App() {
  const [manageBookingOpen, setManageBookingOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
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
    <div className="min-h-screen flex flex-col bg-brand-bg text-brand-text font-sans antialiased selection:bg-brand-red selection:text-white">
      {/* Global Responsive Navigation Header */}
      <Navbar 
        onOpenManageBooking={() => setManageBookingOpen(true)}
        onOpenHelp={() => setHelpOpen(true)}
        onOpenLogin={() => setLoginOpen(true)}
      />

      {/* Application Routing Body */}
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/search" element={<SearchResultsPlaceholder />} />
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

      <LoginModal 
        isOpen={loginOpen}
        onClose={() => setLoginOpen(false)}
      />

      <PolicyModal 
        isOpen={Boolean(policyType)}
        policyType={policyType}
        onClose={() => setPolicyType(null)}
      />
    </div>
  );
}
