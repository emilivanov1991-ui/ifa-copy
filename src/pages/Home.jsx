import React from 'react';
import HeroSection from '../components/home/HeroSection';
import TrustLogos from '../components/home/TrustLogos';
import ServicesSection from '../components/home/ServicesSection';
import MissionSection from '../components/home/MissionSection';
import ProcessSteps from '../components/home/ProcessSteps';
import TestimonialsSection from '../components/home/TestimonialsSection';
import InvestmentCTA from '../components/home/InvestmentCTA';
import UsefulInfoSection from '../components/home/UsefulInfoSection';

export default function Home() {
  return (
    <div>
      <HeroSection />
      <TrustLogos />
      <ServicesSection />
      <MissionSection />
      <ProcessSteps />
      <TestimonialsSection />
      <InvestmentCTA />
      <UsefulInfoSection />
    </div>
  );
}