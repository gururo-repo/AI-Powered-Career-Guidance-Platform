import React from 'react';

const stats = [
  {
    value: "10K+",
    title: "Active Users",
    description: "Professionals using our platform"
  },
  {
    value: "85%",
    title: "Success Rate",
    description: "Users finding better opportunities"
  },
  {
    value: "5K+",
    title: "Job Matches",
    description: "Successful job placements"
  },
  {
    value: "24/7",
    title: "AI Support",
    description: "Always available to help"
  }
];

const StatsSection = () => {
  return (
    <section className="bg-muted/20 text-cyan-100 py-16">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-3xl font-bold mb-8">🚀 Power in Numbers!</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <div key={index} className="shadow-lg p-8 rounded-xl transform hover:scale-105 transition-transform hover:shadow-2xl bg-black hover:shadow-cyan-400 ">
              <h3 className="text-4xl font-bold text-cyan-100">{stat.value}</h3>
              <p className="text-lg font-semibold mt-2">{stat.title}</p>
              <p className="text-muted-foreground mt-1">{stat.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
