import React from "react";
import { CheckCircle } from "lucide-react";
import { number } from "zod";

const steps = [
  {
    number: "1",
    title: "Sign Up & Set Up Your Profile",
    description:
      "Create an account, fill in your details, and let our AI get to know you.",
  },
  {
    number: "2",
    title: "Take the Smart Competency Test",
    description:
      "Answer a few fun questions and get your competency score.",
  },
  {
    number: "3",
    title: "Discover Your Skill Gaps",
    description:
      "Identify missing skills and get course recommendations.",
  },
  {
    number: "4",
    title: "Get AI-Powered Job & Training Recommendations",
    description:
      "Find the best jobs and courses tailored to your profile.",
  },
  {
    number: "5",
    title: "Build Your Resume in Seconds",
    description:
      "Create a professional, ATS-optimized resume effortlessly.",
  },
  {
    number: "6",
    title: "Unlock Your Complete Career Toolkit",
    description:
      "Access your personalized competency scores, discover skill gaps, get AI-powered job recommendations, and build a top-tier resume — all in one place.",
  },
  {
    number: "7",
    title: "Stay Ahead with Real-Time Job Market Insights",
    description:
      "Explore trending skills and in-demand jobs.",
  },
  {
    number: "8",
    title: "Apply & Start Your Career Journey!",
    description:
      "Click, apply, and land the job! With everything in one place, getting hired has never been this easy!",
  },
];

const HowItWorksSection = () => {
  return (
    <section className="py-16 bg-black">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4 text-cyan-100">How It Works</h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto text-cyan-50">
            Our simple process to help you land your dream job
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
          {steps.slice(0, 4).map((step) => (
            <div
              key={step.number}
              className="border p-6 rounded-xl shadow-lg flex flex-col items-center text-center hover:shadow-cyan-400 hover:border-cyan-400 transition-all duration-300"
            >
              <div className="w-12 h-12 rounded-full bg-cyan-500 flex items-center justify-center mb-4">
                <span className="text-white font-bold">{step.number}</span>
              </div>
              <h3 className="text-xl font-bold mb-2 text-cyan-100">{step.title}</h3>
              <p className="text-muted-foreground text-cyan-50">{step.description}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto mt-8">
          {steps.slice(4).map((step) => (
            <div
              key={step.number}
              className="border p-6 rounded-xl shadow-lg flex flex-col items-center text-center hover:shadow-cyan-400 hover:border-cyan-400 transition-all duration-300"
            >
              <div className="w-12 h-12 rounded-full bg-cyan-500 flex items-center justify-center mb-4">
                <span className="text-white font-bold">{step.number}</span>
              </div>
              <h3 className="text-xl font-bold mb-2 text-cyan-100">{step.title}</h3>
              <p className="text-muted-foreground text-cyan-50">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
