import React from 'react';
import PropTypes from 'prop-types';

const SalaryRangesChart = ({ data = [], userSalaryExpectation }) => {
  // If no data, show placeholder
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-cyan-50/70">No salary data available</p>
      </div>
    );
  }

  // We no longer need to determine currency as we always use USD

  // Format currency - always use USD
  const formatCurrency = (amount) => {
    // Always use USD with US locale
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Parse user salary expectation if provided
  const parsedUserSalary = userSalaryExpectation ? parseInt(userSalaryExpectation.replace(/\D/g, '')) : 0;

  // Handle different possible property names in data
  const normalizedData = data.map(range => ({
    role: range.role || range.name || range.title || "Unknown",
    minSalary: range.minSalary || range.minimum || range.min || 0,
    medianSalary: range.medianSalary || range.median || range.avg || (range.minSalary + range.maxSalary) / 2 || 0,
    maxSalary: range.maxSalary || range.maximum || range.max || 0,
    location: range.location || "Global"
  }));

  return (
    <div className="h-full overflow-y-auto">
      {normalizedData.map((range, index) => (
        <div key={`salary-range-${range.role}-${index}`} className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-cyan-50 font-medium">{range.role}</h3>
            {range.location && range.location !== "Global" && (
              <span className="text-xs bg-cyan-900/30 text-cyan-300 px-2 py-1 rounded-full">
                {range.location}
              </span>
            )}
          </div>

          <div className="relative pt-1">
            <div className="flex mb-2 items-center justify-between">
              <div>
                <span className="text-xs text-cyan-50/70">Min</span>
                <span className="text-xs font-semibold inline-block text-cyan-50 ml-1">
                  {formatCurrency(range.minSalary)}
                </span>
              </div>
              <div>
                <span className="text-xs text-cyan-50/70">Median</span>
                <span className="text-xs font-semibold inline-block text-cyan-50 ml-1">
                  {formatCurrency(range.medianSalary)}
                </span>
              </div>
              <div>
                <span className="text-xs text-cyan-50/70">Max</span>
                <span className="text-xs font-semibold inline-block text-cyan-50 ml-1">
                  {formatCurrency(range.maxSalary)}
                </span>
              </div>
            </div>

            <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-zinc-800">
              <div style={{ width: '100%' }} className="relative">
                {/* Min to Max range */}
                <div
                  style={{
                    width: '100%',
                    background: 'linear-gradient(90deg, rgba(0,255,255,0.2) 0%, rgba(0,255,255,0.8) 100%)'
                  }}
                  className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center h-2 rounded-full"
                ></div>

                {/* Median marker */}
                <div
                  style={{
                    left: `${((range.medianSalary - range.minSalary) / (range.maxSalary - range.minSalary)) * 100}%`,
                    transform: 'translateX(-50%)'
                  }}
                  className="absolute top-0 w-1 h-2 bg-white rounded-full"
                ></div>

                {/* User's salary expectation marker */}
                {userSalaryExpectation && (
                  <div
                    style={{
                      left: `${Math.min(Math.max(((parsedUserSalary - range.minSalary) / (range.maxSalary - range.minSalary)) * 100, 0), 100)}%`,
                      transform: 'translateX(-50%)'
                    }}
                    className="absolute top-0 w-1 h-4 bg-yellow-400 rounded-full"
                    title={`Your salary expectation: ${formatCurrency(parsedUserSalary)}`}
                  ></div>
                )}
              </div>
            </div>

            {/* Salary expectation difference */}
            {userSalaryExpectation && (
              <div className="mt-2 text-xs">
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-yellow-400 rounded-full mr-1"></div>
                    <span className="text-yellow-400 font-medium">Your Expectation:</span>
                    <span className="text-cyan-50 ml-1">{formatCurrency(parsedUserSalary)}</span>
                  </div>

                  {parsedUserSalary > range.maxSalary && (
                    <span className="text-red-400 font-medium bg-red-900/20 py-1 px-2 rounded-full">
                      {formatCurrency(parsedUserSalary - range.maxSalary)} above market max
                    </span>
                  )}

                  {parsedUserSalary < range.minSalary && (
                    <span className="text-red-400 font-medium bg-red-900/20 py-1 px-2 rounded-full">
                      {formatCurrency(range.minSalary - parsedUserSalary)} below market min
                    </span>
                  )}

                  {parsedUserSalary >= range.minSalary &&
                   parsedUserSalary <= range.maxSalary && (
                    <span className="text-green-400 font-medium bg-green-900/20 py-1 px-2 rounded-full">
                      Within market range
                      {parsedUserSalary < range.medianSalary && (
                        <span> ({formatCurrency(range.medianSalary - parsedUserSalary)} below median)</span>
                      )}
                      {parsedUserSalary > range.medianSalary && (
                        <span> ({formatCurrency(parsedUserSalary - range.medianSalary)} above median)</span>
                      )}
                    </span>
                  )}
                </div>

                {/* Additional insights about salary positioning */}
                <div className="mt-2 p-2 bg-zinc-800/50 rounded border border-zinc-700">
                  {parsedUserSalary > range.maxSalary && (
                    <>
                      <p className="text-zinc-300 mb-1">
                        Your salary expectation is <span className="text-red-400 font-medium">{Math.round((parsedUserSalary / range.maxSalary - 1) * 100)}%</span> above the maximum market rate for this role.
                      </p>
                      <p className="text-zinc-300">
                        This is <span className="text-yellow-400 font-medium">{Math.round((parsedUserSalary / range.minSalary - 1) * 100)}%</span> higher than the minimum salary for this role.
                      </p>
                    </>
                  )}

                  {parsedUserSalary < range.minSalary && (
                    <>
                      <p className="text-zinc-300 mb-1">
                        Your salary expectation is <span className="text-red-400 font-medium">{Math.round((1 - parsedUserSalary / range.minSalary) * 100)}%</span> below the minimum market rate for this role.
                      </p>
                      <p className="text-zinc-300">
                        This is only <span className="text-red-400 font-medium">{Math.round((parsedUserSalary / range.maxSalary) * 100)}%</span> of the maximum salary for this role.
                      </p>
                    </>
                  )}

                  {parsedUserSalary >= range.minSalary && parsedUserSalary <= range.maxSalary && (
                    <>
                      <p className="text-zinc-300 mb-1">
                        Your salary expectation is at the <span className="text-green-400 font-medium">
                          {Math.round(((parsedUserSalary - range.minSalary) / (range.maxSalary - range.minSalary)) * 100)}%
                        </span> percentile of the market range for this role.
                      </p>
                      <p className="text-zinc-300">
                        This is <span className="text-green-400 font-medium">{Math.round((parsedUserSalary / range.minSalary - 1) * 100)}%</span> higher than the minimum salary and <span className="text-green-400 font-medium">{Math.round((parsedUserSalary / range.maxSalary) * 100)}%</span> of the maximum salary.
                      </p>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

SalaryRangesChart.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.shape({
      role: PropTypes.string,
      minSalary: PropTypes.number,
      medianSalary: PropTypes.number,
      maxSalary: PropTypes.number,
      location: PropTypes.string
    })
  ),
  userSalaryExpectation: PropTypes.string
};

export default SalaryRangesChart;