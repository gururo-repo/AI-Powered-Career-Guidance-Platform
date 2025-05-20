import React from 'react';

const SkillsVsMarketChart = ({ userSkills = [], marketDemand = [] }) => {
  // If no data, show placeholder
  if (!marketDemand || marketDemand.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-cyan-50/70">No market demand data available</p>
      </div>
    );
  }

  // Create a set of user skills for quick lookup
  const userSkillsSet = new Set(userSkills.map(skill => skill.toLowerCase()));
  
  // Sort market demand by demand score (highest first)
  const sortedDemand = [...marketDemand].sort((a, b) => b.demandScore - a.demandScore);
  
  // Take top 8 skills
  const topSkills = sortedDemand.slice(0, 8);

  return (
    <div className="h-full">
      {topSkills.map((skill, index) => {
        const hasSkill = userSkillsSet.has(skill.skill.toLowerCase());
        return (
          <div key={index} className="mb-4">
            <div className="flex justify-between mb-1">
              <span className="text-cyan-50">{skill.skill}</span>
              <span className="text-cyan-50">{skill.demandScore}%</span>
            </div>
            <div className="w-full bg-zinc-800 rounded-full h-2.5">
              <div 
                className={`h-2.5 rounded-full ${hasSkill ? 'bg-green-500' : 'bg-cyan-500'}`}
                style={{ width: `${skill.demandScore}%` }}
              ></div>
            </div>
            {hasSkill && (
              <div className="text-xs text-green-400 mt-1">You have this skill</div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default SkillsVsMarketChart;