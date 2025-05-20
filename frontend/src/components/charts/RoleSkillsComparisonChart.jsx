import React from 'react';
import PropTypes from 'prop-types';
import { FaCheck, FaExchangeAlt, FaArrowRight } from 'react-icons/fa';

const RoleSkillsComparisonChart = ({ data, userSkills = [] }) => {
  // If no data, show placeholder
  if (!data || !data.currentRole || !data.targetRole) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-cyan-50/70">No role comparison data available</p>
      </div>
    );
  }

  const formatCurrency = (amount) => {
    // Always use USD with US locale
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Create a set of user skills for quick lookup (case insensitive)
  const userSkillsSet = new Set(userSkills.map(skill => skill.toLowerCase()));

  // Function to check if user has a skill
  const hasSkill = (skill) => {
    return userSkillsSet.has(skill.toLowerCase());
  };

  // Function to get CSS class based on outlook
  const getOutlookClass = (outlook) => {
    switch (outlook?.toLowerCase()) {
      case 'positive':
        return 'bg-green-900/50 text-green-400';
      case 'neutral':
        return 'bg-blue-900/50 text-blue-400';
      case 'negative':
        return 'bg-red-900/50 text-red-400';
      default:
        return 'bg-zinc-800 text-zinc-400';
    }
  };

  // Function to get CSS class based on demand level
  const getDemandLevelClass = (level) => {
    switch (level?.toLowerCase()) {
      case 'high':
        return 'bg-green-900/50 text-green-400';
      case 'medium':
        return 'bg-yellow-900/50 text-yellow-400';
      case 'low':
        return 'bg-red-900/50 text-red-400';
      default:
        return 'bg-zinc-800 text-zinc-400';
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full overflow-y-auto">
      {/* Current Role */}
      <div className="bg-gradient-to-br from-zinc-800/70 to-zinc-900/90 p-4 rounded-lg border border-zinc-700 shadow-md">
        <h3 className="text-lg font-medium text-cyan-50 mb-3">{data.currentRole.title}</h3>

        <div className="flex flex-wrap gap-2 mb-3">
          <span className={`text-xs px-2 py-1 rounded-full ${getOutlookClass(data.currentRole.growthOutlook)}`}>
            {data.currentRole.growthOutlook} Growth
          </span>
          <span className={`text-xs px-2 py-1 rounded-full ${getDemandLevelClass(data.currentRole.demandLevel)}`}>
            {data.currentRole.demandLevel} Demand
          </span>
        </div>

        <div className="text-cyan-300 font-medium text-sm bg-cyan-900/30 py-1 px-3 rounded-full mb-4 inline-block">
          Avg: {formatCurrency(data.currentRole.avgSalary)}
        </div>

        <h4 className="text-sm font-medium text-cyan-50 mb-2">Required Skills:</h4>
        <ul className="space-y-2 mb-4">
          {data.currentRole.requiredSkills && data.currentRole.requiredSkills.length > 0 ? (
            data.currentRole.requiredSkills.map((skill, index) => (
              <li
                key={`current-skill-${index}`}
                className={`flex items-center text-sm p-2 rounded ${hasSkill(skill) ? 'bg-green-900/20 text-green-400' : 'bg-zinc-800/50 text-zinc-300'}`}
              >
                <FaCheck className="mr-2 text-green-400" />
                {skill}
              </li>
            ))
          ) : (
            <li className="text-zinc-400 text-sm">No skill data available</li>
          )}
        </ul>
      </div>

      {/* Skills Transition */}
      <div className="bg-gradient-to-br from-zinc-800/70 to-zinc-900/90 p-4 rounded-lg border border-zinc-700 shadow-md">
        <h3 className="text-lg font-medium text-cyan-50 mb-3 flex items-center justify-center">
          <FaExchangeAlt className="mr-2 text-cyan-400" /> Skills Transition
        </h3>

        <div className="mb-6">
          <h4 className="text-sm font-medium text-cyan-50 mb-2 flex items-center">
            <FaCheck className="mr-2 text-green-400" /> Transferable Skills:
          </h4>
          <ul className="space-y-2">
            {data.transferableSkills && data.transferableSkills.length > 0 ? (
              data.transferableSkills.map((skill, index) => (
                <li
                  key={`transferable-skill-${index}`}
                  className={`flex items-center text-sm p-2 rounded bg-green-900/20 text-green-400`}
                >
                  <FaCheck className="mr-2" />
                  {skill}
                </li>
              ))
            ) : (
              <li className="text-zinc-400 text-sm">No transferable skills data available</li>
            )}
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-medium text-cyan-50 mb-2 flex items-center">
            <FaArrowRight className="mr-2 text-yellow-400" /> Skills to Acquire:
          </h4>
          <ul className="space-y-2">
            {data.skillGaps && data.skillGaps.length > 0 ? (
              data.skillGaps.map((skill, index) => (
                <li
                  key={`skill-gap-${index}`}
                  className={`flex items-center text-sm p-2 rounded bg-yellow-900/20 text-yellow-400`}
                >
                  <FaArrowRight className="mr-2" />
                  {skill}
                </li>
              ))
            ) : (
              <li className="text-zinc-400 text-sm">No skill gaps data available</li>
            )}
          </ul>
        </div>
      </div>

      {/* Target Role */}
      <div className="bg-gradient-to-br from-zinc-800/70 to-zinc-900/90 p-4 rounded-lg border border-zinc-700 shadow-md">
        <h3 className="text-lg font-medium text-cyan-50 mb-3">{data.targetRole.title}</h3>

        <div className="flex flex-wrap gap-2 mb-3">
          <span className={`text-xs px-2 py-1 rounded-full ${getOutlookClass(data.targetRole.growthOutlook)}`}>
            {data.targetRole.growthOutlook} Growth
          </span>
          <span className={`text-xs px-2 py-1 rounded-full ${getDemandLevelClass(data.targetRole.demandLevel)}`}>
            {data.targetRole.demandLevel} Demand
          </span>
        </div>

        <div className="text-cyan-300 font-medium text-sm bg-cyan-900/30 py-1 px-3 rounded-full mb-4 inline-block">
          Avg: {formatCurrency(data.targetRole.avgSalary)}
        </div>

        <h4 className="text-sm font-medium text-cyan-50 mb-2">Required Skills:</h4>
        <ul className="space-y-2 mb-4">
          {data.targetRole.requiredSkills && data.targetRole.requiredSkills.length > 0 ? (
            data.targetRole.requiredSkills.map((skill, index) => (
              <li
                key={`target-skill-${index}`}
                className={`flex items-center text-sm p-2 rounded ${hasSkill(skill) ? 'bg-green-900/20 text-green-400' : 'bg-zinc-800/50 text-zinc-300'}`}
              >
                <FaCheck className="mr-2 text-green-400" />
                {skill}
              </li>
            ))
          ) : (
            <li className="text-zinc-400 text-sm">No skill data available</li>
          )}
        </ul>
      </div>
    </div>
  );
};

RoleSkillsComparisonChart.propTypes = {
  data: PropTypes.shape({
    currentRole: PropTypes.shape({
      title: PropTypes.string.isRequired,
      requiredSkills: PropTypes.arrayOf(PropTypes.string),
      avgSalary: PropTypes.number,
      growthOutlook: PropTypes.string,
      demandLevel: PropTypes.string
    }),
    targetRole: PropTypes.shape({
      title: PropTypes.string.isRequired,
      requiredSkills: PropTypes.arrayOf(PropTypes.string),
      avgSalary: PropTypes.number,
      growthOutlook: PropTypes.string,
      demandLevel: PropTypes.string
    }),
    skillGaps: PropTypes.arrayOf(PropTypes.string),
    transferableSkills: PropTypes.arrayOf(PropTypes.string)
  }),
  userSkills: PropTypes.arrayOf(PropTypes.string)
};

export default RoleSkillsComparisonChart;
