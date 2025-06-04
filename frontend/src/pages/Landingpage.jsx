import React from 'react';
import { ChevronRight, Award, Book, LineChart, FileText, BriefcaseIcon, Trophy } from 'lucide-react';
import Hero from '../components/Hero';
import Features from '../components/Features';
import HowItWorksSection from '../components/Howitworks';
import StatsSection from '../components/StatsSection';
// import Footer from '../components/Footer';
import IndustryInsightsPage from './IndustryInsightsPage';

const LandingPage = () => {


  const steps = [
    {
      number: "1",
      title: "Take a quick competency test",
      description: "Complete a comprehensive skills assessment"
    },
    {
      number: "2",
      title: "AI analyzes your skills",
      description: "Get detailed insights about your capabilities vs market needs"
    },
    {
      number: "3",
      title: "Get recommendations",
      description: "Receive personalized job and course suggestions"
    },
    {
      number: "4",
      title: "Track progress & apply",
      description: "Monitor your growth and apply to matching positions"
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <Hero/>
      

      {/* Features Section */}
      <Features/>

      {/* How It Works Section */}
      <HowItWorksSection/>

      {/* Stats Section */}
      <StatsSection/>

      {/* Footer */}
      {/* <Footer/> */}
    </div>
  );
};

export default LandingPage;