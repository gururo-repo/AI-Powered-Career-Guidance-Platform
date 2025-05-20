import React from 'react';
import { Link, useNavigate } from 'react-router-dom'; // or use 'next/link' if using Next.js
// import Image from 'next/image'; // If using Next.js, otherwise use a regular img tag
import banner from '../assets/banner.jpeg'

const Hero = () => {
  const imageRef = React.useRef(null); // Assuming you have a ref for the image
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate('/auth');
  };

  return (
    <section className="w-full pt-36 md:pt-42 pb-10">
      <div className="space-y-6 text-center">
        <div className="space-y-6 mx-auto">
          <h1 className="text-4xl font-bold md:text-5xl lg:text-6xl xl:text-7xl gradient-title animate-gradient-x">
            Land Dream Job & Bridge Skill Gaps with
            <br/>AI-Powered Assistance!
          </h1>
          <p className="mx-auto max-w-[800px] text-muted-foreground md:text-2xl text-cyan-50">
          Get AI-powered job matches, personalized skill-building, and real-time career insights.
          </p>
        </div>
        <div className="flex justify-center space-x-4">
          <button 
            onClick={handleGetStarted}
            className="inline-block px-12 py-4 text-white font-bold bg-cyan-600 hover:bg-cyan-700 rounded-full shadow-lg transition duration-200" 
          >
            Get Started
          </button>
        </div>
        <div className="hero-image-wrapper mt-5 md:mt-0">
          
            <img
              src={banner}
              width={1280}
              height={720}
              alt="Dashboard Preview"
              className="rounded-lg shadow-2xl border mx-auto"
            />
          
        </div>
      </div>
    </section>
  );
};

export default Hero;
 