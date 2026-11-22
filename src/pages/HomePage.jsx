import React from 'react';
import { HeroSearch } from '../components/home/HeroSearch';
import { OffersSection } from '../components/home/OffersSection';
import { PopularRoutes } from '../components/home/PopularRoutes';
import { PopularOperators } from '../components/home/PopularOperators';
import { WhyChooseUs } from '../components/home/WhyChooseUs';
import { Testimonials } from '../components/home/Testimonials';
import { FaqSection } from '../components/home/FaqSection';

export const HomePage = ({ onSelectRoute }) => {
  return (
    <div className="min-h-screen bg-brand-bg">
      {/* 1. Hero Search Section with interactive From, To, Swap, Date */}
      <HeroSearch />

      {/* 2. Promotional Offers & Coupon Codes */}
      <OffersSection />

      {/* 3. High-Frequency Popular Indian Routes */}
      <PopularRoutes onSelectRoute={onSelectRoute} />

      {/* 4. Top Rated Bus Operators */}
      <PopularOperators />

      {/* 5. Why Choose BusGo Value Proposition */}
      <WhyChooseUs />

      {/* 6. Passenger Testimonials & Verified Reviews */}
      <Testimonials />

      {/* 7. Frequently Asked Questions (Accordion) */}
      <FaqSection />
    </div>
  );
};

export default HomePage;
